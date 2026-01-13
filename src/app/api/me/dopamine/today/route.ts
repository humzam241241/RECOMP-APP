export const runtime = "nodejs";

import { NextResponse } from "next/server";

import { getAuthenticatedUser, unauthorizedResponse, serverErrorResponse } from "@/lib/auth-utils";
import {
  getOrCreateActiveJourney,
  getOrCreateTodayDopamine,
  getAvailableHabits,
  toDopamineDailyDTO,
} from "@/lib/today-service";

export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return unauthorizedResponse();

    const journey = await getOrCreateActiveJourney(user.id);
    const [dopamine, habits] = await Promise.all([
      getOrCreateTodayDopamine(user.id, journey.id, journey.currentDay),
      getAvailableHabits(user.id),
    ]);

    const dto = toDopamineDailyDTO(dopamine, habits);
    return NextResponse.json(dto);
  } catch (error) {
    console.error("Error fetching dopamine:", error);
    return serverErrorResponse();
  }
}
