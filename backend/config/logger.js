/**
 * Logging Configuration Module
 * 
 * Provides centralized logging functionality for the application
 * with support for file and console logging.
 */

const fs = require('fs');
const path = require('path');
const util = require('util');

// Log levels
const LOG_LEVELS = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3
};

// Color codes for console output
const COLORS = {
  error: '\x1b[31m', // Red
  warn: '\x1b[33m',  // Yellow
  info: '\x1b[36m',  // Cyan
  debug: '\x1b[90m', // Gray
  reset: '\x1b[0m'
};

class Logger {
  constructor(options = {}) {
    this.level = options.level || process.env.LOG_LEVEL || 'info';
    this.logDir = options.logDir || path.join(__dirname, '..', 'logs');
    this.logFile = options.logFile || 'app.log';
    this.errorFile = options.errorFile || 'error.log';
    this.maxFileSize = options.maxFileSize || 10 * 1024 * 1024; // 10MB
    this.maxFiles = options.maxFiles || 7;
    this.consoleEnabled = options.consoleEnabled !== false;
    this.fileEnabled = options.fileEnabled !== false;
    this.colorize = options.colorize !== false && process.env.NODE_ENV !== 'production';

    // Create logs directory if it doesn't exist
    if (this.fileEnabled && !fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  /**
   * Format log message
   */
  formatMessage(level, message, meta = {}) {
    const timestamp = new Date().toISOString();
    const metaStr = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${metaStr}`;
  }

  /**
   * Write to log file
   */
  writeToFile(filename, message) {
    if (!this.fileEnabled) return;

    const filePath = path.join(this.logDir, filename);

    try {
      // Check file size and rotate if necessary
      if (fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath);
        if (stats.size >= this.maxFileSize) {
          this.rotateLogFile(filename);
        }
      }

      // Append to log file
      fs.appendFileSync(filePath, message + '\n', 'utf8');
    } catch (error) {
      console.error('Failed to write to log file:', error);
    }
  }

  /**
   * Rotate log file
   */
  rotateLogFile(filename) {
    const basePath = path.join(this.logDir, filename);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const archivePath = path.join(this.logDir, `${filename}.${timestamp}`);

    try {
      // Rename current log file
      if (fs.existsSync(basePath)) {
        fs.renameSync(basePath, archivePath);
      }

      // Clean up old log files
      this.cleanupOldLogs(filename);
    } catch (error) {
      console.error('Failed to rotate log file:', error);
    }
  }

  /**
   * Clean up old log files
   */
  cleanupOldLogs(filename) {
    try {
      const files = fs.readdirSync(this.logDir)
        .filter(file => file.startsWith(filename) && file !== filename)
        .map(file => ({
          name: file,
          path: path.join(this.logDir, file),
          time: fs.statSync(path.join(this.logDir, file)).mtime.getTime()
        }))
        .sort((a, b) => b.time - a.time);

      // Keep only the most recent files
      if (files.length > this.maxFiles) {
        files.slice(this.maxFiles).forEach(file => {
          fs.unlinkSync(file.path);
        });
      }
    } catch (error) {
      console.error('Failed to cleanup old logs:', error);
    }
  }

  /**
   * Log message
   */
  log(level, message, meta = {}) {
    // Check if this level should be logged
    if (LOG_LEVELS[level] > LOG_LEVELS[this.level]) {
      return;
    }

    const formattedMessage = this.formatMessage(level, message, meta);

    // Console output
    if (this.consoleEnabled) {
      const color = this.colorize ? COLORS[level] : '';
      const reset = this.colorize ? COLORS.reset : '';
      console.log(`${color}${formattedMessage}${reset}`);
    }

    // File output
    if (this.fileEnabled) {
      this.writeToFile(this.logFile, formattedMessage);

      // Also write errors to separate error log
      if (level === 'error') {
        this.writeToFile(this.errorFile, formattedMessage);
      }
    }
  }

  /**
   * Log error
   */
  error(message, meta = {}) {
    if (meta instanceof Error) {
      meta = {
        error: meta.message,
        stack: meta.stack
      };
    }
    this.log('error', message, meta);
  }

  /**
   * Log warning
   */
  warn(message, meta = {}) {
    this.log('warn', message, meta);
  }

  /**
   * Log info
   */
  info(message, meta = {}) {
    this.log('info', message, meta);
  }

  /**
   * Log debug
   */
  debug(message, meta = {}) {
    this.log('debug', message, meta);
  }

  /**
   * Log HTTP request
   */
  logRequest(req, res, duration) {
    const message = `${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`;
    const meta = {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration,
      ip: req.ip,
      userAgent: req.get('user-agent')
    };

    if (res.statusCode >= 500) {
      this.error(message, meta);
    } else if (res.statusCode >= 400) {
      this.warn(message, meta);
    } else {
      this.info(message, meta);
    }
  }

  /**
   * Create request logging middleware
   */
  requestLogger() {
    return (req, res, next) => {
      const startTime = Date.now();

      // Log when response finishes
      res.on('finish', () => {
        const duration = Date.now() - startTime;
        this.logRequest(req, res, duration);
      });

      next();
    };
  }

  /**
   * Get log statistics
   */
  getStats() {
    const stats = {
      logDir: this.logDir,
      files: []
    };

    try {
      const files = fs.readdirSync(this.logDir);
      files.forEach(file => {
        const filePath = path.join(this.logDir, file);
        const fileStats = fs.statSync(filePath);
        stats.files.push({
          name: file,
          size: fileStats.size,
          modified: fileStats.mtime
        });
      });
    } catch (error) {
      this.error('Failed to get log stats', { error: error.message });
    }

    return stats;
  }
}

// Create singleton instance
const logger = new Logger({
  level: process.env.LOG_LEVEL || 'info',
  logDir: process.env.LOG_FILE_PATH ? path.dirname(process.env.LOG_FILE_PATH) : undefined,
  logFile: process.env.LOG_FILE_PATH ? path.basename(process.env.LOG_FILE_PATH) : undefined,
  consoleEnabled: true,
  fileEnabled: process.env.NODE_ENV === 'production'
});

module.exports = logger;
