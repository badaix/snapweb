export enum LogLevel {
    RAW = 0,
    DEBUG = 1,
    INFO = 2,
    WARN = 3,
    ERROR = 4
}

/**
 * A logger class that prefixes all log messages with a custom text
 */
export class Logger {
    private prefix: string;
    private logLevel: LogLevel;

    /**
     * Creates a new Logger instance
     * @param prefix - Text to be prepended to all log messages
     * @param logLevel - Minimum log level to display (default: INFO)
     */
    constructor(prefix: string, logLevel: LogLevel = LogLevel.INFO) {
        this.prefix = prefix;
        this.logLevel = logLevel;
    }

    /**
     * Formats the message by concatenating all parameters
     * @param args - Array of values to be logged
     * @returns Formatted string with prefix
     */
    private formatMessage(...args: any[]): string {
        return `[${this.prefix}] ${args.join(' ')}`;
    }

    /**
     * Sets the current log level
     * @param level - New log level to set
     */
    setLogLevel(level: LogLevel): void {
        this.logLevel = level;
    }

    /**
     * Logs an informational message
     * @param args - Values to be logged
     */
    info(...args: any[]): void {
        if (this.logLevel <= LogLevel.INFO) {
            console.log(this.formatMessage(...args));
        }
    }

    /**
     * Logs a warning message
     * @param args - Values to be logged
     */
    warn(...args: any[]): void {
        if (this.logLevel <= LogLevel.WARN) {
            console.warn(this.formatMessage(...args));
        }
    }

    /**
     * Logs an error message
     * @param args - Values to be logged
     */
    error(...args: any[]): void {
        if (this.logLevel <= LogLevel.ERROR) {
            console.error(this.formatMessage(...args));
        }
    }

    /**
     * Logs a debug message
     * @param args - Values to be logged
     */
    debug(...args: any[]): void {
        if (this.logLevel <= LogLevel.DEBUG) {
            console.debug(this.formatMessage(...args));
        }
    }

    /**
     * Logs a raw debug message without formatting
     * Only logs if log level is set to RAW
     * @param args - Values to be logged in raw format
     */
    debugRaw(...args: any[]): void {
        if (this.logLevel === LogLevel.RAW) {
            console.debug(...args);
        }
    }
}