// 责任链模式实现

const TYPE = {
  LOG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
};

class Logger {
  constructor(logger, level = 0) {
    this.logger = logger;
    this.level = level;
  }

  setNextLogger(logger) {
    this.nextLogger = logger;
  }

  logMessage(level, message) {
    if (this.level <= level) {
      this.logger(message);
      return;
    }

    if (this.nextLogger) {
      this.nextLogger.logMessage(level, message);
    }
  }
}

function getLogger() {
  const logger = new Logger(console.log, TYPE.LOG);
  const infoLogger = new Logger(console.info, TYPE.INFO);
  const warnLogger = new Logger(console.warn, TYPE.WARN);
  const errorLogger = new Logger(console.error, TYPE.ERROR);

  errorLogger.setNextLogger(warnLogger);
  warnLogger.setNextLogger(infoLogger);
  infoLogger.setNextLogger(logger);

  return errorLogger;
}

const logger = getLogger();

logger.logMessage(TYPE.LOG, 'log message');
logger.logMessage(TYPE.INFO, 'info message');
logger.logMessage(TYPE.WARN, 'warn message');
logger.logMessage(TYPE.ERROR, 'error message');
