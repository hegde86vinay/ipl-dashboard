import { NextRequest, NextResponse } from "next/server";
import { searchMatches } from "@/lib/queries/matches";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;

  const data = await searchMatches({
    season: params.get("season") ? parseInt(params.get("season")!) : undefined,
    teamSlug: params.get("team") || undefined,
    venueId: params.get("venue") ? parseInt(params.get("venue")!) : undefined,
    result: params.get("result") || undefined,
    limit: parseInt(params.get("limit") || "20"),
    offset: parseInt(params.get("offset") || "0"),
  });

  return NextResponse.json(data);
}
