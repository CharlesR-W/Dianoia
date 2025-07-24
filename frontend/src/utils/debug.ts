// Simple debug utility for frontend
interface DebugLog {
    timestamp: string;
    level: string;
    category: string;
    action: string;
    message: string;
    data?: any;
}

interface DebugConfig {
    enabled: boolean;
    logLevel: 'trace' | 'info' | 'warn' | 'error';
    maxLogs: number;
}

class DebugLogger {
    private logs: DebugLog[] = [];
    private config: DebugConfig = {
        enabled: true,
        logLevel: 'info',
        maxLogs: 1000
    };

    info(category: string, action: string, message: string, data?: any) {
        this.log('info', category, action, message, data);
    }

    warn(category: string, action: string, message: string, data?: any) {
        this.log('warn', category, action, message, data);
    }

    error(category: string, action: string, message: string, data?: any) {
        this.log('error', category, action, message, data);
    }

    trace(category: string, action: string, message: string, data?: any) {
        this.log('trace', category, action, message, data);
    }

    trackError(error: Error, category: string, action: string) {
        this.log('error', category, action, error.message, {
            stack: error.stack,
            name: error.name
        });
    }

    private log(level: string, category: string, action: string, message: string, data?: any) {
        if (!this.config.enabled) return;

        const logEntry: DebugLog = {
            timestamp: new Date().toISOString(),
            level,
            category,
            action,
            message,
            data
        };

        this.logs.push(logEntry);

        // Limit logs to maxLogs
        if (this.logs.length > this.config.maxLogs) {
            this.logs = this.logs.slice(-this.config.maxLogs);
        }

        // Also log to console
        const consoleMethod = level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log';
        console[consoleMethod](`[${category}] ${action}: ${message}`, data || '');
    }

    getLogs(): DebugLog[] {
        return [...this.logs];
    }

    clearLogs() {
        this.logs = [];
    }

    getConfig(): DebugConfig {
        return { ...this.config };
    }

    updateConfig(newConfig: Partial<DebugConfig>) {
        this.config = { ...this.config, ...newConfig };
    }

    exportLogs(): string {
        return JSON.stringify(this.logs, null, 2);
    }

    setEnabled(enabled: boolean) {
        this.config.enabled = enabled;
    }

    // Performance tracking methods
    private timers: Map<string, number> = new Map();

    startTimer(name: string): void {
        this.timers.set(name, performance.now());
    }

    endTimer(name: string): number {
        const startTime = this.timers.get(name);
        if (startTime) {
            const duration = performance.now() - startTime;
            this.timers.delete(name);
            return duration;
        }
        return 0;
    }

    // API tracking methods
    trackAPIRequest(method: string, url: string, data?: any): void {
        this.info('api', 'request', `${method} ${url}`, data);
    }

    trackAPIResponse(method: string, url: string, status: number, data?: any): void {
        this.info('api', 'response', `${method} ${url} - ${status}`, data);
    }
}

export const debug = new DebugLogger(); 