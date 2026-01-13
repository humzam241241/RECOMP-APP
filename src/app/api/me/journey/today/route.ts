export const runtime = "nodejs";

import { NextResponse } from "next/server";

import { getAuthenticatedUser, unauthorizedResponse, serverErrorResponse } from "@/lib/auth-utils";
import { getOrCreateActiveJourney, toJourneyDTO } from "@/lib/today-service";

export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return unauthorizedResponse();

    const journey = await getOrCreateActiveJourney(user.id);
    const dto = toJourneyDTO(journey);

    return NextResponse.json(dto);
  } catch (error) {
    console.error("Error fetching journey:", error);
    return serverErrorResponse();
  }
}
