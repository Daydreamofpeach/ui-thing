export interface User {
  id: number
  name: string
  email: string
  theme_preference?: string
  font_preferences?: string
  created_at: string
  updated_at: string
}

// Global auth state
const globalUser = ref<User | null>(null)

export const useAuth = () => {
  const user = globalUser
  const isLoggedIn = computed(() => !!user.value)

  const login = async (email: string, password: string) => {
    try {
      const response = await $fetch<{ success: boolean; user: User; message: string }>('/api/auth/login', {
        method: 'POST',
        body: { email, password }
      })

      if (response.success) {
        user.value = response.user
        return { success: true, user: response.user }
      }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, error }
    }
  }

  const signup = async (name: string, email: string, password: string) => {
    try {
      const response = await $fetch<{ success: boolean; user: User; message: string }>('/api/auth/signup', {
        method: 'POST',
        body: { name, email, password }
      })

      if (response.success) {
        return { success: true, user: response.user }
      }
    } catch (error) {
      console.error('Signup error:', error)
      return { success: false, error }
    }
  }

  const logout = () => {
    user.value = null
    // TODO: Clear session/token
  }

  const setUser = (userData: User) => {
    user.value = userData
    // Persist to localStorage
    if (import.meta.client) {
      localStorage.setItem('user', JSON.stringify(userData))
    }
  }

  const loadUserFromStorage = () => {
    if (import.meta.client) {
      const storedUser = localStorage.getItem('user')
      if (storedUser) {
        try {
          user.value = JSON.parse(storedUser)
        } catch (error) {
          console.error('Error parsing stored user:', error)
          localStorage.removeItem('user')
        }
      }
    }
  }

  const clearUser = () => {
    user.value = null
    if (import.meta.client) {
      localStorage.removeItem('user')
    }
  }

  // Initialize user from storage on client side
  if (import.meta.client) {
    loadUserFromStorage()
  }

  return {
    user: readonly(user),
    isLoggedIn,
    login,
    signup,
    logout: clearUser,
    setUser,
    loadUserFromStorage
  }
}
