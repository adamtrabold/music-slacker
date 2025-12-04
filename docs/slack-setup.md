# Setting Up Your Slack App

This guide walks you through creating and configuring a Slack App for the Music Slacker bot.

## Step 1: Create a Slack App

1. Go to [https://api.slack.com/apps](https://api.slack.com/apps)
2. Click **"Create New App"**
3. Select **"From scratch"**
4. Enter the following:
   - **App Name:** `Music Slacker` (or your preferred name)
   - **Workspace:** Select your target workspace
5. Click **"Create App"**

## Step 2: Configure OAuth & Permissions

1. In your app settings, navigate to **"OAuth & Permissions"** (left sidebar)
2. Scroll down to **"Scopes"** section
3. Under **"Bot Token Scopes"**, click **"Add an OAuth Scope"** and add:
   - `chat:write` - Post messages
   - `channels:history` - View messages in public channels
   - `groups:history` - View messages in private channels (if bot is invited)
   
4. Scroll to the top and click **"Install to Workspace"**
5. Review permissions and click **"Allow"**
6. **Copy the "Bot User OAuth Token"** (starts with `xoxb-`)
   - Save this as `SLACK_BOT_TOKEN` in your `.env` file

## Step 3: Enable Event Subscriptions

1. Navigate to **"Event Subscriptions"** (left sidebar)
2. Toggle **"Enable Events"** to **ON**
3. In **"Request URL"** field:
   - For local testing: Enter your ngrok URL (e.g., `https://abc123.ngrok.io/api/slack-events`)
   - For production: Enter your Vercel URL (e.g., `https://music-slacker.vercel.app/api/slack-events`)
   - Slack will verify this URL (you need to deploy the bot first or use ngrok)

4. Scroll down to **"Subscribe to bot events"** and add:
   - `message.channels` - Listen to messages in public channels
   - `message.groups` - Listen to messages in private channels

5. Click **"Save Changes"**

## Step 4: Get Your Signing Secret

1. Navigate to **"Basic Information"** (left sidebar)
2. Scroll to **"App Credentials"**
3. **Copy the "Signing Secret"**
   - Save this as `SLACK_SIGNING_SECRET` in your `.env` file

## Step 5: Install the Bot to Your Channel

1. Go to your Slack workspace
2. Navigate to the channel where you want the bot
3. Type `/invite @Music Slacker` (or your app name)
4. The bot will join the channel and start listening for music links

## Troubleshooting

### Request URL verification fails
- Make sure your bot is deployed and accessible
- Check that the URL is correct (no trailing slash)
- Review Vercel logs for errors

### Bot doesn't respond to messages
- Verify the bot is in the channel (`/invite @Music Slacker`)
- Check that Event Subscriptions are enabled
- Verify bot has correct OAuth scopes
- Check Vercel logs for errors

### "Not in channel" error
- The bot must be invited to the channel first
- Use `/invite @Music Slacker` in the channel

### Permissions issues
- Workspace admins may need to approve the app installation
- Contact your workspace admin if you can't install apps

## Security Notes

- **Never commit your tokens to git** - they're in `.env` which is gitignored
- Keep your Signing Secret safe - it verifies requests are from Slack
- Rotate tokens if they're ever exposed

## Environment Variables Summary

After completing these steps, your `.env` file should look like:

```
SLACK_BOT_TOKEN=xoxb-YOUR-BOT-TOKEN-HERE
SLACK_SIGNING_SECRET=your-signing-secret-here
```

## Next Steps

Once configured:
1. Deploy your bot to Vercel
2. Update the Request URL in Event Subscriptions with your Vercel URL
3. Test by posting a music link in your channel
4. Check Vercel logs if something doesn't work

