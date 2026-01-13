"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to create account");
        return;
      }

      // Sign in the user
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Account created but sign in failed");
        return;
      }

      // Redirect to onboarding
      router.push("/onboarding");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      const result = await signIn("google", { callbackUrl: "/onboarding", redirect: false });
      const url = result?.url || "";
      if (url) window.location.assign(url);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      setError(`Google sign-up failed: ${errorMsg}`);
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
            Start Your 90-Day Transformation
          </p>
        </div>

        <Card variant="elevated" padding="lg">
          <CardHeader style={{ textAlign: "center" }}>
            <CardTitle size="lg">Create your account</CardTitle>
            <CardDescription>Join thousands transforming their bodies</CardDescription>
          </CardHeader>

          <CardContent>
            {error && (
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
                {error}
              </div>
            )}

            {/* Google Sign Up */}
            <Button
              variant="secondary"
              fullWidth
              onClick={handleGoogleSignUp}
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

            {/* Sign Up Form */}
            <form onSubmit={handleSubmit}>
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
                  Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
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
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
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
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
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

              <Button type="submit" fullWidth isLoading={isLoading}>
                Create Account
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
              Already have an account?{" "}
              <Link
                href="/auth/signin"
                style={{
                  color: "var(--accent-blue)",
                  textDecoration: "none",
                  fontWeight: 500,
                }}
              >
                Sign in
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
