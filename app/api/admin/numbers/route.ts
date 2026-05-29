import { NextResponse } from "next/server";
import { jsonError, requireAdmin, requireDb } from "@/lib/api";

export async function GET(request: Request) {
  if (!requireAdmin(request)) return jsonError("Não autorizado.", 401);
  const status = new URL(request.url).searchParams.get("status");
  try {
    const supabase = requireDb();
    let query = supabase.from("raffle_numbers").select("*").order("number");
    if (status && status !== "all") query = query.eq("status", status);
    const { data, error } = await query;
    if (error) return jsonError(error.message, 500);
    return NextResponse.json(data ?? []);
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Erro ao listar números.", 500);
  }
}
