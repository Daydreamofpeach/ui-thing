import { ref } from 'vue'

// Singleton state for Turnstile widget
const activeTurnstileInstance = ref<string | null>(null)
const turnstileToken = ref<string | null>(null)
const turnstileReady = ref(false)

export function useTurnstileSingleton() {
  const registerInstance = (instanceId: string): boolean => {
    // If there's already an active instance, don't allow another
    if (activeTurnstileInstance.value && activeTurnstileInstance.value !== instanceId) {
      console.warn(`⚠️ Turnstile instance ${instanceId} blocked - instance ${activeTurnstileInstance.value} is already active`)
      return false
    }
    
    activeTurnstileInstance.value = instanceId
    console.log(`✅ Turnstile instance registered: ${instanceId}`)
    return true
  }

  const unregisterInstance = (instanceId: string) => {
    if (activeTurnstileInstance.value === instanceId) {
      activeTurnstileInstance.value = null
      turnstileToken.value = null
      turnstileReady.value = false
      console.log(`🧹 Turnstile instance unregistered: ${instanceId}`)
    }
  }

  const setToken = (token: string | null) => {
    turnstileToken.value = token
    turnstileReady.value = !!token
  }

  const resetToken = () => {
    turnstileToken.value = null
    turnstileReady.value = false
  }

  return {
    activeTurnstileInstance,
    turnstileToken,
    turnstileReady,
    registerInstance,
    unregisterInstance,
    setToken,
    resetToken
  }
}

