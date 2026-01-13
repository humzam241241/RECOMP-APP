export const runtime = "nodejs";

import { NextResponse } from "next/server";

import { getAuthenticatedUser, unauthorizedResponse, serverErrorResponse } from "@/lib/auth-utils";
import {
  getOrCreateActiveJourney,
  getOrCreateTodayWorkout,
  toWorkoutSessionDTO,
} from "@/lib/today-service";

export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return unauthorizedResponse();

    const journey = await getOrCreateActiveJourney(user.id);
    const workout = await getOrCreateTodayWorkout(user.id, journey.id, journey.currentDay);
    const dto = toWorkoutSessionDTO(workout);

    return NextResponse.json(dto);
  } catch (error) {
    console.error("Error fetching workout:", error);
    return serverErrorResponse();
  }
}
