/**
 * =============================================================================
 * F0 - /llms.txt ROUTE
 * =============================================================================
 * 
 * GET /llms.txt
 * 
 * Returns the complete documentation in a plain text format optimized for
 * LLM/AI agent ingestion. This is the "AI-first" part of the tri-brid
 * rendering strategy.
 * 
 * CONSTRAINT COMPLIANCE:
 * - C-AI-LLMS-NO-UI-NOISE-004: No navigation, styling, or UI chrome
 * - C-AI-TRIBRID-CONSISTENCY-003: Same source, different render
 * 
 * OUTPUT FORMAT:
 * - Plain text (text/plain)
 * - Hierarchical structure with clear separators
 * - Source file paths for traceability
 * - No HTML, CSS, or JavaScript
 * 
 * CACHING:
 * - 1 hour cache (configured in nuxt.config.ts routeRules)
 * - Invalidated when content changes
 */

import { getCachedLlmsTxt } from '../utils/llms-cache'
import { logger } from '../utils/logger'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  
  try {
    // Serve from cache — regenerates only when content hash changes
    const llmText = await getCachedLlmsTxt(
      config.contentDir,
      config.public.siteName
    )
    
    // Set content type to plain text
    setHeader(event, 'Content-Type', 'text/plain; charset=utf-8')
    setHeader(event, 'Cache-Control', 'public, max-age=3600')
    
    return llmText
    
  } catch (error) {
    logger.error('Failed to generate /llms.txt', {
      error: error instanceof Error ? error.message : String(error),
    })
    
    setHeader(event, 'Content-Type', 'text/plain; charset=utf-8')
    return `# Error\n\nFailed to generate documentation context.\nPlease try again later.`
  }
})
