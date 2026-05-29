import { NextResponse } from "next/server";
import { getCampaign } from "@/lib/supabase";

export async function GET() {
  return NextResponse.json(await getCampaign());
}
