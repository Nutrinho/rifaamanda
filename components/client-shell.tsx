"use client";

import Link from "next/link";
import { Heart, ShieldCheck } from "lucide-react";
import { defaultCampaign } from "@/lib/constants";

export function ClientShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="sticky top-0 z-40 border-b border-wine-100 bg-cream/92 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center gap-2 font-black text-wine-900">
            <span className="grid size-9 place-items-center rounded-full bg-wine-700 text-white">
              <Heart size={18} fill="currentColor" />
            </span>
            <span>Rifa da Amanda</span>
          </Link>
          <nav className="flex items-center gap-1 text-sm font-bold text-wine-800">
            <Link className="rounded-lg px-3 py-2 hover:bg-wine-50" href="/numeros">Números</Link>
            <Link className="rounded-lg px-3 py-2 hover:bg-wine-50" href="/consultar">Consultar</Link>
          </nav>
        </div>
      </header>
      {children}
      <footer className="border-t border-wine-100 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-wine-800">
          <div className="mb-4 flex items-center gap-2 font-bold text-wine-900"><ShieldCheck size={18} /> Transparência e responsabilidade</div>
          <p className="max-w-4xl leading-relaxed">{defaultCampaign.legal_notice}</p>
        </div>
      </footer>
    </>
  );
}
