export const runtime = "nodejs";

import { NextResponse } from "next/server";

import { getAuthenticatedUser, unauthorizedResponse, serverErrorResponse } from "@/lib/auth-utils";
import {
  getOrCreateActiveJourney,
  getOrCreateTodayMindset,
  toMindsetTodayDTO,
} from "@/lib/today-service";

export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return unauthorizedResponse();

    const journey = await getOrCreateActiveJourney(user.id);
    const mindsetData = await getOrCreateTodayMindset(user.id, journey.currentDay);
    const dto = toMindsetTodayDTO(mindsetData, journey.currentDay);

    return NextResponse.json(dto);
  } catch (error) {
    console.error("Error fetching mindset:", error);
    return serverErrorResponse();
  }
}
