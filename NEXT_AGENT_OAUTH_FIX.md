# AGENT HANDOFF - Music Slacker Bot

## STATUS: 95% Complete - OAuth Callback Crashing

### What's Working ✅
- **Bot works perfectly in single workspace** (Trabold Family)
- Signature verification: ✅ Working with `micro` library
- Response time: **568ms average** (fast!)
- Event deduplication: ✅ No double-posting
- Message format: ✅ Separated "Stream on" vs "Search" links
- Uplinks disabled: ✅ Clean text-only responses

### Current Issue ❌
**OAuth callback endpoint crashes** when adding to new workspace
- URL: `https://music-slacker.vercel.app/api/oauth-callback`
- Error: `FUNCTION_INVOCATION_FAILED`
- File: `api/oauth-callback.ts`

### What We Just Built
1. **Token storage** (`src/services/tokenStorage.ts`) - Upstash Redis integration
2. **OAuth callback** (`api/oauth-callback.ts`) - Exchanges code for tokens
3. **Landing page** (`api/index.ts`) - "Add to Slack" button
4. **Dynamic token loading** in `api/slack-events.ts`

### Environment Variables (All Set in Vercel)
- ✅ `SLACK_BOT_TOKEN` (fallback for test workspace)
- ✅ `SLACK_SIGNING_SECRET`
- ✅ `SLACK_CLIENT_ID`
- ✅ `SLACK_CLIENT_SECRET`
- ✅ `UPSTASH_REDIS_REST_URL`
- ✅ `UPSTASH_REDIS_REST_TOKEN`

### Immediate Fix Needed
**Check Vercel logs** for oauth-callback crash:
```bash
# In Vercel Dashboard → Logs
# Look for errors in POST /api/oauth-callback
```

**Likely causes:**
1. Missing import or dependency in `oauth-callback.ts`
2. Upstash connection issue
3. TypeScript compilation error

**Quick fix approach:**
- Check build logs for TypeScript errors
- Test Upstash connection works from Vercel
- Add try-catch with detailed logging to oauth-callback.ts

### Key Files
- `api/slack-events.ts` - Main handler (WORKING)
- `api/oauth-callback.ts` - OAuth handler (CRASHING)
- `src/services/tokenStorage.ts` - Redis token storage
- `api/index.ts` - Landing page

### Critical Context
- GitHub NOW connected to Vercel (was disconnected, caused 2hr debugging)
- Vercel free tier = 10s timeout (changed from 60s in config, won't work)
- MUST process events BEFORE responding (Vercel kills background tasks)
- Using `micro` library's `buffer()` for raw body (signature verification)

### Test Commands
```bash
# Test landing page
curl https://music-slacker.vercel.app/

# Test events endpoint (should return 401 without signature)
curl -X POST https://music-slacker.vercel.app/api/slack-events

# Check if oauth callback responds
curl https://music-slacker.vercel.app/api/oauth-callback?code=test
```

### Success Criteria
1. OAuth callback works without crashing
2. User can install bot to new workspace
3. Bot works in multiple workspaces simultaneously
4. (Optional) Add token rotation if Slack owner requires it

