import { ref, readonly } from 'vue'

// Storage keys
const CACHE_STORAGE_KEY = 'buildit_project_cache'
const TIMESTAMP_STORAGE_KEY = 'buildit_cache_timestamps'

// Cache TTL - 10 minutes for persistent cache
const CACHE_TTL = 10 * 60 * 1000 // 10 minutes

// Initialize from storage
const loadFromStorage = () => {
  if (typeof window === 'undefined') return { cache: new Map(), timestamps: new Map() }
  
  try {
    const cacheStr = localStorage.getItem(CACHE_STORAGE_KEY)
    const timestampsStr = localStorage.getItem(TIMESTAMP_STORAGE_KEY)
    
    const cache = cacheStr ? new Map(JSON.parse(cacheStr)) : new Map()
    const timestamps = timestampsStr ? new Map(JSON.parse(timestampsStr)) : new Map()
    
    console.log('💾 Loaded cache from storage:', cache.size, 'entries')
    console.log('⏰ Loaded timestamps:', timestamps.size, 'entries')
    
    return { cache, timestamps }
  } catch (error) {
    console.warn('Failed to load cache from storage:', error)
    return { cache: new Map(), timestamps: new Map() }
  }
}

const saveToStorage = (cache: Map<string, any>, timestamps: Map<string, number>) => {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.setItem(CACHE_STORAGE_KEY, JSON.stringify(Array.from(cache.entries())))
    localStorage.setItem(TIMESTAMP_STORAGE_KEY, JSON.stringify(Array.from(timestamps.entries())))
    console.log('💾 Saved cache to storage:', cache.size, 'entries')
  } catch (error) {
    console.warn('Failed to save cache to storage:', error)
  }
}

// Load initial state from storage
const { cache: initialCache, timestamps: initialTimestamps } = loadFromStorage()

// Shared cache for project data to avoid duplicate API calls
const projectDataCache = ref<Map<string, any>>(initialCache)
const cacheTimestamps = ref<Map<string, number>>(initialTimestamps)

// Loading states to prevent duplicate simultaneous requests (not persisted)
const loadingStates = ref<Map<string, boolean>>(new Map())

export function useProjectDataCache() {
  const getCacheKey = (projectId: string, dataType: string) => {
    return `${projectId}:${dataType}`
  }

  const isCacheValid = (key: string): boolean => {
    const timestamp = cacheTimestamps.value.get(key)
    if (!timestamp) return false
    return Date.now() - timestamp < CACHE_TTL
  }

  const getCachedData = (projectId: string, dataType: string): any | null => {
    const key = getCacheKey(projectId, dataType)
    if (isCacheValid(key)) {
      console.log(`✅ Cache hit for ${dataType} (project: ${projectId})`)
      return projectDataCache.value.get(key)
    }
    console.log(`❌ Cache miss for ${dataType} (project: ${projectId})`)
    return null
  }

  const setCachedData = (projectId: string, dataType: string, data: any): void => {
    const key = getCacheKey(projectId, dataType)
    projectDataCache.value.set(key, data)
    cacheTimestamps.value.set(key, Date.now())
    console.log(`💾 Cached ${dataType} for project ${projectId}`)
    
    // Persist to storage
    saveToStorage(projectDataCache.value, cacheTimestamps.value)
  }

  const isLoading = (projectId: string, dataType: string): boolean => {
    const key = getCacheKey(projectId, dataType)
    return loadingStates.value.get(key) === true
  }

  const setLoading = (projectId: string, dataType: string, loading: boolean): void => {
    const key = getCacheKey(projectId, dataType)
    loadingStates.value.set(key, loading)
  }

  const invalidateCache = (projectId: string, dataType?: string): void => {
    if (dataType) {
      const key = getCacheKey(projectId, dataType)
      projectDataCache.value.delete(key)
      cacheTimestamps.value.delete(key)
      loadingStates.value.delete(key)
      console.log(`🗑️ Invalidated cache for ${dataType} (project: ${projectId})`)
    } else {
      // Invalidate all data for this project
      const keysToDelete: string[] = []
      projectDataCache.value.forEach((_, key) => {
        if (key.startsWith(`${projectId}:`)) {
          keysToDelete.push(key)
        }
      })
      keysToDelete.forEach(key => {
        projectDataCache.value.delete(key)
        cacheTimestamps.value.delete(key)
        loadingStates.value.delete(key)
      })
      console.log(`🗑️ Invalidated all cache for project ${projectId}`)
    }
    
    // Update storage
    saveToStorage(projectDataCache.value, cacheTimestamps.value)
  }

  const clearAllCache = (): void => {
    projectDataCache.value.clear()
    cacheTimestamps.value.clear()
    loadingStates.value.clear()
    console.log('🗑️ Cleared all project data cache')
    
    // Clear storage
    if (typeof window !== 'undefined') {
      localStorage.removeItem(CACHE_STORAGE_KEY)
      localStorage.removeItem(TIMESTAMP_STORAGE_KEY)
    }
  }
  
  // Clean up expired entries
  const cleanupExpiredEntries = (): void => {
    const now = Date.now()
    const keysToDelete: string[] = []
    
    cacheTimestamps.value.forEach((timestamp, key) => {
      if (now - timestamp > CACHE_TTL) {
        keysToDelete.push(key)
      }
    })
    
    if (keysToDelete.length > 0) {
      keysToDelete.forEach(key => {
        projectDataCache.value.delete(key)
        cacheTimestamps.value.delete(key)
      })
      console.log(`🧹 Cleaned up ${keysToDelete.length} expired cache entries`)
      saveToStorage(projectDataCache.value, cacheTimestamps.value)
    }
  }
  
  // Run cleanup on initialization and periodically
  cleanupExpiredEntries()
  if (typeof window !== 'undefined') {
    setInterval(cleanupExpiredEntries, 60000) // Clean every minute
  }

  return {
    getCachedData,
    setCachedData,
    isLoading,
    setLoading,
    invalidateCache,
    clearAllCache,
    cleanupExpiredEntries,
    cache: readonly(projectDataCache)
  }
}

