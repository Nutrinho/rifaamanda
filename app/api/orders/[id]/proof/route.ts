import { NextResponse } from "next/server";
import { jsonError, requireDb } from "@/lib/api";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const supabase = requireDb();
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) return jsonError("Envie um arquivo de comprovante.");
    const ext = file.name.split(".").pop() || "jpg";
    const path = `payment-proofs/${id}-${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage.from("proofs").upload(path, file, { upsert: true });
    if (uploadError) return jsonError(uploadError.message, 500);
    const { data } = supabase.storage.from("proofs").getPublicUrl(path);
    const { error } = await supabase.from("orders").update({ status: "proof_sent", payment_proof_url: data.publicUrl }).eq("id", id);
    if (error) return jsonError(error.message, 500);
    return NextResponse.json({ ok: true, url: data.publicUrl });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Erro ao enviar comprovante.", 500);
  }
}
