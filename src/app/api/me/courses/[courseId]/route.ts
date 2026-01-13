export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";

import { getAuthenticatedUser, unauthorizedResponse, serverErrorResponse } from "@/lib/auth-utils";
import prisma from "@/lib/prisma";

// GET - Get course details with full content
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return unauthorizedResponse();

    const { courseId } = await params;

    const course = await prisma.brainCourse.findUnique({
      where: { id: courseId },
      include: {
        modules: {
          orderBy: { orderIndex: "asc" },
        },
        progress: {
          where: { userId: user.id },
        },
      },
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    const userProgress = course.progress[0];

    return NextResponse.json({
      id: course.id,
      title: course.title,
      description: course.description,
      category: course.category,
      difficulty: course.difficulty,
      duration: course.duration,
      currentModule: userProgress?.currentModule || 0,
      isCompleted: userProgress?.isCompleted || false,
      modules: course.modules.map((m) => ({
        id: m.id,
        title: m.title,
        content: m.content,
        videoUrl: m.videoUrl,
        duration: m.duration,
        orderIndex: m.orderIndex,
      })),
    });
  } catch (error) {
    console.error("Get course error:", error);
    return serverErrorResponse();
  }
}

// POST - Update course progress
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return unauthorizedResponse();

    const { courseId } = await params;
    const body = await request.json();
    const { moduleIndex, completed } = body;

    const course = await prisma.brainCourse.findUnique({
      where: { id: courseId },
      include: { modules: true },
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    const isFullyCompleted = completed || moduleIndex >= course.modules.length - 1;

    await prisma.courseProgress.upsert({
      where: {
        userId_courseId: { userId: user.id, courseId },
      },
      update: {
        currentModule: moduleIndex + 1,
        isCompleted: isFullyCompleted,
        completedAt: isFullyCompleted ? new Date() : null,
      },
      create: {
        userId: user.id,
        courseId,
        currentModule: moduleIndex + 1,
        isCompleted: isFullyCompleted,
        completedAt: isFullyCompleted ? new Date() : null,
      },
    });

    return NextResponse.json({
      success: true,
      currentModule: moduleIndex + 1,
      isCompleted: isFullyCompleted,
    });
  } catch (error) {
    console.error("Update course progress error:", error);
    return serverErrorResponse();
  }
}
