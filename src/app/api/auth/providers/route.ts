export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { authConfig } from "@/lib/auth";

export async function GET() {
  const providers = authConfig.providers.map((provider: any) => {
    if (provider.id === "google") {
      const clientId = process.env.GOOGLE_CLIENT_ID || "";
      return {
        id: "google",
        name: "Google",
        type: "oauth",
        clientIdSuffix: clientId.length > 6 ? clientId.substring(clientId.length - 6) : "N/A",
        configured: !!clientId,
      };
    }
    return {
      id: provider.id || "unknown",
      name: provider.name || "Unknown",
      type: provider.type || "unknown",
    };
  });

  return NextResponse.json({
    providers,
    nextAuthUrl: process.env.NEXTAUTH_URL || "http://localhost:3000",
  });
}
