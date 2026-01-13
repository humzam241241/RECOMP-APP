import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import NextAuth, { type NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";

import prisma from "@/lib/prisma";

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
const authSecret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;

console.log("🔐 [AUTH] Starting NextAuth with Google OAuth");
console.log("📍 CLIENT_ID:", googleClientId ? `${googleClientId.slice(0, 10)}...` : "MISSING");
console.log("📍 CLIENT_SECRET:", googleClientSecret ? "Present" : "MISSING"); 
console.log("📍 AUTH_SECRET:", authSecret ? "Present" : "MISSING");
console.log("📍 NEXTAUTH_URL:", process.env.NEXTAUTH_URL);
console.log("📍 NODE_ENV:", process.env.NODE_ENV);

if (!googleClientId || !googleClientSecret || !authSecret) {
  throw new Error("❌ Missing Google OAuth credentials or AUTH_SECRET");
}

export const authConfig: NextAuthConfig = {
  adapter: PrismaAdapter(prisma),
  secret: authSecret,
  trustHost: true,
  debug: process.env.NODE_ENV === "development",
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  providers: [
    Google({
      clientId: googleClientId!,
      clientSecret: googleClientSecret!,
      allowDangerousEmailAccountLinking: true,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline", 
          response_type: "code"
        }
      }
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
    async redirect({ url, baseUrl }) {
      console.log("🔄 [REDIRECT CALLBACK]", { url, baseUrl });

      // Allow Google OAuth authorization redirects (external origin).
      // Without this, an overly-strict redirect policy can break OAuth initiation.
      try {
        const u = new URL(url);
        if (u.origin === "https://accounts.google.com") {
          console.log("✅ Allowing Google OAuth redirect:", u.origin);
          return url;
        }
      } catch {
        // ignore parse errors
      }
      
      // In development, force strictly to localhost:3000 for relative URLs
      const effectiveBaseUrl = process.env.NODE_ENV === "development" ? "http://localhost:3000" : baseUrl;
      
      // If the redirect URL is relative, prepend effectiveBaseUrl
      if (url.startsWith("/")) {
        console.log(`🏠 Relative redirect: ${effectiveBaseUrl}${url}`);
        return `${effectiveBaseUrl}${url}`;
      }
      
      // Allow internal redirects within the same origin
      try {
        const urlOrigin = new URL(url).origin;
        if (urlOrigin === effectiveBaseUrl) {
          console.log(`✅ Internal redirect allowed: ${url}`);
          return url;
        }
      } catch (e) {
        console.log("⚠️ URL parsing failed, using fallback");
      }

      // Default to effectiveBaseUrl (e.g. localhost:3000 in dev)
      console.log(`🔄 Default redirect: ${effectiveBaseUrl}`);
      return effectiveBaseUrl;
    },
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
