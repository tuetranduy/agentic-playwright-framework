import winston from 'winston';
import path from 'path';

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ timestamp, level, message, stack }) => {
    if (stack) {
      return `${timestamp} [${level.toUpperCase()}]: ${message}\n${stack}`;
    }
    return `${timestamp} [${level.toUpperCase()}]: ${message}`;
  })
);

export class Logger {
  private static instance: winston.Logger;

  static getInstance(): winston.Logger {
    if (!Logger.instance) {
      Logger.instance = winston.createLogger({
        level: process.env.LOG_LEVEL || 'info',
        format: logFormat,
        transports: [
          new winston.transports.Console({
            format: winston.format.combine(winston.format.colorize(), logFormat),
            forceConsole: true,
          }),
          new winston.transports.File({
            filename: path.join(process.cwd(), 'logs', 'framework.log'),
            maxsize: 5242880, // 5MB
            maxFiles: 5,
          }),
          new winston.transports.File({
            filename: path.join(process.cwd(), 'logs', 'error.log'),
            level: 'error',
            maxsize: 5242880,
            maxFiles: 5,
          }),
        ],
      });
    }
    return Logger.instance;
  }
}

export const logger = Logger.getInstance();
