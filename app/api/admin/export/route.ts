import { jsonError, requireAdmin, requireDb } from "@/lib/api";
import { padNumber } from "@/lib/utils";

export async function GET(request: Request) {
  if (!requireAdmin(request)) return jsonError("Não autorizado.", 401);
  const supabase = requireDb();
  const { data, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
  if (error) return jsonError(error.message, 500);
  const rows = [
    ["id", "nome", "whatsapp", "cidade", "estado", "numeros", "valor", "status", "data"],
    ...(data ?? []).map((o) => [o.id, o.buyer_name, o.buyer_whatsapp, o.buyer_city, o.buyer_state, o.selected_numbers.map(padNumber).join(" "), o.total_amount, o.status, o.created_at])
  ];
  const csv = rows.map((row) => row.map((cell) => `"${String(cell ?? "").replaceAll('"', '""')}"`).join(",")).join("\n");
  return new Response(csv, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": "attachment; filename=pedidos-rifa-amanda.csv"
    }
  });
}
