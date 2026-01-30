// Forced Server Wrapper for Render Stability
process.env.HOSTNAME = '0.0.0.0';
process.env.PORT = '10000';
process.env.NODE_ENV = 'production';

console.log(`[WRAPPER] Starting server on ${process.env.HOSTNAME}:${process.env.PORT}`);

// Load the Next.js standalone server
// Note: In standalone mode, we must relative-require from the standalone directory
require('../.next/standalone/server.js');
