"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Copy, MessageCircle, Upload } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { ClientShell } from "@/components/client-shell";
import { Badge, Button, Card } from "@/components/ui";
import type { Campaign, Order } from "@/lib/types";
import { money, padNumber, whatsappLink } from "@/lib/utils";

const statusText = {
  awaiting_payment: "Aguardando pagamento",
  proof_sent: "Comprovante enviado",
  paid: "Pago confirmado",
  cancelled: "Cancelado"
};

export default function PaymentPage() {
  const { pedidoId } = useParams<{ pedidoId: string }>();
  const [data, setData] = useState<{ order: Order; campaign: Campaign } | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`/api/orders/${pedidoId}`).then((res) => res.json()).then((payload) => {
      if (!payload.error) setData(payload);
      else setMessage(payload.error);
    });
  }, [pedidoId]);

  async function upload() {
    if (!file) return setMessage("Selecione o comprovante.");
    setLoading(true);
    const form = new FormData();
    form.append("file", file);
    const response = await fetch(`/api/orders/${pedidoId}/proof`, { method: "POST", body: form });
    const payload = await response.json();
    setLoading(false);
    if (!response.ok) return setMessage(payload.error ?? "Erro ao enviar comprovante.");
    setMessage("Comprovante enviado. A confirmação será feita pela organização.");
    const refreshed = await fetch(`/api/orders/${pedidoId}`).then((res) => res.json());
    setData(refreshed);
  }

  if (!data) {
    return <ClientShell><main className="mx-auto max-w-2xl px-4 py-10"><Card>{message || "Carregando pedido..."}</Card></main></ClientShell>;
  }

  const { order, campaign } = data;
  const pixMessage = `Olá! Sou ${order.buyer_name}. Acabei de participar da Rifa Solidária da Amanda. Pedido ${order.id}. Números: ${order.selected_numbers.map(padNumber).join(", ")}.`;

  return (
    <ClientShell>
      <main className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="text-3xl font-black text-wine-900">Pagamento PIX</h1>
        <p className="mt-2 text-wine-700">Pedido: <span className="font-bold">{order.id}</span></p>
        <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_260px]">
          <Card>
            <Badge>{statusText[order.status]}</Badge>
            <div className="mt-4 grid gap-3 text-wine-800">
              <p><strong>Nome:</strong> {order.buyer_name}</p>
              <p><strong>Números:</strong> {order.selected_numbers.map(padNumber).join(", ")}</p>
              <p><strong>Valor:</strong> {money(order.total_amount)}</p>
            </div>
            <div className="mt-5 rounded-lg bg-cream p-4">
              <p className="text-sm font-bold text-wine-700">Chave PIX</p>
              <p className="break-all text-lg font-black text-wine-900">{campaign.pix_key}</p>
              <p className="text-sm text-wine-700">Recebedor: {campaign.pix_receiver_name}</p>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Button onClick={() => navigator.clipboard.writeText(campaign.pix_key)}><Copy size={18} /> Copiar PIX</Button>
              <a href={whatsappLink(campaign.whatsapp_contact, pixMessage)} target="_blank" rel="noreferrer"><Button className="w-full" variant="secondary"><MessageCircle size={18} /> Chamar no WhatsApp</Button></a>
            </div>
          </Card>
          <Card className="grid place-items-center">
            <QRCodeSVG value={campaign.pix_key} size={180} fgColor="#6f1b36" />
            <p className="mt-3 text-center text-xs font-bold text-wine-700">QR Code da chave PIX</p>
          </Card>
        </div>
        <Card className="mt-4">
          <h2 className="text-xl font-black text-wine-900">Enviar comprovante</h2>
          <input className="mt-4 block w-full rounded-lg border border-wine-100 bg-white p-3 text-sm" type="file" accept="image/*,.pdf" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
          {message ? <p className="mt-3 rounded-lg bg-wine-50 p-3 text-sm font-bold text-wine-800">{message}</p> : null}
          <Button className="mt-4" disabled={loading} onClick={upload}><Upload size={18} /> {loading ? "Enviando..." : "Enviar comprovante"}</Button>
        </Card>
      </main>
    </ClientShell>
  );
}
