import { pinoLogger } from "hono-pino";
import { logger } from "@/server/services/logger.service";

export const loggerMiddleware = pinoLogger({ pino: logger });
