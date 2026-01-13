"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const errorMessages: Record<string, string> = {
  Configuration: "There is a problem with the server configuration. Please contact support.",
  AccessDenied: "You do not have access to this resource.",
  Verification: "The verification link has expired or has already been used.",
  OAuthSignin: "Error starting the OAuth sign-in flow.",
  OAuthCallback: "Error during the OAuth callback.",
  OAuthCreateAccount: "Could not create an OAuth account.",
  EmailCreateAccount: "Could not create an email account.",
  Callback: "Error during the callback.",
  OAuthAccountNotLinked: "This email is already associated with another account. Please sign in with your original provider.",
  EmailSignin: "Error sending the email sign-in link.",
  CredentialsSignin: "Invalid email or password.",
  SessionRequired: "Please sign in to access this page.",
  Default: "An authentication error occurred.",
};

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error") || "Default";
  
  const errorMessage = errorMessages[error] || errorMessages.Default;

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
      <Card variant="elevated" padding="lg" style={{ maxWidth: "450px", width: "100%" }}>
        <CardHeader style={{ textAlign: "center" }}>
          <div
            style={{
              width: "64px",
              height: "64px",
              margin: "0 auto var(--spacing-lg)",
              borderRadius: "var(--radius-full)",
              background: "rgba(255, 69, 58, 0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "28px",
            }}
          >
            ⚠️
          </div>
          <CardTitle size="lg">Authentication Error</CardTitle>
          <CardDescription>{errorMessage}</CardDescription>
        </CardHeader>
        <CardContent>
          {error === "Configuration" && (
            <div
              style={{
                padding: "var(--spacing-md)",
                background: "rgba(255, 214, 10, 0.1)",
                borderRadius: "var(--radius-md)",
                marginBottom: "var(--spacing-lg)",
                fontSize: "13px",
                color: "var(--foreground-secondary)",
              }}
            >
              <strong>Note:</strong> Google Sign-In requires valid OAuth credentials. 
              Please use Email/Password login instead, or configure Google OAuth in the .env file.
            </div>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-sm)" }}>
            <Link href="/auth/signin" style={{ textDecoration: "none" }}>
              <Button fullWidth>Back to Sign In</Button>
            </Link>
            <Link href="/" style={{ textDecoration: "none" }}>
              <Button variant="ghost" fullWidth>Go Home</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
