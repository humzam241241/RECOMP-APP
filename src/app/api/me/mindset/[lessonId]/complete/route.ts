export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";

import { getAuthenticatedUser, unauthorizedResponse, notFoundResponse, serverErrorResponse, badRequestResponse } from "@/lib/auth-utils";
import prisma from "@/lib/prisma";
import {
  getOrCreateActiveJourney,
  getOrCreateTodayMindset,
  toMindsetTodayDTO,
} from "@/lib/today-service";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return unauthorizedResponse();

    const { lessonId } = await params;

    const progress = await prisma.mindsetProgress.findFirst({
      where: {
        userId: user.id,
        mindsetLessonId: lessonId,
      },
    });

    if (!progress) {
      return notFoundResponse("Lesson progress not found");
    }

    if (!progress.isUnlocked) {
      return badRequestResponse("Lesson is not yet unlocked");
    }

    if (progress.isCompleted) {
      return badRequestResponse("Lesson already completed");
    }

    await prisma.mindsetProgress.update({
      where: { id: progress.id },
      data: {
        isCompleted: true,
        completedAt: new Date(),
      },
    });

    const journey = await getOrCreateActiveJourney(user.id);
    const mindsetData = await getOrCreateTodayMindset(user.id, journey.currentDay);
    const dto = toMindsetTodayDTO(mindsetData, journey.currentDay);

    return NextResponse.json(dto);
  } catch (error) {
    console.error("Error completing mindset lesson:", error);
    return serverErrorResponse();
  }
}
