import crypto from 'crypto';

// Your actual Slack signing secret
const SLACK_SIGNING_SECRET = '27d17606b8eb5bc2fe342fa478f165e6';

// Test with a sample Slack request
const timestamp = Math.floor(Date.now() / 1000).toString();
const body = JSON.stringify({"type":"url_verification","challenge":"test123","token":"test"});

// Calculate signature the way Slack does it
const sigBasestring = `v0:${timestamp}:${body}`;
const signature = 'v0=' + crypto.createHmac('sha256', SLACK_SIGNING_SECRET)
  .update(sigBasestring)
  .digest('hex');

console.log('Test Slack Signature Calculation:');
console.log('Timestamp:', timestamp);
console.log('Body:', body);
console.log('Sig basestring:', sigBasestring);
console.log('Calculated signature:', signature);
console.log('\nTest with curl:');
console.log(`curl -X POST https://music-slacker.vercel.app/api/slack-events \\
  -H "Content-Type: application/json" \\
  -H "X-Slack-Request-Timestamp: ${timestamp}" \\
  -H "X-Slack-Signature: ${signature}" \\
  -d '${body}'`);
