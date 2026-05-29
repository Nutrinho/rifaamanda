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
  const { data, error } = await supabase.from("campaigns").select("*").limit(1).single();
  if (error) return defaultCampaign;
  return (data as Campaign | null) ?? defaultCampaign;
}

function fallbackNumbers(total = defaultCampaign.total_numbers): RaffleNumber[] {
  return Array.from({ length: total }, (_, index) => ({
    id: `fallback-${index + 1}`,
    number: index + 1,
    status: "available",
    order_id: null,
    buyer_name: null,
    buyer_whatsapp: null
  }));
}

export async function getNumbers(): Promise<RaffleNumber[]> {
  const supabase = adminSupabase() ?? browserSupabase();
  if (!supabase) return fallbackNumbers();
  const campaign = await getCampaign();
  const { data, error } = await supabase.from("raffle_numbers").select("*").order("number");
  if (error || !data || data.length === 0) return fallbackNumbers(campaign.total_numbers);
  return data as RaffleNumber[];
}

export async function getOrder(id: string): Promise<Order | null> {
  const supabase = adminSupabase() ?? browserSupabase();
  if (!supabase) return null;
  const { data } = await supabase.from("orders").select("*").eq("id", id).single();
  return data as Order | null;
}
