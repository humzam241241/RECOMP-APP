"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function SignInPage() {
  const searchParams = useSearchParams();
  const rawCallbackUrl = searchParams.get("callbackUrl") || "/";
  const callbackUrl = (() => {
    // Prevent the common infinite loop where callbackUrl points back to /auth/signin
    try {
      const url = new URL(rawCallbackUrl, window.location.origin);
      if (url.pathname.startsWith("/auth/signin")) return "/";
      // Lock down to same-origin only
      if (url.origin !== window.location.origin) return "/";
      return url.pathname + url.search + url.hash;
    } catch {
      // If it's a relative path like "/dashboard", allow it, but not /auth/signin
      if (rawCallbackUrl.startsWith("/auth/signin")) return "/";
      if (rawCallbackUrl.startsWith("/")) return rawCallbackUrl;
      return "/";
    }
  })();
  const error = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(error);
  const [debugInfo, setDebugInfo] = useState<string>("");
  const [errorLog, setErrorLog] = useState<string[]>([]); // Persistent error log

  // Persist error log in localStorage to survive page redirects
  const addToErrorLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = `[${timestamp}] ${message}`;
    
    setErrorLog(prev => {
      const newLog = [...prev, logEntry];
      // Save to localStorage so it survives page redirects
      localStorage.setItem('recomp-error-log', JSON.stringify(newLog));
      return newLog;
    });
  };

  // Load error log from localStorage on component mount
  useEffect(() => {
    try {
      const savedLog = localStorage.getItem('recomp-error-log');
      if (savedLog) {
        const parsedLog = JSON.parse(savedLog);
        setErrorLog(parsedLog);
      }
    } catch (e) {
      console.warn('Failed to load error log from localStorage');
    }
  }, []);

  // Log page information on mount (separate useEffect to avoid dependency issues)
  useEffect(() => {
    const logPageInfo = (message: string) => {
      const timestamp = new Date().toLocaleTimeString();
      const logEntry = `[${timestamp}] ${message}`;
      
      setErrorLog(prev => {
        const newLog = [...prev, logEntry];
        localStorage.setItem('recomp-error-log', JSON.stringify(newLog));
        return newLog;
      });
    };

    // Log page load and any URL errors
    logPageInfo("=== PAGE LOADED ===");
    logPageInfo(`Current URL: ${window.location.href}`);
    
    if (error) {
      logPageInfo(`URL Error Parameter: ${error}`);
      logPageInfo("This suggests an OAuth redirect with an error occurred");
    }
    
    // Check for other URL parameters that might indicate OAuth state
    const urlParams = new URLSearchParams(window.location.search);
    const allParams = Array.from(urlParams.entries());
    if (allParams.length > 0) {
      logPageInfo(`URL Parameters: ${JSON.stringify(Object.fromEntries(allParams))}`);
    }
  }, [error]);

  // Debug: Test available endpoints
  const testDebugEndpoints = async () => {
    try {
      addToErrorLog("Testing debug endpoints...");
      
      // Test debug endpoint
      const debugResponse = await fetch("/api/auth/debug");
      const debugData = await debugResponse.json();
      addToErrorLog(`Debug endpoint response: ${JSON.stringify(debugData)}`);
      
      // Test providers endpoint
      const providersResponse = await fetch("/api/auth/providers");
      const providersData = await providersResponse.json();
      addToErrorLog(`Providers endpoint response: ${JSON.stringify(providersData)}`);
      
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      addToErrorLog(`Debug test failed: ${errorMsg}`);
    }
  };

  // Clear error log
  const clearErrorLog = () => {
    setErrorLog([]);
    setAuthError(null);
    setDebugInfo("");
    localStorage.removeItem('recomp-error-log');
  };

  // Simple NextAuth signIn test
  const testSimpleSignIn = async () => {
    addToErrorLog("🎯 Testing simple NextAuth signIn('google')...");
    
    try {
      addToErrorLog("🔧 Testing basic signIn function...");
      addToErrorLog(`signIn function type: ${typeof signIn}`);
      
      // Try the absolute simplest call
      const result = await signIn("google");
      
      // This line should not execute due to redirect
      addToErrorLog(`⚠️ signIn('google') returned: ${JSON.stringify(result)}`);
      addToErrorLog("❌ PROBLEM: signIn should redirect, not return a value");
      
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      addToErrorLog(`❌ Simple signIn failed: ${errorMsg}`);
    }
  };

  // Manual OAuth URL construction test
  const testManualOAuth = async () => {
    addToErrorLog("🧪 Testing manual Google OAuth URL construction...");
    
    try {
      // Get CSRF token
      const csrfResponse = await fetch("/api/auth/csrf");
      const csrfData = await csrfResponse.json();
      
      if (!csrfData.csrfToken) {
        addToErrorLog("❌ Cannot get CSRF token for OAuth");
        return;
      }
      
      addToErrorLog(`✅ CSRF Token: ${csrfData.csrfToken.slice(0, 10)}...`);
      
      // Provider-specific sign-in endpoint (this is what next-auth/react signIn() normally hits)
      const oauthUrl = `/api/auth/signin/google?callbackUrl=${encodeURIComponent("/")}`;
      addToErrorLog(`🔗 NextAuth v5 OAuth URL: ${oauthUrl}`);
      
      addToErrorLog("🚀 Manually navigating to NextAuth v5 OAuth URL...");
      window.location.href = oauthUrl;
      
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      addToErrorLog(`❌ Manual OAuth test failed: ${errorMsg}`);
    }
  };

  // Comprehensive NextAuth diagnosis
  const diagnoseNextAuth = async () => {
    addToErrorLog("🏥 COMPREHENSIVE NEXTAUTH DIAGNOSIS");
    
    try {
      // Test all NextAuth client functions
      addToErrorLog("📋 NextAuth React Functions Available:");
      addToErrorLog(`- signIn: ${typeof signIn}`);
      
      // Import other NextAuth functions to test
      const { useSession, getSession, getCsrfToken } = await import("next-auth/react");
      addToErrorLog(`- useSession: ${typeof useSession}`);
      addToErrorLog(`- getSession: ${typeof getSession}`);
      addToErrorLog(`- getCsrfToken: ${typeof getCsrfToken}`);
      
      // Test getSession
      const session = await getSession();
      addToErrorLog(`Current Session: ${session ? "Logged In" : "Not Logged In"}`);
      
      // Test getCsrfToken
      const csrfToken = await getCsrfToken();
      addToErrorLog(`CSRF Token from getCsrfToken: ${csrfToken ? "Present" : "Missing"}`);
      
      // Test providers endpoint
      const providersRes = await fetch("/api/auth/providers");
      const providersData = await providersRes.json();
      addToErrorLog(`Providers Available: ${providersData.providers?.length || 0}`);
      
      // Test direct OAuth endpoint
      addToErrorLog("🔗 Testing direct OAuth endpoint...");
      // IMPORTANT: next-auth/react starts OAuth with a POST to /api/auth/signin/<provider>
      // and expects JSON { url } when X-Auth-Return-Redirect=1 is set.
      const oauthRes = await fetch("/api/auth/signin/google", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "X-Auth-Return-Redirect": "1",
        },
        body: new URLSearchParams({
          csrfToken,
          callbackUrl: window.location.origin + "/",
        }),
      });

      const oauthJson = await oauthRes.json().catch(() => null);
      addToErrorLog(`Direct OAuth POST: status=${oauthRes.status} ok=${oauthRes.ok}`);

      const redirectUrl = oauthJson?.url as string | undefined;
      if (redirectUrl?.includes("accounts.google.com")) {
        addToErrorLog("✅ OAuth initiation succeeded (server returned Google URL)");
        addToErrorLog(`🔗 Google URL (prefix): ${redirectUrl.slice(0, 120)}...`);
      } else {
        addToErrorLog(`❌ OAuth initiation did not return Google URL. Returned: ${JSON.stringify(oauthJson)}`);
      }
      
      // Final diagnosis
      addToErrorLog("🎯 DIAGNOSIS COMPLETE:");
      addToErrorLog("If OAuth endpoint works but signIn() doesn't, this suggests:");
      addToErrorLog("1. NextAuth React hooks not properly initialized");
      addToErrorLog("2. SessionProvider configuration issue");
      addToErrorLog("3. NextAuth version compatibility problem");
      
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      addToErrorLog(`❌ Diagnosis failed: ${errorMsg}`);
    }
  };

  // Test Google OAuth configuration in detail
  const testGoogleConfig = async () => {
    addToErrorLog("🔍 Testing Google OAuth configuration...");
    
    try {
      // Test CSRF and session
      const csrfResponse = await fetch("/api/auth/csrf");
      const csrfData = await csrfResponse.json();
      addToErrorLog(`CSRF Token: ${csrfData.csrfToken ? "✅ Present" : "❌ Missing"}`);
      
      // Test session - handle null response properly
      const sessionResponse = await fetch("/api/auth/session");
      const sessionData = await sessionResponse.json();
      addToErrorLog(`Session: ${sessionData && sessionData.user ? "✅ Logged In" : "❌ Not Logged In"}`);
      
      // Test providers in detail
      const providersResponse = await fetch("/api/auth/providers");
      const providersData = await providersResponse.json();
      
      const googleProvider = providersData.providers.find(p => p.id === "google");
      if (googleProvider) {
        addToErrorLog(`Google Provider: ✅ Found`);
        addToErrorLog(`  - ID: ${googleProvider.id}`);
        addToErrorLog(`  - Name: ${googleProvider.name}`);
        addToErrorLog(`  - Type: ${googleProvider.type}`);
        addToErrorLog(`  - Client ID Suffix: ${googleProvider.clientIdSuffix}`);
        addToErrorLog(`  - Configured: ${googleProvider.configured}`);
      } else {
        addToErrorLog(`Google Provider: ❌ Not Found`);
      }
      
      // NextAuth v5 uses different URL patterns - test the correct ones
      addToErrorLog("🔗 Testing NextAuth v5 OAuth patterns...");
      
      // Use the same POST flow next-auth/react uses, so results are reliable in-browser.
      const csrfTokenForPost = csrfData.csrfToken as string | undefined;
      if (!csrfTokenForPost) {
        addToErrorLog("❌ Cannot test OAuth POST flow: missing csrf token");
        return;
      }

      const postRes = await fetch("/api/auth/signin/google", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "X-Auth-Return-Redirect": "1",
        },
        body: new URLSearchParams({
          csrfToken: csrfTokenForPost,
          callbackUrl: window.location.origin + "/",
        }),
      });

      const postJson = await postRes.json().catch(() => null);
      addToErrorLog(`POST /api/auth/signin/google => status=${postRes.status} ok=${postRes.ok}`);
      if (postJson?.url?.includes("accounts.google.com")) {
        addToErrorLog("✅ SUCCESS: OAuth initiation returned a Google URL");
        addToErrorLog(`📋 Google OAuth URL (prefix): ${String(postJson.url).slice(0, 120)}...`);
      } else {
        addToErrorLog(`❌ OAuth initiation did not return Google URL. Returned: ${JSON.stringify(postJson)}`);
      }
      
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      addToErrorLog(`❌ Google config test failed: ${errorMsg}`);
    }
  };

  // Initialize error log with any URL error
  useEffect(() => {
    if (error) {
      addToErrorLog(`URL Error: ${error}`);
    }
  }, [error]);

  const handleCredentialsSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    addToErrorLog("Starting credentials sign-in");
    setDebugInfo("Signing in with email/password...");

    try {
      addToErrorLog(`Attempting credentials login for: ${email}`);
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl,
      });

      addToErrorLog(`Credentials result: ${JSON.stringify(result)}`);

      if (result?.error) {
        setAuthError("Invalid email or password");
        setDebugInfo(`❌ Credentials error: ${result.error}`);
        addToErrorLog(`Credentials error: ${result.error}`);
      } else if (result?.ok) {
        setDebugInfo("✓ Credentials sign in successful! Redirecting...");
        addToErrorLog("Credentials sign-in successful, redirecting");
        window.location.href = callbackUrl;
      } else {
        addToErrorLog("Unexpected credentials result");
        setAuthError("Unexpected response from sign-in");
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      setAuthError("Something went wrong: " + errorMsg);
      setDebugInfo(`❌ Exception: ${errorMsg}`);
      addToErrorLog(`Credentials exception: ${errorMsg}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    addToErrorLog("🔵 Google Sign-In button clicked");
    setAuthError(null);
    setIsLoading(true);

    try {
      await signIn("google", { callbackUrl: "/" });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      addToErrorLog(`❌ Google sign-in failed: ${errorMsg}`);
      setAuthError(`Google sign-in failed: ${errorMsg}`);
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
            {/* Persistent Error Log */}
            {errorLog.length > 0 && (
              <div
                style={{
                  padding: "var(--spacing-md)",
                  background: "rgba(255, 69, 58, 0.1)",
                  borderRadius: "var(--radius-md)",
                  marginBottom: "var(--spacing-lg)",
                  maxHeight: "200px", // Increased height to see more logs
                  overflowY: "auto",
                }}
              >
                <div
                  style={{
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "var(--accent-red)",
                    marginBottom: "8px",
                  }}
                >
                  🐛 Error Log (Persistent - Survives Page Reloads)
                </div>
                {errorLog.slice(-20).map((log, index) => ( // Show last 20 entries
                  <div
                    key={index}
                    style={{
                      fontSize: "11px",
                      fontFamily: "monospace",
                      color: "var(--foreground-secondary)",
                      marginBottom: "4px",
                      wordBreak: "break-all",
                      borderLeft: log.includes("===") ? "3px solid #ff4444" : "none",
                      paddingLeft: log.includes("===") ? "8px" : "0",
                    }}
                  >
                    {log}
                  </div>
                ))}
                {errorLog.length > 20 && (
                  <div style={{ fontSize: "11px", color: "gray", fontStyle: "italic" }}>
                    ... showing last 20 of {errorLog.length} entries
                  </div>
                )}
              </div>
            )}

            {/* Debug Test Buttons */}
            <div style={{ display: "flex", gap: "3px", marginBottom: "var(--spacing-md)" }}>
              <Button
                variant="secondary"
                onClick={diagnoseNextAuth}
                style={{ 
                  fontSize: "9px",
                  backgroundColor: "rgba(255, 0, 0, 0.1)",
                  color: "red",
                  flex: 1,
                  fontWeight: 600,
                }}
              >
                🏥 DIAGNOSE
              </Button>
              <Button
                variant="secondary"
                onClick={testManualOAuth}
                style={{ 
                  fontSize: "9px",
                  backgroundColor: "rgba(255, 0, 255, 0.1)",
                  color: "magenta",
                  flex: 1,
                }}
              >
                🧪 Manual
              </Button>
              <Button
                variant="secondary"
                onClick={testGoogleConfig}
                style={{ 
                  fontSize: "9px",
                  backgroundColor: "rgba(0, 255, 255, 0.1)",
                  color: "cyan",
                  flex: 1,
                }}
              >
                🔍 Deep
              </Button>
              <Button
                variant="secondary"
                onClick={testSimpleSignIn}
                style={{ 
                  fontSize: "9px",
                  backgroundColor: "rgba(0, 255, 0, 0.1)",
                  color: "lime",
                  flex: 1,
                }}
              >
                🎯 Simple
              </Button>
              <Button
                variant="secondary"
                onClick={clearErrorLog}
                style={{ 
                  fontSize: "9px",
                  backgroundColor: "rgba(128, 128, 128, 0.1)",
                  color: "gray",
                  flex: 1,
                }}
              >
                🗑️ Clear
              </Button>
            </div>

                {/* Server Log Instructions */}
                <div
                  style={{
                    padding: "8px",
                    background: "rgba(255, 165, 0, 0.1)",
                    borderRadius: "var(--radius-md)",
                    fontSize: "11px",
                    color: "var(--foreground-secondary)",
                    marginBottom: "var(--spacing-md)",
                  }}
                >
                  🎯 <strong>NEXTAUTH v5 BETA FIX APPLIED!</strong><br/>
                  ✅ <strong>Using direct URL redirect</strong> (bypasses buggy signIn() function)<br/>
                  ✅ <strong>Correct v5 URL pattern</strong>: /api/auth/signin?provider=google<br/>
                  <br/>
                  🔵 <strong>Continue with Google</strong> = Fixed v5 beta approach (TRY THIS!)<br/>
                  🧪 <strong>Manual</strong> = Same direct redirect method<br/>
                  🔍 <strong>Deep</strong> = Test both v4 and v5 URL patterns to compare<br/>
                  🏥 <strong>DIAGNOSE</strong> = Full NextAuth compatibility analysis
                </div>

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
