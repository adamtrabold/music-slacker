/**
 * Slack OAuth Callback Handler
 * Handles the OAuth flow when users install the app to their workspace
 */

import { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';
import { storeWorkspaceTokens } from '../src/services/tokenStorage';

const SLACK_CLIENT_ID = process.env.SLACK_CLIENT_ID;
const SLACK_CLIENT_SECRET = process.env.SLACK_CLIENT_SECRET;

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  console.log('🔄 OAuth callback triggered');
  
  try {
    // Check environment variables
    if (!SLACK_CLIENT_ID || !SLACK_CLIENT_SECRET) {
      console.error('❌ Missing required environment variables');
      return res.status(500).send(`
        <html>
          <body style="font-family: Arial; padding: 40px; text-align: center;">
            <h1>❌ Configuration Error</h1>
            <p>Missing SLACK_CLIENT_ID or SLACK_CLIENT_SECRET environment variables.</p>
            <p>Please configure these in your Vercel dashboard.</p>
          </body>
        </html>
      `);
    }
    
    // Get the authorization code from Slack
    const code = req.query.code as string;
    const error = req.query.error as string;

    if (error) {
      console.error('OAuth error:', error);
      return res.status(400).send(`
        <html>
          <body style="font-family: Arial; padding: 40px; text-align: center;">
            <h1>❌ Installation Failed</h1>
            <p>Error: ${error}</p>
            <p><a href="/">Try again</a></p>
          </body>
        </html>
      `);
    }

    if (!code) {
      return res.status(400).send(`
        <html>
          <body style="font-family: Arial; padding: 40px; text-align: center;">
            <h1>❌ Missing Authorization Code</h1>
            <p><a href="/">Go back</a></p>
          </body>
        </html>
      `);
    }

    // Exchange the code for an access token
    console.log('🔄 Exchanging code for access token...');
    const response = await axios.post(
      'https://slack.com/api/oauth.v2.access',
      new URLSearchParams({
        client_id: SLACK_CLIENT_ID,
        client_secret: SLACK_CLIENT_SECRET,
        code,
      }).toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    const data = response.data;
    console.log('📦 OAuth response received:', { ok: data.ok, teamId: data.team?.id });

    if (!data.ok) {
      console.error('❌ OAuth token exchange failed:', data.error);
      return res.status(400).send(`
        <html>
          <body style="font-family: Arial; padding: 40px; text-align: center;">
            <h1>❌ Installation Failed</h1>
            <p>Error: ${data.error}</p>
            <p><a href="/">Try again</a></p>
          </body>
        </html>
      `);
    }

    // Store the tokens
    console.log('💾 Storing tokens for team:', data.team.id);
    await storeWorkspaceTokens(data.team.id, {
      botToken: data.access_token,
      teamId: data.team.id,
      teamName: data.team.name,
      installedAt: new Date().toISOString(),
    });

    console.log('✅ App installed successfully:', {
      teamId: data.team.id,
      teamName: data.team.name,
    });

    // Success page
    return res.status(200).send(`
      <html>
        <head>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
              padding: 60px 40px;
              text-align: center;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .container {
              background: white;
              color: #333;
              padding: 40px;
              border-radius: 12px;
              box-shadow: 0 10px 40px rgba(0,0,0,0.2);
              max-width: 500px;
            }
            h1 { color: #1DB954; margin: 0 0 20px 0; }
            p { font-size: 18px; line-height: 1.6; }
            .emoji { font-size: 48px; margin-bottom: 20px; }
            a {
              display: inline-block;
              margin-top: 20px;
              padding: 12px 24px;
              background: #4A154B;
              color: white;
              text-decoration: none;
              border-radius: 6px;
              font-weight: bold;
            }
            a:hover { background: #611f69; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="emoji">🎉</div>
            <h1>Success!</h1>
            <p><strong>Music Slacker</strong> has been installed to <strong>${data.team.name}</strong></p>
            <p>Share any music link in a channel and the bot will reply with links to all platforms!</p>
            <a href="slack://open">Open Slack</a>
          </div>
        </body>
      </html>
    `);
  } catch (error: any) {
    console.error('❌ OAuth handler error:', error.message);
    console.error('Stack trace:', error.stack);
    
    // NEVER expose full error messages - they may contain tokens
    const safeError = error.message?.includes('WRONGPASS') 
      ? 'Database connection failed. Please check Redis configuration.'
      : 'An unexpected error occurred during installation.';
    
    return res.status(500).send(`
      <html>
        <body style="font-family: Arial; padding: 40px; text-align: center;">
          <h1>❌ Something went wrong</h1>
          <p>Please try again or contact support.</p>
          <p style="color: #999; font-size: 12px;">${safeError}</p>
        </body>
      </html>
    `);
  }
}
