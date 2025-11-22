import { ref, reactive, computed } from 'vue'
import type { CreateHookData, Hook } from './useHooks'

export interface HookFormData {
	name: string
	description: string
	type: string
	enabled: boolean
	priority: string
	trigger: {
		events: string[]
		conditions: Record<string, any>
		filters: Record<string, any>
	}
	listeners: Record<string, any>
	subscribers: Record<string, any>
	retryConfig: {
		maxRetries: number
		retryDelay: number
		backoffMultiplier: number
	}
	organisationId: string
}

export const useHookForm = () => {
	const isSubmitting = ref(false)
	const formError = ref<string | null>(null)

	// Form data
	const formData = reactive<HookFormData>({
		name: '',
		description: '',
		type: 'BUTT', // Default type (only BUTT or SNS allowed)
		enabled: true,
		priority: 'normal',
		trigger: {
			events: [], // Start with empty events
			conditions: {},
			filters: {}
		},
		listeners: {},
		subscribers: {},
		retryConfig: {
			maxRetries: 3,
			retryDelay: 1000,
			backoffMultiplier: 2
		},
		organisationId: ''
	})

	// Common hook types (based on API validation - only BUTT and SNS are allowed)
	const defaultHookTypes = [
		{ label: 'BUTT Hook', value: 'BUTT' },
		{ label: 'SNS Hook', value: 'SNS' }
	]

	// Priority options
	const priorityOptions = [
		{ label: 'Low', value: 'low' },
		{ label: 'Normal', value: 'normal' },
		{ label: 'High', value: 'high' },
		{ label: 'Critical', value: 'critical' }
	]

	// Common event types
	const eventTypes = [
		{ label: 'User Created', value: 'user.created' },
		{ label: 'User Updated', value: 'user.updated' },
		{ label: 'User Deleted', value: 'user.deleted' },
		{ label: 'User Login', value: 'user.login' },
		{ label: 'User Logout', value: 'user.logout' },
		{ label: 'Project Created', value: 'project.created' },
		{ label: 'Project Updated', value: 'project.updated' },
		{ label: 'Project Deleted', value: 'project.deleted' },
		{ label: 'Template Created', value: 'template.created' },
		{ label: 'Template Updated', value: 'template.updated' },
		{ label: 'Template Executed', value: 'template.executed' },
		{ label: 'Transport Triggered', value: 'transport.triggered' },
		{ label: 'Hook Triggered', value: 'hook.triggered' },
		{ label: 'System Error', value: 'system.error' },
		{ label: 'System Warning', value: 'system.warning' },
		{ label: 'Custom Event', value: 'custom.event' }
	]

	// Form validation
	const isFormValid = computed(() => {
		return formData.name.trim() !== '' &&
			formData.type.trim() !== ''
			// Note: We'll provide a default trigger event if none selected, so not requiring it here
	})

	// Reset form
	const resetForm = () => {
		formData.name = ''
		formData.description = ''
		formData.type = 'BUTT' // Set a default type (only BUTT or SNS allowed)
		formData.enabled = true
		formData.priority = 'normal'
		formData.trigger = {
			events: [], // Start with empty events - user will add them
			conditions: {},
			filters: {}
		}
		formData.listeners = {}
		formData.subscribers = {}
		formData.retryConfig = {
			maxRetries: 3,
			retryDelay: 1000,
			backoffMultiplier: 2
		}
		formData.organisationId = ''
		formError.value = null
	}

	// Populate form with existing hook data
	const populateForm = (hook: Hook) => {
		formData.name = hook.name || ''
		formData.description = hook.description || ''
		formData.type = hook.type || ''
		formData.enabled = hook.enabled !== false
		formData.priority = hook.priority || 'normal'
		formData.organisationId = hook.organisationId || ''
		
		// Handle trigger data
		if (hook.trigger && Array.isArray(hook.trigger)) {
			formData.trigger.events = hook.trigger.map(t => t.event || t).filter(Boolean)
		}
		
		formData.listeners = hook.listeners || {}
		formData.subscribers = hook.subscribers || {}
		
		// Handle retry config
		if (hook.retryConfig) {
			formData.retryConfig = {
				maxRetries: hook.retryConfig.maxRetries || 3,
				retryDelay: hook.retryConfig.retryDelay || 1000,
				backoffMultiplier: hook.retryConfig.backoffMultiplier || 2
			}
		}
		
		// Handle filters
		if (hook.filters) {
			formData.trigger.filters = hook.filters
		}
	}

	// Convert form data to create hook data
	const toCreateData = (): CreateHookData => {
		// API expects trigger to be an array of strings, not objects
		const triggerArray: string[] = formData.trigger.events.length > 0 
			? formData.trigger.events 
			: ['user.login'] // Default trigger if none selected

		// Start with only required fields
		const data: CreateHookData = {
			name: formData.name.trim(),
			type: formData.type, // Must be 'BUTT' or 'SNS'
			trigger: triggerArray // Array of strings
		}

		// Only add optional fields if they have meaningful values
		if (formData.description && formData.description.trim()) {
			data.description = formData.description.trim()
		}

		if (formData.organisationId && formData.organisationId.trim()) {
			data.organisationId = formData.organisationId.trim()
		}

		// Only add non-default values
		if (formData.enabled !== true) {
			data.enabled = formData.enabled
		}

		if (formData.priority !== 'normal') {
			data.priority = formData.priority
		}

		// Only add complex objects if they have content
		if (formData.listeners && Object.keys(formData.listeners).length > 0) {
			data.listeners = { ...formData.listeners }
		}

		if (formData.subscribers && Object.keys(formData.subscribers).length > 0) {
			data.subscribers = { ...formData.subscribers }
		}

		if (formData.trigger.filters && Object.keys(formData.trigger.filters).length > 0) {
			data.filters = { ...formData.trigger.filters }
		}

		// Only add retry config if it's different from defaults
		if (formData.retryConfig.maxRetries !== 3 || 
			formData.retryConfig.retryDelay !== 1000 || 
			formData.retryConfig.backoffMultiplier !== 2) {
			data.retryConfig = { ...formData.retryConfig }
		}

		console.log('🔧 useHookForm: Generated create data:', JSON.stringify(data, null, 2))
		return data
	}

	// Note: Hook updates are not supported by the BApi, so we only have create functionality

	// Get hook type label
	const getHookTypeLabel = (type: string): string => {
		const hookType = defaultHookTypes.find(t => t.value === type)
		return hookType?.label || type
	}

	// Get priority label
	const getPriorityLabel = (priority: string): string => {
		const priorityOption = priorityOptions.find(p => p.value === priority)
		return priorityOption?.label || priority
	}

	// Add event to trigger
	const addEvent = (event: string) => {
		if (event && !formData.trigger.events.includes(event)) {
			formData.trigger.events.push(event)
		}
	}

	// Remove event from trigger
	const removeEvent = (event: string) => {
		const index = formData.trigger.events.indexOf(event)
		if (index > -1) {
			formData.trigger.events.splice(index, 1)
		}
	}

	// Add condition to trigger
	const addCondition = (key: string, value: any) => {
		formData.trigger.conditions[key] = value
	}

	// Remove condition from trigger
	const removeCondition = (key: string) => {
		delete formData.trigger.conditions[key]
	}

	// Add filter to trigger
	const addFilter = (key: string, value: any) => {
		formData.trigger.filters[key] = value
	}

	// Remove filter from trigger
	const removeFilter = (key: string) => {
		delete formData.trigger.filters[key]
	}

	return {
		// State
		formData,
		isSubmitting,
		formError,
		defaultHookTypes,
		priorityOptions,
		eventTypes,

		// Computed
		isFormValid,

		// Actions
		resetForm,
		populateForm,
		toCreateData,
		getHookTypeLabel,
		getPriorityLabel,
		addEvent,
		removeEvent,
		addCondition,
		removeCondition,
		addFilter,
		removeFilter
	}
}
