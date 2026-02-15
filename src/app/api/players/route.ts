import { NextRequest, NextResponse } from "next/server";
import { searchPlayers } from "@/lib/queries/players";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const search = params.get("search") || "";
  const limit = parseInt(params.get("limit") || "20");
  const offset = parseInt(params.get("offset") || "0");

  const data = await searchPlayers(search, limit, offset);
  return NextResponse.json(data);
}
