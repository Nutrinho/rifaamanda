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
    <div className={cn("grid gap-4 lg:grid-cols-[1fr_320px]", !readonly && "pb-28 lg:pb-0")}>
      <Card className="p-2 sm:p-4">
        <div className="mb-3 flex items-center justify-between gap-3 px-1 lg:hidden">
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
        <div className="mb-4 flex gap-2 overflow-x-auto px-1 pb-2 [-webkit-overflow-scrolling:touch]">
          {[
            ["all", "Todos"],
            ["available", "Disponíveis"],
            ["reserved", "Reservados"],
            ["paid", "Pagos"],
            ["cancelled", "Cancelados"]
          ].map(([key, label]) => (
            <button
              key={key}
              className={cn("focus-ring shrink-0 rounded-full border px-3 py-2 text-xs font-bold", filter === key ? "border-wine-700 bg-wine-700 text-white" : "border-wine-100 bg-white text-wine-800")}
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
        <div className="grid grid-cols-5 gap-1.5 sm:grid-cols-8 sm:gap-2 md:grid-cols-10 lg:grid-cols-12">
          {filtered.map((item) => {
            const isSelected = selected.includes(item.number);
            return (
              <button
                key={item.id}
                aria-label={`${padNumber(item.number)} - ${statusLabel[item.status]}`}
                className={cn(
                  "focus-ring aspect-square min-w-0 rounded-md border text-[11px] font-black leading-none transition sm:rounded-lg sm:text-sm",
                  item.status === "available" && "border-wine-100 bg-white text-wine-900 hover:border-wine-500",
                  item.status === "reserved" && "border-amber-300 bg-amber-100 text-amber-800",
                  item.status === "paid" && "border-wine-700 bg-wine-700 text-white",
                  item.status === "cancelled" && "border-slate-200 bg-slate-100 text-slate-500",
                  isSelected && "border-2 border-gold bg-gold text-rosewood shadow"
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
        <div className="fixed inset-x-0 bottom-0 z-50 border-t border-wine-100 bg-white/95 p-3 shadow-soft backdrop-blur lg:hidden">
          <div className="mx-auto max-w-6xl">
            <div className="mb-2 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase text-wine-500">Selecionados</p>
                <p className="truncate text-sm font-black text-wine-900">{selectedLabel || "Nenhum número"}</p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-xs font-bold uppercase text-wine-500">{selected.length} número(s)</p>
                <p className="text-lg font-black text-wine-900">{money(selected.length * ticketPrice)}</p>
              </div>
            </div>
            <Button className="w-full" disabled={selected.length === 0} onClick={continueToCheckout}>Continuar</Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
