import express from 'express';
import { Config } from '../config';

let serverConfig: Config;

const app = express();

// Basic middleware
app.use(express.json());

// Simple logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Local x402 Facilitator' });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/config', (req, res) => {
  res.json({ 
    facilitatorPort: serverConfig.facilitatorPort,
    tenderlyConfigured: Boolean(serverConfig.tenderly.rpc),
    tenderly: serverConfig.tenderly.rpc ? {
      rpc: serverConfig.tenderly.rpc,
      accountName: serverConfig.tenderly.accountName,
      projectName: serverConfig.tenderly.projectName,
      // Don't expose the access key for security
      hasAccessKey: Boolean(serverConfig.tenderly.accessKey)
    } : null
  });
});

// Start server
export function startServer(config: Config) {
  const { facilitatorPort } = config;
  
  // Store config reference for use in endpoints
  serverConfig = config;
  
  const server = app.listen(facilitatorPort, () => {
    console.log(`x402 Facilitator running on port ${facilitatorPort}`);
    console.log('Facilitator started. Press Ctrl+C to stop.');
  });

  // Graceful shutdown handling
  const shutdown = (signal: string) => {
    console.log(`\nReceived ${signal}. Shutting down gracefully...`);
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  };

  // Handle different termination signals
  process.on('SIGTERM', () => {shutdown('SIGTERM');});
  process.on('SIGINT', () => {shutdown('SIGINT');});
  process.on('SIGQUIT', () => {shutdown('SIGQUIT');});
  
  return server;
}

export default app;