import { ref, watch } from 'vue'
import { useTauriStoreLoad } from './useTauriStoreLoad'

export interface UserState {
  username: string
  email: string
  isGithubConnected?: boolean
  githubToken?: string
  phone?: string
  address?: string
}

export function useUserState() {
  const currentUser = ref<UserState | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Load user from localStorage on init
  const loadFromLocalStorage = () => {
    const stored = localStorage.getItem('currentUser')
    if (stored) {
      currentUser.value = JSON.parse(stored)
    }
  }

  // Save user to both localStorage and Tauri store
  const saveUser = async (user: UserState) => {
    try {
      isLoading.value = true
      error.value = null

      // Save to localStorage
      localStorage.setItem('currentUser', JSON.stringify(user))
      currentUser.value = user

      // Save to Tauri store
      const userStore = await useTauriStoreLoad('users.bin', { autoSave: true })
      await userStore.set(user.email, JSON.stringify(user))

      return true
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to save user'
      return false
    } finally {
      isLoading.value = false
    }
  }

  // Update user profile
  const updateProfile = async (updates: Partial<UserState>) => {
    if (!currentUser.value?.email) return false

    try {
      isLoading.value = true
      error.value = null

      const userStore = await useTauriStoreLoad('users.bin', { autoSave: true })
      const existingUser = await userStore.get(currentUser.value.email)
      
      if (!existingUser) {
        error.value = 'User not found'
        return false
      }

      const updatedUser = {
        ...JSON.parse(existingUser as string),
        ...updates
      }

      // If email changed, we need to update the store key
      if (updates.email && updates.email !== currentUser.value.email) {
        await userStore.delete(currentUser.value.email)
        await userStore.set(updates.email, JSON.stringify(updatedUser))
      } else {
        await userStore.set(currentUser.value.email, JSON.stringify(updatedUser))
      }

      // Update localStorage and current user state
      localStorage.setItem('currentUser', JSON.stringify(updatedUser))
      currentUser.value = updatedUser

      return true
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to update profile'
      return false
    } finally {
      isLoading.value = false
    }
  }

  // Update password
  const updatePassword = async (currentPassword: string, newPassword: string) => {
    if (!currentUser.value?.email) return false

    try {
      isLoading.value = true
      error.value = null

      const userStore = await useTauriStoreLoad('users.bin', { autoSave: true })
      const existingUser = await userStore.get(currentUser.value.email)
      
      if (!existingUser) {
        error.value = 'User not found'
        return false
      }

      const userData = JSON.parse(existingUser as string)
      
      if (userData.password !== currentPassword) {
        error.value = 'Current password is incorrect'
        return false
      }

      const updatedUser = {
        ...userData,
        password: newPassword
      }

      await userStore.set(currentUser.value.email, JSON.stringify(updatedUser))
      return true
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to update password'
      return false
    } finally {
      isLoading.value = false
    }
  }

  // Load initial state
  loadFromLocalStorage()

  return {
    currentUser,
    isLoading,
    error,
    saveUser,
    updateProfile,
    updatePassword
  }
} 