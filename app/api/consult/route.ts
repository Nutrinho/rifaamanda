import { NextResponse } from "next/server";
import { jsonError, requireDb } from "@/lib/api";
import { onlyDigits } from "@/lib/utils";

export async function POST(request: Request) {
  const { query } = await request.json();
  if (!query || String(query).length < 3) return jsonError("Informe WhatsApp ou código do pedido.");
  try {
    const supabase = requireDb();
    const raw = String(query).trim();
    const digits = onlyDigits(raw);
    let builder = supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(10);
    if (raw.includes("-")) builder = builder.eq("id", raw);
    else builder = builder.eq("buyer_whatsapp", digits);
    const { data, error } = await builder;
    if (error) return jsonError(error.message, 500);
    return NextResponse.json(data ?? []);
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Erro na consulta.", 500);
  }
}
