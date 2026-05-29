import Link from "next/link";
import { ArrowRight, Gift, Heart, MessageCircle, Sparkles, Stethoscope } from "lucide-react";
import { PublicShell } from "@/components/campaign-shell";
import { MetricCard } from "@/components/metric-card";
import { Badge, Button, Card, Progress } from "@/components/ui";
import { defaultCampaign, painItems, prizeItems } from "@/lib/constants";
import { getCampaign, getNumbers } from "@/lib/supabase";
import { money, shareText } from "@/lib/utils";

export default async function Home() {
  const [campaign, numbers] = await Promise.all([getCampaign(), getNumbers()]);
  const paid = numbers.filter((item) => item.status === "paid").length * campaign.ticket_price;
  const percent = campaign.goal_amount ? (paid / campaign.goal_amount) * 100 : 0;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const share = `https://wa.me/?text=${encodeURIComponent(shareText(siteUrl))}`;

  return (
    <PublicShell>
      <main className="heart-pattern">
        <section className="mx-auto grid max-w-6xl gap-8 px-4 py-8 sm:py-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <div className="mb-5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/rifa-solidaria-logo.png" alt="Rifa Solidária - Ajude a Amanda a viver sem dor" className="h-auto w-full" />
            </div>
            <Badge className="mb-4 bg-white text-wine-800"><Heart size={14} fill="currentColor" /> Rifa Solidária</Badge>
            <h1 className="text-4xl font-black leading-tight text-wine-900 sm:text-5xl">Ajude a Amanda a viver sem dor</h1>
            <p className="mt-4 max-w-xl text-lg leading-relaxed text-wine-800">
              Com apenas R$ 10,00 você participa da rifa solidária e ajuda a transformar uma vida.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link href="/numeros"><Button className="w-full sm:w-auto">Escolher meus números <ArrowRight size={18} /></Button></Link>
              <a href={share} target="_blank" rel="noreferrer"><Button className="w-full sm:w-auto" variant="secondary"><MessageCircle size={18} /> Compartilhar no WhatsApp</Button></a>
            </div>
          </div>
          <div>
            <div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={campaign.image_url || "/images/amanda-lavinia.png"} alt="Amanda Lavínia" className="h-auto w-full object-cover" />
            </div>
            <div className="mt-3 px-1 text-wine-900">
              <p className="text-sm font-bold uppercase">Amanda Lavínia, 29 anos</p>
              <p className="mt-2 text-xl font-black">Cada contribuição faz a diferença. Sua solidariedade é transformação.</p>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-10">
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/valor-cirurgia.png" alt="O valor total da cirurgia é R$ 18.000,00" className="h-auto w-full" />
            </div>
            <div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/valor-rifa.png" alt="Rifa solidária por apenas R$ 10,00" className="h-auto w-full" />
            </div>
            <MetricCard label="Arrecadado" value={money(paid)} hint={`${Math.round(percent)}% da meta alcançada.`} />
          </div>
          <Card className="mt-4">
            <div className="mb-2 flex justify-between text-sm font-bold text-wine-800">
              <span>Progresso da campanha</span>
              <span>{Math.round(percent)}%</span>
            </div>
            <Progress value={percent} />
          </Card>
        </section>

        <section className="bg-white py-10">
          <div className="mx-auto grid max-w-6xl gap-6 px-4 lg:grid-cols-2">
            <Card>
              <h2 className="text-2xl font-black text-wine-900">Sobre a Amanda</h2>
              <p className="mt-4 leading-relaxed text-wine-800">{campaign.story || defaultCampaign.story}</p>
              <p className="mt-4 leading-relaxed text-wine-800">{campaign.surgery_text}</p>
              <p className="mt-4 rounded-lg bg-cream p-4 font-bold leading-relaxed text-wine-900">{campaign.hope_text}</p>
            </Card>
            <Card>
              <h2 className="text-2xl font-black text-wine-900">A dor me impede de</h2>
              <div className="mt-4 grid gap-3">
                {painItems.map((item) => (
                  <div key={item} className="flex gap-3 rounded-lg bg-wine-50 p-3 text-wine-900">
                    <Stethoscope className="mt-0.5 shrink-0 text-wine-700" size={18} />
                    <span className="font-bold">{item}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </section>

        <section className="mx-auto grid max-w-6xl gap-6 px-4 py-10 lg:grid-cols-2">
          <Card>
            <h2 className="flex items-center gap-2 text-2xl font-black text-wine-900"><Gift className="text-gold" /> Prêmio da rifa</h2>
            <p className="mt-2 text-wine-700">Cesta de eletrônicos</p>
            <div className="mt-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/cesta-eletronicos.png" alt="Cesta de eletrônicos da rifa solidária" className="h-auto w-full" />
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {prizeItems.map((item) => <div key={item} className="rounded-lg border border-wine-100 bg-white p-3 font-bold text-wine-800">{item}</div>)}
            </div>
          </Card>
          <Card>
            <h2 className="flex items-center gap-2 text-2xl font-black text-wine-900"><Sparkles className="text-gold" /> Como participar</h2>
            {["Escolha seus números", "Preencha seus dados", "Faça o pagamento via PIX", "Envie o comprovante", "Aguarde a confirmação"].map((item, index) => (
              <div key={item} className="mt-4 flex items-center gap-3">
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-wine-700 text-sm font-black text-white">{index + 1}</span>
                <span className="font-bold text-wine-900">{item}</span>
              </div>
            ))}
            <Link href="/numeros"><Button className="mt-6 w-full">Vamos juntos devolver à Amanda a chance de viver, sorrir e realizar seus sonhos.</Button></Link>
          </Card>
        </section>

        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-wine-100 bg-white p-3 shadow-soft sm:hidden">
          <Link href="/numeros"><Button className="w-full">Participar da rifa</Button></Link>
        </div>
      </main>
    </PublicShell>
  );
}
