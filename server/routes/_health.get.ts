/**
 * =============================================================================
 * F0 - HEALTH CHECK ENDPOINT
 * =============================================================================
 * 
 * GET /_health
 * 
 * Returns 200 if the Node process is alive and can serve requests.
 * This is a liveness probe — it answers "is the process running?"
 * 
 * Use for:
 * - Coolify health checks (configure: /_health, port 3000, HTTP scheme)
 * - Kubernetes liveness probes
 * - Load balancer health checks
 * - Uptime monitoring (Pingdom, UptimeRobot, etc.)
 * 
 * DESIGN: Zero dependencies, zero filesystem access, zero computation.
 * Must respond in <5ms under any conditions.
 */

import { getContentCacheStats } from '../utils/cache'

export default defineEventHandler(() => {
  const stats = getContentCacheStats()

  return {
    status: 'ok',
    timestamp: Date.now(),
    uptime: Math.round(process.uptime()),
    cache: {
      entries: stats.entries,
      hits: stats.hits,
      misses: stats.misses,
    },
  }
})
