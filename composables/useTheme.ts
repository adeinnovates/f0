/**
 * =============================================================================
 * F0 - THEME COMPOSABLE
 * =============================================================================
 * 
 * Handles dark/light mode theme switching with system preference detection
 * and localStorage persistence.
 * 
 * USAGE:
 * ```vue
 * const { theme, isDark, toggle, setTheme } = useTheme()
 * ```
 * 
 * FEATURES:
 * - Auto-detects system preference
 * - Persists choice in localStorage
 * - Smooth CSS transitions
 * - SSR-compatible (uses inline script to prevent flash)
 */

type Theme = 'light' | 'dark' | 'system'

interface ThemeState {
  theme: Theme          // User preference
  resolvedTheme: 'light' | 'dark'  // Actual theme being applied
  initialized: boolean
}

const STORAGE_KEY = 'f0-theme'

/**
 * Theme composable
 */
export function useTheme() {
  // State - start with dark as default to match inline script behavior
  const state = useState<ThemeState>('theme', () => ({
    theme: 'system',
    resolvedTheme: 'dark',  // Default to dark to prevent flash
    initialized: false,
  }))
  
  /**
   * Get system color scheme preference
   */
  function getSystemTheme(): 'light' | 'dark' {
    if (import.meta.client) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
    }
    return 'dark'  // Default to dark for SSR
  }
  
  /**
   * Resolve the actual theme to apply
   */
  function resolveTheme(theme: Theme): 'light' | 'dark' {
    if (theme === 'system') {
      return getSystemTheme()
    }
    return theme
  }
  
  /**
   * Apply theme to document
   */
  function applyTheme(resolvedTheme: 'light' | 'dark') {
    if (import.meta.client) {
      document.documentElement.setAttribute('data-theme', resolvedTheme)
      document.documentElement.style.colorScheme = resolvedTheme
    }
    
    state.value.resolvedTheme = resolvedTheme
  }
  
  /**
   * Set theme preference
   */
  function setTheme(theme: Theme) {
    state.value.theme = theme
    
    // Persist to localStorage
    if (import.meta.client) {
      localStorage.setItem(STORAGE_KEY, theme)
    }
    
    // Apply resolved theme
    const resolved = resolveTheme(theme)
    applyTheme(resolved)
  }
  
  /**
   * Toggle between light and dark
   */
  function toggle() {
    const newTheme = state.value.resolvedTheme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
  }
  
  /**
   * Initialize theme on client
   */
  function initTheme() {
    if (!import.meta.client) return
    if (state.value.initialized) return
    
    // Check what theme the inline script already applied
    const currentTheme = document.documentElement.getAttribute('data-theme') as 'light' | 'dark' | null
    
    // Load saved preference
    const saved = localStorage.getItem(STORAGE_KEY) as Theme | null
    
    if (saved && ['light', 'dark', 'system'].includes(saved)) {
      state.value.theme = saved
    }
    
    // If inline script already set theme, use that as resolved
    if (currentTheme) {
      state.value.resolvedTheme = currentTheme
    } else {
      // Apply theme
      const resolved = resolveTheme(state.value.theme)
      applyTheme(resolved)
    }
    
    state.value.initialized = true
    
    // Listen for system preference changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    mediaQuery.addEventListener('change', (e) => {
      if (state.value.theme === 'system') {
        applyTheme(e.matches ? 'dark' : 'light')
      }
    })
  }
  
  // Computed properties
  const isDark = computed(() => state.value.resolvedTheme === 'dark')
  const isLight = computed(() => state.value.resolvedTheme === 'light')
  const isSystem = computed(() => state.value.theme === 'system')
  
  // Initialize on client - run immediately if possible
  if (import.meta.client) {
    // Try to initialize immediately
    initTheme()
    
    // Also ensure it runs on mount
    onMounted(() => {
      initTheme()
    })
  }
  
  return {
    // State
    theme: computed(() => state.value.theme),
    resolvedTheme: computed(() => state.value.resolvedTheme),
    isDark,
    isLight,
    isSystem,
    
    // Methods
    setTheme,
    toggle,
    initTheme,
  }
}
