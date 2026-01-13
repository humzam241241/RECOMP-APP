import { authConfig } from "../src/lib/auth";

async function verify() {
  console.log("--- GOOGLE OAUTH VERIFICATION ---");
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const nextAuthUrl = process.env.NEXTAUTH_URL;
  const authSecret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;

  console.log("GOOGLE_CLIENT_ID:", clientId ? `Found (ends with ${clientId.slice(-10)})` : "MISSING");
  console.log("GOOGLE_CLIENT_ID length:", clientId?.length);
  console.log("GOOGLE_CLIENT_SECRET:", clientSecret ? "Found" : "MISSING");
  console.log("GOOGLE_CLIENT_SECRET length:", clientSecret?.length);
  console.log("NEXTAUTH_URL:", nextAuthUrl);
  console.log("AUTH_SECRET:", authSecret ? "Found" : "MISSING");
  
  if (clientId && clientId.includes(" ")) {
    console.error("ERROR: GOOGLE_CLIENT_ID contains spaces!");
  }
  if (clientSecret && clientSecret.includes(" ")) {
    console.error("ERROR: GOOGLE_CLIENT_SECRET contains spaces!");
  }

  const googleProvider = authConfig.providers.find(p => p.id === "google") as any;
  if (googleProvider) {
    console.log("Google Provider in Config:", googleProvider.options ? "Has Options" : "No Options");
    console.log("Config Client ID suffix:", googleProvider.options?.clientId?.slice(-10));
  } else {
    console.error("ERROR: Google provider not found in authConfig.providers");
  }
}

verify();
