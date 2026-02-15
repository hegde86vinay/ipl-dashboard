import { NextRequest, NextResponse } from "next/server";
import { getPlayerDetail } from "@/lib/queries/players";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ playerId: string }> }
) {
  const { playerId } = await params;
  const data = await getPlayerDetail(parseInt(playerId));

  if (!data) {
    return NextResponse.json({ error: "Player not found" }, { status: 404 });
  }

  return NextResponse.json(data);
}
