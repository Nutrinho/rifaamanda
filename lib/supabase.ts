import { createClient } from "@supabase/supabase-js";
import { defaultCampaign } from "./constants";
import type { Campaign, Order, RaffleNumber } from "./types";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const isSupabaseConfigured = Boolean(url && anonKey);

export function browserSupabase() {
  if (!url || !anonKey) return null;
  return createClient(url, anonKey);
}

export function adminSupabase() {
  if (!url || !serviceKey) return null;
  return createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
}

export async function getCampaign(): Promise<Campaign> {
  const supabase = adminSupabase() ?? browserSupabase();
  if (!supabase) return defaultCampaign;
  const { data } = await supabase.from("campaigns").select("*").limit(1).single();
  return (data as Campaign | null) ?? defaultCampaign;
}

export async function getNumbers(): Promise<RaffleNumber[]> {
  const supabase = adminSupabase() ?? browserSupabase();
  if (!supabase) {
    return Array.from({ length: defaultCampaign.total_numbers }, (_, index) => ({
      id: String(index + 1),
      number: index + 1,
      status: "available",
      order_id: null,
      buyer_name: null,
      buyer_whatsapp: null
    }));
  }
  const { data } = await supabase.from("raffle_numbers").select("*").order("number");
  return (data as RaffleNumber[] | null) ?? [];
}

export async function getOrder(id: string): Promise<Order | null> {
  const supabase = adminSupabase() ?? browserSupabase();
  if (!supabase) return null;
  const { data } = await supabase.from("orders").select("*").eq("id", id).single();
  return data as Order | null;
}
