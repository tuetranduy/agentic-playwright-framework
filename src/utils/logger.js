"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = exports.Logger = void 0;
const winston_1 = __importDefault(require("winston"));
const path_1 = __importDefault(require("path"));
const logFormat = winston_1.default.format.combine(winston_1.default.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), winston_1.default.format.errors({ stack: true }), winston_1.default.format.printf(({ timestamp, level, message, stack }) => {
    if (stack) {
        return `${timestamp} [${level.toUpperCase()}]: ${message}\n${stack}`;
    }
    return `${timestamp} [${level.toUpperCase()}]: ${message}`;
}));
class Logger {
    static getInstance() {
        if (!Logger.instance) {
            Logger.instance = winston_1.default.createLogger({
                level: process.env.LOG_LEVEL || 'info',
                format: logFormat,
                transports: [
                    new winston_1.default.transports.Console({
                        format: winston_1.default.format.combine(winston_1.default.format.colorize(), logFormat),
                    }),
                    new winston_1.default.transports.File({
                        filename: path_1.default.join(process.cwd(), 'logs', 'framework.log'),
                        maxsize: 5242880, // 5MB
                        maxFiles: 5,
                    }),
                    new winston_1.default.transports.File({
                        filename: path_1.default.join(process.cwd(), 'logs', 'error.log'),
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
exports.Logger = Logger;
exports.logger = Logger.getInstance();
//# sourceMappingURL=logger.js.map