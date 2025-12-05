# Token Rotation Implementation Guide

## Overview

Token rotation is now implemented in Music Slacker! This adds an extra layer of security by making access tokens expire every 12 hours instead of lasting forever.

## What Was Implemented

### ✅ Code Changes

1. **`src/services/tokenStorage.ts`**
   - Updated `WorkspaceTokens` interface to store:
     - `refreshToken` - Used to get new access tokens
     - `expiresAt` - Unix timestamp when token expires

2. **`src/services/tokenRefresh.ts`** (NEW FILE)
   - `needsRefresh()` - Checks if token expires within 1 hour
   - `refreshToken()` - Calls Slack API to get new tokens
   - `getValidToken()` - Returns a valid token, refreshing if needed

3. **`api/oauth-callback.ts`**
   - Now captures `refresh_token` and `expires_in` from OAuth response
   - Stores expiration time in Redis

4. **`api/slack-events.ts`**
   - Updated to use `getValidToken()` which auto-refreshes
   - Falls back gracefully if refresh fails

## How It Works

### Token Lifecycle

```
User Installs App
      ↓
OAuth callback receives:
  - access_token (expires in 12 hours)
  - refresh_token (used to get new tokens)
  - expires_in: 43200 (seconds)
      ↓
Stored in Redis with expiration timestamp
      ↓
When Slack event arrives:
  1. Check if token expires within 1 hour
  2. If yes, refresh token automatically
  3. Store new tokens in Redis
  4. Use fresh token for API call
```

### Automatic Refresh

The bot automatically refreshes tokens **1 hour before expiration** to ensure:
- No downtime when tokens expire
- Fresh tokens are always used
- Smooth operation across all workspaces

## Enabling Token Rotation in Slack

### ⚠️ IMPORTANT: Test First!

**DO NOT enable token rotation in production without testing!** Once enabled, it **cannot be turned off**.

### Testing Steps

1. **Create a Test App** (recommended)
   - Go to https://api.slack.com/apps
   - Click "Create New App" → "From scratch"
   - Name it "Music Slacker Test"
   - Use the same configuration as your production app

2. **Or Create a Development Branch**
   - Use your existing app but test in a test workspace first

### Enable Token Rotation

#### For Apps NOT in Slack Marketplace:

1. Go to https://api.slack.com/apps
2. Select your app
3. Navigate to **OAuth & Permissions** (left sidebar)
4. Scroll down to **Token Rotation**
5. Click **Opt In**
6. Confirm by clicking **Enable Token Rotation**

#### For Apps IN Slack Marketplace:

1. Go to https://api.slack.com/apps
2. Select your app
3. Navigate to **Published App Settings**
4. Find **Token Rotation** section
5. Click **Opt In**
6. Confirm by clicking **Enable Token Rotation**

### After Enabling

Once token rotation is enabled:

1. **Existing Tokens**: Long-lived tokens continue to work
2. **New Installations**: Will receive rotating tokens automatically
3. **Migration**: Need to exchange existing tokens for rotating ones

### Migrating Existing Installations

For each existing workspace installation, you need to exchange the long-lived token for a rotating token:

```bash
# Call this once per workspace
curl -X POST https://slack.com/api/oauth.v2.exchange \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "client_id=YOUR_CLIENT_ID" \
  -d "client_secret=YOUR_CLIENT_SECRET" \
  -d "token=xoxb-EXISTING-BOT-TOKEN"
```

The response will include:
- New `access_token` (starts with `xoxe.xoxb-`)
- `refresh_token` (starts with `xoxe-`)
- `expires_in: 43200` (12 hours)

**Your code already handles this!** Just store these new values.

## Testing Token Rotation

### Test 1: New Installation

1. Install your app to a test workspace
2. Check Vercel logs - should see:
   ```
   📦 OAuth response received: { 
     ok: true, 
     teamId: 'T...', 
     hasRefreshToken: true,
     expiresIn: 43200 
   }
   ```
3. Post a music link - bot should work normally

### Test 2: Token Refresh

To test token refresh without waiting 12 hours:

