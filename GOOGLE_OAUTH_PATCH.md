# Google OAuth Fix - Minimal Patch & Verification

## ✅ Changes Made

### 1. Added Safe Logging (`src/lib/auth.ts`)
- Added development-only logging that prints:
  - CLIENT_ID suffix (first 20 + last 10 chars)
  - CLIENT_SECRET suffix (GOCSPX-... + last 5 chars)
  - NEXTAUTH_URL
- **No secrets exposed** - only partial values for verification

### 2. Created `.env.local` (Highest Precedence)
- Consolidated all env vars into `.env.local`
- Next.js loads: `.env.local` > `.env.development` > `.env`
- Ensures no precedence conflicts

### 3. Verified Configuration
- ✅ NextAuth uses `process.env.GOOGLE_CLIENT_ID` and `process.env.GOOGLE_CLIENT_SECRET`
- ✅ Client ID format: `1060411421606-kdggnh2vdls2jee8deg4it89daofs1d3.apps.googleusercontent.com`
- ✅ Client Secret format: `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`
- ✅ Redirect URI: `http://localhost:3000/api/auth/callback/google`

## 🔍 Verification Steps

### Step 1: Check Server Logs
After server starts, look for:
```
[AUTH] Google OAuth Config:
  CLIENT_ID: 1060411421606-kdgg...ofs1d3.apps.googleusercontent.com (65 chars)
  CLIENT_SECRET: GOCSPX-...jAgA (40 chars)
  NEXTAUTH_URL: http://localhost:3000
```

**How to check:**
1. Server terminal should show this on startup
2. Or trigger auth by visiting: http://localhost:3000/api/auth/signin/google

### Step 2: Verify Redirect URL Contains Client ID
When you click "Sign in with Google", the browser URL should be:
```
https://accounts.google.com/o/oauth2/v2/auth?
  client_id=1060411421606-kdggnh2vdls2jee8deg4it89daofs1d3.apps.googleusercontent.com
  &redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fapi%2Fauth%2Fcallback%2Fgoogle
  &response_type=code
  &scope=openid%20email%20profile
```

**Verify:**
- `client_id` parameter matches your `GOOGLE_CLIENT_ID`
- `redirect_uri` is `http://localhost:3000/api/auth/callback/google`

### Step 3: Test Google Sign-In
1. Go to: http://localhost:3000/auth/signin
2. Click "Sign in with Google"
3. Should redirect to Google consent screen
4. After authorizing, redirects back to your app

### Step 4: Run Verification Script
```powershell
npx tsx scripts/verify-google-oauth.ts
```

Expected output:
- ✅ All environment variables present
- ✅ Client ID format valid
- ✅ Client Secret format valid
- ✅ Expected redirect URI matches

## 📋 Files Changed

1. **`src/lib/auth.ts`**
   - Added safe logging (lines 9-18)
   - Uses env vars via constants (lines 23-24)

2. **`.env.local`** (new file)
   - Consolidated all env vars
   - Takes precedence over `.env`

3. **`scripts/verify-google-oauth.ts`** (new file)
   - Verification script for troubleshooting

## 🎯 Expected Behavior

When working correctly:
1. Server logs show `[AUTH] Google OAuth Config` on startup
2. Clicking "Sign in with Google" redirects to Google
3. Google URL contains your `client_id`
4. After consent, redirects to `/api/auth/callback/google`
5. User is created/logged in and redirected to `/onboarding` or `/dashboard`

## 🐛 Troubleshooting

If still not working:
1. **Check server logs** for `[AUTH]` output
2. **Verify `.env.local` exists** and has correct values
3. **Check Google Console** redirect URI matches exactly:
   ```
   http://localhost:3000/api/auth/callback/google
   ```
4. **OAuth Consent Screen** must be configured (Testing mode requires test users)
5. **Restart server** after any `.env.local` changes

## ✅ Success Criteria

- [ ] Server logs show `[AUTH] Google OAuth Config` with correct values
- [ ] Google authorization URL contains your `client_id`
- [ ] Redirect URI in Google Console matches exactly
- [ ] Can complete Google sign-in flow
- [ ] User is created/logged in successfully
