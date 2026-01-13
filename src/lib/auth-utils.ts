import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";

export async function getAuthenticatedUser() {
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  return session.user;
}

export function unauthorizedResponse() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export function notFoundResponse(message = "Not found") {
  return NextResponse.json({ error: message }, { status: 404 });
}

export function badRequestResponse(message = "Bad request") {
  return NextResponse.json({ error: message }, { status: 400 });
}

export function serverErrorResponse(message = "Internal server error") {
  return NextResponse.json({ error: message }, { status: 500 });
}
