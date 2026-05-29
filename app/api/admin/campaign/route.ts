import { NextResponse } from "next/server";
import { campaignSchema } from "@/lib/validation";
import { campaignId, jsonError, requireAdmin, requireDb } from "@/lib/api";

export async function PUT(request: Request) {
  if (!requireAdmin(request)) return jsonError("Não autorizado.", 401);
  const body = await request.json();
  const parsed = campaignSchema.safeParse(body);
  if (!parsed.success) return jsonError(parsed.error.errors[0]?.message ?? "Dados inválidos.");
  try {
    const supabase = requireDb();
    const id = await campaignId();
    const { error } = await supabase.from("campaigns").update({ ...parsed.data, updated_at: new Date().toISOString() }).eq("id", id);
    if (error) return jsonError(error.message, 500);
    await supabase.rpc("ensure_raffle_numbers", { p_campaign_id: id });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Erro ao salvar campanha.", 500);
  }
}
