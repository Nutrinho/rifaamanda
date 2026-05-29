import { NextResponse } from "next/server";
import { checkoutSchema } from "@/lib/validation";
import { campaignId, jsonError, requireDb } from "@/lib/api";
import { onlyDigits } from "@/lib/utils";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) return jsonError(parsed.error.errors[0]?.message ?? "Dados inválidos.");

  try {
    const supabase = requireDb();
    const campaign_id = await campaignId();
    const { data: campaign } = await supabase.from("campaigns").select("ticket_price").eq("id", campaign_id).single();
    const total_amount = parsed.data.selected_numbers.length * Number(campaign?.ticket_price ?? 10);
    const { data, error } = await supabase.rpc("reserve_raffle_numbers", {
      p_campaign_id: campaign_id,
      p_buyer_name: parsed.data.buyer_name,
      p_buyer_whatsapp: onlyDigits(parsed.data.buyer_whatsapp),
      p_buyer_city: parsed.data.buyer_city,
      p_buyer_state: parsed.data.buyer_state.toUpperCase(),
      p_buyer_email: parsed.data.buyer_email || null,
      p_selected_numbers: parsed.data.selected_numbers,
      p_total_amount: total_amount
    });

    if (error) return jsonError(error.message.includes("unavailable") ? "Algum número já foi reservado ou pago. Atualize a lista e escolha novamente." : error.message);
    return NextResponse.json({ id: data, total_amount });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Erro ao criar pedido.", 500);
  }
}
