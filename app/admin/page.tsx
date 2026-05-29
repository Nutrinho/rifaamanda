"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Download, ExternalLink, LogIn, MessageCircle, RefreshCw, Search, X } from "lucide-react";
import { NumberGrid } from "@/components/number-grid";
import { Badge, Button, Card, EmptyState, Input, Label, Progress, Textarea } from "@/components/ui";
import type { Campaign, Order, RaffleNumber } from "@/lib/types";
import { money, padNumber, whatsappLink } from "@/lib/utils";

type Stats = {
  campaign: Campaign;
  paidTotal: number;
  paidNumbers: number;
  reservedNumbers: number;
  availableNumbers: number;
  pendingOrders: number;
  proofsSent: number;
};

export default function AdminPage() {
  const [token, setToken] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [tab, setTab] = useState("dashboard");
  const [stats, setStats] = useState<Stats | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [numbers, setNumbers] = useState<RaffleNumber[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [message, setMessage] = useState("");

  useEffect(() => setToken(localStorage.getItem("adminToken")), []);
  useEffect(() => {
    if (token) void loadAll();
  }, [token]);

  async function api(path: string, options: RequestInit = {}) {
    return fetch(path, { ...options, headers: { "content-type": "application/json", "x-admin-token": token ?? "", ...(options.headers ?? {}) } });
  }

  async function login() {
    const response = await fetch("/api/admin/login", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ password }) });
    const payload = await response.json();
    if (!response.ok) return setMessage(payload.error ?? "Senha inválida.");
    localStorage.setItem("adminToken", payload.token);
    setToken(payload.token);
  }

  async function loadAll() {
    const [statsRes, ordersRes, numbersRes] = await Promise.all([
      api("/api/admin/stats"),
      api(`/api/admin/orders?status=${status}&search=${encodeURIComponent(search)}`),
      api("/api/admin/numbers")
    ]);
    if (statsRes.ok) setStats(await statsRes.json());
    if (ordersRes.ok) setOrders(await ordersRes.json());
    if (numbersRes.ok) setNumbers(await numbersRes.json());
  }

  async function orderAction(id: string, action: "confirm" | "cancel" | "release") {
    if (action !== "confirm" && !confirm("Tem certeza que deseja cancelar/liberar este pedido?")) return;
    const response = await api("/api/admin/orders", { method: "PATCH", body: JSON.stringify({ id, action }) });
    setMessage(response.ok ? "Pedido atualizado." : ((await response.json()).error ?? "Erro ao atualizar."));
    await loadAll();
  }

  async function saveCampaign(formData: FormData) {
    const body = Object.fromEntries(formData.entries());
    const response = await api("/api/admin/campaign", { method: "PUT", body: JSON.stringify(body) });
    setMessage(response.ok ? "Campanha salva." : ((await response.json()).error ?? "Erro ao salvar."));
    await loadAll();
  }

  const percent = useMemo(() => stats ? (stats.paidTotal / stats.campaign.goal_amount) * 100 : 0, [stats]);

  if (!token) {
    return (
      <main className="heart-pattern grid min-h-screen place-items-center px-4">
        <Card className="w-full max-w-sm">
          <h1 className="text-2xl font-black text-wine-900">Administração</h1>
          <p className="mt-2 text-sm text-wine-700">Entre com a senha configurada em ADMIN_PASSWORD.</p>
          <Label className="mt-5">Senha</Label>
          <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === "Enter" && login()} />
          {message ? <p className="mt-3 text-sm font-bold text-red-700">{message}</p> : null}
          <Button className="mt-4 w-full" onClick={login}><LogIn size={18} /> Entrar</Button>
        </Card>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-cream">
      <header className="border-b border-wine-100 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4">
          <div>
            <h1 className="text-2xl font-black text-wine-900">Painel da Rifa</h1>
            <p className="text-sm text-wine-700">Controle de vendas, pagamentos e campanha.</p>
          </div>
          <Button variant="secondary" onClick={loadAll}><RefreshCw size={18} /> Atualizar</Button>
        </div>
      </header>
      <div className="mx-auto max-w-7xl px-4 py-5">
        <div className="mb-5 flex gap-2 overflow-x-auto">
          {["dashboard", "pedidos", "numeros", "configuracoes"].map((item) => (
            <button key={item} className={`rounded-full px-4 py-2 text-sm font-bold ${tab === item ? "bg-wine-700 text-white" : "bg-white text-wine-800"}`} onClick={() => setTab(item)}>
              {item[0].toUpperCase() + item.slice(1)}
            </button>
          ))}
        </div>
        {message ? <p className="mb-4 rounded-lg bg-wine-50 p-3 text-sm font-bold text-wine-800">{message}</p> : null}
        {tab === "dashboard" && stats ? <Dashboard stats={stats} percent={percent} /> : null}
        {tab === "pedidos" ? (
          <Orders
            orders={orders}
            search={search}
            status={status}
            setSearch={setSearch}
            setStatus={setStatus}
            reload={loadAll}
            action={orderAction}
            token={token}
            whatsapp={stats?.campaign.whatsapp_contact ?? ""}
          />
        ) : null}
        {tab === "numeros" ? <NumberGrid numbers={numbers} ticketPrice={stats?.campaign.ticket_price ?? 10} readonly /> : null}
        {tab === "configuracoes" && stats ? <CampaignForm campaign={stats.campaign} save={saveCampaign} /> : null}
      </div>
    </main>
  );
}

