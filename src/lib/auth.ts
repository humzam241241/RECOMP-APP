import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import NextAuth, { type NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";

import prisma from "@/lib/prisma";

// Safe logging and strict runtime assertions for OAuth env
const googleClientId = process.env.GOOGLE_CLIENT_ID?.trim();
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();
const nextAuthUrl = process.env.NEXTAUTH_URL?.trim();
const authSecret = (process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET)?.trim();

(() => {
  const suffix = googleClientId?.slice(-6) || "MISSING";
  const secretLen = googleClientSecret?.length ?? 0;
  const authSecretLen = authSecret?.length ?? 0;
  const url = nextAuthUrl || "MISSING";

  console.log("----------------------------------------");
  console.log("[AUTH][STARTUP] ENVIRONMENT CHECK:");
  console.log("  GOOGLE_CLIENT_ID suffix:", suffix);
  console.log("  GOOGLE_CLIENT_SECRET length:", secretLen);
  console.log("  NEXTAUTH_URL:", url);
  console.log("  AUTH_SECRET/NEXTAUTH_SECRET length:", authSecretLen);
  console.log("----------------------------------------");

  if (!googleClientId || !googleClientSecret || !nextAuthUrl || !authSecret) {
    const missing = [];
    if (!googleClientId) missing.push("GOOGLE_CLIENT_ID");
    if (!googleClientSecret) missing.push("GOOGLE_CLIENT_SECRET");
    if (!nextAuthUrl) missing.push("NEXTAUTH_URL");
    if (!authSecret) missing.push("AUTH_SECRET/NEXTAUTH_SECRET");
    
    throw new Error(`[AUTH][FATAL] Missing environment variables: ${missing.join(", ")}`);
  }
})();

export const authConfig: NextAuthConfig = {
  adapter: PrismaAdapter(prisma),
  secret: authSecret,
  trustHost: true,
  debug: true,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  logger: {
    error(error) {
      console.error("[AUTH][ERROR]", error);
    },
    warn(code) {
      console.warn("[AUTH][WARN]", code);
    },
    debug(code, metadata) {
      // Clean metadata of secrets before logging
      const safeMetadata = metadata ? JSON.parse(JSON.stringify(metadata)) : metadata;
      if (safeMetadata?.client_secret) safeMetadata.client_secret = "[REDACTED]";
      console.log("[AUTH][DEBUG]", code, safeMetadata);
    },
  },
  pages: {
    signIn: "/auth/signin",
    signOut: "/auth/signout",
    error: "/auth/error",
    newUser: "/onboarding",
  },
  providers: [
    Google({
      clientId: googleClientId,
      clientSecret: googleClientSecret,
      allowDangerousEmailAccountLinking: true,
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = credentials.email as string;
        const password = credentials.password as string;

        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user || !user.password) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id;
        
        // Check if onboarding is complete
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { onboardingComplete: true },
        });
        token.onboardingComplete = dbUser?.onboardingComplete ?? false;
      }
      
      // Handle update trigger
      if (trigger === "update") {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { onboardingComplete: true },
        });
        token.onboardingComplete = dbUser?.onboardingComplete ?? false;
      }
      
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.onboardingComplete = token.onboardingComplete as boolean;
      }
      return session;
    },
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
