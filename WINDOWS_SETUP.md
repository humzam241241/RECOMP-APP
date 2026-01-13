# Windows Setup Guide

## Quick Start

**One-click startup:**
```bash
npm run start:win
```

Or double-click `start.bat` in Windows Explorer.

## What the Script Does

The `start.bat` script automates the entire startup process:

1. **Checks PostgreSQL**
   - Detects if PostgreSQL service is running
   - Attempts to start it if stopped
   - Warns if PostgreSQL is not detected

2. **Frees Port 3000**
   - Kills any process using port 3000
   - Ensures clean startup

3. **Generates Prisma Client**
   - Runs `npx prisma generate`

4. **Runs Database Migrations**
   - Uses `prisma migrate deploy` for existing migrations
   - Falls back to `prisma migrate dev` for initial setup

5. **Seeds Database**
   - Runs `npm run seed` if `prisma/seed.ts` exists
   - Skips gracefully if seed file doesn't exist

6. **Starts Next.js Server**
   - Launches dev server on port 3000
   - Shows server logs in the console

7. **Verifies Configuration**
   - Checks `/api/auth/providers` endpoint
   - Confirms Google OAuth is configured
   - Shows client ID suffix (last 6 chars) and NEXTAUTH_URL

## Environment Variables

**Important:** Create `.env.local` (not `.env`) for local development.

Next.js loads env files in this order:
1. `.env.local` (highest priority)
2. `.env.development.local`
3. `.env.development`
4. `.env`

**Required variables:**
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/recomp?schema=public
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-here
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

## Verification

After startup, verify configuration:

1. **Check server:** http://localhost:3000
2. **Check auth providers:** http://localhost:3000/api/auth/providers
   - Should show `google` provider
   - Should show client ID suffix (last 6 chars)
   - Should show NEXTAUTH_URL

## Troubleshooting

### PostgreSQL Not Starting
- Ensure PostgreSQL service exists: `sc query postgresql-x64-17`
- Check if running on different port
- Manually start PostgreSQL before running script

### Port 3000 Already in Use
- Script automatically kills processes on port 3000
- If issues persist, manually kill: `netstat -ano | findstr :3000`

### Migrations Fail
- Check `DATABASE_URL` is correct
- Ensure database exists: `createdb recomp` (if needed)
- Check PostgreSQL is accessible

### Google OAuth Not Working
- Verify `.env.local` has correct `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`
- Check Google Cloud Console redirect URI: `http://localhost:3000/api/auth/callback/google`
- Restart server after changing env vars

## Manual Steps (if script fails)

If the automated script fails, run manually:

```bash
# 1. Check PostgreSQL
sc query postgresql-x64-17

# 2. Generate Prisma client
npx prisma generate

# 3. Run migrations
npx prisma migrate dev --name init

# 4. Seed database
npm run seed

# 5. Start server
npm run dev
```

## Files Created

- `start.bat` - Windows startup script
- `scripts/verify-startup.ts` - Verification script
- `src/app/api/auth/providers/route.ts` - Auth providers API endpoint

## Notes

- `.env.local` is gitignored (never commit secrets)
- Script uses `prisma migrate deploy` for production-like behavior
- Falls back to `prisma migrate dev` for initial setup
- Verification runs automatically but won't block startup if it fails
