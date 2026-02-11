/**
 * =============================================================================
 * F0 - IMAGE PROCESSING PIPELINE
 * =============================================================================
 * 
 * On-demand image processing using sharp. Generates optimized variants on
 * first request and caches them to disk. Falls back to original on any failure.
 * 
 * CONSTRAINT COMPLIANCE:
 * - C-MEDIA-PROGRESSIVE-012: Original files always served if processing fails.
 *   Never block a request on image optimization.
 * - C-PERF-CACHE-MTIME-010: Disk cache invalidated by source file mtime comparison.
 * 
 * API SURFACE:
 *   GET /api/content/assets/images/photo.png              → Original
 *   GET /api/content/assets/images/photo.png?w=800        → Resized to 800px
 *   GET /api/content/assets/images/photo.png?w=800&f=webp → Resized + WebP
 *   GET /api/content/assets/images/photo.png?w=400&q=80   → Resized, quality 80
 * 
 * DISK CACHE:
 *   content/.cache/images/photo-w800-q80.webp
 *   Invalidation: source mtime > cache mtime → regenerate
 */

import { readFile, writeFile, mkdir, stat } from 'fs/promises'
import { existsSync } from 'fs'
import { join, dirname, basename, extname } from 'path'
import { logger } from './logger'

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

export interface ImageOptions {
  width?: number
  height?: number
  format?: 'webp' | 'avif' | 'jpeg' | 'png' | 'original'
  quality?: number
}

export interface ProcessedImage {
  buffer: Buffer
  mimeType: string
  width?: number
  height?: number
}

// =============================================================================
// CONSTANTS
// =============================================================================

const SUPPORTED_FORMATS = ['webp', 'avif', 'jpeg', 'jpg', 'png'] as const
const MAX_WIDTH = 3840    // 4K max
const MAX_HEIGHT = 2160
const DEFAULT_QUALITY = 80
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.avif', '.gif', '.svg']

// =============================================================================
// SHARP LAZY LOADER
// =============================================================================

let sharpModule: typeof import('sharp') | null = null
let sharpAvailable = true

async function getSharp(): Promise<typeof import('sharp') | null> {
  if (!sharpAvailable) return null
  if (sharpModule) return sharpModule

  try {
    sharpModule = (await import('sharp')).default as unknown as typeof import('sharp')
    return sharpModule
  } catch {
    logger.warn('sharp not available — image processing disabled, serving originals')
    sharpAvailable = false
    return null
  }
}

// =============================================================================
// CACHE KEY GENERATION
// =============================================================================

/**
 * Generate a cache filename for a processed image variant.
 * e.g., "photo.png" with w=800, f=webp, q=80 → "photo-w800-q80.webp"
 */
function getCacheKey(originalName: string, options: ImageOptions): string {
  const name = basename(originalName, extname(originalName))
  const parts = [name]

  if (options.width) parts.push(`w${options.width}`)
  if (options.height) parts.push(`h${options.height}`)
  if (options.quality && options.quality !== DEFAULT_QUALITY) parts.push(`q${options.quality}`)

  const ext = options.format && options.format !== 'original'
    ? `.${options.format === 'jpeg' ? 'jpg' : options.format}`
    : extname(originalName)

  return parts.join('-') + ext
}

/**
 * Get the MIME type for a format.
 */
function getMimeType(format: string): string {
  const mimeMap: Record<string, string> = {
    webp: 'image/webp',
    avif: 'image/avif',
    jpeg: 'image/jpeg',
    jpg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    svg: 'image/svg+xml',
  }
  return mimeMap[format] || 'application/octet-stream'
}

// =============================================================================
// CORE PROCESSING
// =============================================================================

/**
 * Process an image with the given options.
 * Returns the processed buffer and metadata, or null if processing fails.
 */
