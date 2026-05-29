# Rifa Solidária — Amanda Lavínia

Aplicação web completa para controle e venda da rifa solidária da Amanda, com páginas públicas, checkout PIX, consulta de pedido e painel administrativo.

## Rodar localmente

1. Instale dependências:

```bash
pnpm install
```

2. Copie as variáveis:

```bash
cp .env.example .env.local
```

3. Configure `.env.local` com Supabase e senha admin.

4. No Supabase, execute o SQL em `supabase/schema.sql` no SQL Editor.

5. Rode:

```bash
pnpm run dev
```

Acesse `http://localhost:3000`.

## Rotas

- `/` campanha
- `/numeros` escolha de números
- `/checkout` reserva e PIX
- `/pagamento/[pedidoId]` envio de comprovante
- `/consultar` consulta pública
- `/admin` painel administrativo

## Observações

- A reserva usa a função SQL `reserve_raffle_numbers`, com bloqueio transacional por linha para evitar venda dupla.
- Reservas antigas podem ser liberadas com `select expire_old_reservations(24);`.
- Upload de comprovantes usa o bucket público `proofs`.
- O admin usa `ADMIN_PASSWORD` como login simples.
- O aviso legal, autorização, regulamento, meta, PIX, textos e imagem são editáveis no painel.
