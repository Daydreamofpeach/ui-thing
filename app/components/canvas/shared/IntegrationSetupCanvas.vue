<template>
	<div class="integration-setup-canvas">
		<!-- Header Card -->
		<div class="setup-header">
			<div class="setup-icon">
				<UIcon name="i-lucide-plug-zap" class="size-6" />
			</div>
			<div class="setup-text">
				<h3 class="setup-title">Add Integration</h3>
				<p class="setup-description">Connect your favorite tools and services</p>
			</div>
		</div>

		<!-- Toggle Button -->
		<button
			class="toggle-button"
			:disabled="loading || filteredIntegrationDefaults.length === 0"
			@click="showIntegrationList = !showIntegrationList"
		>
			<UIcon name="i-lucide-plus-circle" class="size-4" />
			<span>{{ loading ? 'Loading integrations...' : filteredIntegrationDefaults.length === 0 ? 'All integrations added' : 'Add Integration' }}</span>
			<UIcon
				name="i-lucide-chevron-down"
				class="size-4 chevron-icon"
				:class="{ 'chevron-rotated': showIntegrationList }"
			/>
		</button>

		<!-- Integration List -->
		<div v-if="showIntegrationList && filteredIntegrationDefaults.length > 0" class="integration-list">
			<div
				v-for="integration in filteredIntegrationDefaults"
				:key="integration.id || integration.butt"
				class="integration-item"
				:class="{ 'item-expanded': expandedIntegration?.id === integration.id }"
			>
				<!-- Integration Card Header -->
				<button
					class="item-header"
					@click="toggleIntegrationExpansion(integration)"
				>
					<div class="item-icon-wrapper">
						<Icon :name="getIntegrationIcon(integration.type)" class="item-icon" />
					</div>
					<div class="item-content">
						<h4 class="item-title">{{ integration.name }}</h4>
						<p class="item-description">{{ integration.description }}</p>
					</div>
					<UIcon
						name="i-lucide-chevron-down"
						class="size-4 chevron-icon"
						:class="{ 'chevron-rotated': expandedIntegration?.id === integration.id }"
					/>
				</button>

				<!-- Expanded Configuration -->
				<div v-if="expandedIntegration?.id === integration.id" class="item-expanded-content">
					<!-- Non-OAuth Integration -->
					<div v-if="!isOAuthProvider(integration)" class="info-card success">
						<UIcon name="i-lucide-check-circle" class="size-5 info-icon" />
						<div class="info-content">
							<h4 class="info-title">Ready to Connect</h4>
							<p class="info-message">
								This integration doesn't require OAuth setup. Click "Save and Connect" to add it.
							</p>
						</div>
					</div>

					<!-- OAuth Setup Instructions -->
					<div v-if="isOAuthProvider(integration)" class="oauth-section">
						<IntegrationSetupGuide :integration="integration" />

						<!-- OAuth Credentials Form -->
						<div class="credentials-form">
							<div class="form-header">
								<UIcon name="i-lucide-key" class="size-4" />
								<span class="form-title">OAuth Credentials</span>
							</div>
							<div class="form-field">
								<label class="field-label">Client ID</label>
								<input
									v-model="integrationForm.clientId"
									type="text"
									class="field-input"
									placeholder="Enter client ID"
								>
							</div>
							<div class="form-field">
								<label class="field-label">Client Secret</label>
								<input
									v-model="integrationForm.clientSecret"
									type="password"
									class="field-input"
									placeholder="Enter client secret"
								>
							</div>
						</div>
					</div>

					<!-- Action Buttons -->
					<div class="action-buttons">
						<button
							class="action-btn secondary"
							@click="cancelIntegrationConfig"
						>
							<UIcon name="i-lucide-x" class="size-4" />
							<span>Cancel</span>
						</button>
						<button
							class="action-btn primary"
							:disabled="!canSave || saving"
							@click="saveAndConnectIntegration(integration)"
						>
							<UIcon
								v-if="saving"
								name="i-lucide-loader-2"
								class="size-4 animate-spin"
							/>
							<UIcon
								v-else
								name="i-lucide-check"
								class="size-4"
							/>
							<span>{{ saving ? 'Saving...' : 'Save and Connect' }}</span>
						</button>
					</div>
				</div>
			</div>
		</div>

		<!-- Error State -->
		<div v-if="error" class="error-card">
			<UIcon name="i-lucide-alert-circle" class="size-5 error-icon" />
			<div class="error-content">
				<h4 class="error-title">Error</h4>
				<p class="error-message">{{ error }}</p>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
	import { useToast } from "#imports";
	import IntegrationSetupGuide from "@canvas/shared/IntegrationSetupGuide.vue";
	import { useButtAuth } from "@butt/client";
	import { useOAuthConnection } from "@composables/useOAuthConnection";
	import { useSelectedOrganisationId } from "@composables/useSelectedOrganisationId";
	import { buttClient } from "@utils/buttClient";
	import { computed, onMounted, reactive, ref } from "vue";

	interface Props {
		excludeTypes?: string[]
	}

	const props = withDefaults(defineProps<Props>(), {
		excludeTypes: () => []
	});

	const emit = defineEmits<{
		integrationCreated: [integration: any]
	}>();

	const toast = useToast();
	const { user: _currentUser } = useButtAuth(buttClient);
	const selectedOrganisationId = useSelectedOrganisationId();
	const { initiateOAuthConnection: initiateOAuth } = useOAuthConnection();

	// Reactive state
	const integrationDefaults = ref<any[]>([]);
	const loading = ref(true);
	const error = ref<string | null>(null);
	const showIntegrationList = ref(false);
	const expandedIntegration = ref<any | null>(null);
	const saving = ref(false);

	// Form state
	const integrationForm = reactive({
		clientId: "",
		clientSecret: ""
	});

	// Filter out integration types that already exist
	const filteredIntegrationDefaults = computed(() => {
		if (props.excludeTypes.length === 0) {
			return integrationDefaults.value;
		}
		return integrationDefaults.value.filter(
			(integration) => !props.excludeTypes.includes(integration.type?.toUpperCase())
		);
	});

	// Get icon based on integration type
	function getIntegrationIcon(type: string): string {
		const iconMap: Record<string, string> = {
			GITHUB: "simple-icons:github",
			ATLASSIAN: "simple-icons:atlassian",
			JIRA: "simple-icons:jira",
			BITBUCKET: "simple-icons:bitbucket",
			DISCORD: "simple-icons:discord",
			GOOGLE: "simple-icons:google",
			SLACK: "simple-icons:slack"
		};
		return iconMap[type?.toUpperCase()] || "heroicons:puzzle-piece";
	}

	// Check if integration is OAuth provider
	function isOAuthProvider(integration: any): boolean {
		const method = integration?.method?.toUpperCase();
		return method === "OAUTH2" || method === "OAUTH" || !method;
	}

	// Toggle integration expansion
	function toggleIntegrationExpansion(integration: any) {
		if (expandedIntegration.value?.id === integration.id) {
			expandedIntegration.value = null;
		} else {
			expandedIntegration.value = integration;
			// Initialize form
			integrationForm.clientId = "";
			integrationForm.clientSecret = "";
		}
	}

	// Cancel integration configuration
	function cancelIntegrationConfig() {
		expandedIntegration.value = null;
		// Reset form
		integrationForm.clientId = "";
		integrationForm.clientSecret = "";
	}

	// Check if form can be saved
	const canSave = computed(() => {
		if (!isOAuthProvider(expandedIntegration.value)) {
			return true; // Non-OAuth integrations can always be saved
		}
		// For OAuth, we can save without credentials (they can be added later)
		return true;
	});

	// Save and connect integration
	async function saveAndConnectIntegration(defaultIntegration: any) {
		if (!canSave.value || !selectedOrganisationId.value) {
			toast.add({
				title: "Error",
				description: "Please fill in all required fields and ensure an organization is selected",
				color: "error"
			});
			return;
		}

		try {
			saving.value = true;

			toast.add({
				title: "Creating Integration",
				description: `Creating ${defaultIntegration.name} integration...`,
				color: "info"
			});

			// Create a clean copy of integration defaults without unwanted fields
			const { id, createdAt, updatedAt, ...cleanDefaults } = defaultIntegration;

			// Merge form values with integration defaults
			const integrationData = {
				...cleanDefaults,
				organisationId: selectedOrganisationId.value,
				clientId: integrationForm.clientId || undefined,
				clientSecret: integrationForm.clientSecret || undefined
			};

			console.log("Creating integration with merged data:", integrationData);

			const createdIntegration = await buttClient.createIntegration(integrationData);

			console.log("✅ Integration created successfully:", createdIntegration);

			// Emit the created integration
			emit("integrationCreated", createdIntegration);

			toast.add({
				title: "Integration Created",
				description: `Successfully created ${defaultIntegration.name} integration!`,
				color: "success"
			});

			// If it's an OAuth integration, automatically start the OAuth flow
			if (isOAuthProvider(defaultIntegration) && createdIntegration.id) {
				toast.add({
					title: "Starting OAuth",
					description: "Opening OAuth authentication window...",
					color: "info"
				});

				// Wait a moment for the integration to be fully created
				await new Promise((resolve) => setTimeout(resolve, 500));

				// Start OAuth flow
				await initiateOAuthConnection(createdIntegration);
			}

			// Reset form and close expansion
			cancelIntegrationConfig();
		} catch (error: any) {
			console.error("Error creating integration:", error);
			toast.add({
				title: "Creation Failed",
				description: `Failed to create ${defaultIntegration.name} integration: ${error.message}`,
				color: "error"
			});
		} finally {
			saving.value = false;
		}
	}

	// Fetch integration defaults using listIntegrations method
	async function getAllIntegrationDefaults() {
		try {
			loading.value = true;
			error.value = null;

			const defaults = await buttClient.getAllIntegrationDefaults();

			if (Array.isArray(defaults)) {
				integrationDefaults.value = defaults;
			} else {
				console.warn("listIntegrations returned non-array:", defaults);
				integrationDefaults.value = [];
			}
		} catch (err) {
			console.error("Error fetching integration defaults:", err);
			error.value = "Failed to load available integrations. Please try again.";
			integrationDefaults.value = [];
		} finally {
			loading.value = false;
		}
	}

	// Initiate OAuth connection using centralized composable
	async function initiateOAuthConnection(integration: any) {
		if (!selectedOrganisationId.value) {
			toast.add({
				title: "Error",
				description: "No organization selected",
				color: "error"
			});
			return;
		}

		try {
			console.log("🔗 Starting OAuth connection for:", integration.name);

			// Use the centralized OAuth connection composable
			await initiateOAuth({
				integrationId: integration.id,
				integrationName: integration.name,
				organizationId: selectedOrganisationId.value,
				onSuccess: (updatedIntegration: any) => {
					console.log("✅ OAuth connection successful:", updatedIntegration);
				},
				onError: (error: Error) => {
					console.error("❌ OAuth connection failed:", error);
				},
				onClose: () => {
					console.log("🔒 OAuth window closed");
				}
			});
		} catch (err: any) {
			console.error("Error initiating OAuth connection:", err);
			toast.add({
				title: "OAuth Error",
				description: err.message || "Failed to initiate OAuth connection",
				color: "error"
			});
		}
	}

	onMounted(() => {
		getAllIntegrationDefaults();
	});
