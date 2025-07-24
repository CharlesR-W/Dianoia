// Clean debugging system for Dianoia
// Provides structured logging without TypeScript compilation issues

export interface DebugConfig {
    enabled: boolean;
    level: 'error' | 'warn' | 'info' | 'debug' | 'trace';
    includeTimestamps: boolean;
    includePerformance: boolean;
    includeStackTraces: boolean;
    logToConsole: boolean;
    logToFile: boolean;
    logFilePath?: string;
}

export interface LogEntry {
    timestamp: string;
    level: string;
    component: string;
    action: string;
    message: string;
    data?: any;
    performance?: {
        duration?: number;
        memory?: number;
    };
    error?: {
        name: string;
        message: string;
        stack?: string;
    };
    context?: {
        sessionId?: string;
        userId?: string;
        requestId?: string;
        [key: string]: any;
    };
}

export interface PerformanceMetric {
    operation: string;
    startTime: number;
    endTime?: number;
    duration?: number;
    metadata?: Record<string, any>;
}

const isNodeEnv = (): boolean => {
    return typeof process !== 'undefined' &&
        typeof process.versions !== 'undefined' &&
        typeof process.versions.node !== 'undefined';
};

const isBrowserEnv = (): boolean => {
    try {
        return typeof globalThis !== 'undefined' && typeof (globalThis as any).window !== 'undefined';
    } catch {
        return false;
    }
};

const getTime = (): number => {
    return Date.now();
};

const getStorage = (): any => {
    if (isBrowserEnv()) {
        try {
            const win = (globalThis as any).window;
            if (win && win.localStorage) {
                return win.localStorage;
            }
        } catch {
            // Ignore errors in Node.js environment
        }
    }
    return null;
};

class DebugLogger {
    private config: DebugConfig;
    private performanceMetrics: Map<string, PerformanceMetric> = new Map();
    private logBuffer: LogEntry[] = [];
    private maxBufferSize = 1000;

    constructor(config: Partial<DebugConfig> = {}) {
        this.config = {
            enabled: true, // Default to enabled
            level: 'debug',
            includeTimestamps: true,
            includePerformance: true,
            includeStackTraces: true,
            logToConsole: true,
            logToFile: false,
            ...config
        };

        // Initialize debug mode
        this.initializeDebugMode();
    }

    private initializeDebugMode(): void {
        // Check environment variables first (Node.js)
        if (isNodeEnv() && typeof process !== 'undefined' && process.env) {
            if (process.env.DIANOIA_DEBUG === 'false') {
                this.config.enabled = false;
            } else if (process.env.DIANOIA_DEBUG_LEVEL) {
                this.config.level = process.env.DIANOIA_DEBUG_LEVEL as any;
            }
        }

        // Check localStorage for frontend (Browser)
        const storage = getStorage();
        if (storage) {
            const debugEnabled = storage.getItem('dianoia_debug_enabled');
            if (debugEnabled === 'false') {
                this.config.enabled = false;
            } else if (debugEnabled === 'true') {
                this.config.enabled = true;
            }

            const debugLevel = storage.getItem('dianoia_debug_level');
            if (debugLevel && ['error', 'warn', 'info', 'debug', 'trace'].includes(debugLevel)) {
                this.config.level = debugLevel as any;
            }
        }

        if (this.config.enabled) {
            this.log('system', 'debug_init', 'Debug system initialized', {
                config: this.config,
                environment: isBrowserEnv() ? 'browser' : 'node',
                timestamp: new Date().toISOString()
            });
        }
    }

    private shouldLog(level: string): boolean {
        if (!this.config.enabled) return false;

        const levels = ['error', 'warn', 'info', 'debug', 'trace'];
        const currentLevelIndex = levels.indexOf(this.config.level);
        const messageLevelIndex = levels.indexOf(level);

        return messageLevelIndex <= currentLevelIndex;
    }

