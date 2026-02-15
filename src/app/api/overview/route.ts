import { NextRequest, NextResponse } from "next/server";
import { getOverviewStats } from "@/lib/queries/overview";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const seasonFrom = parseInt(params.get("seasonFrom") || "2008");
  const seasonTo = parseInt(params.get("seasonTo") || "2024");

  const data = await getOverviewStats(seasonFrom, seasonTo);
  return NextResponse.json(data);
}
