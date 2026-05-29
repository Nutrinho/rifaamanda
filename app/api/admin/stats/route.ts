import { NextResponse } from "next/server";
import { jsonError, requireAdmin, requireDb } from "@/lib/api";
import { getCampaign } from "@/lib/supabase";

export async function GET(request: Request) {
  if (!requireAdmin(request)) return jsonError("Não autorizado.", 401);
  try {
    const supabase = requireDb();
    const campaign = await getCampaign();
    const [{ data: orders }, { data: numbers }] = await Promise.all([
      supabase.from("orders").select("status,total_amount,payment_proof_url"),
      supabase.from("raffle_numbers").select("status")
    ]);
    const paidTotal = (orders ?? []).filter((o) => o.status === "paid").reduce((sum, o) => sum + Number(o.total_amount), 0);
    const count = (status: string) => (numbers ?? []).filter((n) => n.status === status).length;
    return NextResponse.json({
      campaign,
      paidTotal,
      paidNumbers: count("paid"),
      reservedNumbers: count("reserved"),
      availableNumbers: count("available"),
      pendingOrders: (orders ?? []).filter((o) => o.status === "awaiting_payment").length,
      proofsSent: (orders ?? []).filter((o) => o.status === "proof_sent" || o.payment_proof_url).length
    });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Erro ao carregar painel.", 500);
  }
}
