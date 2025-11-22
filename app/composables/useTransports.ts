import { ref, computed } from 'vue'

export interface Transport {
	id?: string
	type?: string
	target?: string
	meta?: Record<string, any>
	hook?: string
	name?: string
	description?: string
	enabled?: boolean
	priority?: string
	creator?: string
	status?: string
	lastUsed?: string
	createdAt?: string
	updatedAt?: string
	deletedAt?: string
}

export interface CreateTransportData {
	name: string
	description?: string
	butt?: string
	type: string
	target: string
	meta?: Record<string, any>
	hook?: string
}

export interface UpdateTransportData {
	type?: string
	target?: string
	meta?: Record<string, any>
	hook?: string
}

export const useTransports = () => {
	const transports = ref<Transport[]>([])
	const availableTransports = ref<any[]>([])
	const availableTransportTypes = ref<any[]>([])
	const isLoading = ref(false)
	const error = ref<string | null>(null)

	// Get ButtClient
	const getButtClient = async () => {
		const { buttClient } = await import('~/utils/buttClient')
		return buttClient
	}

	// Get all transports
	const fetchTransports = async () => {
		isLoading.value = true
		error.value = null

		try {
			console.log('🔧 useTransports: Fetching all transports')
			const buttClient = await getButtClient()
			const result = await buttClient.findAllTransport()
			
			transports.value = result || []
			console.log('✅ useTransports: Fetched transports:', transports.value.length)
			
			return transports.value
		} catch (err) {
			console.error('❌ useTransports: Error fetching transports:', err)
			error.value = err instanceof Error ? err.message : 'Failed to fetch transports'
			throw err
		} finally {
			isLoading.value = false
		}
	}

	// Get available transports
	const fetchAvailableTransports = async () => {
		isLoading.value = true
		error.value = null

		try {
			console.log('🔧 useTransports: Fetching available transports')
			const buttClient = await getButtClient()
			const result = await buttClient.getAvailableTransports()
			
			availableTransports.value = result || []
			console.log('✅ useTransports: Fetched available transports:', availableTransports.value.length)
			
			return availableTransports.value
		} catch (err) {
			console.error('❌ useTransports: Error fetching available transports:', err)
			error.value = err instanceof Error ? err.message : 'Failed to fetch available transports'
			throw err
		} finally {
			isLoading.value = false
		}
	}

	// Get available transport types
	const fetchAvailableTransportTypes = async () => {
		isLoading.value = true
		error.value = null

		try {
			console.log('🔧 useTransports: Fetching available transport types')
			const buttClient = await getButtClient()
			const result = await buttClient.getAvailableTransportsTypes()
			
			availableTransportTypes.value = result || []
			console.log('✅ useTransports: Fetched available transport types:', availableTransportTypes.value.length)
			
			return availableTransportTypes.value
		} catch (err) {
			console.error('❌ useTransports: Error fetching available transport types:', err)
			error.value = err instanceof Error ? err.message : 'Failed to fetch available transport types'
			throw err
		} finally {
			isLoading.value = false
		}
	}

	// Create transport
	const createTransport = async (transportData: CreateTransportData): Promise<Transport> => {
		isLoading.value = true
		error.value = null

		try {
			console.log('🔧 useTransports: Creating transport:', transportData)
			const buttClient = await getButtClient()
			
			// Generate BUTT identifier if not provided
			if (!transportData.butt) {
				transportData.butt = `TRANSPORT.${transportData.name.replace(/\s+/g, '')}.${Date.now()}`
			}

			const result = await buttClient.createTransport(transportData)
			console.log('✅ useTransports: Transport created:', result)
			
			// Add to local array
			if (result) {
				transports.value.push(result)
			}
			
			return result
		} catch (err) {
			console.error('❌ useTransports: Error creating transport:', err)
			error.value = err instanceof Error ? err.message : 'Failed to create transport'
			throw err
		} finally {
			isLoading.value = false
		}
	}

	// Update transport
	const updateTransport = async (id: string, updateData: UpdateTransportData): Promise<Transport> => {
		isLoading.value = true
		error.value = null

		try {
			console.log('🔧 useTransports: Updating transport:', id, updateData)
			const buttClient = await getButtClient()
			const result = await buttClient.updateTransport(id, updateData)
			
			console.log('✅ useTransports: Transport updated:', result)
			
			// Update in local array
			const index = transports.value.findIndex(t => t.id === id)
			if (index !== -1 && result) {
				transports.value[index] = { ...transports.value[index], ...result }
			}
			
			return result
		} catch (err) {
			console.error('❌ useTransports: Error updating transport:', err)
			error.value = err instanceof Error ? err.message : 'Failed to update transport'
			throw err
		} finally {
			isLoading.value = false
		}
	}

	// Delete transport
	const deleteTransport = async (id: string): Promise<void> => {
		isLoading.value = true
		error.value = null

		try {
			console.log('🔧 useTransports: Deleting transport:', id)
			const buttClient = await getButtClient()
			await buttClient.deleteTransport(id)
			
			console.log('✅ useTransports: Transport deleted:', id)
			
			// Remove from local array
			transports.value = transports.value.filter(t => t.id !== id)
		} catch (err) {
			console.error('❌ useTransports: Error deleting transport:', err)
			error.value = err instanceof Error ? err.message : 'Failed to delete transport'
			throw err
		} finally {
			isLoading.value = false
		}
	}

	// Find transport by ID
	const findTransportById = (id: string): Transport | undefined => {
		return transports.value.find(t => t.id === id)
	}

	// Computed properties
	const enabledTransports = computed(() => 
		transports.value.filter(t => t.enabled !== false)
	)

	const transportsByType = computed(() => {
		const grouped: Record<string, Transport[]> = {}
		transports.value.forEach(transport => {
			const type = transport.type || 'unknown'
			if (!grouped[type]) {
				grouped[type] = []
			}
			grouped[type].push(transport)
		})
		return grouped
	})

	return {
		// State
		transports,
		availableTransports,
		availableTransportTypes,
		isLoading,
		error,

		// Actions
		fetchTransports,
		fetchAvailableTransports,
		fetchAvailableTransportTypes,
		createTransport,
		updateTransport,
		deleteTransport,
		findTransportById,

		// Computed
		enabledTransports,
		transportsByType
	}
}