    private formatLogEntry(entry: LogEntry): string {
        let formatted = '';

        if (this.config.includeTimestamps) {
            formatted += `[${entry.timestamp}] `;
        }

        formatted += `[${entry.level.toUpperCase()}] `;
        formatted += `[${entry.component}] `;
        formatted += `${entry.action}: ${entry.message}`;

        if (entry.performance?.duration) {
            formatted += ` (${entry.performance.duration.toFixed(2)}ms)`;
        }

        if (entry.context) {
            formatted += ` | Context: ${JSON.stringify(entry.context)}`;
        }

        return formatted;
    }

    private createLogEntry(
        level: string,
        component: string,
        action: string,
        message: string,
        data?: any,
        context?: any
    ): LogEntry {
        const entry: LogEntry = {
            timestamp: new Date().toISOString(),
            level,
            component,
            action,
            message,
            data,
            context
        };

        if (this.config.includePerformance) {
            entry.performance = { duration: getTime() };
        }

        return entry;
    }

    private outputLog(entry: LogEntry): void {
        if (!this.shouldLog(entry.level)) return;

        const formatted = this.formatLogEntry(entry);

        if (this.config.logToConsole) {
            const consoleMethod = entry.level === 'error' ? 'error'
                : entry.level === 'warn' ? 'warn'
                    : entry.level === 'info' ? 'info'
                        : 'log';

            console[consoleMethod](formatted);

            // Include structured data for debugging
            if (entry.data || entry.error || entry.performance) {
                console.group('📊 Debug Details');
                if (entry.data) console.log('Data:', entry.data);
                if (entry.error) console.log('Error:', entry.error);
                if (entry.performance) console.log('Performance:', entry.performance);
                if (entry.context) console.log('Context:', entry.context);
                console.groupEnd();
            }
        }

        // Add to buffer for potential file logging
        this.logBuffer.push(entry);
        if (this.logBuffer.length > this.maxBufferSize) {
            this.logBuffer.shift();
        }
    }

    // Public logging methods
    public error(component: string, action: string, message: string, data?: any, context?: any): void {
        const entry = this.createLogEntry('error', component, action, message, data, context);
        this.outputLog(entry);
    }

    public warn(component: string, action: string, message: string, data?: any, context?: any): void {
        const entry = this.createLogEntry('warn', component, action, message, data, context);
        this.outputLog(entry);
    }

    public info(component: string, action: string, message: string, data?: any, context?: any): void {
        const entry = this.createLogEntry('info', component, action, message, data, context);
        this.outputLog(entry);
    }

    public debug(component: string, action: string, message: string, data?: any, context?: any): void {
        const entry = this.createLogEntry('debug', component, action, message, data, context);
        this.outputLog(entry);
    }

    public trace(component: string, action: string, message: string, data?: any, context?: any): void {
        const entry = this.createLogEntry('trace', component, action, message, data, context);
        this.outputLog(entry);
    }

    // Convenience method for general logging
    public log(component: string, action: string, message: string, data?: any, context?: any): void {
        this.debug(component, action, message, data, context);
    }

