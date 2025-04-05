import winston from 'winston';
import 'winston-daily-rotate-file';

const { colorize, combine, timestamp, json, printf, align } = winston.format;

class LoggerSingleton {
  constructor() {
    if (LoggerSingleton.instance) {
      return LoggerSingleton.instance;
    }

    // Format for log file
    const defaultFormatFile = combine(
      colorize({ all: true }),
      timestamp({ format: 'YYYY-MM-DD hh:mm:ss.SSS A' }),
      align(),
      printf((info) => `[${info.timestamp}] ${info.level}: ${info.message}`)
    );

    // Winston Log for App (Log from repository, service, controller, etc.)
    winston.loggers.add(
      'app',
      winston.createLogger({
        level: process.env.LOG_LEVEL || 'info',
        format:
          process.env.LOG_OUTPUT === 'console'
            ? winston.format.cli()
            : combine(
                colorize({ all: true }),
                timestamp({ format: 'hh:mm:ss.SSS A YYYY-MM-DD' }),
                json()
              ),
        transports:
          process.env.LOG_OUTPUT === 'console'
            ? [new winston.transports.Console()]
            : [
                new winston.transports.DailyRotateFile({
                  filename: 'app-%DATE%.log',
                  datePattern: 'YYYY-MM-DD',
                  maxFiles: process.env.LOG_ROTATE || '30d',
                  format: defaultFormatFile
                }),
                new winston.transports.DailyRotateFile({
                  filename: 'app-error-%DATE%.log',
                  datePattern: 'YYYY-MM-DD',
                  maxFiles: process.env.LOG_ROTATE || '30d',
                  format: combine(
                    winston.format((info) =>
                      info.level === 'error' ? info : false
                    )(),
                    defaultFormatFile
                  )
                })
              ]
      })
    );

    // Winston Log for Request from HTTP with integrate to middleware
    winston.loggers.add(
      'access',
      winston.createLogger({
        level: process.env.LOG_LEVEL || 'info',
        format:
          process.env.LOG_OUTPUT === 'console'
            ? winston.format.cli()
            : combine(
                colorize({ all: true }),
                timestamp({ format: 'hh:mm:ss.SSS A YYYY-MM-DD' }),
                json()
              ),
        transports: [new winston.transports.Console()]
      })
    );

    // Store the instance
    this.loggers = winston.loggers;
    LoggerSingleton.instance = this;
  }

  /**
   * Get logger by name
   * @param {string} name - Logger name ('app' or 'access')
   * @returns {winston.Logger} Winston logger instance
   */
  getLogger(name) {
    return this.loggers.get(name);
  }

  /**
   * Get app logger
   * @returns {winston.Logger} App logger instance
   */
  get app() {
    return this.loggers.get('app');
  }

  /**
   * Get access logger
   * @returns {winston.Logger} Access logger instance
   */
  get access() {
    return this.loggers.get('access');
  }

  /**
   * Get all configured loggers
   * @returns {winston.Container} Winston loggers container
   */
  get all() {
    return this.loggers;
  }
}

// Create and freeze the singleton instance
const Logger = Object.freeze(new LoggerSingleton());

export default Logger;
