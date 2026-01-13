export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";

import { getAuthenticatedUser, unauthorizedResponse, serverErrorResponse } from "@/lib/auth-utils";
import prisma from "@/lib/prisma";

// GET - Get today's water intake
export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return unauthorizedResponse();

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const waterLogs = await prisma.waterLog.findMany({
      where: {
        userId: user.id,
        loggedAt: {
          gte: today,
          lt: tomorrow,
        },
      },
    });

    const totalLiters = waterLogs.reduce((sum, log) => sum + log.amount, 0);

    return NextResponse.json({
      totalLiters,
      targetLiters: 3.0,
      logs: waterLogs.map((log) => ({
        id: log.id,
        amount: log.amount,
        loggedAt: log.loggedAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error("Get water error:", error);
    return serverErrorResponse();
  }
}

// POST - Log water intake
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return unauthorizedResponse();

    const body = await request.json();
    const { amount } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Valid amount required" }, { status: 400 });
    }

    const waterLog = await prisma.waterLog.create({
      data: {
        userId: user.id,
        amount: parseFloat(amount),
        loggedAt: new Date(),
      },
    });

    // Get updated total
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const waterLogs = await prisma.waterLog.findMany({
      where: {
        userId: user.id,
        loggedAt: {
          gte: today,
          lt: tomorrow,
        },
      },
    });

    const totalLiters = waterLogs.reduce((sum, log) => sum + log.amount, 0);

    return NextResponse.json({
      success: true,
      log: {
        id: waterLog.id,
        amount: waterLog.amount,
        loggedAt: waterLog.loggedAt.toISOString(),
      },
      totalLiters,
    });
  } catch (error) {
    console.error("Log water error:", error);
    return serverErrorResponse();
  }
}
