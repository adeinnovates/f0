/**
 * =============================================================================
 * F0 - AUDIT LOGS API ENDPOINT
 * =============================================================================
 * 
 * GET /api/admin/audit-logs
 * 
 * Retrieves authentication audit logs for security monitoring.
 * 
 * QUERY PARAMETERS:
 * - count: Number of entries to return (default: 100, max: 500)
 * - email: Filter by email address
 * - ip: Filter by IP address
 * - failures: If 'true', only show failed attempts
 * - minutes: Time window for failures (default: 60)
 * 
 * RESPONSES:
 * - 200: Audit log entries
 * - 401: Unauthorized (requires auth in private mode)
 * 
 * EXAMPLE RESPONSES:
 * 
 * GET /api/admin/audit-logs?count=50
 * {
 *   "stats": { "totalEntries": 150, "recentFailures": 5, "suspiciousIps": 1 },
 *   "entries": [...]
 * }
 * 
 * GET /api/admin/audit-logs?failures=true&minutes=30
 * {
 *   "stats": {...},
 *   "entries": [...],
 *   "suspiciousIps": [{ "ip": "1.2.3.4", "failures": 10 }]
 * }
 */

import { 
  getRecentAuditLogs, 
  getAuditLogsByEmail, 
  getAuditLogsByIp,
  getRecentFailures,
  getSuspiciousIps,
  getAuditStats,
  type AuditLogEntry 
} from '../../utils/audit'

export default defineEventHandler(async (event) => {
  // Get query parameters
  const query = getQuery(event)
  
  const count = Math.min(
    parseInt(query.count as string) || 100,
    500 // Max 500 entries
  )
  const email = query.email as string | undefined
  const ip = query.ip as string | undefined
  const failuresOnly = query.failures === 'true'
  const minutes = parseInt(query.minutes as string) || 60
  
  // Get stats
  const stats = getAuditStats()
  
  // Get entries based on filters
  let entries: AuditLogEntry[]
  
  if (failuresOnly) {
    entries = getRecentFailures(minutes).slice(0, count)
  } else if (email) {
    entries = getAuditLogsByEmail(email, count)
  } else if (ip) {
    entries = getAuditLogsByIp(ip, count)
  } else {
    entries = getRecentAuditLogs(count)
  }
  
  // Build response
  const response: {
    stats: typeof stats
    entries: AuditLogEntry[]
    suspiciousIps?: { ip: string; failures: number }[]
  } = {
    stats,
    entries,
  }
  
  // Include suspicious IPs if showing failures
  if (failuresOnly) {
    response.suspiciousIps = getSuspiciousIps(5, minutes)
  }
  
  return response
})
