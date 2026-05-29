import { NextResponse } from "next/server";
import { getOrder } from "@/lib/supabase";
import { getCampaign } from "@/lib/supabase";
import { jsonError } from "@/lib/api";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await getOrder(id);
  if (!order) return jsonError("Pedido não encontrado.", 404);
  return NextResponse.json({ order, campaign: await getCampaign() });
}
