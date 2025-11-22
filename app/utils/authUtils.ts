import { buttClient } from './buttClient'

/**
 * Get the current user ID from the authentication system
 * Tries multiple sources in order of preference
 */
export function getCurrentUserId(): string | null {
  try {
    // First, try to get from buttClient if available
    if (buttClient && typeof buttClient.getCurrentUser === 'function') {
      try {
        const currentUser = buttClient.getCurrentUser()
        if (currentUser && currentUser.id) {
          console.log('🔍 getCurrentUserId: Found from buttClient:', currentUser.id)
          return currentUser.id
        }
      } catch (error) {
        console.log('🔍 getCurrentUserId: buttClient.getCurrentUser failed:', error)
      }
    }

    // Second, try to get from localStorage
    const storedUser = localStorage.getItem('currentUser')
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser)
        if (user && user.id) {
          console.log('🔍 getCurrentUserId: Found from localStorage:', user.id)
          return user.id
        }
        if (user && user.username) {
          console.log('🔍 getCurrentUserId: Found username from localStorage:', user.username)
          return user.username
        }
      } catch (error) {
        console.warn('🔍 getCurrentUserId: Failed to parse localStorage user:', error)
      }
    }

    // Third, try to get from token bundle if available
    if (buttClient && typeof buttClient.getTokenBundle === 'function') {
      try {
        const tokenBundle = buttClient.getTokenBundle()
        if (tokenBundle && tokenBundle.id) {
          console.log('🔍 getCurrentUserId: Found from token bundle:', tokenBundle.id)
          return tokenBundle.id
        }
      } catch (error) {
        console.log('🔍 getCurrentUserId: buttClient.getTokenBundle failed:', error)
      }
    }

    console.warn('🔍 getCurrentUserId: No user ID found in any source')
    return null
  } catch (error) {
    console.error('🔍 getCurrentUserId: Error getting current user ID:', error)
    return null
  }
}

/**
 * Get the current user's email from the authentication system
 */
export function getCurrentUserEmail(): string | null {
  try {
    // Try localStorage first
    const storedUser = localStorage.getItem('currentUser')
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser)
        if (user && user.email) {
          return user.email
        }
      } catch (error) {
        console.warn('🔍 getCurrentUserEmail: Failed to parse localStorage user:', error)
      }
    }

    // Try buttClient if available
    if (buttClient && typeof buttClient.getCurrentUser === 'function') {
      try {
        const currentUser = buttClient.getCurrentUser()
        if (currentUser && currentUser.email) {
          return currentUser.email
        }
      } catch (error) {
        // Ignore errors
      }
    }

    return null
  } catch (error) {
    console.error('🔍 getCurrentUserEmail: Error getting current user email:', error)
    return null
  }
}

/**
 * Check if the current user is authenticated
 */
export function isCurrentUserAuthenticated(): boolean {
  const userId = getCurrentUserId()
  return userId !== null
}

/**
 * Get authentication status with user details
 */
export function getUserAuthStatus(): {
  authenticated: boolean
  userId: string | null
  email: string | null
} {
  const userId = getCurrentUserId()
  const email = getCurrentUserEmail()
  
  return {
    authenticated: userId !== null,
    userId,
    email
  }
}

