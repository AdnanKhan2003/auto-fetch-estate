import pino from "pino";

// Configure Pino to write to BOTH the console (formatted) AND a file
const logger = pino({
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
          destination: "./scraper.log", // Saves all logs to this file in the root directory
          mkdir: true,
        },
      },
    ],
  },
});

export default logger;
