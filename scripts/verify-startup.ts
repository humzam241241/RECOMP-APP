/**
 * Verification script for startup
 * Checks Google OAuth configuration via /api/auth/providers
 */

async function verify() {
  const maxRetries = 10;
  const delay = 2000;

  console.log("\n[VERIFY] Checking server configuration...\n");

  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch("http://localhost:3000/api/auth/providers");
      if (response.ok) {
        const data = await response.json();
        
        console.log("✅ Server is responding\n");
        console.log("Auth Providers Configuration:");
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        
        const googleProvider = data.providers?.find((p: any) => p.id === "google");
        if (googleProvider) {
          console.log(`✅ Google OAuth: Configured`);
          if (googleProvider.clientIdSuffix) {
            console.log(`   Client ID suffix: ...${googleProvider.clientIdSuffix}`);
          }
        } else {
          console.log(`❌ Google OAuth: Not found in providers`);
        }
        
        console.log(`\nNEXTAUTH_URL: ${data.nextAuthUrl || "Not set"}`);
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
        
        process.exit(0);
      }
    } catch (error) {
      // Server not ready yet
      if (i < maxRetries - 1) {
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }
    }
  }

  console.log("⚠️  Server not responding yet (may still be starting)");
  console.log("   Check manually at: http://localhost:3000/api/auth/providers\n");
  process.exit(0);
}

verify();
