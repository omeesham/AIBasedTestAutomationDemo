/**
 * Enterprise Framework Logger
 * 
 * Structured logging with log levels, timestamps, and component context.
 * Protected in distribution builds.
 */

export enum LogLevel {
    DEBUG = 0,
    INFO = 1,
    WARN = 2,
    ERROR = 3,
    SILENT = 4
}

const LOG_COLORS: Record<string, string> = {
    DEBUG: '\x1b[36m',   // Cyan
    INFO: '\x1b[32m',    // Green
    WARN: '\x1b[33m',    // Yellow
    ERROR: '\x1b[31m',   // Red
    RESET: '\x1b[0m'
};

const LOG_ICONS: Record<string, string> = {
    DEBUG: '🔍',
    INFO: '✅',
    WARN: '⚠️',
    ERROR: '❌'
};

export class Logger {
    private component: string;
    private static globalLevel: LogLevel = LogLevel.INFO;

    constructor(component: string) {
        this.component = component;
    }

    /**
     * Set global log level
     */
    static setLevel(level: LogLevel): void {
        Logger.globalLevel = level;
    }

    /**
     * Get current log level from environment
     */
    static getLevel(): LogLevel {
        const envLevel = process.env.LOG_LEVEL?.toUpperCase();
        if (envLevel && envLevel in LogLevel) {
            return LogLevel[envLevel as keyof typeof LogLevel];
        }
        return Logger.globalLevel;
    }

    private formatMessage(level: string, message: string): string {
        const timestamp = new Date().toISOString();
        const icon = LOG_ICONS[level] || '';
        const color = LOG_COLORS[level] || '';
        const reset = LOG_COLORS.RESET;
        return `${color}${icon} [${timestamp}] [${level}] [${this.component}]${reset} ${message}`;
    }

    debug(message: string, ...args: any[]): void {
        if (Logger.getLevel() <= LogLevel.DEBUG) {
            console.log(this.formatMessage('DEBUG', message), ...args);
        }
    }

    info(message: string, ...args: any[]): void {
        if (Logger.getLevel() <= LogLevel.INFO) {
            console.log(this.formatMessage('INFO', message), ...args);
        }
    }

    warn(message: string, ...args: any[]): void {
        if (Logger.getLevel() <= LogLevel.WARN) {
            console.warn(this.formatMessage('WARN', message), ...args);
        }
    }

    error(message: string, ...args: any[]): void {
        if (Logger.getLevel() <= LogLevel.ERROR) {
            console.error(this.formatMessage('ERROR', message), ...args);
        }
    }

    /**
     * Log a step in test execution
     */
    step(stepNumber: number, description: string): void {
        this.info(`Step ${stepNumber}: ${description}`);
    }

    /**
     * Log test start
     */
    testStart(testName: string): void {
        this.info(`━━━ TEST START: ${testName} ━━━`);
    }

    /**
     * Log test end
     */
    testEnd(testName: string, status: 'PASS' | 'FAIL' | 'SKIP'): void {
        const icon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⏭️';
        this.info(`━━━ TEST ${status}: ${testName} ${icon} ━━━`);
    }

    /**
     * Log a separator line for readability
     */
    separator(): void {
        if (Logger.getLevel() <= LogLevel.INFO) {
            console.log('─'.repeat(80));
        }
    }
}
