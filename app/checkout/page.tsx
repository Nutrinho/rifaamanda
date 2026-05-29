"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Copy, Heart } from "lucide-react";
import Link from "next/link";
import { ClientShell } from "@/components/client-shell";
import { Button, Card, Input, Label } from "@/components/ui";
import { checkoutSchema } from "@/lib/validation";
import { money, padNumber, phoneMask } from "@/lib/utils";
import type { Campaign } from "@/lib/types";
import type { z } from "zod";

type FormData = z.infer<typeof checkoutSchema>;

export default function CheckoutPage() {
  const [selected, setSelected] = useState<number[]>([]);
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [result, setResult] = useState<{ id: string; total_amount: number } | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const form = useForm<FormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: { buyer_name: "", buyer_whatsapp: "", buyer_city: "", buyer_state: "SC", buyer_email: "", selected_numbers: [] }
  });

  useEffect(() => {
    const values = JSON.parse(sessionStorage.getItem("selectedNumbers") || "[]") as number[];
    setSelected(values);
    form.setValue("selected_numbers", values);
    fetch("/api/campaign").then((res) => res.json()).then(setCampaign);
  }, [form]);

  async function submit(data: FormData) {
    setLoading(true);
    setError("");
    const response = await fetch("/api/orders", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(data) });
    const payload = await response.json();
    setLoading(false);
    if (!response.ok) return setError(payload.error ?? "Erro ao reservar números.");
    sessionStorage.removeItem("selectedNumbers");
    setResult(payload);
  }

  if (result && campaign) {
    return (
      <ClientShell>
        <main className="mx-auto max-w-2xl px-4 py-8">
          <Card>
            <div className="grid size-12 place-items-center rounded-full bg-wine-700 text-white"><Heart fill="currentColor" /></div>
            <h1 className="mt-4 text-3xl font-black text-wine-900">Números reservados</h1>
            <p className="mt-2 text-wine-700">Faça o PIX e envie o comprovante para confirmar sua participação.</p>
            <div className="mt-5 rounded-lg bg-cream p-4">
              <p className="text-sm font-bold text-wine-700">Valor total</p>
              <p className="text-3xl font-black text-wine-900">{money(result.total_amount)}</p>
              <p className="mt-3 text-sm font-bold text-wine-700">Chave PIX</p>
              <p className="break-all text-lg font-black text-wine-900">{campaign.pix_key}</p>
              <p className="text-sm text-wine-700">Recebedor: {campaign.pix_receiver_name}</p>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Button onClick={() => navigator.clipboard.writeText(campaign.pix_key)}><Copy size={18} /> Copiar chave PIX</Button>
              <Link href={`/pagamento/${result.id}`}><Button className="w-full" variant="secondary">Enviar comprovante</Button></Link>
            </div>
          </Card>
        </main>
      </ClientShell>
    );
  }

  return (
    <ClientShell>
      <main className="mx-auto max-w-3xl px-4 py-8">
        <Link href="/numeros" className="mb-4 inline-flex items-center gap-2 text-sm font-bold text-wine-700"><ArrowLeft size={16} /> Voltar aos números</Link>
        <h1 className="text-3xl font-black text-wine-900">Complete sua reserva</h1>
        <p className="mt-2 text-wine-700">Números: {selected.map(padNumber).join(", ") || "nenhum número selecionado"}</p>
        <form className="mt-6 grid gap-4" onSubmit={form.handleSubmit(submit)}>
          <Card className="grid gap-4">
            <div>
              <Label>Nome completo</Label>
              <Input {...form.register("buyer_name")} />
              <Error text={form.formState.errors.buyer_name?.message} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>WhatsApp</Label>
                <Input {...form.register("buyer_whatsapp")} onChange={(e) => form.setValue("buyer_whatsapp", phoneMask(e.target.value))} />
                <Error text={form.formState.errors.buyer_whatsapp?.message} />
              </div>
              <div>
                <Label>E-mail opcional</Label>
                <Input {...form.register("buyer_email")} type="email" />
                <Error text={form.formState.errors.buyer_email?.message} />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-[1fr_120px]">
              <div>
                <Label>Cidade</Label>
                <Input {...form.register("buyer_city")} />
                <Error text={form.formState.errors.buyer_city?.message} />
              </div>
              <div>
                <Label>Estado</Label>
                <Input {...form.register("buyer_state")} maxLength={2} />
                <Error text={form.formState.errors.buyer_state?.message} />
              </div>
            </div>
            {error ? <p className="rounded-lg bg-red-50 p-3 text-sm font-bold text-red-700">{error}</p> : null}
            <div className="rounded-lg bg-wine-50 p-4">
              <p className="text-sm font-bold text-wine-700">Total</p>
              <p className="text-2xl font-black text-wine-900">{money(selected.length * (campaign?.ticket_price ?? 10))}</p>
            </div>
            <Button disabled={loading || selected.length === 0}>{loading ? "Reservando..." : "Reservar e ver PIX"}</Button>
          </Card>
        </form>
      </main>
    </ClientShell>
  );
}

function Error({ text }: { text?: string }) {
  return text ? <p className="mt-1 text-xs font-bold text-red-700">{text}</p> : null;
}
