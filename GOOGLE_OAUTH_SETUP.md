# Google OAuth Troubleshooting Guide

## ✅ Current Configuration Status

**Environment Variables (from .env):**
- ✅ `GOOGLE_CLIENT_ID`: Set correctly
- ✅ `GOOGLE_CLIENT_SECRET`: Set correctly (starts with GOCSPX-)
- ✅ `NEXTAUTH_URL`: http://localhost:3000
- ✅ `NEXTAUTH_SECRET`: Set

## 🔍 Diagnosis: Most Likely Issue

**The redirect URI is not configured in Google Cloud Console.**

## 📋 Step-by-Step Fix

### 1. Go to Google Cloud Console
Visit: https://console.cloud.google.com/apis/credentials

### 2. Find Your OAuth 2.0 Client
- Look for Client ID: `1060411421606-kdggnh2vdls2jee8deg4it89daofs1d3.apps.googleusercontent.com`
- Click on it to edit

### 3. Add Authorized Redirect URIs
In the "Authorized redirect URIs" section, add:
```
http://localhost:3000/api/auth/callback/google
```

### 4. Add Authorized JavaScript Origins (if not already there)
In the "Authorized JavaScript origins" section, add:
```
http://localhost:3000
```

### 5. Save Changes
Click "Save" at the bottom

### 6. Restart Dev Server
After saving, restart your Next.js dev server:
```powershell
# Stop current server (Ctrl+C)
npm run dev
```

## 🧪 Test After Fix

1. Go to: http://localhost:3000/auth/signin
2. Click "Sign in with Google"
3. You should be redirected to Google's consent screen
4. After authorizing, you'll be redirected back to your app

## ❌ Common Errors & Solutions

### Error: "redirect_uri_mismatch"
**Solution:** Make sure the redirect URI in Google Console **exactly** matches:
```
http://localhost:3000/api/auth/callback/google
```
- No trailing slash
- Use `http://` not `https://` for localhost
- Case-sensitive

### Error: "Configuration"
**Solution:** 
1. Verify `GOOGLE_CLIENT_SECRET` in `.env` is correct (starts with `GOCSPX-`)
2. Make sure OAuth consent screen is published (or add your email as a test user)
3. Restart dev server after changing `.env`

### Error: "access_denied"
**Solution:** 
1. Check OAuth consent screen is configured
2. Add your email as a test user if app is in "Testing" mode
3. Make sure you're using the correct Google account

## 🔐 OAuth Consent Screen Setup

If you haven't set up the consent screen:

1. Go to: https://console.cloud.google.com/apis/credentials/consent
2. Choose "External" (unless you have Google Workspace)
3. Fill in:
   - App name: RECOMP
   - User support email: Your email
   - Developer contact: Your email
4. Add scopes:
   - `email`
   - `profile`
   - `openid`
5. Add test users (your email) if app is in "Testing" mode
6. Save and continue

## 📝 Quick Checklist

- [ ] `.env` file has correct `GOOGLE_CLIENT_ID`
- [ ] `.env` file has correct `GOOGLE_CLIENT_SECRET` (starts with `GOCSPX-`)
- [ ] Redirect URI added in Google Console: `http://localhost:3000/api/auth/callback/google`
- [ ] JavaScript origin added: `http://localhost:3000`
- [ ] OAuth consent screen configured
- [ ] Test user added (if app is in Testing mode)
- [ ] Dev server restarted after changes

## 🆘 Still Not Working?

Check the browser console and server logs for specific error messages. The error will tell you exactly what's wrong.
