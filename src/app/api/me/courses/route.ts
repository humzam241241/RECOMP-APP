export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";

import { getAuthenticatedUser, unauthorizedResponse, serverErrorResponse } from "@/lib/auth-utils";
import prisma from "@/lib/prisma";

// GET - Get all courses with user progress
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return unauthorizedResponse();

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");

    const courses = await prisma.brainCourse.findMany({
      where: category ? { category, isActive: true } : { isActive: true },
      include: {
        modules: {
          orderBy: { orderIndex: "asc" },
        },
        progress: {
          where: { userId: user.id },
        },
      },
      orderBy: { orderIndex: "asc" },
    });

    return NextResponse.json({
      courses: courses.map((course) => {
        const userProgress = course.progress[0];
        return {
          id: course.id,
          title: course.title,
          description: course.description,
          category: course.category,
          difficulty: course.difficulty,
          duration: course.duration,
          imageUrl: course.imageUrl,
          modulesCount: course.modules.length,
          currentModule: userProgress?.currentModule || 0,
          isCompleted: userProgress?.isCompleted || false,
          isStarted: !!userProgress,
          modules: course.modules.map((m) => ({
            id: m.id,
            title: m.title,
            duration: m.duration,
            orderIndex: m.orderIndex,
          })),
        };
      }),
    });
  } catch (error) {
    console.error("Get courses error:", error);
    return serverErrorResponse();
  }
}
