export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";

import { getAuthenticatedUser, unauthorizedResponse, serverErrorResponse } from "@/lib/auth-utils";
import prisma from "@/lib/prisma";

// GET - Get user profile
export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return unauthorizedResponse();

    const profile = await prisma.userProfile.findUnique({
      where: { userId: user.id },
    });

    const userData = await prisma.user.findUnique({
      where: { id: user.id },
      select: { name: true, email: true, image: true, createdAt: true },
    });

    return NextResponse.json({
      user: {
        id: user.id,
        name: userData?.name,
        email: userData?.email,
        image: userData?.image,
        memberSince: userData?.createdAt?.toISOString(),
      },
      profile: profile ? {
        displayName: profile.displayName,
        username: profile.username,
        bio: profile.bio,
        dateOfBirth: profile.dateOfBirth?.toISOString() || null,
        location: profile.location,
        website: profile.website,
        avatarUrl: profile.avatarUrl,
        coverImageUrl: profile.coverImageUrl,
        instagramUrl: profile.instagramUrl,
        twitterUrl: profile.twitterUrl,
        youtubeUrl: profile.youtubeUrl,
        tiktokUrl: profile.tiktokUrl,
        linkedinUrl: profile.linkedinUrl,
        height: profile.height,
        weight: profile.weight,
        targetWeight: profile.targetWeight,
        age: profile.age,
        gender: profile.gender,
        activityLevel: profile.activityLevel,
        fitnessGoal: profile.fitnessGoal,
        experienceLevel: profile.experienceLevel,
        workoutDays: profile.workoutDays,
        preferredWorkoutTime: profile.preferredWorkoutTime,
        dietaryRestrictions: profile.dietaryRestrictions,
        isPublic: profile.isPublic,
        showStats: profile.showStats,
        showStreak: profile.showStreak,
      } : null,
    });
  } catch (error) {
    console.error("Get profile error:", error);
    return serverErrorResponse();
  }
}

// PATCH - Update user profile
export async function PATCH(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return unauthorizedResponse();

    const body = await request.json();
    const {
      name,
      displayName,
      username,
      bio,
      dateOfBirth,
      location,
      website,
      avatarUrl,
      coverImageUrl,
      instagramUrl,
      twitterUrl,
      youtubeUrl,
      tiktokUrl,
      linkedinUrl,
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
      dietaryRestrictions,
      isPublic,
      showStats,
      showStreak,
    } = body;

    // Check username uniqueness if changing
    if (username) {
      const existingUser = await prisma.userProfile.findUnique({
        where: { username },
      });
      if (existingUser && existingUser.userId !== user.id) {
        return NextResponse.json({ error: "Username is already taken" }, { status: 400 });
      }
    }

    // Update user name if provided
    if (name !== undefined) {
      await prisma.user.update({
        where: { id: user.id },
        data: { name },
      });
    }

    // Upsert profile
    const profile = await prisma.userProfile.upsert({
      where: { userId: user.id },
      update: {
        ...(displayName !== undefined && { displayName }),
        ...(username !== undefined && { username }),
        ...(bio !== undefined && { bio }),
        ...(dateOfBirth !== undefined && { dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null }),
        ...(location !== undefined && { location }),
        ...(website !== undefined && { website }),
        ...(avatarUrl !== undefined && { avatarUrl }),
        ...(coverImageUrl !== undefined && { coverImageUrl }),
        ...(instagramUrl !== undefined && { instagramUrl }),
        ...(twitterUrl !== undefined && { twitterUrl }),
        ...(youtubeUrl !== undefined && { youtubeUrl }),
        ...(tiktokUrl !== undefined && { tiktokUrl }),
        ...(linkedinUrl !== undefined && { linkedinUrl }),
        ...(height !== undefined && { height }),
        ...(weight !== undefined && { weight }),
        ...(targetWeight !== undefined && { targetWeight }),
        ...(age !== undefined && { age }),
        ...(gender !== undefined && { gender }),
        ...(activityLevel !== undefined && { activityLevel }),
        ...(fitnessGoal !== undefined && { fitnessGoal }),
        ...(experienceLevel !== undefined && { experienceLevel }),
        ...(workoutDays !== undefined && { workoutDays }),
        ...(preferredWorkoutTime !== undefined && { preferredWorkoutTime }),
        ...(dietaryRestrictions !== undefined && { dietaryRestrictions }),
        ...(isPublic !== undefined && { isPublic }),
        ...(showStats !== undefined && { showStats }),
        ...(showStreak !== undefined && { showStreak }),
      },
      create: {
        userId: user.id,
        displayName,
        username,
        bio,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        location,
        website,
        avatarUrl,
        coverImageUrl,
        instagramUrl,
        twitterUrl,
        youtubeUrl,
        tiktokUrl,
        linkedinUrl,
        height,
        weight,
        targetWeight,
        age,
        gender,
        activityLevel,
        fitnessGoal,
        experienceLevel,
        workoutDays: workoutDays || 4,
        preferredWorkoutTime,
        dietaryRestrictions: dietaryRestrictions || [],
        isPublic: isPublic ?? true,
        showStats: showStats ?? true,
        showStreak: showStreak ?? true,
      },
    });

    return NextResponse.json({
      success: true,
      profile: {
        displayName: profile.displayName,
        username: profile.username,
        bio: profile.bio,
        dateOfBirth: profile.dateOfBirth?.toISOString() || null,
        location: profile.location,
        website: profile.website,
        avatarUrl: profile.avatarUrl,
        instagramUrl: profile.instagramUrl,
        twitterUrl: profile.twitterUrl,
        youtubeUrl: profile.youtubeUrl,
        tiktokUrl: profile.tiktokUrl,
        linkedinUrl: profile.linkedinUrl,
      },
    });
  } catch (error) {
    console.error("Update profile error:", error);
    return serverErrorResponse();
  }
}
