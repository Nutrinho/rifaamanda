import { NextResponse } from "next/server";
import { getNumbers } from "@/lib/supabase";

export async function GET() {
  return NextResponse.json(await getNumbers());
}