</script>

<style scoped>
/* Container */
.integration-setup-canvas {
	display: flex;
	flex-direction: column;
	gap: 1rem;
	padding: 1rem;
}

/* Header */
.setup-header {
	display: flex;
	align-items: center;
	gap: 1rem;
	padding: 1.25rem;
	background: rgba(255, 255, 255, 0.03);
	border: 1px solid rgba(255, 255, 255, 0.08);
	border-radius: 0.75rem;
}

.setup-icon {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 3rem;
	height: 3rem;
	background: rgba(var(--color-primary-rgb), 0.15);
	border: 1px solid rgba(var(--color-primary-rgb), 0.3);
	border-radius: 0.75rem;
	color: var(--color-primary);
	flex-shrink: 0;
}

.setup-text {
	flex: 1;
}

.setup-title {
	font-size: 1.125rem;
	font-weight: 600;
	color: rgba(255, 255, 255, 0.9);
	margin-bottom: 0.25rem;
}

.setup-description {
	font-size: 0.875rem;
	color: rgba(255, 255, 255, 0.6);
}

/* Toggle Button */
.toggle-button {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 0.75rem;
	width: 100%;
	padding: 0.875rem 1.25rem;
	background: rgba(var(--color-primary-rgb), 0.15);
	border: 1px solid rgba(var(--color-primary-rgb), 0.3);
	border-radius: 0.5rem;
	font-size: 0.875rem;
	font-weight: 600;
	color: var(--color-primary);
	cursor: pointer;
	transition: all 0.2s ease;
}

