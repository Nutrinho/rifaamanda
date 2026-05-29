"use client";

import { useMemo, useState } from "react";
import type { RaffleNumber } from "@/lib/types";
import { cn, money, padNumber } from "@/lib/utils";
import { Button, Card, EmptyState } from "./ui";

const statusLabel = {
  available: "Disponível",
  reserved: "Reservado",
  paid: "Pago",
  cancelled: "Cancelado"
};

export function NumberGrid({
  numbers,
  ticketPrice,
  initialSelected = [],
  readonly = false
}: {
  numbers: RaffleNumber[];
  ticketPrice: number;
  initialSelected?: number[];
  readonly?: boolean;
}) {
  const [selected, setSelected] = useState<number[]>(initialSelected);
  const [filter, setFilter] = useState<"all" | RaffleNumber["status"]>("all");
  const filtered = useMemo(() => (filter === "all" ? numbers : numbers.filter((item) => item.status === filter)), [filter, numbers]);

  function toggle(number: RaffleNumber) {
    if (readonly || number.status !== "available") return;
    setSelected((current) => current.includes(number.number) ? current.filter((item) => item !== number.number) : [...current, number.number].sort((a, b) => a - b));
  }

  function continueToCheckout() {
    sessionStorage.setItem("selectedNumbers", JSON.stringify(selected));
    window.location.href = "/checkout";
  }

  const selectedLabel = selected.map(padNumber).join(", ");

  return (
    <div className={cn("grid max-w-full gap-4 overflow-x-hidden lg:grid-cols-[minmax(0,1fr)_320px]", !readonly && "pb-36 lg:pb-0")}>
      <Card className="max-w-full overflow-x-hidden p-2.5 sm:p-4">
        <div className="mb-3 flex items-center justify-between gap-3 px-0.5 lg:hidden">
          <div>
            <p className="text-xs font-bold uppercase text-wine-500">Números</p>
            <p className="text-sm font-black text-wine-900">{filtered.length} exibidos</p>
          </div>
          {!readonly ? (
            <div className="text-right">
              <p className="text-xs font-bold uppercase text-wine-500">Selecionados</p>
              <p className="text-sm font-black text-wine-900">{selected.length}</p>
            </div>
          ) : null}
        </div>
        <div className="sticky top-[65px] z-20 mb-4 flex flex-wrap gap-2 border-y border-wine-100 bg-white/95 py-2 backdrop-blur sm:static sm:border-0 sm:bg-transparent sm:px-1 sm:pb-2 sm:pt-0">
          {[
            ["all", "Todos"],
            ["available", "Disponíveis"],
            ["reserved", "Reservados"],
            ["paid", "Pagos"],
            ["cancelled", "Cancelados"]
          ].map(([key, label]) => (
            <button
              key={key}
              className={cn("focus-ring min-h-10 rounded-full border px-3 py-2 text-xs font-bold", filter === key ? "border-wine-700 bg-wine-700 text-white" : "border-wine-100 bg-white text-wine-800")}
              onClick={() => setFilter(key as typeof filter)}
              type="button"
            >
              {label}
            </button>
          ))}
        </div>
        {filtered.length === 0 ? (
          <EmptyState title="Nenhum número encontrado" text="Troque o filtro para visualizar outros status." />
        ) : null}
        <div className="grid w-full max-w-full grid-cols-3 gap-2 min-[380px]:grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12">
          {filtered.map((item) => {
            const isSelected = selected.includes(item.number);
            return (
              <button
                key={item.id}
                aria-label={`${padNumber(item.number)} - ${statusLabel[item.status]}`}
                className={cn(
                  "focus-ring aspect-square min-h-[58px] min-w-0 rounded-lg border text-sm font-black leading-none transition active:scale-[0.97] sm:min-h-[54px]",
                  item.status === "available" && "border-wine-100 bg-white text-wine-900 shadow-sm hover:border-wine-500",
                  item.status === "reserved" && "border-amber-300 bg-amber-100 text-amber-800",
                  item.status === "paid" && "border-wine-700 bg-wine-700 text-white",
                  item.status === "cancelled" && "border-slate-200 bg-slate-100 text-slate-500",
                  isSelected && "border-2 border-wine-900 bg-gold text-rosewood shadow-md ring-2 ring-gold/40"
                )}
                disabled={readonly || item.status !== "available"}
                onClick={() => toggle(item)}
                type="button"
              >
                {padNumber(item.number)}
              </button>
            );
          })}
        </div>
      </Card>
      {!readonly ? (
        <aside className="hidden self-start rounded-lg border border-wine-100 bg-white p-4 shadow-soft lg:sticky lg:top-20 lg:block">
          <p className="text-sm font-bold text-wine-700">Resumo</p>
          <p className="mt-2 text-3xl font-black text-wine-900">{selected.length} número(s)</p>
          <p className="text-lg font-bold text-wine-800">{money(selected.length * ticketPrice)}</p>
          <p className="mt-2 break-words text-xs text-wine-600">{selectedLabel || "Nenhum número selecionado."}</p>
          <Button className="mt-4 w-full" disabled={selected.length === 0} onClick={continueToCheckout}>Continuar</Button>
        </aside>
      ) : null}
      {!readonly ? (
        <div className="fixed inset-x-0 bottom-0 z-50 border-t border-wine-100 bg-white/95 px-3 pt-3 shadow-soft backdrop-blur pb-[calc(env(safe-area-inset-bottom)+0.75rem)] lg:hidden">
          <div className="mx-auto max-w-6xl">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase text-wine-500">Selecionados</p>
                <p className="truncate text-sm font-black text-wine-900">{selectedLabel || "Nenhum número"}</p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-xs font-bold uppercase text-wine-500">{selected.length} número(s)</p>
                <p className="text-lg font-black text-wine-900">{money(selected.length * ticketPrice)}</p>
              </div>
            </div>
            <Button className="min-h-12 w-full text-base" disabled={selected.length === 0} onClick={continueToCheckout}>Continuar</Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
