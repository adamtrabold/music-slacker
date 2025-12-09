/**
 * Token Refresh Service
 * Handles automatic token rotation for expiring Slack tokens
 */

import axios from 'axios';
import { getWorkspaceTokens, storeWorkspaceTokens, WorkspaceTokens } from './tokenStorage';

const SLACK_CLIENT_ID = process.env.SLACK_CLIENT_ID;
const SLACK_CLIENT_SECRET = process.env.SLACK_CLIENT_SECRET;

// Buffer time: refresh tokens 1 hour before they expire
const REFRESH_BUFFER_MS = 60 * 60 * 1000; // 1 hour

/**
 * Check if a token needs to be refreshed
 */
export function needsRefresh(tokens: WorkspaceTokens): boolean {
  // If no expiration time, token doesn't rotate (long-lived token)
  if (!tokens.expiresAt) {
    return false;
  }

  // Check if token expires within the buffer period
  const now = Date.now();
  const timeUntilExpiry = tokens.expiresAt - now;
  
  return timeUntilExpiry < REFRESH_BUFFER_MS;
}

/**
 * Refresh an expired or expiring token
 */
export async function refreshToken(teamId: string): Promise<WorkspaceTokens> {
  console.log('🔄 Refreshing token for team:', teamId);
  
  // Check environment variables first (fail fast)
  if (!SLACK_CLIENT_ID || !SLACK_CLIENT_SECRET) {
    throw new Error('Missing SLACK_CLIENT_ID or SLACK_CLIENT_SECRET');
  }
  
  // Get current tokens
  const currentTokens = await getWorkspaceTokens(teamId);
  
  if (!currentTokens) {
    throw new Error('No tokens found for workspace');
  }

  // Check if we have a refresh token
  if (!currentTokens.refreshToken) {
    // If token has an expiration but no refresh token, it's an invalid state
    if (currentTokens.expiresAt) {
      const timeUntilExpiry = currentTokens.expiresAt - Date.now();
      if (timeUntilExpiry < REFRESH_BUFFER_MS) {
        const isExpired = timeUntilExpiry < 0;
        console.error(isExpired ? '❌ Token already expired' : '❌ Token expires soon', 'but no refresh token available');
        throw new Error(`Token ${isExpired ? 'has expired' : 'is expiring'} but cannot be refreshed - workspace needs to reinstall app`);
      }
    }
    
    // Long-lived token without expiration - no refresh needed
    console.log('ℹ️ No refresh token - using long-lived token');
    return currentTokens;
  }

  try {
    // Call Slack OAuth API to refresh the token
    const response = await axios.post(
      'https://slack.com/api/oauth.v2.access',
      new URLSearchParams({
        client_id: SLACK_CLIENT_ID,
        client_secret: SLACK_CLIENT_SECRET,
        grant_type: 'refresh_token',
        refresh_token: currentTokens.refreshToken,
      }).toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    const data = response.data;

    if (!data.ok) {
      console.error('❌ Token refresh failed:', data.error);
      throw new Error(`Token refresh failed: ${data.error}`);
    }

    console.log('✅ Token refreshed successfully');

    // Calculate new expiration time
    const expiresAt = data.expires_in 
      ? Date.now() + (data.expires_in * 1000) 
      : undefined;

    // Store the new tokens
    const newTokens: WorkspaceTokens = {
      botToken: data.access_token,
      refreshToken: data.refresh_token, // New refresh token
      expiresAt,
      teamId: currentTokens.teamId,
      teamName: currentTokens.teamName,
      installedAt: currentTokens.installedAt,
    };

    await storeWorkspaceTokens(teamId, newTokens);

    return newTokens;
  } catch (error: any) {
    console.error('❌ Error refreshing token:', error.message);
    throw new Error('Failed to refresh token');
  }
}

/**
 * Get a valid token, refreshing if necessary
 */
export async function getValidToken(teamId: string): Promise<string> {
  let tokens = await getWorkspaceTokens(teamId);

  if (!tokens) {
    throw new Error('No tokens found for workspace');
  }

  // Check if token needs refresh
  if (needsRefresh(tokens)) {
    console.log('⏰ Token expiring soon, refreshing...');
    tokens = await refreshToken(teamId);
  }

  return tokens.botToken;
}