.toggle-button:hover:not(:disabled) {
	background: rgba(var(--color-primary-rgb), 0.25);
	border-color: rgba(var(--color-primary-rgb), 0.4);
	transform: translateY(-1px);
}

.toggle-button:disabled {
	opacity: 0.5;
	cursor: not-allowed;
}

.chevron-icon {
	transition: transform 0.3s ease;
	margin-left: auto;
}

.chevron-rotated {
	transform: rotate(180deg);
}

/* Integration List */
.integration-list {
	display: flex;
	flex-direction: column;
	gap: 0.75rem;
}

/* Integration Item */
.integration-item {
	background: rgba(255, 255, 255, 0.03);
	border: 1px solid rgba(255, 255, 255, 0.08);
	border-radius: 0.75rem;
	overflow: hidden;
	transition: all 0.2s ease;
}

.integration-item.item-expanded {
	border-color: rgba(var(--color-primary-rgb), 0.3);
	box-shadow: 0 0 20px rgba(var(--color-primary-rgb), 0.1);
}

/* Item Header */
.item-header {
	display: flex;
	align-items: center;
	gap: 1rem;
	width: 100%;
	padding: 1rem;
	background: transparent;
	border: none;
	cursor: pointer;
	transition: all 0.2s ease;
	text-align: left;
}

