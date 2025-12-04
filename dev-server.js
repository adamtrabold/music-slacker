// Simple local dev server for testing
const { createServer } = require('http');
const { parse } = require('url');

// Load environment variables
require('dotenv').config();

// Import the serverless function handler
const handler = require('./api/slack-events.ts');

const PORT = process.env.PORT || 3000;

const server = createServer(async (req, res) => {
  const parsedUrl = parse(req.url, true);
  
  console.log(`📥 ${req.method} ${req.url}`);
  
  // Handle both /api/slack-events and root /
  if (parsedUrl.pathname === '/api/slack-events' || parsedUrl.pathname === '/') {
    let body = '';
    
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', async () => {
      try {
        // Parse body
        const parsedBody = body ? JSON.parse(body) : {};
        
        console.log('📦 Request body:', JSON.stringify(parsedBody, null, 2));
        
        // Create Vercel-style request/response objects
        const vercelReq = {
          method: req.method,
          headers: req.headers,
          body: parsedBody,
          url: req.url,
        };
        
        const vercelRes = {
          status: (code) => {
            res.statusCode = code;
            console.log(`📤 Response status: ${code}`);
            return vercelRes;
          },
          json: (data) => {
            res.setHeader('Content-Type', 'application/json');
            console.log('📤 Response:', JSON.stringify(data, null, 2));
            res.end(JSON.stringify(data));
          },
        };
        
        // Call the handler
        await handler.default(vercelReq, vercelRes);
      } catch (error) {
        console.error('❌ Error handling request:', error);
        res.statusCode = 500;
        res.end(JSON.stringify({ error: 'Internal server error' }));
      }
    });
  } else {
    res.statusCode = 404;
    res.end('Not found');
  }
});

server.listen(PORT, () => {
  console.log(`🚀 Dev server running at http://localhost:${PORT}`);
  console.log(`📡 Slack endpoint: http://localhost:${PORT}/api/slack-events`);
  console.log(`\n💡 Start ngrok in another terminal: ngrok http ${PORT}`);
});

