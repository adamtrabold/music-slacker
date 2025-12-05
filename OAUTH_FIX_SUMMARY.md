# OAuth Callback Fix Summary

## What Was Wrong

Your OAuth callback endpoint was crashing due to several issues:

### 1. **Missing Environment Variable Checks**
- The code used TypeScript's non-null assertion operator (`!`) on environment variables
- If `SLACK_CLIENT_ID` or `SLACK_CLIENT_SECRET` weren't set, the function would crash immediately
- **Fixed:** Now checks for these variables and returns a helpful error page if missing

### 2. **Import Path Issue**  
- The import was using `../../src/services/tokenStorage` (wrong depth)
- Should be `../src/services/tokenStorage` (from `api/` folder to `src/` folder)
- **Fixed:** Corrected the relative import path

### 3. **Insufficient Error Logging**
- When errors occurred, there was minimal logging to help debug
- **Fixed:** Added detailed console logging at each step:
  - `🔄 OAuth callback triggered` - Function started
  - `🔄 Exchanging code for access token...` - Making Slack API call
  - `📦 OAuth response received` - Got response from Slack
  - `💾 Storing tokens for team` - Saving to Redis
  - `✅ App installed successfully` - Completed

### 4. **Weak Error Handling in Token Storage**
- `tokenStorage.ts` could fail silently on Redis errors
- **Fixed:** Added try-catch with detailed error messages

## Files Changed

1. **`api/oauth-callback.ts`**
   - Fixed import path
   - Added environment variable checks
   - Enhanced logging throughout
   - Better error messages

2. **`api/index.ts`**
   - Added environment variable check for `SLACK_CLIENT_ID`
   - Shows helpful error if not configured

3. **`src/services/tokenStorage.ts`**
   - Added environment variable validation
   - Enhanced error handling in `storeWorkspaceTokens()`

## What You Need to Do

### Step 1: Verify Environment Variables in Vercel

Make sure these are set in your Vercel dashboard:

1. Go to: https://vercel.com/adams-projects-9a2509e9/music-slacker
2. Click **Settings** → **Environment Variables**
3. Verify these exist for **Production**:
   - ✅ `SLACK_BOT_TOKEN`
   - ✅ `SLACK_SIGNING_SECRET`
   - ✅ `SLACK_CLIENT_ID`
   - ✅ `SLACK_CLIENT_SECRET`
   - ✅ `UPSTASH_REDIS_REST_URL`
   - ✅ `UPSTASH_REDIS_REST_TOKEN`

### Step 2: Deploy to Vercel

```bash
cd "/Users/adam.trabold/Cursor Projects/Music Slacker"
vercel --prod
```

Wait for deployment to complete (should take ~30 seconds).

### Step 3: Test the OAuth Flow

1. Open: https://music-slacker.vercel.app/
2. Click the **"Add to Slack"** button
3. Authorize the app in your workspace
4. You should see a success page with 🎉

### Step 4: Check Vercel Logs

If it still fails, check the logs to see the detailed error:

```bash
vercel logs music-slacker.vercel.app --follow
```

Then try clicking "Add to Slack" again while watching the logs.

## Expected Behavior

### ✅ Success Flow:
```
🔄 OAuth callback triggered
🔄 Exchanging code for access token...
📦 OAuth response received: { ok: true, teamId: 'T123456' }
💾 Storing tokens for team: T123456
✅ Stored tokens for workspace: T123456
✅ App installed successfully: { teamId: 'T123456', teamName: 'Your Workspace' }
```

### ❌ If Environment Variables Missing:
You'll see a page saying:
> **Configuration Error**  
> Missing SLACK_CLIENT_ID or SLACK_CLIENT_SECRET environment variables.

### ❌ If Redis Fails:
You'll see:
> **Something went wrong**  
> Error: Failed to store tokens: [error message]

## Common Issues & Solutions

### Issue: "Missing SLACK_CLIENT_ID"
**Solution:** Add the environment variable in Vercel dashboard, then redeploy

### Issue: "OAuth token exchange failed: invalid_code"
**Solution:** The authorization code expired (they expire in 10 minutes). Try clicking "Add to Slack" again

### Issue: "Failed to store tokens"
**Solution:** Check that your Upstash Redis credentials are correct:
- Log into https://console.upstash.com/
- Verify your Redis database exists
- Copy the REST URL and TOKEN
- Update in Vercel if needed

## OAuth Response Structure

For reference, here's what Slack returns from `oauth.v2.access`:

```json
{
  "ok": true,
  "access_token": "xoxb-...",  // ← Bot token (we save this)
  "token_type": "bot",
  "scope": "channels:history,chat:write,links:read",
  "bot_user_id": "U123456",
  "app_id": "A123456",
  "team": {
    "id": "T123456",       // ← Team ID (Redis key)
    "name": "Your Team"    // ← Team name (displayed)
  }
}
```

## Testing Checklist

- [ ] Environment variables set in Vercel
- [ ] Deployed to production (`vercel --prod`)
- [ ] Landing page loads (https://music-slacker.vercel.app/)
- [ ] "Add to Slack" button appears
- [ ] Click button redirects to Slack authorization
- [ ] After authorizing, see success page
- [ ] Token stored in Upstash Redis
- [ ] Bot works when you post a music link

## Next Steps After OAuth Works

Once OAuth is working, you'll need to:

1. **Invite the bot to a channel**: `/invite @Music Slacker`
2. **Test with a music link**: Post `https://open.spotify.com/track/3n3Ppam7vgaVa1iaRUc9Lp`
3. **Verify threaded response**: Bot should reply with links to other services

## Questions?

If you're still having issues after following these steps:

1. Share the Vercel logs output
2. Share the exact error message you see
3. Confirm which step fails (landing page, authorization, callback, or token storage)

