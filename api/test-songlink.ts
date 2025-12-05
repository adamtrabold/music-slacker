/**
 * Test endpoint to measure Songlink API response time from Vercel
 */

import { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  const testUrl = 'https://open.spotify.com/track/3n3Ppam7vgaVa1iaRUc9Lp';
  const songlinkUrl = 'https://api.song.link/v1-alpha.1/links';
  
  const results = {
    timestamp: new Date().toISOString(),
    testUrl,
    attempts: [] as any[],
  };

  // Try 3 times to get average
  for (let i = 1; i <= 3; i++) {
    const startTime = Date.now();
    
    try {
      const response = await axios.get(songlinkUrl, {
        params: {
          url: testUrl,
          userCountry: 'US',
        },
        timeout: 35000, // 35 seconds
      });
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      results.attempts.push({
        attempt: i,
        success: true,
        duration: `${duration}ms`,
        statusCode: response.status,
        dataSize: JSON.stringify(response.data).length,
      });
      
      console.log(`Attempt ${i}: SUCCESS in ${duration}ms`);
      
    } catch (error: any) {
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      results.attempts.push({
        attempt: i,
        success: false,
        duration: `${duration}ms`,
        error: error.code || error.message,
        timeout: error.code === 'ECONNABORTED',
      });
      
      console.log(`Attempt ${i}: FAILED after ${duration}ms - ${error.code || error.message}`);
    }
    
    // Wait 2 seconds between attempts
    if (i < 3) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  // Calculate average for successful attempts
  const successful = results.attempts.filter(a => a.success);
  if (successful.length > 0) {
    const avgDuration = successful.reduce((sum, a) => {
      return sum + parseInt(a.duration);
    }, 0) / successful.length;
    
    results.summary = {
      successfulAttempts: successful.length,
      failedAttempts: results.attempts.length - successful.length,
      averageDuration: `${Math.round(avgDuration)}ms`,
    };
  } else {
    results.summary = {
      successfulAttempts: 0,
      failedAttempts: results.attempts.length,
      note: 'All attempts failed - likely network issue from Vercel to Songlink API',
    };
  }

  return res.status(200).json(results);
}