    // Performance tracking
    public startTimer(operation: string, metadata?: Record<string, any>): string {
        if (!this.config.enabled || !this.config.includePerformance) return '';

        const timerId = `${operation}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const startTime = getTime();

        this.performanceMetrics.set(timerId, {
            operation,
            startTime,
            metadata
        });

        this.trace('performance', 'timer_start', `Started timer for: ${operation}`, { timerId, metadata });
        return timerId;
    }

    public endTimer(timerId: string, additionalData?: any): void {
        if (!this.config.enabled || !this.config.includePerformance || !timerId) return;

        const metric = this.performanceMetrics.get(timerId);
        if (!metric) {
            this.warn('performance', 'timer_end', `Timer not found: ${timerId}`);
            return;
        }

        const endTime = getTime();
        const duration = endTime - metric.startTime;

        metric.endTime = endTime;
        metric.duration = duration;

        this.info('performance', 'timer_end', `Completed: ${metric.operation}`, {
            duration: `${duration.toFixed(2)}ms`,
            operation: metric.operation,
            metadata: metric.metadata,
            ...additionalData
        });

        this.performanceMetrics.delete(timerId);
    }

    // Error tracking with stack traces
    public trackError(error: Error, component: string, action: string, context?: any): void {
        const errorData = {
            name: error.name,
            message: error.message,
            stack: this.config.includeStackTraces ? error.stack : undefined
        };

        this.error(component, action, `Error: ${error.message}`, errorData, context);
    }

    // API request/response tracking
    public trackAPIRequest(method: string, url: string, data?: any, context?: any): string {
        const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        this.info('api', 'request', `${method} ${url}`, {
            method,
            url,
            data,
            requestId
        }, { ...context, requestId });

        return requestId;
    }

    public trackAPIResponse(requestId: string, status: number, data?: any, duration?: number, context?: any): void {
        this.info('api', 'response', `Response ${status} for ${requestId}`, {
            status,
            data,
            duration: duration ? `${duration.toFixed(2)}ms` : undefined
        }, { ...context, requestId });
    }

    // State change tracking
    public trackStateChange(component: string, action: string, oldState: any, newState: any, context?: any): void {
        this.debug('state', 'change', `${component} state changed via ${action}`, {
            oldState,
            newState,
            changes: this.getStateChanges(oldState, newState)
        }, context);
    }

    private getStateChanges(oldState: any, newState: any): Record<string, { from: any; to: any }> {
        const changes: Record<string, { from: any; to: any }> = {};

        if (!oldState || !newState) return changes;

        const allKeys = new Set([...Object.keys(oldState), ...Object.keys(newState)]);

        for (const key of Array.from(allKeys)) {
            if (oldState[key] !== newState[key]) {
                changes[key] = {
                    from: oldState[key],
                    to: newState[key]
                };
            }
        }

        return changes;
    }

    // Configuration management
    public updateConfig(newConfig: Partial<DebugConfig>): void {
        const oldConfig = { ...this.config };
        this.config = { ...this.config, ...newConfig };

        this.info('system', 'config_update', 'Debug configuration updated', {
            oldConfig,
            newConfig: this.config
        });
    }

    public getConfig(): DebugConfig {
        return { ...this.config };
    }

    // Get all logs (useful for debugging)
    public getLogs(): LogEntry[] {
        return [...this.logBuffer];
    }

    public clearLogs(): void {
        this.logBuffer = [];
        this.info('system', 'logs_cleared', 'Debug logs cleared');
    }

    // Export logs for debugging
    public exportLogs(): string {
        return JSON.stringify(this.logBuffer, null, 2);
    }
}

// Create singleton instance
export const debugLogger = new DebugLogger();

// Convenience functions for easy access
export const debug = {
    log: (component: string, action: string, message: string, data?: any, context?: any) =>
        debugLogger.log(component, action, message, data, context),
    error: (component: string, action: string, message: string, data?: any, context?: any) =>
        debugLogger.error(component, action, message, data, context),
    warn: (component: string, action: string, message: string, data?: any, context?: any) =>
        debugLogger.warn(component, action, message, data, context),
    info: (component: string, action: string, message: string, data?: any, context?: any) =>
        debugLogger.info(component, action, message, data, context),
    trace: (component: string, action: string, message: string, data?: any, context?: any) =>
        debugLogger.trace(component, action, message, data, context),
    startTimer: (operation: string, metadata?: Record<string, any>) =>
        debugLogger.startTimer(operation, metadata),
    endTimer: (timerId: string, additionalData?: any) =>
        debugLogger.endTimer(timerId, additionalData),
    trackError: (error: Error, component: string, action: string, context?: any) =>
        debugLogger.trackError(error, component, action, context),
    trackAPIRequest: (method: string, url: string, data?: any, context?: any) =>
        debugLogger.trackAPIRequest(method, url, data, context),
    trackAPIResponse: (requestId: string, status: number, data?: any, duration?: number, context?: any) =>
        debugLogger.trackAPIResponse(requestId, status, data, duration, context),
    trackStateChange: (component: string, action: string, oldState: any, newState: any, context?: any) =>
        debugLogger.trackStateChange(component, action, oldState, newState, context),
    updateConfig: (newConfig: Partial<DebugConfig>) =>
        debugLogger.updateConfig(newConfig),
    getConfig: () => debugLogger.getConfig(),
    getLogs: () => debugLogger.getLogs(),
    clearLogs: () => debugLogger.clearLogs(),
    exportLogs: () => debugLogger.exportLogs()
};

export default debug; 