import pino from "pino";

const isDev = process.env.NODE_ENV === "development";

export const logger = pino({
  level: isDev ? "debug" : "info",
  serializers: {
    req: (req) => ({ method: req.method, url: req.url }),
    res: (res) => ({ status: res.status }),
    err: pino.stdSerializers.err,
  },
  ...(isDev && {
    transport: {
      target: "hono-pino/debug-log",
      options: {
        httpLogFormat:
          "[{time}] {levelLabel} {req.method} {req.url} {res.status} ({responseTime}ms)",
      },
    },
  }),
});
