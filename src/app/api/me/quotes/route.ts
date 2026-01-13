export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";

import { getAuthenticatedUser, unauthorizedResponse, serverErrorResponse } from "@/lib/auth-utils";
import prisma from "@/lib/prisma";

// GET - Get quotes (random or by category)
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return unauthorizedResponse();

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const random = searchParams.get("random") === "true";
    const limit = parseInt(searchParams.get("limit") || "10");

    let quotes;

    if (random) {
      // Get random quotes
      const allQuotes = await prisma.quote.findMany({
        where: category ? { category, isActive: true } : { isActive: true },
      });
      
      // Shuffle and take limit
      quotes = allQuotes
        .sort(() => Math.random() - 0.5)
        .slice(0, limit);
    } else {
      quotes = await prisma.quote.findMany({
        where: category ? { category, isActive: true } : { isActive: true },
        take: limit,
      });
    }

    // Get user's saved quotes
    const savedQuotes = await prisma.savedQuote.findMany({
      where: { userId: user.id },
      select: { quoteId: true },
    });
    const savedQuoteIds = new Set(savedQuotes.map((sq) => sq.quoteId));

    return NextResponse.json({
      quotes: quotes.map((q) => ({
        id: q.id,
        text: q.text,
        author: q.author,
        category: q.category,
        isSaved: savedQuoteIds.has(q.id),
      })),
    });
  } catch (error) {
    console.error("Get quotes error:", error);
    return serverErrorResponse();
  }
}

// POST - Save/unsave a quote
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return unauthorizedResponse();

    const body = await request.json();
    const { quoteId, action } = body;

    if (!quoteId) {
      return NextResponse.json({ error: "Quote ID required" }, { status: 400 });
    }

    if (action === "save") {
      await prisma.savedQuote.upsert({
        where: {
          userId_quoteId: { userId: user.id, quoteId },
        },
        update: {},
        create: {
          userId: user.id,
          quoteId,
        },
      });
    } else if (action === "unsave") {
      await prisma.savedQuote.deleteMany({
        where: { userId: user.id, quoteId },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Save quote error:", error);
    return serverErrorResponse();
  }
}
