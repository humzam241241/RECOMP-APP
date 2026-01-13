export const runtime = "nodejs";

import { NextResponse } from "next/server";

import { getAuthenticatedUser, unauthorizedResponse, serverErrorResponse } from "@/lib/auth-utils";
import {
  getOrCreateActiveJourney,
  getOrCreateTodayNutrition,
  toNutritionPlanDTO,
} from "@/lib/today-service";

export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return unauthorizedResponse();

    const journey = await getOrCreateActiveJourney(user.id);
    const nutrition = await getOrCreateTodayNutrition(user.id, journey.id, journey.currentDay);
    const dto = toNutritionPlanDTO(nutrition);

    return NextResponse.json(dto);
  } catch (error) {
    console.error("Error fetching nutrition:", error);
    return serverErrorResponse();
  }
}