.item-header:hover {
	background: rgba(255, 255, 255, 0.05);
}

.item-icon-wrapper {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 2.5rem;
	height: 2.5rem;
	background: rgba(var(--color-primary-rgb), 0.1);
	border: 1px solid rgba(var(--color-primary-rgb), 0.2);
	border-radius: 0.5rem;
	flex-shrink: 0;
}

.item-icon {
	width: 1.5rem;
	height: 1.5rem;
	color: var(--color-primary);
}

.item-content {
	flex: 1;
	min-width: 0;
}

.item-title {
	font-size: 0.9375rem;
	font-weight: 600;
	color: rgba(255, 255, 255, 0.9);
	margin-bottom: 0.25rem;
}

.item-description {
	font-size: 0.8125rem;
	color: rgba(255, 255, 255, 0.6);
	line-height: 1.4;
}

/* Expanded Content */
.item-expanded-content {
	display: flex;
	flex-direction: column;
	gap: 1rem;
	padding: 0 1rem 1rem 1rem;
	border-top: 1px solid rgba(255, 255, 255, 0.08);
	margin-top: 1rem;
	padding-top: 1rem;
}

/* Info Cards */
.info-card {
	display: flex;
	gap: 0.875rem;
	padding: 1rem;
	border-radius: 0.5rem;
	border: 1px solid;
}

.info-card.success {
	background: rgba(16, 185, 129, 0.1);
	border-color: rgba(16, 185, 129, 0.3);
}

.info-card.info {
	background: rgba(59, 130, 246, 0.1);
	border-color: rgba(59, 130, 246, 0.3);
}

.info-icon {
	flex-shrink: 0;
	margin-top: 0.125rem;
}

.info-card.success .info-icon {
	color: rgb(16, 185, 129);
}

.info-card.info .info-icon {
	color: rgb(59, 130, 246);
}

.info-content {
	flex: 1;
}

.info-title {
	font-size: 0.875rem;
	font-weight: 600;
	color: rgba(255, 255, 255, 0.9);
	margin-bottom: 0.25rem;
}

.info-message {
	font-size: 0.8125rem;
	color: rgba(255, 255, 255, 0.7);
	line-height: 1.5;
	margin-bottom: 0.5rem;
}

