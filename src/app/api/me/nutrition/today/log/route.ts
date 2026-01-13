export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";

import { getAuthenticatedUser, unauthorizedResponse, badRequestResponse, serverErrorResponse } from "@/lib/auth-utils";
import prisma from "@/lib/prisma";
import {
  getOrCreateActiveJourney,
  getOrCreateTodayNutrition,
  toNutritionPlanDTO,
} from "@/lib/today-service";
import type { LogNutritionRequest } from "@/types/dto";

export async function PATCH(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return unauthorizedResponse();

    const body = (await request.json()) as LogNutritionRequest;

    if (!body.mealType) {
      return badRequestResponse("Meal type is required");
    }

    const validMealTypes = ["breakfast", "lunch", "dinner", "snack"];
    if (!validMealTypes.includes(body.mealType)) {
      return badRequestResponse("Invalid meal type");
    }

    const journey = await getOrCreateActiveJourney(user.id);
    const nutrition = await getOrCreateTodayNutrition(user.id, journey.id, journey.currentDay);

    await prisma.nutritionLog.create({
      data: {
        userId: user.id,
        nutritionPlanId: nutrition.id,
        mealType: body.mealType,
        description: body.description ?? null,
        calories: body.calories ?? 0,
        protein: body.protein ?? 0,
        carbs: body.carbs ?? 0,
        fat: body.fat ?? 0,
      },
    });

    const updatedNutrition = await prisma.nutritionPlan.findUnique({
      where: { id: nutrition.id },
      include: {
        nutritionLogs: {
          orderBy: { loggedAt: "desc" },
        },
      },
    });

    const dto = toNutritionPlanDTO(updatedNutrition!);
    return NextResponse.json(dto);
  } catch (error) {
    console.error("Error logging nutrition:", error);
    return serverErrorResponse();
  }
}
