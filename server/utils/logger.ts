/**
 * =============================================================================
 * F0 - STRUCTURED LOGGER
 * =============================================================================
 * 
 * Minimal structured logging utility that outputs JSON in production
 * and human-readable messages in development. No external dependencies.
 * 
 * DESIGN DECISIONS:
 * - No Winston, Pino, or Bunyan — f0 doesn't need a logging framework.
 * - JSON output in production for log aggregators (Datadog, Loki, CloudWatch).
 * - Pretty output in development for developer readability.
 * - Consistent format across the entire codebase.
 * 
 * USAGE:
 *   import { logger } from '~/server/utils/logger'
 *   logger.info('Content parsed', { path: '/guides/setup', duration: 42 })
 *   logger.warn('Missing image', { image: 'diagram.png', referencedIn: 'setup.md' })
 *   logger.error('Parse failed', { path: '/guides/broken.md', error: err.message })
 */

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

export interface LogEntry {
  level: 'debug' | 'info' | 'warn' | 'error'
  msg: string
  ts: string
  [key: string]: unknown
}

// =============================================================================
// LOG EMITTER
// =============================================================================

const isProduction = process.env.NODE_ENV === 'production'

function emit(level: 'debug' | 'info' | 'warn' | 'error', msg: string, meta?: Record<string, unknown>): void {
  const entry: LogEntry = {
    level,
    msg,
    ts: new Date().toISOString(),
    ...meta,
  }

  if (isProduction) {
    // Structured JSON for log aggregators
    const logFn = level === 'error' ? console.error : level === 'warn' ? console.warn : console.log
    logFn(JSON.stringify(entry))
  } else {
    // Human-readable for development
    const prefix = `[f0:${level.toUpperCase()}]`
    const metaStr = meta && Object.keys(meta).length > 0
      ? ' ' + JSON.stringify(meta)
      : ''
    const logFn = level === 'error' ? console.error : level === 'warn' ? console.warn : console.log
    logFn(`${prefix} ${msg}${metaStr}`)
  }
}

// =============================================================================
// PUBLIC API
// =============================================================================

export const logger = {
  debug: (msg: string, meta?: Record<string, unknown>) => emit('debug', msg, meta),
  info: (msg: string, meta?: Record<string, unknown>) => emit('info', msg, meta),
  warn: (msg: string, meta?: Record<string, unknown>) => emit('warn', msg, meta),
  error: (msg: string, meta?: Record<string, unknown>) => emit('error', msg, meta),
}