/* OAuth Link */
.oauth-link {
	display: inline-flex;
	align-items: center;
	gap: 0.5rem;
	padding: 0.5rem 0.875rem;
	background: rgba(59, 130, 246, 0.15);
	border: 1px solid rgba(59, 130, 246, 0.3);
	border-radius: 0.375rem;
	font-size: 0.8125rem;
	font-weight: 600;
	color: rgb(59, 130, 246);
	text-decoration: none;
	transition: all 0.2s ease;
	margin-top: 0.5rem;
}

.oauth-link:hover {
	background: rgba(59, 130, 246, 0.25);
	border-color: rgba(59, 130, 246, 0.4);
	transform: translateY(-1px);
}

/* OAuth Section */
.oauth-section {
	display: flex;
	flex-direction: column;
	gap: 1rem;
}

/* Credentials Form */
.credentials-form {
	display: flex;
	flex-direction: column;
	gap: 0.875rem;
	padding: 1rem;
	background: rgba(255, 255, 255, 0.02);
	border: 1px solid rgba(255, 255, 255, 0.08);
	border-radius: 0.5rem;
}

.form-header {
	display: flex;
	align-items: center;
	gap: 0.5rem;
	margin-bottom: 0.5rem;
}

.form-title {
	font-size: 0.875rem;
	font-weight: 600;
	color: rgba(255, 255, 255, 0.8);
}

.form-field {
	display: flex;
	flex-direction: column;
	gap: 0.5rem;
}

.field-label {
	font-size: 0.8125rem;
	font-weight: 500;
	color: rgba(255, 255, 255, 0.7);
}

.field-input {
	padding: 0.625rem 0.875rem;
	background: rgba(255, 255, 255, 0.03);
	border: 1px solid rgba(255, 255, 255, 0.1);
	border-radius: 0.375rem;
	font-size: 0.875rem;
	color: rgba(255, 255, 255, 0.9);
	transition: all 0.2s ease;
}

.field-input:focus {
	outline: none;
	background: rgba(255, 255, 255, 0.05);
	border-color: rgba(var(--color-primary-rgb), 0.4);
}

.field-input::placeholder {
	color: rgba(255, 255, 255, 0.4);
}

/* Action Buttons */
.action-buttons {
	display: flex;
	gap: 0.75rem;
	margin-top: 0.5rem;
}

.action-btn {
	flex: 1;
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 0.5rem;
	padding: 0.75rem 1rem;
	border: 1px solid;
	border-radius: 0.5rem;
	font-size: 0.875rem;
	font-weight: 600;
	cursor: pointer;
	transition: all 0.2s ease;
}

.action-btn.secondary {
	background: rgba(255, 255, 255, 0.03);
	border-color: rgba(255, 255, 255, 0.1);
	color: rgba(255, 255, 255, 0.8);
}

.action-btn.secondary:hover {
	background: rgba(255, 255, 255, 0.06);
	border-color: rgba(255, 255, 255, 0.15);
}

.action-btn.primary {
	background: rgba(var(--color-primary-rgb), 0.15);
	border-color: rgba(var(--color-primary-rgb), 0.3);
	color: var(--color-primary);
}

.action-btn.primary:hover:not(:disabled) {
	background: rgba(var(--color-primary-rgb), 0.25);
	border-color: rgba(var(--color-primary-rgb), 0.4);
	transform: translateY(-1px);
}

.action-btn:disabled {
	opacity: 0.5;
	cursor: not-allowed;
	transform: none;
}

/* Error Card */
.error-card {
	display: flex;
	gap: 0.875rem;
	padding: 1rem;
	background: rgba(239, 68, 68, 0.1);
	border: 1px solid rgba(239, 68, 68, 0.3);
	border-radius: 0.5rem;
}

.error-icon {
	flex-shrink: 0;
	color: rgb(239, 68, 68);
	margin-top: 0.125rem;
}

.error-content {
	flex: 1;
}

.error-title {
	font-size: 0.875rem;
	font-weight: 600;
	color: rgba(255, 255, 255, 0.9);
	margin-bottom: 0.25rem;
}

.error-message {
	font-size: 0.8125rem;
	color: rgba(255, 255, 255, 0.7);
	line-height: 1.5;
}
</style>
