import { NextResponse } from "next/server";
import { jsonError, requireAdmin, requireDb } from "@/lib/api";

export async function GET(request: Request) {
  if (!requireAdmin(request)) return jsonError("Não autorizado.", 401);
  const url = new URL(request.url);
  const search = url.searchParams.get("search")?.trim();
  const status = url.searchParams.get("status");
  try {
    const supabase = requireDb();
    let query = supabase.from("orders").select("*").order("created_at", { ascending: false });
    if (status && status !== "all") query = query.eq("status", status);
    if (search && /^[0-9a-f-]{36}$/i.test(search)) query = query.eq("id", search);
    else if (search && /^\d{1,4}$/.test(search)) query = query.contains("selected_numbers", [Number(search)]);
    else if (search) query = query.or(`buyer_name.ilike.%${search}%,buyer_whatsapp.ilike.%${search}%`);
    const { data, error } = await query.limit(200);
    if (error) return jsonError(error.message, 500);
    return NextResponse.json(data ?? []);
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Erro ao listar pedidos.", 500);
  }
}

export async function PATCH(request: Request) {
  if (!requireAdmin(request)) return jsonError("Não autorizado.", 401);
  const { id, action } = await request.json();
  if (!id || !["confirm", "cancel", "release"].includes(action)) return jsonError("Ação inválida.");
  try {
    const supabase = requireDb();
    const fn = action === "confirm" ? "confirm_raffle_order" : "cancel_raffle_order";
    const { error } = await supabase.rpc(fn, { p_order_id: id });
    if (error) return jsonError(error.message, 500);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Erro ao atualizar pedido.", 500);
  }
}
