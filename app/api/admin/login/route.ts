import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api";

export async function POST(request: Request) {
  const { password } = await request.json();
  if (!process.env.ADMIN_PASSWORD || password !== process.env.ADMIN_PASSWORD) return jsonError("Senha inválida.", 401);
  return NextResponse.json({ token: password });
}
