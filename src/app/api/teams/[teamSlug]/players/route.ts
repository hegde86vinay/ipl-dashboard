import { NextRequest, NextResponse } from "next/server";
import { getTeamPlayers } from "@/lib/queries/teams";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ teamSlug: string }> }
) {
  const { teamSlug } = await params;
  const data = await getTeamPlayers(teamSlug);

  if (!data) {
    return NextResponse.json({ error: "Team not found" }, { status: 404 });
  }

  return NextResponse.json(data);
}