1. **Manually expire a token** in Redis:
   ```javascript
   // In your Upstash console or a test script
   // Update the expiresAt to be in the past
   await redis.set('workspace:T1234567', JSON.stringify({
     ...tokens,
     expiresAt: Date.now() - 1000 // 1 second ago
   }));
   ```

2. **Post a music link**

3. **Check logs** - should see:
   ```
   ⏰ Token expiring soon, refreshing...
   🔄 Refreshing token for team: T1234567
   ✅ Token refreshed successfully
   ✅ Using valid token for workspace: T1234567
   ```

### Test 3: Verify Auto-Refresh

Set expiration to 30 minutes from now and wait. The token should auto-refresh when an event comes in.

## Response Structure Examples

### OAuth v2.access WITH Token Rotation

```json
{
  "ok": true,
  "access_token": "xoxe.xoxb-1-...",    // Note the xoxe. prefix
  "token_type": "bot",
  "scope": "channels:history,chat:write,links:read",
  "bot_user_id": "U123456",
  "app_id": "A123456",
  "team": {
    "id": "T123456",
    "name": "Your Team"
  },
  "expires_in": 43200,                   // 12 hours
  "refresh_token": "xoxe-1-..."         // NEW: Used to refresh
}
```

### OAuth v2.access WITHOUT Token Rotation (Current)

```json
{
  "ok": true,
  "access_token": "xoxb-...",            // Regular xoxb- prefix
  "token_type": "bot",
  "scope": "channels:history,chat:write,links:read",
  "bot_user_id": "U123456",
  "app_id": "A123456",
  "team": {
    "id": "T123456",
    "name": "Your Team"
  }
  // No expires_in or refresh_token
}
```

## Monitoring Token Rotation

### Key Metrics to Watch

1. **Token refresh frequency**: Should be ~every 11 hours per workspace
2. **Refresh failures**: Should be 0 (indicates expired tokens or API issues)
3. **Token age**: All tokens should be < 12 hours old

### Log Messages to Watch For

✅ **Good:**
```
📦 OAuth response received: { hasRefreshToken: true, expiresIn: 43200 }
⏰ Token expiring soon, refreshing...
🔄 Refreshing token for team: T1234567
✅ Token refreshed successfully
```

❌ **Bad:**
```
❌ Token refresh failed: invalid_refresh_token
❌ Error refreshing token
⚠️ Using potentially expired token
```

## Troubleshooting

### "No refresh token - using long-lived token"

**Cause**: Workspace was installed before token rotation was enabled.

**Fix**: Exchange the token using `oauth.v2.exchange` (see "Migrating Existing Installations" above).

### "Token refresh failed: invalid_refresh_token"

**Cause**: Refresh token was already used or revoked.

**Fix**: User needs to reinstall the app to get new tokens.

### "Failed to refresh token"

**Cause**: Could be network issues, wrong client credentials, or Slack API issues.

**Fix**: 
1. Verify `SLACK_CLIENT_ID` and `SLACK_CLIENT_SECRET` are correct
2. Check Slack API status
3. Review full error logs

## Deployment Checklist

- [ ] Code deployed to production
- [ ] Test token rotation in development workspace
- [ ] Verify new installations receive rotating tokens
- [ ] Exchange existing long-lived tokens for rotating ones
- [ ] Monitor logs for successful refreshes
- [ ] Set up alerts for refresh failures

## Rollback Plan

If something goes wrong:

1. **Code is backward compatible** - Works with both rotating and long-lived tokens
2. **Existing long-lived tokens keep working** even after enabling rotation
3. **Cannot disable rotation** once enabled - must fix forward

## Benefits of Token Rotation

✅ **Security**: Tokens expire every 12 hours
✅ **Automatic**: No manual intervention needed
✅ **Transparent**: Users don't notice anything
✅ **Best practice**: Recommended by Slack for distributed apps
✅ **Marketplace ready**: Required for Slack Marketplace distribution

## Next Steps

1. **Test in development** with a test workspace
2. **Enable token rotation** in Slack app settings
3. **Deploy to production** (already done!)
4. **Monitor logs** for the first 24 hours
5. **Exchange existing tokens** for rotating ones (optional but recommended)

---

**Questions?** Check the Slack documentation: https://api.slack.com/authentication/rotation

