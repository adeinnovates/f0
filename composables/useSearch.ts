/**
 * =============================================================================
 * F0 - SEARCH COMPOSABLE
 * =============================================================================
 * 
 * Manages search state and provides search functionality.
 * 
 * USAGE:
 * ```vue
 * const { 
 *   isOpen, 
 *   query, 
 *   results, 
 *   isLoading,
 *   openSearch, 
 *   closeSearch, 
 *   search 
 * } = useSearch()
 * ```
 */

interface SearchResult {
  title: string
  path: string
  excerpt: string
  section: string
}

interface SearchState {
  isOpen: boolean
  query: string
  results: SearchResult[]
  isLoading: boolean
  error: string | null
}

// Debounce timer
let searchTimeout: ReturnType<typeof setTimeout> | null = null

export function useSearch() {
  const router = useRouter()
  
  // Shared state across components
  const state = useState<SearchState>('search', () => ({
    isOpen: false,
    query: '',
    results: [],
    isLoading: false,
    error: null,
  }))
  
  /**
   * Open search modal
   */
  function openSearch() {
    state.value.isOpen = true
    state.value.query = ''
    state.value.results = []
    state.value.error = null
  }
  
  /**
   * Close search modal
   */
  function closeSearch() {
    state.value.isOpen = false
    state.value.query = ''
    state.value.results = []
  }
  
  /**
   * Toggle search modal
   */
  function toggleSearch() {
    if (state.value.isOpen) {
      closeSearch()
    } else {
      openSearch()
    }
  }
  
  /**
   * Perform search with debouncing
   */
  function search(query: string) {
    state.value.query = query
    
    // Clear previous timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout)
    }
    
    // Don't search for very short queries
    if (query.trim().length < 2) {
      state.value.results = []
      state.value.isLoading = false
      return
    }
    
    state.value.isLoading = true
    
    // Debounce search
    searchTimeout = setTimeout(async () => {
      try {
        const response = await $fetch<{ results: SearchResult[] }>('/api/search', {
          params: { q: query },
        })
        
        state.value.results = response.results
        state.value.error = null
      } catch (e) {
        console.error('[Search] Error:', e)
        state.value.error = 'Search failed. Please try again.'
        state.value.results = []
      } finally {
        state.value.isLoading = false
      }
    }, 200) // 200ms debounce
  }
  
  /**
   * Navigate to a search result
   */
  function goToResult(result: SearchResult) {
    closeSearch()
    router.push(result.path)
  }
  
  /**
   * Set up keyboard shortcuts
   */
  function setupKeyboardShortcuts() {
    if (!import.meta.client) return
    
    const handleKeydown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K to open search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        toggleSearch()
      }
      
      // Escape to close
      if (e.key === 'Escape' && state.value.isOpen) {
        closeSearch()
      }
    }
    
    window.addEventListener('keydown', handleKeydown)
    
    // Cleanup
    onUnmounted(() => {
      window.removeEventListener('keydown', handleKeydown)
    })
  }
  
  // Set up keyboard shortcuts on mount
  if (import.meta.client) {
    onMounted(() => {
      setupKeyboardShortcuts()
    })
  }
  
  return {
    // State
    isOpen: computed(() => state.value.isOpen),
    query: computed(() => state.value.query),
    results: computed(() => state.value.results),
    isLoading: computed(() => state.value.isLoading),
    error: computed(() => state.value.error),
    
    // Methods
    openSearch,
    closeSearch,
    toggleSearch,
    search,
    goToResult,
    setupKeyboardShortcuts,
  }
}
