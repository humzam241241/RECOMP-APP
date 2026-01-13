export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";

import { getAuthenticatedUser, unauthorizedResponse, serverErrorResponse } from "@/lib/auth-utils";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return unauthorizedResponse();

    const body = await request.json();
    const {
      height,
      weight,
      targetWeight,
      age,
      gender,
      activityLevel,
      fitnessGoal,
      experienceLevel,
      workoutDays,
      preferredWorkoutTime,
    } = body;

    // Calculate BMR and TDEE
    const heightNum = parseFloat(height) || 175;
    const weightNum = parseFloat(weight) || 80;
    const ageNum = parseInt(age) || 28;
    const isMale = gender !== "female";

    // BMR using Mifflin-St Jeor equation
    const bmr = isMale
      ? 10 * weightNum + 6.25 * heightNum - 5 * ageNum + 5
      : 10 * weightNum + 6.25 * heightNum - 5 * ageNum - 161;

    const activityMultipliers: Record<string, number> = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      very_active: 1.9,
    };

    const tdee = Math.round(bmr * (activityMultipliers[activityLevel] || 1.55));

    // Create or update profile
    await prisma.userProfile.upsert({
      where: { userId: user.id },
      update: {
        height: parseFloat(height) || null,
        weight: parseFloat(weight) || null,
        targetWeight: parseFloat(targetWeight) || null,
        age: parseInt(age) || null,
        gender,
        activityLevel,
        fitnessGoal,
        experienceLevel,
        workoutDays: parseInt(workoutDays) || 4,
        preferredWorkoutTime,
        bmr,
        tdee,
      },
      create: {
        userId: user.id,
        height: parseFloat(height) || null,
        weight: parseFloat(weight) || null,
        targetWeight: parseFloat(targetWeight) || null,
        age: parseInt(age) || null,
        gender,
        activityLevel,
        fitnessGoal,
        experienceLevel,
        workoutDays: parseInt(workoutDays) || 4,
        preferredWorkoutTime,
        bmr,
        tdee,
      },
    });

    // Mark onboarding as complete
    await prisma.user.update({
      where: { id: user.id },
      data: { onboardingComplete: true },
    });

    // Create the user's journey
    const existingJourney = await prisma.journey.findFirst({
      where: { userId: user.id, isActive: true },
    });

    if (!existingJourney) {
      await prisma.journey.create({
        data: {
          userId: user.id,
          startDate: new Date(),
          currentDay: 1,
          phase: "foundation",
          isActive: true,
        },
      });
    }

    // Create default habits based on goals
    const existingHabits = await prisma.habit.findMany({
      where: { userId: user.id },
    });

    if (existingHabits.length === 0) {
      const defaultHabits = [
        // Good habits - Natural dopamine
        { name: "Morning Workout", type: "good", category: "exercise", dopamineType: "natural" },
        { name: "8 Hours Sleep", type: "good", category: "sleep", dopamineType: "natural" },
        { name: "Hit Protein Goal", type: "good", category: "nutrition", dopamineType: "natural" },
        { name: "10 Min Meditation", type: "good", category: "mindfulness", dopamineType: "natural" },
        { name: "10K Steps", type: "good", category: "exercise", dopamineType: "natural" },
        { name: "Cold Shower", type: "good", category: "mindfulness", dopamineType: "natural" },
        { name: "Read 20 Pages", type: "good", category: "productivity", dopamineType: "natural" },
        { name: "Drink 3L Water", type: "good", category: "nutrition", dopamineType: "natural" },
        // Bad habits - Artificial dopamine
        { name: "Social Media Scrolling", type: "bad", category: "vice", dopamineType: "artificial" },
        { name: "Late Night Snacking", type: "bad", category: "nutrition", dopamineType: "artificial" },
        { name: "Skipped Workout", type: "bad", category: "exercise", dopamineType: "artificial" },
        { name: "Alcohol", type: "bad", category: "vice", dopamineType: "artificial" },
        { name: "Processed Food", type: "bad", category: "nutrition", dopamineType: "artificial" },
        { name: "Binge Watching", type: "bad", category: "vice", dopamineType: "artificial" },
      ];

      await prisma.habit.createMany({
        data: defaultHabits.map((h) => ({ ...h, userId: user.id, isPreset: true })),
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Onboarding error:", error);
    return serverErrorResponse();
  }
}
