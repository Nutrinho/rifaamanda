import { NextResponse } from "next/server";
import { adminSupabase, getCampaign } from "./supabase";

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export function requireAdmin(request: Request) {
  const token = request.headers.get("x-admin-token");
  const password = process.env.ADMIN_PASSWORD;
  return Boolean(password && token === password);
}

export async function campaignId() {
  const campaign = await getCampaign();
  return campaign.id;
}

export function requireDb() {
  const supabase = adminSupabase();
  if (!supabase) throw new Error("Supabase não configurado.");
  return supabase;
}
