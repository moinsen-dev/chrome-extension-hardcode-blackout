export interface ExtensionError {
  id: string;
  timestamp: number;
  component: string; // Which part of extension (content-script, background, options, popup)
  operation: string; // What was being attempted (analyze-content, save-settings, etc.)
  severity: 'low' | 'medium' | 'high' | 'critical';
  error: {
    name: string;
    message: string;
    stack?: string;
  };
  context?: {
    url?: string;
    postId?: string;
    platform?: string;
    modelSettings?: any;
    userAgent?: string;
    extensionVersion?: string;
    [key: string]: any;
  };
}

export class ErrorLogger {
  private static instance: ErrorLogger;
  private maxErrors = 100; // Maximum number of errors to store
  private storageKey = 'extensionErrors';

  private constructor() {}

  static getInstance(): ErrorLogger {
    if (!ErrorLogger.instance) {
      ErrorLogger.instance = new ErrorLogger();
    }
    return ErrorLogger.instance;
  }

  /**
   * Log an error with context information
   */
  async logError(
    component: string,
    operation: string,
    error: Error,
    severity: ExtensionError['severity'] = 'medium',
    context?: ExtensionError['context']
  ): Promise<void> {
    try {
      const extensionError: ExtensionError = {
        id: this.generateId(),
        timestamp: Date.now(),
        component,
        operation,
        severity,
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack
        },
        context: {
          ...context,
          url: typeof window !== 'undefined' ? window.location.href : undefined,
          userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
          extensionVersion: chrome.runtime.getManifest().version
        }
      };

      await this.storeError(extensionError);
      
      // Also log to console for immediate debugging
      console.error(`[${component}] ${operation}:`, error, context);
    } catch (storageError) {
      // Fallback: at least log to console if storage fails
      console.error('Failed to store error log:', storageError);
      console.error(`[${component}] ${operation}:`, error, context);
    }
  }

  /**
   * Log a simple message as an error
   */
  async logMessage(
    component: string,
    operation: string,
    message: string,
    severity: ExtensionError['severity'] = 'medium',
    context?: ExtensionError['context']
  ): Promise<void> {
    const error = new Error(message);
    await this.logError(component, operation, error, severity, context);
  }

  /**
   * Get all stored errors
   */
  async getErrors(): Promise<ExtensionError[]> {
    try {
      const result = await chrome.storage.local.get(this.storageKey);
      return result[this.storageKey] || [];
    } catch (error) {
      console.error('Failed to retrieve error logs:', error);
      return [];
    }
  }

  /**
   * Get errors filtered by component
   */
  async getErrorsByComponent(component: string): Promise<ExtensionError[]> {
    const errors = await this.getErrors();
    return errors.filter(err => err.component === component);
  }

  /**
   * Get errors filtered by severity
   */
  async getErrorsBySeverity(severity: ExtensionError['severity']): Promise<ExtensionError[]> {
    const errors = await this.getErrors();
    return errors.filter(err => err.severity === severity);
  }

  /**
   * Clear all stored errors
   */
  async clearErrors(): Promise<void> {
    try {
      await chrome.storage.local.remove(this.storageKey);
    } catch (error) {
      console.error('Failed to clear error logs:', error);
    }
  }

  /**
   * Clear errors older than specified days
   */
  async clearOldErrors(daysOld: number = 7): Promise<void> {
    try {
      const errors = await this.getErrors();
      const cutoffTime = Date.now() - (daysOld * 24 * 60 * 60 * 1000);
      const recentErrors = errors.filter(err => err.timestamp > cutoffTime);
      await chrome.storage.local.set({ [this.storageKey]: recentErrors });
    } catch (error) {
      console.error('Failed to clear old error logs:', error);
    }
  }

  /**
   * Get error statistics
   */
  async getErrorStats(): Promise<{
    total: number;
    byComponent: Record<string, number>;
    bySeverity: Record<string, number>;
    last24Hours: number;
  }> {
    const errors = await this.getErrors();
    const last24Hours = Date.now() - (24 * 60 * 60 * 1000);
    
    const stats = {
      total: errors.length,
      byComponent: {} as Record<string, number>,
      bySeverity: {} as Record<string, number>,
      last24Hours: errors.filter(err => err.timestamp > last24Hours).length
    };

    errors.forEach(err => {
      stats.byComponent[err.component] = (stats.byComponent[err.component] || 0) + 1;
      stats.bySeverity[err.severity] = (stats.bySeverity[err.severity] || 0) + 1;
    });

    return stats;
  }

  /**
   * Store error in Chrome storage
   */
  private async storeError(error: ExtensionError): Promise<void> {
    const errors = await this.getErrors();
    errors.unshift(error); // Add to beginning of array (most recent first)
    
    // Keep only the most recent errors
    if (errors.length > this.maxErrors) {
      errors.splice(this.maxErrors);
    }
    
    await chrome.storage.local.set({ [this.storageKey]: errors });
  }

  /**
   * Generate a unique ID for the error
   */
  private generateId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Wrap a function to automatically log errors
   */
  wrapAsync<T extends any[], R>(
    component: string, 
    operation: string, 
    fn: (...args: T) => Promise<R>
  ): (...args: T) => Promise<R> {
    return async (...args: T): Promise<R> => {
      try {
        return await fn(...args);
      } catch (error) {
        await this.logError(component, operation, error as Error, 'high', { args });
        throw error; // Re-throw to maintain original behavior
      }
    };
  }

  /**
   * Wrap a synchronous function to automatically log errors
   */
  wrapSync<T extends any[], R>(
    component: string, 
    operation: string, 
    fn: (...args: T) => R
  ): (...args: T) => R {
    return (...args: T): R => {
      try {
        return fn(...args);
      } catch (error) {
        // Use setTimeout to avoid blocking synchronous execution
        setTimeout(() => {
          this.logError(component, operation, error as Error, 'high', { args });
        }, 0);
        throw error; // Re-throw to maintain original behavior
      }
    };
  }
}

// Export a singleton instance
export const errorLogger = ErrorLogger.getInstance();

// Global error handler for unhandled errors
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    errorLogger.logError(
      'global',
      'unhandled-error',
      event.error || new Error(event.message),
      'critical',
      {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      }
    );
  });

  window.addEventListener('unhandledrejection', (event) => {
    errorLogger.logError(
      'global',
      'unhandled-promise-rejection',
      event.reason instanceof Error ? event.reason : new Error(String(event.reason)),
      'critical'
    );
  });
}