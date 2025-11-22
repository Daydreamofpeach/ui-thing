import { ref, reactive, computed } from 'vue'
import type { CreateTransportData, UpdateTransportData, Transport } from './useTransports'

export interface TransportFormData {
	name: string
	description: string
	type: string
	target: string
	hook: string
	meta: Record<string, any>
}

export const useTransportForm = () => {
	const isSubmitting = ref(false)
	const formError = ref<string | null>(null)

	// Form data
	const formData = reactive<TransportFormData>({
		name: '',
		description: '',
		type: '',
		target: '',
		hook: '',
		meta: {}
	})

	// Common transport types (can be extended with API data)
	const defaultTransportTypes = [
		{ label: 'Webhook', value: 'WEBHOOK' },
		{ label: 'Email', value: 'EMAIL' },
		{ label: 'SMS', value: 'SMS' },
		{ label: 'Slack', value: 'SLACK' },
		{ label: 'Discord', value: 'DISCORD' },
		{ label: 'Teams', value: 'TEAMS' },
		{ label: 'Integration Connection', value: 'INTEGRATION_CONNECTION' },
		{ label: 'Database', value: 'DATABASE' },
		{ label: 'File System', value: 'FILE_SYSTEM' },
		{ label: 'Message Queue', value: 'MESSAGE_QUEUE' }
	]

	// Form validation
	const isFormValid = computed(() => {
		return formData.name.trim() !== '' &&
			formData.type.trim() !== '' &&
			formData.target.trim() !== ''
	})

	// Reset form
	const resetForm = () => {
		formData.name = ''
		formData.description = ''
		formData.type = ''
		formData.target = ''
		formData.hook = ''
		formData.meta = {}
		formError.value = null
	}

	// Populate form with existing transport data
	const populateForm = (transport: Transport) => {
		formData.name = transport.name || ''
		formData.description = transport.description || ''
		formData.type = transport.type || ''
		formData.target = transport.target || ''
		formData.hook = transport.hook || ''
		formData.meta = transport.meta || {}
	}

	// Convert form data to create transport data
	const toCreateData = (): CreateTransportData => {
		const data: CreateTransportData = {
			name: formData.name.trim(),
			type: formData.type,
			target: formData.target.trim()
		}

		if (formData.description.trim()) {
			data.description = formData.description.trim()
		}

		if (formData.hook.trim()) {
			data.hook = formData.hook.trim()
		}

		if (Object.keys(formData.meta).length > 0) {
			data.meta = { ...formData.meta }
		}

		return data
	}

	// Convert form data to update transport data
	const toUpdateData = (): UpdateTransportData => {
		const data: UpdateTransportData = {}

		if (formData.type) {
			data.type = formData.type
		}

		if (formData.target.trim()) {
			data.target = formData.target.trim()
		}

		if (formData.hook.trim()) {
			data.hook = formData.hook.trim()
		}

		if (Object.keys(formData.meta).length > 0) {
			data.meta = { ...formData.meta }
		}

		return data
	}

	// Get transport type label
	const getTransportTypeLabel = (type: string): string => {
		const transportType = defaultTransportTypes.find(t => t.value === type)
		return transportType?.label || type
	}

	// Get placeholder text for target field based on type
	const getTargetPlaceholder = computed(() => {
		switch (formData.type) {
			case 'WEBHOOK':
				return 'https://example.com/webhook'
			case 'EMAIL':
				return 'user@example.com'
			case 'SMS':
				return '+1234567890'
			case 'SLACK':
				return '#channel-name or @username'
			case 'DISCORD':
				return 'Channel ID or Webhook URL'
			case 'TEAMS':
				return 'Teams Webhook URL'
			case 'INTEGRATION_CONNECTION':
				return 'Connection ID'
			case 'DATABASE':
				return 'Database connection string'
			case 'FILE_SYSTEM':
				return '/path/to/file'
			case 'MESSAGE_QUEUE':
				return 'Queue name'
			default:
				return 'Enter target identifier'
		}
	})

	// Get help text for target field based on type
	const getTargetHelpText = computed(() => {
		switch (formData.type) {
			case 'WEBHOOK':
				return 'URL endpoint that will receive HTTP POST requests'
			case 'EMAIL':
				return 'Email address to send notifications to'
			case 'SMS':
				return 'Phone number in international format'
			case 'SLACK':
				return 'Slack channel or user to send messages to'
			case 'DISCORD':
				return 'Discord channel ID or webhook URL'
			case 'TEAMS':
				return 'Microsoft Teams webhook URL'
			case 'INTEGRATION_CONNECTION':
				return 'ID of an existing integration connection'
			case 'DATABASE':
				return 'Database connection string or identifier'
			case 'FILE_SYSTEM':
				return 'File path where data will be written'
			case 'MESSAGE_QUEUE':
				return 'Name of the message queue'
			default:
				return 'Target identifier for this transport'
		}
	})

	return {
		// State
		formData,
		isSubmitting,
		formError,
		defaultTransportTypes,

		// Computed
		isFormValid,
		getTargetPlaceholder,
		getTargetHelpText,

		// Actions
		resetForm,
		populateForm,
		toCreateData,
		toUpdateData,
		getTransportTypeLabel
	}
}
