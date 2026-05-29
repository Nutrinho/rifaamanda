import { PublicShell } from "@/components/campaign-shell";
import { NumberGrid } from "@/components/number-grid";
import { getCampaign, getNumbers } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function NumerosPage() {
  const [campaign, numbers] = await Promise.all([getCampaign(), getNumbers()]);
  return (
    <PublicShell>
      <main className="mx-auto max-w-6xl overflow-x-hidden px-3 py-5 sm:px-4 sm:py-8">
        <h1 className="text-2xl font-black leading-tight text-wine-900 sm:text-3xl">Escolha seus números</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-wine-700 sm:text-base">Selecione um ou mais números disponíveis. Cada número custa R$ {campaign.ticket_price.toFixed(2).replace(".", ",")}.</p>
        <div className="mt-6">
          <NumberGrid numbers={numbers} ticketPrice={campaign.ticket_price} />
        </div>
      </main>
    </PublicShell>
  );
}
