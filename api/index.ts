/**
 * Landing page with "Add to Slack" button
 */

import { VercelRequest, VercelResponse } from '@vercel/node';

const SLACK_CLIENT_ID = process.env.SLACK_CLIENT_ID;

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Check if client ID is configured
  if (!SLACK_CLIENT_ID) {
    return res.status(500).send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Music Slacker - Configuration Error</title>
      </head>
      <body style="font-family: Arial; padding: 40px; text-align: center;">
        <h1>❌ Configuration Error</h1>
        <p>Missing SLACK_CLIENT_ID environment variable.</p>
        <p>Please configure this in your Vercel dashboard.</p>
      </body>
      </html>
    `);
  }
  
  const redirectUri = 'https://music-slacker.vercel.app/api/oauth-callback';
  const scopes = 'channels:history,chat:write,links:read';
  const slackAuthUrl = `https://slack.com/oauth/v2/authorize?client_id=${SLACK_CLIENT_ID}&scope=${scopes}&redirect_uri=${encodeURIComponent(redirectUri)}`;

  return res.status(200).send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Music Slacker - Add to Slack</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
          margin: 0;
          padding: 0;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .container {
          background: white;
          padding: 60px 40px;
          border-radius: 16px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
          max-width: 600px;
          text-align: center;
        }
        h1 {
          color: #333;
          font-size: 48px;
          margin: 0 0 20px 0;
        }
        .emoji {
          font-size: 80px;
          margin-bottom: 20px;
        }
        p {
          color: #666;
          font-size: 18px;
          line-height: 1.8;
          margin: 20px 0;
        }
        .features {
          text-align: left;
          margin: 30px 0;
          display: inline-block;
        }
        .feature {
          margin: 10px 0;
          font-size: 16px;
          color: #555;
        }
        .feature::before {
          content: "✓ ";
          color: #1DB954;
          font-weight: bold;
          margin-right: 8px;
        }
        .button-container {
          margin: 40px 0 20px 0;
        }
        a {
          display: inline-block;
          transition: transform 0.2s;
        }
        a:hover {
          transform: scale(1.05);
        }
        .footer {
          margin-top: 30px;
          font-size: 14px;
          color: #999;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="emoji">🎵</div>
        <h1>Music Slacker</h1>
        <p>Share music links and instantly get links for all platforms</p>
        
        <div class="features">
          <div class="feature">Spotify, Apple Music, Tidal, YouTube Music</div>
          <div class="feature">Qobuz and Bandcamp search links</div>
          <div class="feature">Automatic threaded replies</div>
          <div class="feature">Fast and secure (< 600ms average)</div>
        </div>

        <div class="button-container">
          <a href="${slackAuthUrl}">
            <img 
              alt="Add to Slack" 
              height="40" 
              width="139" 
              src="https://platform.slack-edge.com/img/add_to_slack.png" 
              srcSet="https://platform.slack-edge.com/img/add_to_slack.png 1x, https://platform.slack-edge.com/img/add_to_slack@2x.png 2x" 
            />
          </a>
        </div>

        <div class="footer">
          <p>Free • Open Source • Secure</p>
        </div>
      </div>
    </body>
    </html>
  `);
}

