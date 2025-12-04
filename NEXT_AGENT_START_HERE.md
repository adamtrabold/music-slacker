# NEXT AGENT: START HERE

## The Problem
Slack Event URL verification fails with: "Your URL didn't respond with the challenge parameter"

## What Works
- ✅ Bot code is complete and works locally with ngrok
- ✅ Vercel deployment succeeds
- ✅ Endpoint responds (returns 401 "Invalid signature")
- ✅ Environment variables are set in Vercel

## The Issue
**Signature verification is failing.** File: `api/slack-events.ts`

Current approach: Disable bodyParser and read raw body as buffer.
Problem: Still getting "Invalid signature" even with our own test requests.

## Immediate Action
**Check Vercel logs** - the function has detailed debug logging:
```bash
cd "/Users/adam.trabold/Cursor Projects/Music Slacker"
vercel logs music-slacker.vercel.app
```

Look for the "===== DEBUG INFO =====" section which shows:
- What raw body was received
- What signature was calculated
- What signature was expected

## Likely Solutions
1. **Use @slack/bolt** - It handles signature verification correctly for Vercel
2. **Check if bodyParser: false actually works** in Vercel functions
3. **Compare raw body received vs what Slack actually sent**

## Test Commands
See `DEPLOYMENT_ISSUE.md` for full details and test commands.

## URLs
- Vercel: https://vercel.com/adams-projects-9a2509e9/music-slacker
- GitHub: https://github.com/adamtrabold/music-slacker  
- Slack Config: https://api.slack.com/apps (Music Slacker Test app)

## Files to Review
- `api/slack-events.ts` - Main handler (line ~110 has debug logging)
- `DEPLOYMENT_ISSUE.md` - Full problem description
- `.env` - Local environment variables (gitignored, has actual tokens)

