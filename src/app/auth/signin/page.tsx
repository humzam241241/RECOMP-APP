"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function SignInPage() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const error = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(error);
  const [debugInfo, setDebugInfo] = useState<string>("");

  const handleCredentialsSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setDebugInfo("Signing in with email/password...");

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl,
      });

      if (result?.error) {
        setAuthError("Invalid email or password");
        setDebugInfo(`❌ Credentials error: ${result.error}`);
      } else if (result?.ok) {
        setDebugInfo("✓ Credentials sign in successful! Redirecting...");
        window.location.href = callbackUrl;
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      setAuthError("Something went wrong: " + errorMsg);
      setDebugInfo(`❌ Exception: ${errorMsg}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    console.log("GOOGLE CLICKED");
    setDebugInfo("✓ Button clicked! Initiating Google sign-in...");
    setIsLoading(true);
    setAuthError(null);
    
    try {
      // In NextAuth v5, using the signIn helper is the best way to handle POST and CSRF
      console.log("[SIGNIN] Calling signIn('google') helper...");
      await signIn("google", { callbackUrl: "/" });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      setDebugInfo(`❌ Google sign-in error: ${errorMsg}`);
      setAuthError("Failed to sign in with Google. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "var(--spacing-xl)",
        background: "linear-gradient(135deg, #000000 0%, #1a1a2e 50%, #16213e 100%)",
      }}
    >
      <div style={{ width: "100%", maxWidth: "440px" }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "var(--spacing-xl)" }}>
          <div
            style={{
              width: "64px",
              height: "64px",
              margin: "0 auto var(--spacing-md)",
              borderRadius: "var(--radius-lg)",
              background: "var(--gradient-blue)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "28px",
              fontWeight: 700,
              color: "white",
            }}
          >
            R
          </div>
          <h1
            style={{
              fontSize: "32px",
              fontWeight: 700,
              letterSpacing: "-0.03em",
              marginBottom: "8px",
            }}
          >
            RECOMP
          </h1>
          <p style={{ color: "var(--foreground-secondary)", fontSize: "15px" }}>
            90-Day Body Transformation
          </p>
        </div>

        <Card variant="elevated" padding="lg">
          <CardHeader style={{ textAlign: "center" }}>
            <CardTitle size="lg">Welcome back</CardTitle>
            <CardDescription>Sign in to continue your journey</CardDescription>
          </CardHeader>

          <CardContent>
            {/* Debug Info (temporary) */}
            {debugInfo && (
              <div
                style={{
                  padding: "var(--spacing-md)",
                  background: "rgba(10, 132, 255, 0.15)",
                  borderRadius: "var(--radius-md)",
                  color: "var(--accent-blue)",
                  fontSize: "12px",
                  marginBottom: "var(--spacing-lg)",
                  fontFamily: "monospace",
                  wordBreak: "break-all",
                }}
              >
                DEBUG: {debugInfo}
              </div>
            )}

            {authError && (
              <div
                style={{
                  padding: "var(--spacing-md)",
                  background: "rgba(255, 69, 58, 0.15)",
                  borderRadius: "var(--radius-md)",
                  color: "var(--accent-red)",
                  fontSize: "14px",
                  marginBottom: "var(--spacing-lg)",
                  textAlign: "center",
                }}
              >
                {authError}
              </div>
            )}

            {/* Google Sign In */}
            <Button
              variant="secondary"
              fullWidth
              onClick={handleGoogleSignIn}
              isLoading={isLoading && debugInfo.includes("Google")}
              disabled={isLoading}
              style={{ marginBottom: "var(--spacing-lg)" }}
            >
              <GoogleIcon />
              Continue with Google
            </Button>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--spacing-md)",
                marginBottom: "var(--spacing-lg)",
              }}
            >
              <div
                style={{ flex: 1, height: "1px", background: "rgba(255, 255, 255, 0.1)" }}
              />
              <span style={{ fontSize: "13px", color: "var(--foreground-tertiary)" }}>or</span>
              <div
                style={{ flex: 1, height: "1px", background: "rgba(255, 255, 255, 0.1)" }}
              />
            </div>

            {/* Email/Password Form */}
            <form onSubmit={handleCredentialsSignIn}>
              <div style={{ marginBottom: "var(--spacing-md)" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "13px",
                    fontWeight: 500,
                    color: "var(--foreground-secondary)",
                    marginBottom: "8px",
                  }}
                >
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    background: "var(--background-tertiary)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "var(--radius-md)",
                    color: "var(--foreground)",
                    fontSize: "15px",
                  }}
                />
              </div>

              <div style={{ marginBottom: "var(--spacing-lg)" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "13px",
                    fontWeight: 500,
                    color: "var(--foreground-secondary)",
                    marginBottom: "8px",
                  }}
                >
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    background: "var(--background-tertiary)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "var(--radius-md)",
                    color: "var(--foreground)",
                    fontSize: "15px",
                  }}
                />
              </div>

              <Button type="submit" fullWidth isLoading={isLoading && !debugInfo.includes("Google")}>
                Sign In
              </Button>
            </form>

            <p
              style={{
                textAlign: "center",
                marginTop: "var(--spacing-lg)",
                fontSize: "14px",
                color: "var(--foreground-secondary)",
              }}
            >
              Don&apos;t have an account?{" "}
              <Link
                href="/auth/signup"
                style={{
                  color: "var(--accent-blue)",
                  textDecoration: "none",
                  fontWeight: 500,
                }}
              >
                Sign up
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path
        d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"
        fill="#4285F4"
      />
      <path
        d="M9.003 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.836.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.96v2.332C2.44 15.983 5.485 18 9.003 18z"
        fill="#34A853"
      />
      <path
        d="M3.964 10.71c-.18-.54-.282-1.117-.282-1.71s.102-1.17.282-1.71V4.958H.957C.347 6.173 0 7.548 0 9s.348 2.827.957 4.042l3.007-2.332z"
        fill="#FBBC05"
      />
      <path
        d="M9.003 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.464.891 11.428 0 9.002 0 5.485 0 2.44 2.017.96 4.958L3.967 7.29c.708-2.127 2.692-3.71 5.036-3.71z"
        fill="#EA4335"
      />
    </svg>
  );
}
