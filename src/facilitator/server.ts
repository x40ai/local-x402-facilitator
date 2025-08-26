import express from 'express';
import chalk from 'chalk';
import logger from 'pino-http';
import pino from 'pino';

import config from '../config';

import appRouter from './router';
import TenderlyClient from '../tenderly/client';

const app = express();

// Basic middleware
app.use(express.json());

const loggerMiddleware = logger({
  autoLogging: false, // Disable automatic request/response logging
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname,category,eventCode,req,res,responseTime',
      messageFormat: '{msg}',
    },
  },
});

app.use(loggerMiddleware);

app.use((req, res, next) => {
  const originalSend = res.send;
  res.send = function(body) {
    const message = `[${req.method}] ${req.url} - HTTP ${res.statusCode}`;
    
    if (req.path === '/verify' || req.path === '/settle') {
      req.log.info({response: JSON.parse(body)}, message);
    } else {
      req.log.info(message);
    }

    return originalSend.call(this, body);
  };
  next();
});

app.use('/', appRouter);

const serverAsciiArt = [
  "/* +-------------------------------------------------------+ */",
  "/* |                                                       | */",
  "/* |   _                     _          ___ _____  _____   | */",
  "/* |  | |                   | |        /   |  _  |/ __  \\  | */",
  "/* |  | |     ___   ___ __ _| | __  __/ /| | |/' |`' / /'  | */",
  "/* |  | |    / _ \\ / __/ _` | | \\ \\/ / /_| |  /| |  / /    | */",
  "/* |  | |___| (_) | (_| (_| | |  >  <\\___  \\ |_/ /./ /___  | */",
  "/* |  \\_____/\\___/ \\___\\__,_|_| /_/\\_\\   |_/\\___/ \\_____/  | */",
  "/* |                                                       | */",
  "/* |                                                       | */",
  "/* |  ______         _ _ _ _        _                      | */",
  "/* |  |  ___|       (_) (_) |      | |                     | */",
  "/* |  | |_ __ _  ___ _| |_| |_ __ _| |_ ___  _ __          | */",
  "/* |  |  _/ _` |/ __| | | | __/ _` | __/ _ \\| '__|         | */",
  "/* |  | || (_| | (__| | | | || (_| | || (_) | |            | */",
  "/* |  \\_| \\__,_|\\___|_|_|_|\\__\\__,_|\\__\\___/|_|            | */",
  "/* |                                                       | */",
  "/* +-------------------------------------------------------+ */\n"
].join('\n');

// Start server
export function startServer() {
  const server = app.listen(config.facilitatorPort, async () => {
    console.log(serverAsciiArt);
    
    config.printSetup();

    const tenderlyClient = TenderlyClient.getInstance();

    await tenderlyClient.checkIfTestnetIsSetup();
  });

  // Graceful shutdown handling
  const shutdown = (signal: string) => {
    console.log(`\nReceived ${chalk.bgRed(signal)}. Shutting down gracefully...`);
    server.close(() => {
      console.log(chalk.yellow('Server shut down.'));
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