function Dashboard({ stats, percent }: { stats: Stats; percent: number }) {
  const cards = [
    ["Total arrecadado", money(stats.paidTotal)],
    ["Meta", money(stats.campaign.goal_amount)],
    ["Números pagos", String(stats.paidNumbers)],
    ["Reservados", String(stats.reservedNumbers)],
    ["Disponíveis", String(stats.availableNumbers)],
    ["Pendentes", String(stats.pendingOrders)],
    ["Comprovantes", String(stats.proofsSent)]
  ];
  return (
    <div className="grid gap-4">
      <Card>
        <div className="mb-2 flex justify-between text-sm font-bold text-wine-800"><span>Progresso</span><span>{Math.round(percent)}%</span></div>
        <Progress value={percent} />
      </Card>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(([label, value]) => <Card key={label}><p className="text-xs font-bold uppercase text-wine-500">{label}</p><p className="mt-1 text-2xl font-black text-wine-900">{value}</p></Card>)}
      </div>
    </div>
  );
}

function Orders(props: {
  orders: Order[];
  search: string;
  status: string;
  setSearch: (value: string) => void;
  setStatus: (value: string) => void;
  reload: () => void;
  action: (id: string, action: "confirm" | "cancel" | "release") => void;
  token: string;
  whatsapp: string;
}) {
  return (
    <Card>
      <div className="mb-4 grid gap-3 lg:grid-cols-[1fr_180px_auto_auto]">
        <Input placeholder="Buscar por nome, WhatsApp ou ID" value={props.search} onChange={(e) => props.setSearch(e.target.value)} />
        <select className="rounded-lg border border-wine-100 bg-white px-3 text-sm font-bold text-wine-800" value={props.status} onChange={(e) => props.setStatus(e.target.value)}>
          <option value="all">Todos</option><option value="awaiting_payment">Pendentes</option><option value="proof_sent">Comprovantes</option><option value="paid">Pagos</option><option value="cancelled">Cancelados</option>
        </select>
        <Button variant="secondary" onClick={props.reload}><Search size={18} /> Filtrar</Button>
        <a href={`/api/admin/export`} onClick={(e) => { e.preventDefault(); fetch("/api/admin/export", { headers: { "x-admin-token": props.token } }).then((r) => r.blob()).then((b) => { const a = document.createElement("a"); a.href = URL.createObjectURL(b); a.download = "pedidos-rifa-amanda.csv"; a.click(); }); }}><Button className="w-full" variant="secondary"><Download size={18} /> CSV</Button></a>
      </div>
      {props.orders.length === 0 ? <EmptyState title="Nenhum pedido" text="Os pedidos aparecerão aqui quando forem criados." /> : null}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[920px] text-left text-sm">
          <thead className="text-xs uppercase text-wine-500"><tr>{["ID", "Nome", "WhatsApp", "Números", "Valor", "Status", "Data", "Ações"].map((h) => <th key={h} className="p-2">{h}</th>)}</tr></thead>
          <tbody>
            {props.orders.map((order) => (
              <tr key={order.id} className="border-t border-wine-100">
                <td className="p-2 font-mono text-xs">{order.id.slice(0, 8)}</td>
                <td className="p-2 font-bold">{order.buyer_name}</td>
                <td className="p-2">{order.buyer_whatsapp}</td>
                <td className="p-2">{order.selected_numbers.map(padNumber).join(", ")}</td>
                <td className="p-2">{money(order.total_amount)}</td>
                <td className="p-2"><Badge>{order.status}</Badge></td>
                <td className="p-2">{new Date(order.created_at).toLocaleDateString("pt-BR")}</td>
                <td className="flex gap-1 p-2">
                  <Button variant="secondary" onClick={() => props.action(order.id, "confirm")}><Check size={16} /></Button>
                  <Button variant="danger" onClick={() => props.action(order.id, "cancel")}><X size={16} /></Button>
                  {order.payment_proof_url ? <a href={order.payment_proof_url} target="_blank" rel="noreferrer"><Button variant="secondary"><ExternalLink size={16} /></Button></a> : null}
                  <a href={whatsappLink(order.buyer_whatsapp || props.whatsapp, `Olá, ${order.buyer_name}! Sobre sua participação na Rifa Solidária da Amanda: pedido ${order.id}.`)} target="_blank" rel="noreferrer"><Button variant="secondary"><MessageCircle size={16} /></Button></a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function CampaignForm({ campaign, save }: { campaign: Campaign; save: (data: FormData) => void }) {
  return (
    <form action={save} className="grid gap-4 lg:grid-cols-2">
      {[
        ["title", "Nome da campanha"], ["beneficiary_name", "Nome da beneficiada"], ["goal_amount", "Meta"], ["ticket_price", "Valor por número"],
        ["total_numbers", "Quantidade de números"], ["pix_key", "Chave PIX"], ["pix_receiver_name", "Recebedor PIX"], ["whatsapp_contact", "WhatsApp de contato"],
        ["draw_date", "Data do sorteio"], ["image_url", "Imagem da campanha"], ["authorization_number", "Número de autorização"], ["regulation_url", "Regulamento"]
      ].map(([name, label]) => (
        <Card key={name}>
          <Label>{label}</Label>
          <Input name={name} defaultValue={String((campaign as unknown as Record<string, string | number | null>)[name] ?? "")} />
        </Card>
      ))}
      <Card className="lg:col-span-2"><Label>História</Label><Textarea name="story" defaultValue={campaign.story} /></Card>
      <Card className="lg:col-span-2"><Label>Texto da cirurgia</Label><Textarea name="surgery_text" defaultValue={campaign.surgery_text ?? ""} /></Card>
      <Card className="lg:col-span-2"><Label>Texto de esperança</Label><Textarea name="hope_text" defaultValue={campaign.hope_text ?? ""} /></Card>
      <Card className="lg:col-span-2"><Label>Aviso legal</Label><Textarea name="legal_notice" defaultValue={campaign.legal_notice ?? ""} /></Card>
      <Button className="lg:col-span-2">Salvar configurações</Button>
    </form>
  );
}
