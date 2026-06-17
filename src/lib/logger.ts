import pino from "pino";

// Configure Pino to write to BOTH the console (formatted) AND a file
// Vercel serverless functions do not support pino transports or writing to local files,
// so we only enable these transports in development mode.
const isDev = process.env.NODE_ENV !== "production";

const logger = pino(
  isDev
    ? {
        level: "info",
        transport: {
          targets: [
            {
              target: "pino-pretty",
              options: {
                colorize: true,
                translateTime: "SYS:HH:MM:ss",
                ignore: "pid,hostname",
              },
            },
            {
              target: "pino/file",
              options: {
                destination: "./scraper.log",
                mkdir: true,
              },
            },
          ],
        },
      }
    : {
        level: "info",
      }
);

export default logger;
