create extension if not exists "pgcrypto";

create table if not exists campaigns (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  beneficiary_name text not null,
  story text not null,
  surgery_text text,
  hope_text text,
  goal_amount numeric(12,2) not null default 18000,
  ticket_price numeric(12,2) not null default 10,
  total_numbers integer not null default 1000,
  pix_key text not null,
  pix_receiver_name text not null,
  whatsapp_contact text not null,
  draw_date date,
  image_url text,
  legal_notice text,
  authorization_number text,
  regulation_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create type raffle_number_status as enum ('available', 'reserved', 'paid', 'cancelled');
create type order_status as enum ('awaiting_payment', 'proof_sent', 'paid', 'cancelled');

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references campaigns(id) on delete cascade,
  buyer_name text not null,
  buyer_whatsapp text not null,
  buyer_city text not null,
  buyer_state text not null,
  buyer_email text,
  selected_numbers integer[] not null,
  total_amount numeric(12,2) not null,
  status order_status not null default 'awaiting_payment',
  payment_proof_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists raffle_numbers (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references campaigns(id) on delete cascade,
  number integer not null,
  status raffle_number_status not null default 'available',
  order_id uuid references orders(id) on delete set null,
  buyer_name text,
  buyer_whatsapp text,
  reserved_at timestamptz,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  unique (campaign_id, number)
);

create table if not exists admin_users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  password_hash text,
  created_at timestamptz not null default now()
);

create index if not exists raffle_numbers_status_idx on raffle_numbers(status);
create index if not exists raffle_numbers_order_idx on raffle_numbers(order_id);
create index if not exists orders_status_idx on orders(status);
create index if not exists orders_whatsapp_idx on orders(buyer_whatsapp);

insert into campaigns (
  id,
  title,
  beneficiary_name,
  story,
  surgery_text,
  hope_text,
  goal_amount,
  ticket_price,
  total_numbers,
  pix_key,
  pix_receiver_name,
  whatsapp_contact,
  legal_notice
) values (
  '00000000-0000-0000-0000-000000000001',
  'Rifa Solidária — Ajude a Amanda a viver sem dor',
  'Amanda Lavínia',
  'Meu nome é Amanda Lavínia, tenho 29 anos, moro em Caçador/SC e hoje estou enfrentando a maior batalha da minha vida. Há 5 meses convivo com uma hérnia de disco de 13mm na coluna, causando dores intensas e constantes. A dor se tornou incapacitante. Hoje não consigo trabalhar, sair de casa, sentar, ficar em pé ou até mesmo realizar tarefas simples sem sofrimento.',
  'Após diversas tentativas de tratamento, os médicos informaram que a única solução para o meu caso é a cirurgia. O valor total é de R$ 18.000,00, incluindo hospital, equipe médica, anestesia, exames e pós-operatório.',
  'Sou uma menina guerreira, estudosa e cheia de sonhos. Formada em Engenharia Ambiental, sempre corri atrás dos meus objetivos com dedicação. Hoje, estou completamente parada pela dor e dependo da ajuda dos familiares até para coisas simples.',
  18000,
  10,
  1000,
  'cadastre-a-chave-pix-no-admin',
  'Amanda Lavínia',
  '5549999999999',
  'Esta campanha deve seguir as regras aplicáveis para sorteios, rifas e ações beneficentes. Consulte a organização responsável para informações sobre regulamento, autorização, data do sorteio e prestação de contas. No Brasil, distribuições de prêmios, promoções comerciais e sorteios filantrópicos podem exigir autorização e documentação específica em sistemas oficiais, como o SCPC/Ministério da Fazenda ou canais indicados pela Caixa/Governo Federal.'
) on conflict (id) do nothing;

create or replace function ensure_raffle_numbers(p_campaign_id uuid)
returns void
language plpgsql
security definer
as $$
declare
  total integer;
begin
  select total_numbers into total from campaigns where id = p_campaign_id;
  insert into raffle_numbers (campaign_id, number)
  select p_campaign_id, n
  from generate_series(1, total) as n
  on conflict (campaign_id, number) do nothing;
end;
$$;

select ensure_raffle_numbers('00000000-0000-0000-0000-000000000001');

create or replace function expire_old_reservations(p_hours integer default 24)
returns integer
language plpgsql
security definer
as $$
declare
  changed integer;
begin
  update orders
  set status = 'cancelled', updated_at = now()
  where status = 'awaiting_payment'
    and created_at < now() - make_interval(hours => p_hours);

  update raffle_numbers
  set status = 'available',
      order_id = null,
      buyer_name = null,
      buyer_whatsapp = null,
      reserved_at = null
  where status = 'reserved'
    and reserved_at < now() - make_interval(hours => p_hours)
    and coalesce(order_id::text, '') not in (select id::text from orders where status in ('paid', 'proof_sent'));

  get diagnostics changed = row_count;
  return changed;
end;
$$;

create or replace function reserve_raffle_numbers(
  p_campaign_id uuid,
  p_buyer_name text,
  p_buyer_whatsapp text,
  p_buyer_city text,
  p_buyer_state text,
  p_buyer_email text,
  p_selected_numbers integer[],
  p_total_amount numeric
) returns uuid
language plpgsql
security definer
as $$
declare
  v_order_id uuid;
  v_available integer;
begin
  perform expire_old_reservations(24);

  if array_length(p_selected_numbers, 1) is null then
    raise exception 'no_numbers';
  end if;

  perform 1
  from raffle_numbers
  where campaign_id = p_campaign_id and number = any(p_selected_numbers)
  for update;

  select count(*) into v_available
  from raffle_numbers
  where campaign_id = p_campaign_id
    and number = any(p_selected_numbers)
    and status = 'available';

  if v_available <> array_length(p_selected_numbers, 1) then
    raise exception 'unavailable_numbers';
  end if;

  insert into orders (
    campaign_id, buyer_name, buyer_whatsapp, buyer_city, buyer_state,
    buyer_email, selected_numbers, total_amount, status
  ) values (
    p_campaign_id, p_buyer_name, p_buyer_whatsapp, p_buyer_city, p_buyer_state,
    p_buyer_email, p_selected_numbers, p_total_amount, 'awaiting_payment'
  ) returning id into v_order_id;

  update raffle_numbers
  set status = 'reserved',
      order_id = v_order_id,
      buyer_name = p_buyer_name,
      buyer_whatsapp = p_buyer_whatsapp,
      reserved_at = now()
  where campaign_id = p_campaign_id and number = any(p_selected_numbers);

  return v_order_id;
end;
$$;

create or replace function confirm_raffle_order(p_order_id uuid)
returns void
language plpgsql
security definer
as $$
begin
  update orders set status = 'paid', updated_at = now() where id = p_order_id;
  update raffle_numbers set status = 'paid', paid_at = now() where order_id = p_order_id;
end;
$$;

create or replace function cancel_raffle_order(p_order_id uuid)
returns void
language plpgsql
security definer
as $$
begin
  update orders set status = 'cancelled', updated_at = now() where id = p_order_id;
  update raffle_numbers
  set status = 'available',
      order_id = null,
      buyer_name = null,
      buyer_whatsapp = null,
      reserved_at = null,
      paid_at = null
  where order_id = p_order_id;
end;
$$;

alter table campaigns enable row level security;
alter table orders enable row level security;
alter table raffle_numbers enable row level security;

create policy "public campaigns read" on campaigns for select using (true);
create policy "public numbers read" on raffle_numbers for select using (true);
create policy "public orders insert via rpc" on orders for insert with check (true);

insert into storage.buckets (id, name, public)
values ('proofs', 'proofs', true)
on conflict (id) do nothing;
