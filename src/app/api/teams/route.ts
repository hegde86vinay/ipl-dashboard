import { NextRequest, NextResponse } from "next/server";
import { getAllTeams } from "@/lib/queries/teams";

export async function GET(request: NextRequest) {
  const activeOnly = request.nextUrl.searchParams.get("active") === "true";
  const teams = await getAllTeams(activeOnly);
  return NextResponse.json({ teams });
}
