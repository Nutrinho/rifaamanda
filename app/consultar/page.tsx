"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { ClientShell } from "@/components/client-shell";
import { Button, Card, EmptyState, Input, Label } from "@/components/ui";
import type { Order } from "@/lib/types";
import { money, padNumber } from "@/lib/utils";

export default function ConsultarPage() {
  const [query, setQuery] = useState("");
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [error, setError] = useState("");

  async function consult() {
    setError("");
    const response = await fetch("/api/consult", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ query }) });
    const payload = await response.json();
    if (!response.ok) return setError(payload.error ?? "Erro ao consultar.");
    setOrders(payload);
  }

  return (
    <ClientShell>
      <main className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="text-3xl font-black text-wine-900">Consultar participação</h1>
        <p className="mt-2 text-wine-700">Informe seu WhatsApp ou o código do pedido.</p>
        <Card className="mt-6">
          <Label>WhatsApp ou código do pedido</Label>
          <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
            <Input value={query} onChange={(e) => setQuery(e.target.value)} />
            <Button onClick={consult}><Search size={18} /> Consultar</Button>
          </div>
          {error ? <p className="mt-3 text-sm font-bold text-red-700">{error}</p> : null}
        </Card>
        <div className="mt-5 grid gap-3">
          {orders?.length === 0 ? <EmptyState title="Nenhum pedido encontrado" text="Confira os dados informados e tente novamente." /> : null}
          {orders?.map((order) => (
            <Card key={order.id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-black text-wine-900">{order.buyer_name}</p>
                  <p className="text-sm text-wine-700">{order.id}</p>
                </div>
                <span className="rounded-full bg-wine-50 px-3 py-1 text-xs font-bold text-wine-800">{order.status}</span>
              </div>
              <p className="mt-3 text-sm text-wine-800"><strong>Números:</strong> {order.selected_numbers.map(padNumber).join(", ")}</p>
              <p className="text-sm text-wine-800"><strong>Valor:</strong> {money(order.total_amount)}</p>
              <p className="text-sm text-wine-800"><strong>Reserva:</strong> {new Date(order.created_at).toLocaleString("pt-BR")}</p>
            </Card>
          ))}
        </div>
      </main>
    </ClientShell>
  );
}
