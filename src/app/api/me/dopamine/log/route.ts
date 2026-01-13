export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";

import { getAuthenticatedUser, unauthorizedResponse, badRequestResponse, notFoundResponse, serverErrorResponse } from "@/lib/auth-utils";
import prisma from "@/lib/prisma";
import {
  getOrCreateActiveJourney,
  getOrCreateTodayDopamine,
  getAvailableHabits,
  toDopamineDailyDTO,
} from "@/lib/today-service";
import type { LogHabitRequest } from "@/types/dto";

const SCORE_VALUES = {
  GOOD_HABIT: 10,
  BAD_HABIT: -5,
  FIRST_WIN_BONUS: 5,
  SWAP_BONUS: 15,
  STREAK_BONUS: 10,
} as const;

const SWAP_WINDOW_MS = 60 * 60 * 1000; // 60 minutes

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return unauthorizedResponse();

    const body = (await request.json()) as LogHabitRequest;

    if (!body.habitId) {
      return badRequestResponse("Habit ID is required");
    }

    const habit = await prisma.habit.findFirst({
      where: { id: body.habitId, userId: user.id, isActive: true },
    });

    if (!habit) {
      return notFoundResponse("Habit not found");
    }

    const journey = await getOrCreateActiveJourney(user.id);
    const dopamine = await getOrCreateTodayDopamine(user.id, journey.id, journey.currentDay);

    // Create the habit log
    const habitLog = await prisma.habitLog.create({
      data: {
        userId: user.id,
        habitId: body.habitId,
        dopamineDailyId: dopamine.id,
        type: habit.type,
        notes: body.notes ?? null,
        swapFromLogId: body.swapFromLogId ?? null,
      },
    });

    // Calculate score updates
    let scoreChange = habit.type === "good" ? SCORE_VALUES.GOOD_HABIT : SCORE_VALUES.BAD_HABIT;
    let newFirstWin = dopamine.firstWin;
    let newSwapBonus = dopamine.swapBonus;
    let newStreakBonus = dopamine.streakBonus;

    // First Win Bonus: First good habit of the day
    if (habit.type === "good" && !dopamine.firstWin && dopamine.goodCount === 0) {
      scoreChange += SCORE_VALUES.FIRST_WIN_BONUS;
      newFirstWin = true;
    }

    // Swap Bonus: Logging a good habit within 60 minutes of a bad habit
    if (habit.type === "good" && body.swapFromLogId && !dopamine.swapBonus) {
      const badLog = await prisma.habitLog.findFirst({
        where: {
          id: body.swapFromLogId,
          userId: user.id,
          type: "bad",
          dopamineDailyId: dopamine.id,
        },
      });

      if (badLog) {
        const timeDiff = new Date().getTime() - badLog.loggedAt.getTime();
        if (timeDiff <= SWAP_WINDOW_MS) {
          scoreChange += SCORE_VALUES.SWAP_BONUS;
          newSwapBonus = true;

          // Update the swap reference on the habit log
          await prisma.habitLog.update({
            where: { id: habitLog.id },
            data: { swapFromLogId: body.swapFromLogId },
          });
        }
      }
    }

    // Streak Bonus: If yesterday had at least one good habit logged
    if (habit.type === "good" && !dopamine.streakBonus && dopamine.streakDays > 0) {
      scoreChange += SCORE_VALUES.STREAK_BONUS;
      newStreakBonus = true;
    }

    // Update dopamine daily record
    const updatedDopamine = await prisma.dopamineDaily.update({
      where: { id: dopamine.id },
      data: {
        score: dopamine.score + scoreChange,
        goodCount: habit.type === "good" ? dopamine.goodCount + 1 : dopamine.goodCount,
        badCount: habit.type === "bad" ? dopamine.badCount + 1 : dopamine.badCount,
        firstWin: newFirstWin,
        swapBonus: newSwapBonus,
        streakBonus: newStreakBonus,
      },
      include: {
        habitLogs: {
          include: { habit: true },
          orderBy: { loggedAt: "desc" },
        },
      },
    });

    const habits = await getAvailableHabits(user.id);
    const dto = toDopamineDailyDTO(updatedDopamine, habits);

    return NextResponse.json(dto, { status: 201 });
  } catch (error) {
    console.error("Error logging habit:", error);
    return serverErrorResponse();
  }
}
