import { NextRequest, NextResponse } from "next/server";
import { getHeadToHead } from "@/lib/queries/head-to-head";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const team1 = params.get("team1");
  const team2 = params.get("team2");

  if (!team1 || !team2) {
    return NextResponse.json({ error: "Both team1 and team2 params required" }, { status: 400 });
  }

  const data = await getHeadToHead(team1, team2);

  if (!data) {
    return NextResponse.json({ error: "One or both teams not found" }, { status: 404 });
  }

  return NextResponse.json(data);
}
