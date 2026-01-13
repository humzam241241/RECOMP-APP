export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";

import { getAuthenticatedUser, unauthorizedResponse, notFoundResponse, serverErrorResponse, badRequestResponse } from "@/lib/auth-utils";
import prisma from "@/lib/prisma";
import { toWorkoutSessionDTO } from "@/lib/today-service";
import type { UpdateWorkoutSessionRequest } from "@/types/dto";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return unauthorizedResponse();

    const { sessionId } = await params;
    const body = (await request.json()) as UpdateWorkoutSessionRequest;

    const workout = await prisma.workoutSession.findFirst({
      where: { id: sessionId, userId: user.id },
      include: {
        exercises: {
          include: { sets: true },
          orderBy: { orderIndex: "asc" },
        },
      },
    });

    if (!workout) {
      return notFoundResponse("Workout session not found");
    }

    const updateData: {
      status?: string;
      notes?: string;
      startedAt?: Date;
      completedAt?: Date;
      duration?: number;
    } = {};

    if (body.status) {
      updateData.status = body.status;

      if (body.status === "in_progress" && !workout.startedAt) {
        updateData.startedAt = new Date();
      }

      if (body.status === "completed" && !workout.completedAt) {
        updateData.completedAt = new Date();
        if (workout.startedAt) {
          updateData.duration = Math.round(
            (new Date().getTime() - workout.startedAt.getTime()) / 60000
          );
        }
      }
    }

    if (body.notes !== undefined) {
      updateData.notes = body.notes;
    }

    if (body.sets && body.sets.length > 0) {
      for (const setUpdate of body.sets) {
        if (!setUpdate.setId) {
          return badRequestResponse("Set ID is required for set updates");
        }

        const existingSet = await prisma.exerciseSet.findFirst({
          where: { id: setUpdate.setId },
          include: {
            exercise: {
              select: { workoutSessionId: true },
            },
          },
        });

        if (!existingSet || existingSet.exercise.workoutSessionId !== sessionId) {
          return notFoundResponse(`Set ${setUpdate.setId} not found in this workout`);
        }

        const setData: {
          weight?: number;
          reps?: number;
          rpe?: number;
          isCompleted?: boolean;
          completedAt?: Date | null;
          notes?: string;
        } = {};

        if (setUpdate.weight !== undefined) setData.weight = setUpdate.weight;
        if (setUpdate.reps !== undefined) setData.reps = setUpdate.reps;
        if (setUpdate.rpe !== undefined) setData.rpe = setUpdate.rpe;
        if (setUpdate.notes !== undefined) setData.notes = setUpdate.notes;

        if (setUpdate.isCompleted !== undefined) {
          setData.isCompleted = setUpdate.isCompleted;
          setData.completedAt = setUpdate.isCompleted ? new Date() : null;
        }

        await prisma.exerciseSet.update({
          where: { id: setUpdate.setId },
          data: setData,
        });
      }
    }

    const updatedWorkout = await prisma.workoutSession.update({
      where: { id: sessionId },
      data: updateData,
      include: {
        exercises: {
          include: { sets: true },
          orderBy: { orderIndex: "asc" },
        },
      },
    });

    const dto = toWorkoutSessionDTO(updatedWorkout);
    return NextResponse.json(dto);
  } catch (error) {
    console.error("Error updating workout:", error);
    return serverErrorResponse();
  }
}
