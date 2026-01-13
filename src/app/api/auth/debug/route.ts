import { NextResponse } from "next/server";

export async function GET() {
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  
  return NextResponse.json({
    message: "NextAuth Debug Info",
    availableEndpoints: {
      signin: `${baseUrl}/api/auth/signin`,
      signout: `${baseUrl}/api/auth/signout`,
      session: `${baseUrl}/api/auth/session`,
      providers: `${baseUrl}/api/auth/providers`,
      csrf: `${baseUrl}/api/auth/csrf`,
      googleSignin: `${baseUrl}/api/auth/signin?provider=google`, // NextAuth v5 pattern
    },
    environment: {
      NEXTAUTH_URL: process.env.NEXTAUTH_URL,
      NODE_ENV: process.env.NODE_ENV,
      hasGoogleClientId: !!process.env.GOOGLE_CLIENT_ID,
      hasGoogleClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
      hasAuthSecret: !!(process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET),
    },
    timestamp: new Date().toISOString(),
  });
}