async function processImageBuffer(
  sourceBuffer: Buffer,
  options: ImageOptions
): Promise<ProcessedImage | null> {
  const sharp = await getSharp()
  if (!sharp) return null

  try {
    let pipeline = sharp(sourceBuffer)

    // Resize
    if (options.width || options.height) {
      pipeline = pipeline.resize({
        width: options.width ? Math.min(options.width, MAX_WIDTH) : undefined,
        height: options.height ? Math.min(options.height, MAX_HEIGHT) : undefined,
        fit: 'inside',
        withoutEnlargement: true,
      })
    }

    // Format conversion
    const quality = options.quality || DEFAULT_QUALITY
    const format = options.format || 'original'

    if (format === 'webp') {
      pipeline = pipeline.webp({ quality })
    } else if (format === 'avif') {
      pipeline = pipeline.avif({ quality })
    } else if (format === 'jpeg' || format === 'jpg') {
      pipeline = pipeline.jpeg({ quality })
    } else if (format === 'png') {
      pipeline = pipeline.png()
    }
    // 'original' — no format conversion

    const { data, info } = await pipeline.toBuffer({ resolveWithObject: true })

    const outputFormat = format === 'original' ? info.format : format
    return {
      buffer: data,
      mimeType: getMimeType(outputFormat),
      width: info.width,
      height: info.height,
    }
  } catch (error) {
    logger.warn('Image processing failed', {
      error: error instanceof Error ? error.message : String(error),
    })
    return null
  }
}

// =============================================================================
// PUBLIC API
// =============================================================================

/**
 * Check if a file is a processable image based on extension.
 */
export function isProcessableImage(filename: string): boolean {
  const ext = extname(filename).toLowerCase()
  return IMAGE_EXTENSIONS.includes(ext) && ext !== '.svg' && ext !== '.gif'
}

/**
 * Parse image processing options from URL query parameters.
 */
export function parseImageOptions(query: Record<string, unknown>): ImageOptions | null {
  const w = query.w || query.width
  const h = query.h || query.height
  const f = query.f || query.format
  const q = query.q || query.quality

  // No processing params — serve original
  if (!w && !h && !f && !q) return null

  const options: ImageOptions = {}

  if (w) {
    const width = parseInt(String(w), 10)
    if (width > 0 && width <= MAX_WIDTH) options.width = width
  }

  if (h) {
    const height = parseInt(String(h), 10)
    if (height > 0 && height <= MAX_HEIGHT) options.height = height
  }

  if (f) {
    const format = String(f).toLowerCase()
    if (SUPPORTED_FORMATS.includes(format as typeof SUPPORTED_FORMATS[number])) {
      options.format = format as ImageOptions['format']
    }
  }

  if (q) {
    const quality = parseInt(String(q), 10)
    if (quality >= 1 && quality <= 100) options.quality = quality
  }

  return Object.keys(options).length > 0 ? options : null
}

/**
 * Get a processed image, using disk cache when available.
 * Falls back to original on any failure (constraint C-MEDIA-PROGRESSIVE-012).
 * 
 * @param sourcePath - Absolute path to the original image
 * @param cacheDir - Directory for disk cache (e.g., content/.cache/images/)
 * @param options - Processing options (width, format, quality)
 * @returns Processed image buffer and mime type
 */
export async function getProcessedImage(
  sourcePath: string,
  cacheDir: string,
  options: ImageOptions
): Promise<ProcessedImage | null> {
  const cacheKey = getCacheKey(basename(sourcePath), options)
  const cachePath = join(cacheDir, cacheKey)

  // Check disk cache
  try {
    if (existsSync(cachePath)) {
      const [sourceStats, cacheStats] = await Promise.all([
        stat(sourcePath),
        stat(cachePath),
      ])

      // Cache is valid if it's newer than the source
      if (cacheStats.mtimeMs >= sourceStats.mtimeMs) {
        const buffer = await readFile(cachePath)
        const ext = extname(cachePath).toLowerCase().replace('.', '')
        return {
          buffer,
          mimeType: getMimeType(ext),
        }
      }
    }
  } catch {
    // Cache miss or read error — continue to process
  }

  // Process the image
  const sourceBuffer = await readFile(sourcePath)
  const result = await processImageBuffer(sourceBuffer, options)

  if (!result) return null

  // Write to disk cache (async, don't block response)
  try {
    await mkdir(dirname(cachePath), { recursive: true })
    await writeFile(cachePath, result.buffer)
  } catch (error) {
    logger.warn('Failed to write image cache', {
      path: cachePath,
      error: error instanceof Error ? error.message : String(error),
    })
  }

  return result
}
