import { format } from "date-fns";
import winston, { Logger, transports } from "winston";

export function createLogger(prod = false): Logger {
  const logger = winston.createLogger({
    level: prod ? "info" : "debug",
    levels: {
      alert: 1,
      debug: 5,
      error: 0,
      info: 4,
      notice: 3,
      warn: 2,
    },
    transports: [
      new transports.File({
        filename: `logs/error-${format(Date.now(), "dd-MM-yyyy-HH-mm-ss")}.log`,
        level: "error",
      }),
      new transports.File({ filename: `logs/logs-${format(Date.now(), "dd-MM-yyyy-HH-mm-ss")}.log` }),
    ],
    format: winston.format.combine(
      winston.format.printf((info) => {
        const { level, message, stack } = info;
        const prefix = `[${format(Date.now(), "dd-MM-yyyy HH:mm:ss (x)")}] [${level}]`;
        if (["error", "crit"].includes(level)) return `${prefix}: ${stack ?? message}`;
        return `${prefix}: ${message}`;
      })
    ),
  });

  logger.add(
    new transports.Console({
      format: winston.format.combine(
        winston.format.printf((info) => {
          const { level, message, stack } = info;
          const prefix = `[${format(Date.now(), "dd-MM-yyyy HH:mm:ss (x)")}] [${level}]`;

          if (["error", "alert"].includes(level) && !prod) {
            const symbolKey = Reflect.ownKeys(info).find((key) => key.toString() === "Symbol(message)") as any;

            if (!symbolKey) return `${prefix}: ${stack ?? message}`;

            return info[symbolKey];
          }
          return `${prefix}: ${message}`;
        }),
        winston.format.align(),
        prod ? winston.format.colorize({ all: false }) : winston.format.colorize({ all: true })
      ),
    })
  );

  return logger;
}
