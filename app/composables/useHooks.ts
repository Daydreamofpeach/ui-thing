import { ref, computed } from 'vue'
import { buttClient } from '~/utils/buttClient'

export interface Hook {
	id?: string
	name?: string
	description?: string
	type?: string
	trigger?: any[]
	listeners?: Record<string, any>
	subscribers?: Record<string, any>
	organisationId?: string
	owners?: Record<string, any>
	enabled?: boolean
	priority?: string
	retryConfig?: Record<string, any>
	filters?: Record<string, any>
	token?: string
	status?: string
	lastTriggered?: string
	triggerCount?: number
	createdAt?: string
	updatedAt?: string
	deletedAt?: string
}

export interface CreateHookData {
	name: string
	description?: string
	type: string
	trigger: any[]
	listeners?: Record<string, any>
	subscribers?: Record<string, any>
	organisationId?: string
	owners?: Record<string, any>
	enabled?: boolean
	priority?: string
	retryConfig?: Record<string, any>
	filters?: Record<string, any>
}

export interface SubscribeHookData {
	id: string
	subscriber: string
	type: string
}

export const useHooks = () => {
	const hooks = ref<Hook[]>([])
	const availableHooks = ref<any[]>([])
	const isLoading = ref(false)
	const error = ref<string | null>(null)

	// Get hooks by organisation ID (this is the main way to get hooks)
	const fetchHooksByOrganisation = async (organisationId: string) => {
		isLoading.value = true
		error.value = null

		try {
			// Check authentication first
			if (!buttClient.isAuthenticated()) {
				throw new Error('Authentication required. Please login first.')
			}

			console.log('🔧 useHooks: Fetching hooks for organisation:', organisationId)
			console.log('🔧 useHooks: Authentication status:', buttClient.isAuthenticated())
			console.log('🔧 useHooks: Has access token:', !!buttClient.getAccessToken())
			
			const result = await buttClient.getByOrganisationId(organisationId)
			
			const orgHooks = result || []
			hooks.value = orgHooks
			console.log('✅ useHooks: Fetched organisation hooks:', orgHooks.length)
			
			return orgHooks
		} catch (err) {
			console.error('❌ useHooks: Error fetching organisation hooks:', err)
			console.error('❌ useHooks: Error details:', {
				organisationId,
				isAuthenticated: buttClient.isAuthenticated(),
				hasToken: !!buttClient.getAccessToken(),
				error: err
			})
			error.value = err instanceof Error ? err.message : 'Failed to fetch organisation hooks'
			throw err
		} finally {
			isLoading.value = false
		}
	}

	// Get all hooks (uses available hooks endpoint which includes default buildit hooks)
	const fetchAllHooks = async () => {
		isLoading.value = true
		error.value = null

		try {
			// Check authentication first
			if (!buttClient.isAuthenticated()) {
				throw new Error('Authentication required. Please login first.')
			}

			console.log('🔧 useHooks: Fetching all hooks via getAvailableHooks')
			console.log('🔧 useHooks: Authentication status:', buttClient.isAuthenticated())
			console.log('🔧 useHooks: Has access token:', !!buttClient.getAccessToken())

			const result = await buttClient.getAvailableHooks()

			hooks.value = result || []
			console.log('✅ useHooks: Fetched all hooks:', hooks.value.length)

			return hooks.value
		} catch (err) {
			console.error('❌ useHooks: Error fetching all hooks:', err)
			console.error('❌ useHooks: Error details:', {
				isAuthenticated: buttClient.isAuthenticated(),
				hasToken: !!buttClient.getAccessToken(),
				error: err
			})
			error.value = err instanceof Error ? err.message : 'Failed to fetch all hooks'
			throw err
		} finally {
			isLoading.value = false
		}
	}

	// Get available hook types
	const fetchAvailableHooks = async () => {
		isLoading.value = true
		error.value = null

		try {
			// Check authentication first
			if (!buttClient.isAuthenticated()) {
				throw new Error('Authentication required. Please login first.')
			}

			console.log('🔧 useHooks: Fetching available hook types')
			console.log('🔧 useHooks: Authentication status:', buttClient.isAuthenticated())
			console.log('🔧 useHooks: Has access token:', !!buttClient.getAccessToken())
			
			const result = await buttClient.getAvailableHooks()
			
			availableHooks.value = result || []
			console.log('✅ useHooks: Fetched available hook types:', availableHooks.value.length)
			
			return availableHooks.value
		} catch (err) {
			console.error('❌ useHooks: Error fetching available hook types:', err)
			console.error('❌ useHooks: Error details:', {
				isAuthenticated: buttClient.isAuthenticated(),
				hasToken: !!buttClient.getAccessToken(),
				error: err
			})
			error.value = err instanceof Error ? err.message : 'Failed to fetch available hook types'
			throw err
		} finally {
			isLoading.value = false
		}
	}

	// Create hook
	const createHook = async (hookData: CreateHookData): Promise<Hook> => {
		isLoading.value = true
		error.value = null

		try {
			// Check authentication first
			if (!buttClient.isAuthenticated()) {
				throw new Error('Authentication required. Please login first.')
			}

			console.log('🔧 useHooks: Creating hook with data:', JSON.stringify(hookData, null, 2))
			console.log('🔧 useHooks: Authentication status:', buttClient.isAuthenticated())
			console.log('🔧 useHooks: Has access token:', !!buttClient.getAccessToken())
			
			// Validate required fields before sending
			if (!hookData.name || !hookData.type || !hookData.trigger) {
				throw new Error('Missing required fields: name, type, and trigger are required')
			}
			
			if (!Array.isArray(hookData.trigger) || hookData.trigger.length === 0) {
				throw new Error('Trigger must be a non-empty array')
			}
			
			console.log('🔧 useHooks: Validation passed, sending to API...')
			console.log('🔧 useHooks: Final payload being sent:', JSON.stringify(hookData, null, 2))
			console.log('🔧 useHooks: Payload type check:', {
				name: typeof hookData.name,
				type: typeof hookData.type,
				trigger: Array.isArray(hookData.trigger) ? 'Array' : typeof hookData.trigger,
				triggerLength: hookData.trigger?.length,
				organisationId: typeof hookData.organisationId,
				butt: typeof hookData.butt
			})
			
			// Log the actual request details
			console.log('🔧 useHooks: ButtClient instance:', {
				baseUrl: (buttClient as any).baseUrl,
				serviceId: (buttClient as any).serviceId,
				clientType: (buttClient as any).clientType
			})
			
			const result = await buttClient.createHook(hookData)
			console.log('✅ useHooks: Hook created:', result)
			
			// Add to local array
			if (result) {
				hooks.value.push(result)
			}
			
			return result
		} catch (err) {
			console.error('❌ useHooks: Error creating hook:', err)
			console.error('❌ useHooks: Hook data that failed:', JSON.stringify(hookData, null, 2))
			console.error('❌ useHooks: Error details:', {
				isAuthenticated: buttClient.isAuthenticated(),
				hasToken: !!buttClient.getAccessToken(),
				hookData,
				error: err
			})
			error.value = err instanceof Error ? err.message : 'Failed to create hook'
			throw err
		} finally {
			isLoading.value = false
		}
	}

	// Subscribe to hook
	const subscribeToHook = async (subscribeData: SubscribeHookData): Promise<void> => {
		isLoading.value = true
		error.value = null

		try {
			console.log('🔧 useHooks: Subscribing to hook:', subscribeData)
			await buttClient.subscribe(subscribeData)
			
			console.log('✅ useHooks: Subscribed to hook:', subscribeData.id)
		} catch (err) {
			console.error('❌ useHooks: Error subscribing to hook:', err)
			error.value = err instanceof Error ? err.message : 'Failed to subscribe to hook'
			throw err
		} finally {
			isLoading.value = false
		}
	}

	// Get hook by token
	const getHookByToken = async (token: string): Promise<Hook> => {
		isLoading.value = true
		error.value = null

		try {
			console.log('🔧 useHooks: Getting hook by token')
			const result = await buttClient.getHook(token)
			
			console.log('✅ useHooks: Hook retrieved by token:', result)
			return result
		} catch (err) {
			console.error('❌ useHooks: Error getting hook by token:', err)
			error.value = err instanceof Error ? err.message : 'Failed to get hook by token'
			throw err
		} finally {
			isLoading.value = false
		}
	}

	// Send email via hook
	const sendEmailViaHook = async (emailData: { to: string; subject: string; body: string }): Promise<void> => {
		isLoading.value = true
		error.value = null

		try {
			console.log('🔧 useHooks: Sending email via hook:', emailData)
			await buttClient.email(emailData)
			
			console.log('✅ useHooks: Email sent via hook')
		} catch (err) {
			console.error('❌ useHooks: Error sending email via hook:', err)
			error.value = err instanceof Error ? err.message : 'Failed to send email via hook'
			throw err
		} finally {
			isLoading.value = false
		}
	}

	// Find hook by ID
	const findHookById = (id: string): Hook | undefined => {
		return hooks.value.find(h => h.id === id)
	}

	// Computed properties
	const enabledHooks = computed(() => 
		hooks.value.filter(h => h.enabled !== false)
	)

	const hooksByType = computed(() => {
		const grouped: Record<string, Hook[]> = {}
		hooks.value.forEach(hook => {
			const type = hook.type || 'unknown'
			if (!grouped[type]) {
				grouped[type] = []
			}
			grouped[type].push(hook)
		})
		return grouped
	})

	const hooksByPriority = computed(() => {
		const grouped: Record<string, Hook[]> = {}
		hooks.value.forEach(hook => {
			const priority = hook.priority || 'normal'
			if (!grouped[priority]) {
				grouped[priority] = []
			}
			grouped[priority].push(hook)
		})
		return grouped
	})

	return {
		// State
		hooks,
		availableHooks,
		isLoading,
		error,

		// Actions
		fetchHooksByOrganisation,
		fetchAllHooks,
		fetchAvailableHooks,
		createHook,
		subscribeToHook,
		getHookByToken,
		sendEmailViaHook,
		findHookById,

		// Computed
		enabledHooks,
		hooksByType,
		hooksByPriority
	}
}