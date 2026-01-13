export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";

import { getAuthenticatedUser, unauthorizedResponse, serverErrorResponse } from "@/lib/auth-utils";
import prisma from "@/lib/prisma";

// GET - Get user's habits
export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return unauthorizedResponse();

    const habits = await prisma.habit.findMany({
      where: { userId: user.id, isActive: true },
      orderBy: [{ type: "asc" }, { createdAt: "asc" }],
    });

    return NextResponse.json({
      habits: habits.map((h) => ({
        id: h.id,
        name: h.name,
        description: h.description,
        type: h.type,
        category: h.category,
        dopamineType: h.dopamineType,
        icon: h.icon,
        color: h.color,
        isPreset: h.isPreset,
      })),
    });
  } catch (error) {
    console.error("Get habits error:", error);
    return serverErrorResponse();
  }
}

// POST - Create a new habit
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return unauthorizedResponse();

    const body = await request.json();
    const { name, description, type, category, dopamineType } = body;

    if (!name || !type) {
      return NextResponse.json({ error: "Name and type are required" }, { status: 400 });
    }

    if (!["good", "bad"].includes(type)) {
      return NextResponse.json({ error: "Type must be 'good' or 'bad'" }, { status: 400 });
    }

    const habit = await prisma.habit.create({
      data: {
        userId: user.id,
        name,
        description: description || null,
        type,
        category: category || null,
        dopamineType: dopamineType || (type === "good" ? "natural" : "artificial"),
        isPreset: false,
        isActive: true,
      },
    });

    return NextResponse.json({
      habit: {
        id: habit.id,
        name: habit.name,
        description: habit.description,
        type: habit.type,
        category: habit.category,
        dopamineType: habit.dopamineType,
        isPreset: habit.isPreset,
      },
    });
  } catch (error) {
    console.error("Create habit error:", error);
    return serverErrorResponse();
  }
}

// DELETE - Delete a habit
export async function DELETE(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return unauthorizedResponse();

    const { searchParams } = new URL(request.url);
    const habitId = searchParams.get("id");

    if (!habitId) {
      return NextResponse.json({ error: "Habit ID required" }, { status: 400 });
    }

    // Verify ownership
    const habit = await prisma.habit.findFirst({
      where: { id: habitId, userId: user.id },
    });

    if (!habit) {
      return NextResponse.json({ error: "Habit not found" }, { status: 404 });
    }

    // Soft delete by setting isActive to false
    await prisma.habit.update({
      where: { id: habitId },
      data: { isActive: false },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete habit error:", error);
    return serverErrorResponse();
  }
}
