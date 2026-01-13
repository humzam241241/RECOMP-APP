import { PrismaClient } from "@prisma/client";

console.log("🔍 Google OAuth Configuration Diagnostic\n");

// Check environment variables
const clientId = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
const nextAuthUrl = process.env.NEXTAUTH_URL;
const nextAuthSecret = process.env.NEXTAUTH_SECRET;

console.log("Environment Variables:");
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log(`GOOGLE_CLIENT_ID: ${clientId ? "✅ Set" : "❌ Missing"}`);
if (clientId) {
  console.log(`  Value: ${clientId.substring(0, 20)}...${clientId.substring(clientId.length - 10)}`);
  console.log(`  Format: ${clientId.includes(".apps.googleusercontent.com") ? "✅ Valid" : "❌ Invalid"}`);
}

console.log(`\nGOOGLE_CLIENT_SECRET: ${clientSecret ? "✅ Set" : "❌ Missing"}`);
if (clientSecret) {
  console.log(`  Value: ${clientSecret.substring(0, 10)}...${clientSecret.substring(clientSecret.length - 5)}`);
  console.log(`  Format: ${clientSecret.startsWith("GOCSPX-") ? "✅ Valid" : "❌ Invalid (should start with GOCSPX-)"}`);
  console.log(`  Length: ${clientSecret.length} chars (should be ~40)`);
}

console.log(`\nNEXTAUTH_URL: ${nextAuthUrl ? "✅ Set" : "❌ Missing"}`);
if (nextAuthUrl) {
  console.log(`  Value: ${nextAuthUrl}`);
  console.log(`  Format: ${nextAuthUrl.startsWith("http") ? "✅ Valid" : "❌ Invalid"}`);
}

console.log(`\nNEXTAUTH_SECRET: ${nextAuthSecret ? "✅ Set" : "❌ Missing"}`);
if (nextAuthSecret) {
  console.log(`  Length: ${nextAuthSecret.length} chars`);
}

console.log("\n\nRequired Google Cloud Console Settings:");
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log("1. Authorized JavaScript origins:");
console.log(`   ✅ http://localhost:3000`);
console.log("\n2. Authorized redirect URIs:");
console.log(`   ✅ ${nextAuthUrl || "http://localhost:3000"}/api/auth/callback/google`);

console.log("\n\nCommon Issues:");
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
if (!clientId || !clientSecret) {
  console.log("❌ Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET");
}
if (clientSecret && !clientSecret.startsWith("GOCSPX-")) {
  console.log("❌ GOOGLE_CLIENT_SECRET format is incorrect (should start with GOCSPX-)");
}
if (clientSecret && clientSecret.length < 30) {
  console.log("❌ GOOGLE_CLIENT_SECRET seems too short");
}
if (!nextAuthUrl) {
  console.log("❌ NEXTAUTH_URL is not set");
}

console.log("\n\nNext Steps:");
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log("1. Verify redirect URI in Google Cloud Console:");
console.log(`   https://console.cloud.google.com/apis/credentials`);
console.log(`   → Click your OAuth 2.0 Client ID`);
console.log(`   → Add: ${nextAuthUrl || "http://localhost:3000"}/api/auth/callback/google`);
console.log("\n2. Make sure OAuth consent screen is configured");
console.log("\n3. Restart dev server after making changes");
