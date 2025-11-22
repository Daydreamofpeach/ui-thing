import { ref, computed } from 'vue'
import { buttClient } from '~/utils/buttClient'

export interface Integration {
	id: string
	name: string
	type: string
	description?: string
	logo?: string
	connected?: boolean
	isLinked?: boolean
	userInfo?: any
	createdAt?: string
}

export interface Connection {
	id: string
	name: string
	type: string
	description?: string
	connected: boolean
	userInfo?: any
	createdAt?: string
	integrationId?: string
	integrationConnectionId?: string
}

export function useIntegrationManagement() {
	const loading = ref(false)
	const error = ref<string | null>(null)
	const availableIntegrations = ref<Integration[]>([])
	const linkedConnections = ref<Connection[]>([])
	const recentlyLinked = ref(false)

	// Get integration icon based on type
	const getIntegrationIcon = (type: string): string => {
		const iconMap: Record<string, string> = {
			// Version Control & Code
			GITHUB: "i-lucide-github",
			ATLASSIAN_BITBUCKET: "i-lucide-git-branch",
			// Project Management & Collaboration
			ATLASSIAN: "i-lucide-puzzle",
			JIRA: "i-lucide-ticket",
			CONFLUENCE: "i-lucide-file-text",
			// Communication
			DISCORD: "i-lucide-message-circle",
			SLACK: "i-lucide-slack",
			// Google Services
			GOOGLE: "i-lucide-chrome",
			GMAIL: "i-lucide-mail",
			GOOGLE_DRIVE: "i-lucide-hard-drive",
			GOOGLE_SHEETS: "i-lucide-table",
			GOOGLE_DOCS: "i-lucide-file-text",
			// Email & Communication
			POSTMARK: "i-lucide-send",
			MAIL: "i-lucide-mail",
			EMAIL: "i-lucide-mail",
			// Cloud & Storage
			AWS: "i-lucide-cloud",
			AZURE: "i-lucide-cloud",
			DROPBOX: "i-lucide-cloud",
			// Development Tools
			DOCKER: "i-lucide-container",
			KUBERNETES: "i-lucide-layers",
			JENKINS: "i-lucide-settings",
			// Database
			MYSQL: "i-lucide-database",
			POSTGRESQL: "i-lucide-database",
			MONGODB: "i-lucide-database",
			// Monitoring & Analytics
			GRAFANA: "i-lucide-bar-chart",
			PROMETHEUS: "i-lucide-activity",
			NEW_RELIC: "i-lucide-trending-up",
			// Payment & Finance
			STRIPE: "i-lucide-credit-card",
			PAYPAL: "i-lucide-credit-card",
			QUICKBOOKS: "i-lucide-calculator",
			// CRM & Sales
			SALESFORCE: "i-lucide-users",
			HUBSPOT: "i-lucide-target",
			PIPEDRIVE: "i-lucide-trending-up",
			// Social Media
			TWITTER: "i-lucide-twitter",
			FACEBOOK: "i-lucide-facebook",
			LINKEDIN: "i-lucide-linkedin",
			INSTAGRAM: "i-lucide-instagram",
			// Default fallback
			DEFAULT: "i-lucide-puzzle-piece"
		}
		const normalizedType = type?.toUpperCase()?.replace(/[^A-Z0-9_]/g, '') || 'DEFAULT'
		return iconMap[normalizedType] || iconMap.DEFAULT || 'i-lucide-puzzle-piece'
	}

	// Fetch available integrations for organization
	const fetchAvailableIntegrations = async (organizationId: string) => {
		try {
			loading.value = true
			error.value = null
			console.log("Fetching integrations for organization:", organizationId)

			const integrations = await buttClient.findIntegrationsByOrganisationId(organizationId)
			availableIntegrations.value = Array.isArray(integrations) 
				? integrations.map((integration: any) => ({
					...integration,
					connected: integration.connected || false
				}))
				: []

			console.log("Available integrations loaded:", availableIntegrations.value.length)
		} catch (err: any) {
			console.error("Error fetching integrations:", err)
			error.value = err?.message || "Failed to load integrations"
			availableIntegrations.value = []
		} finally {
			loading.value = false
		}
	}

	// Check if integration is linked to project
	const checkIfIntegrationLinked = async (integration: Integration, projectId: string): Promise<boolean> => {
		if (!projectId || !integration.id) return false

		try {
			console.log(`Checking link status for integration: ${integration.name} (${integration.type})`)
			const connections = await buttClient.getConnectionsByIntegrationId(integration.id)
			
			if (!connections || connections.length === 0) {
				return false
			}

			// Check if any connection is linked to the current project
			for (const connection of connections) {
				try {
					const linkedConnection = await buttClient.linkedConnection(projectId, connection.id)
					if (linkedConnection) {
						return true
					}
				} catch (error) {
					// No link exists for this connection
					continue
				}
			}
			return false
		} catch (error) {
			console.error("Error checking integration link status:", error)
			return false
		}
	}

	// Link integration to project
	const linkIntegrationToProject = async (integration: Integration, projectId: string) => {
		if (!projectId || !integration.id) {
			throw new Error("Missing project or integration information")
		}

		try {
			console.log("Linking integration to project:", {
				projectId,
				integrationId: integration.id
			})

			const connections = await buttClient.getConnectionsByIntegrationId(integration.id)
			const connection = connections[0]

			if (!connection) {
				throw new Error("No connection found for this integration")
			}

			const linkResult = await buttClient.linkService(projectId, connection.id, {})

			console.log("Integration linked successfully:", linkResult)

			// Mark integration as linked
			integration.isLinked = true

			// Show success message temporarily
			recentlyLinked.value = true
			setTimeout(() => {
				recentlyLinked.value = false
			}, 3000)

			return {
				project: { id: projectId },
				integration,
				connection,
				linkResult
			}
		} catch (error: any) {
			console.error("Error linking integration to project:", error)
			throw error
		}
	}

	// Fetch linked connections for project
	const fetchLinkedConnections = async (projectId: string, organizationId: string) => {
		try {
			loading.value = true
			error.value = null
			console.log("Fetching linked connections for project:", projectId)

			// Get all integrations for the organization
			const integrations = await buttClient.findIntegrationsByOrganisationId(organizationId)
			
			// Get the linked connections for the specific project
			const connections = await buttClient.linkedConnections(projectId)

			// Process and combine the data
			const linkedConnectionsList = Array.isArray(connections) ? connections : [connections].filter(Boolean)
			
			// Map the linked connections with integration details
			const enrichedConnections = linkedConnectionsList.map(connection => {
				// Find the corresponding integration details
				const integration = integrations?.find((int: any) => 
					int.id === connection.integrationConnectionId || 
					int.id === connection.integrationId ||
					int.integrationConnectionId === connection.integrationConnectionId
				)

				return {
					...connection,
					// Add integration details if found
					...(integration && {
						name: integration.name || connection.name,
						type: integration.type || connection.type,
						description: integration.description || connection.description,
						userInfo: integration.userInfo || connection.userInfo,
						connected: true
					})
				}
			})

			linkedConnections.value = enrichedConnections
			console.log("Fetched and enriched linked connections:", linkedConnections.value.length)
		} catch (err: any) {
			console.error("Error fetching linked connections:", err)
			error.value = err?.message || "Failed to load linked connections"
			linkedConnections.value = []
		} finally {
			loading.value = false
		}
	}

	// Unlink connection from project
	const unlinkConnection = async (connection: Connection, projectId: string) => {
		if (!projectId || !connection.id) {
			throw new Error("Missing project or connection information")
		}

		try {
			console.log("Unlinking connection from project:", {
				projectId,
				connectionId: connection.id
			})

			await buttClient.unlinkService(projectId, connection.id)

			console.log("Connection unlinked successfully")

			// Remove from local list
			linkedConnections.value = linkedConnections.value.filter((c) => c.id !== connection.id)

			return connection
		} catch (error: any) {
			console.error("Error unlinking connection from project:", error)
			throw error
		}
	}

	// Update integration link statuses for a project
	const updateIntegrationLinkStatuses = async (projectId: string) => {
		if (!projectId || availableIntegrations.value.length === 0) return

		console.log(`Updating link statuses for ${availableIntegrations.value.length} integrations for project ${projectId}`)
		
		for (const integration of availableIntegrations.value) {
			integration.isLinked = await checkIfIntegrationLinked(integration, projectId)
		}
	}

	// Format date for display
	const formatDate = (date: string | Date): string => {
		if (!date) return "N/A"
		return new Date(date).toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric"
		})
	}

	// Computed properties
	const hasIntegrations = computed(() => availableIntegrations.value.length > 0)
	const hasLinkedConnections = computed(() => linkedConnections.value.length > 0)
	const isLoading = computed(() => loading.value)
	const hasError = computed(() => !!error.value)

	return {
		// State
		loading,
		error,
		availableIntegrations,
		linkedConnections,
		recentlyLinked,
		
		// Computed
		hasIntegrations,
		hasLinkedConnections,
		isLoading,
		hasError,
		
		// Methods
		getIntegrationIcon,
		fetchAvailableIntegrations,
		checkIfIntegrationLinked,
		linkIntegrationToProject,
		fetchLinkedConnections,
		unlinkConnection,
		updateIntegrationLinkStatuses,
		formatDate
	}
}
