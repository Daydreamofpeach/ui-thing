<template>
	<div class="integration-detail-node-container node-container">
		<!-- Connection Handles -->
		<Handle id="left" type="target" :position="Position.Left" class="connection-handle" />
		<Handle id="right" type="source" :position="Position.Right" class="connection-handle" />

		<!-- Circular Icon Above Node -->
		<div class="node-icon-wrapper" :style="{ borderColor: themeColor }">
			<Icon :name="getIntegrationIcon(customNodeProps.data?.integrationType)" class="size-8" :style="{ color: themeColor }" />
		</div>

		<!-- Shared Header -->
		<NodeHeader
			:title="customNodeProps.data?.integrationName?.toUpperCase() || 'INTEGRATION'"
			:title-color="themeColor"
			:theme-color="themeColor"
			:transparent-background="true"
			:show-edit-button="false"
			:show-close-button="true"
			close-button-label="Delete integration detail node"
			@close="handleClose"
		/>

		<!-- Integration Details Panel -->
		<NodePanel
			panel-class="integration-detail-panel"
			:scrollbar-color="scrollbarColor"
		>
			<!-- Integration Info Card -->
			<div class="integration-info-card">
				<div class="integration-header">
					<div class="integration-icon-large" :style="iconStyle">
						<Icon :name="getIntegrationIcon(customNodeProps.data?.integrationType)" class="size-8" />
					</div>
					<div class="integration-info">
						<h3 class="integration-name-large">
							{{ customNodeProps.data?.integrationName || "Unknown Integration" }}
						</h3>
						<p v-if="customNodeProps.data?.description" class="integration-description-large">
							{{ customNodeProps.data.description }}
						</p>
					</div>
				</div>

				<!-- Status Badge -->
				<div class="status-section">
					<UBadge
						:color="customNodeProps.data?.connected ? 'success' : 'warning'"
						:label="customNodeProps.data?.connected ? 'Connected' : 'Setup Required'"
						size="sm"
					/>
				</div>

				<!-- Integration Details -->
				<div class="details-grid">
					<div class="detail-item">
						<span class="detail-label">Type</span>
						<span class="detail-value">{{ customNodeProps.data?.integrationType || "Unknown" }}</span>
					</div>
					<div v-if="customNodeProps.data?.method" class="detail-item">
						<span class="detail-label">Method</span>
						<span class="detail-value">{{ customNodeProps.data.method }}</span>
					</div>
					<div v-if="customNodeProps.data?.integrationId" class="detail-item">
						<span class="detail-label">Integration ID</span>
						<span class="detail-value detail-id">{{ customNodeProps.data.integrationId.slice(-8) }}</span>
					</div>
					<div v-if="customNodeProps.data?.clientId" class="detail-item">
						<span class="detail-label">Client ID</span>
						<span class="detail-value detail-id">{{ customNodeProps.data.clientId.slice(0, 16) }}...</span>
					</div>
				</div>
			</div>

			<!-- Connection Status -->
			<div v-if="customNodeProps.data?.connected" class="connection-status-section">
				<div class="status-indicator success">
					<UIcon name="i-lucide-check-circle" class="size-5" />
					<div class="status-text">
						<span class="status-title">Active & Ready</span>
						<span class="status-subtitle">Integration is connected and working</span>
					</div>
				</div>

				<!-- Re-authenticate Button -->
				<button
					class="oauth-button secondary"
					:disabled="isConnecting"
					@click="reconnectOAuth"
				>
					<UIcon name="i-lucide-refresh-cw" class="size-4" />
					<span>Re-authenticate</span>
				</button>
			</div>
			<div v-else class="connection-status-section">
				<div class="status-indicator warning">
					<UIcon name="i-lucide-alert-circle" class="size-5" />
					<div class="status-text">
						<span class="status-title">Setup Required</span>
						<span class="status-subtitle">Add credentials and complete OAuth to activate</span>
					</div>
				</div>

				<!-- OAuth Credentials Form -->
				<div v-if="isOAuthIntegration" class="credentials-form">
					<div class="form-header">
						<UIcon name="i-lucide-key" class="size-4 text-purple-400" />
						<span class="form-title">OAuth Credentials</span>
						<button
							v-if="!showCredentialsForm"
							class="edit-credentials-button"
							@click="showCredentialsForm = true"
						>
							<UIcon name="i-lucide-edit" class="size-3.5" />
							<span>{{ hasCredentials ? 'Edit' : 'Add' }}</span>
						</button>
					</div>

					<div v-if="showCredentialsForm" class="credentials-inputs">
						<div class="form-field">
							<label class="form-label">Client ID</label>
							<input
								v-model="credentials.clientId"
								type="text"
								class="form-input"
								placeholder="Enter OAuth Client ID"
								@click.stop
								@mousedown.stop
								@keydown.stop
							>
						</div>
						<div class="form-field">
							<label class="form-label">Client Secret</label>
							<input
								v-model="credentials.clientSecret"
								type="password"
								class="form-input"
								placeholder="Enter OAuth Client Secret"
								@click.stop
								@mousedown.stop
								@keydown.stop
							>
						</div>
						<div class="form-actions">
							<button
								class="oauth-button secondary"
								@click="cancelCredentialsEdit"
							>
								Cancel
							</button>
							<button
								class="oauth-button primary"
								:disabled="!canSaveCredentials || isSavingCredentials"
								@click="saveCredentials"
							>
								<UIcon
									v-if="isSavingCredentials"
									name="i-lucide-loader-2"
									class="size-4 animate-spin"
								/>
								<UIcon v-else name="i-lucide-save" class="size-4" />
								<span>{{ isSavingCredentials ? 'Saving...' : 'Save Credentials' }}</span>
							</button>
						</div>
					</div>
					<div v-else-if="hasCredentials" class="credentials-status">
						<UIcon name="i-lucide-check-circle-2" class="size-4 text-green-400" />
						<span class="text-sm text-white/70">Credentials configured</span>
					</div>
				</div>

				<!-- Complete OAuth Button -->
				<button
					v-if="hasCredentials || !isOAuthIntegration"
					class="oauth-button primary large"
					:disabled="isConnecting"
					@click="completeOAuthSetup"
				>
					<UIcon
						v-if="isConnecting"
						name="i-lucide-loader-2"
						class="size-5 animate-spin"
					/>
					<UIcon v-else name="i-lucide-log-in" class="size-5" />
					<span>{{ isConnecting ? 'Connecting...' : 'Complete OAuth Setup' }}</span>
				</button>
			</div>
		</NodePanel>
	</div>
</template>

<script setup lang="ts">
	import NodeHeader from "@canvas/shared/NodeHeader.vue";
	import NodePanel from "@canvas/shared/NodePanel.vue";
	import { buttClient } from "@utils/buttClient";
	import { Handle, Position } from "@vue-flow/core";
	import { computed, ref, watch } from "vue";
	import "./styles/nodeContainer.css";

	interface Props {
		customNodeProps: any
		updateNodeData: (nodeId: string, key: string, value: any) => void
	}

	const props = defineProps<Props>();

	const emit = defineEmits<{
		closeNode: [nodeId: string]
	}>();

	// Theme color (purple for integrations)
	const themeColor = computed(() => "#a855f7");
	const scrollbarColor = computed(() => themeColor.value);

	const customNodeProps = computed(() => props.customNodeProps || {});

	const iconStyle = computed(() => ({
		backgroundColor: "rgba(168, 85, 247, 0.2)",
		borderColor: "rgba(168, 85, 247, 0.4)",
		color: "#a855f7"
	}));

	// Get icon based on integration type
	const getIntegrationIcon = (type: string): string => {
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
	};

	// State for credentials management
	const showCredentialsForm = ref(false);
	const isSavingCredentials = ref(false);
	const isConnecting = ref(false);
	const credentials = ref({
		clientId: "",
		clientSecret: ""
	});

	// Load existing credentials if available
	watch(() => customNodeProps.value.data, (data) => {
		if (data?.clientId) {
			credentials.value.clientId = data.clientId;
		}
		if (data?.clientSecret) {
			credentials.value.clientSecret = data.clientSecret;
		}
	}, { immediate: true });

	// Check if integration is OAuth-based
	const isOAuthIntegration = computed(() => {
		const method = customNodeProps.value.data?.method?.toUpperCase();
		return method === "OAUTH2" || method === "OAUTH" || !method;
	});

	// Check if credentials are set
	const hasCredentials = computed(() => {
		return !!(customNodeProps.value.data?.clientId || credentials.value.clientId);
	});

	// Check if credentials can be saved
	const canSaveCredentials = computed(() => {
		return credentials.value.clientId.trim() !== "" && credentials.value.clientSecret.trim() !== "";
	});

	// Save credentials to the integration
	const saveCredentials = async () => {
		isSavingCredentials.value = true;
		try {
			const integrationId = customNodeProps.value.data?.integrationId;
			if (!integrationId) {
				console.error("❌ Error: Integration ID not found");
				throw new Error("Integration ID not found");
			}

			console.log("💾 Saving credentials for integration:", integrationId);
			console.log("📝 Credentials:", {
				clientId: `${credentials.value.clientId.substring(0, 10)}...`,
				clientSecretLength: credentials.value.clientSecret.length
			});

			// Update integration with credentials
			await buttClient.updateIntegration(integrationId, {
				clientId: credentials.value.clientId,
				clientSecret: credentials.value.clientSecret
			});

			// Update node data
			props.updateNodeData(customNodeProps.value.id, "clientId", credentials.value.clientId);
			props.updateNodeData(customNodeProps.value.id, "clientSecret", credentials.value.clientSecret);

			console.log("✅ Credentials saved successfully to API - You can now complete the OAuth setup.");

			// Hide form
			showCredentialsForm.value = false;
		} catch (error: any) {
			console.error("❌ Failed to save credentials:", error);
			const errorMessage = error.message || "Unknown error";
			console.error(`Failed to save credentials: ${errorMessage} - Please try again or check the console for details.`);
		} finally {
			isSavingCredentials.value = false;
		}
	};

	// Cancel credentials editing
	const cancelCredentialsEdit = () => {
		showCredentialsForm.value = false;
		// Reset to current values
		credentials.value.clientId = customNodeProps.value.data?.clientId || "";
		credentials.value.clientSecret = customNodeProps.value.data?.clientSecret || "";
	};

	// Complete OAuth setup (POPUP-BLOCKER-PROOF METHOD)
	const completeOAuthSetup = async () => {
		isConnecting.value = true;
		const integrationId = customNodeProps.value.data?.integrationId;
		const integrationName = customNodeProps.value.data?.integrationName || "Integration";

		if (!integrationId) {
			console.error("❌ Error: Integration ID not found");
			isConnecting.value = false;
			return;
		}

		// Check if OAuth integration has credentials
		if (isOAuthIntegration.value && !hasCredentials.value) {
			console.warn("⚠️ Please add OAuth credentials (Client ID & Secret) before connecting");
			showCredentialsForm.value = true;
			isConnecting.value = false;
			return;
		}

		try {
			console.log("🔗 Starting OAuth connection for:", integrationName);
			console.log("📝 Integration ID:", integrationId);

			// Get OAuth URL from API
			const connection = await buttClient.connect(integrationId, "false");
			const oauthUrl = connection.url;

			if (!oauthUrl) {
				throw new Error("No OAuth URL returned from API");
			}

			console.log("🌐 Opening OAuth URL:", oauthUrl);

			// Check if we're in Tauri environment
			if (typeof window !== "undefined" && (window as any).__TAURI__) {
				// Use Tauri's WebviewWindow API (NO TURNSTILE - OAuth window doesn't need auth)
				const { WebviewWindow } = await import("@tauri-apps/api/webviewWindow");

				const webviewId = `oauth-${integrationId}-${Date.now()}`;
				const webview = new WebviewWindow(webviewId, {
					url: oauthUrl,
					title: `Connect to ${integrationName}`,
					width: 600,
					height: 700,
					center: true,
					resizable: true,
					minimizable: false,
					maximizable: false,
					closable: true,
					alwaysOnTop: false
				});

				// Listen for window events
				webview.once("tauri://created", () => {
					console.log("✅ Tauri OAuth window created:", webviewId);
				});

				webview.once("tauri://error", (e: any) => {
					console.error("❌ Tauri OAuth window error:", e);
					isConnecting.value = false;
				});

				// Monitor window close using polling (Tauri doesn't have direct close event)
				const checkClosedInterval = setInterval(async () => {
					try {
						// Try to get window by label
						const checkWindow = WebviewWindow.getByLabel(webviewId);
						if (!checkWindow) {
							// Window no longer exists
							clearInterval(checkClosedInterval);
							console.log("🔄 OAuth window closed, user completed authentication");
							props.updateNodeData(customNodeProps.value.id, "connected", true);
							console.log(`✅ ${integrationName} authentication completed successfully!`);
							isConnecting.value = false;
						}
					} catch {
						// Window might not exist anymore
						clearInterval(checkClosedInterval);
						console.log("🔄 OAuth window closed, user completed authentication");
						props.updateNodeData(customNodeProps.value.id, "connected", true);
						console.log(`✅ ${integrationName} authentication completed successfully!`);
						isConnecting.value = false;
					}
				}, 1000);
			} else {
				// Browser fallback: Use window.open
				const authWindow = window.open(
					oauthUrl,
					"oauth-window",
					"width=600,height=700,scrollbars=yes,resizable=yes,toolbar=no,menubar=no,location=no,directories=no,status=no"
				);

				if (!authWindow) {
					throw new Error("Failed to open OAuth window. Please allow popups for this site.");
				}

				// Monitor window close
				const checkClosed = setInterval(() => {
					if (authWindow.closed) {
						clearInterval(checkClosed);
						console.log("🔄 OAuth window closed, user completed authentication");
						props.updateNodeData(customNodeProps.value.id, "connected", true);
						console.log(`✅ ${integrationName} authentication completed successfully!`);
						isConnecting.value = false;
					}
				}, 1000);
			}
		} catch (error: any) {
			console.error("❌ OAuth connection error:", error);
			isConnecting.value = false;
		}
	};

	// Re-authenticate OAuth
	const reconnectOAuth = async () => {
		await completeOAuthSetup();
	};

	const handleClose = () => {
		emit("closeNode", customNodeProps.value.id);
	};
</script>

<style scoped>
.integration-detail-node-container {
	min-width: 400px;
}

.integration-detail-panel {
	padding: 1rem;
	display: flex;
	flex-direction: column;
	gap: 1rem;
}

.integration-info-card {
	background: rgba(0, 0, 0, 0.4);
	border: 1px solid rgba(168, 85, 247, 0.3);
	border-radius: 0.75rem;
	padding: 1.25rem;
	display: flex;
	flex-direction: column;
	gap: 1rem;
}

.integration-header {
	display: flex;
	gap: 1rem;
}

.integration-icon-large {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 4rem;
	height: 4rem;
	border-radius: 0.75rem;
	border: 1px solid;
	flex-shrink: 0;
}

.integration-info {
	flex: 1;
	min-width: 0;
}

.integration-name-large {
	font-size: 1.125rem;
	font-weight: 600;
	color: rgba(255, 255, 255, 0.95);
	margin: 0 0 0.5rem 0;
	word-wrap: break-word;
}

.integration-description-large {
	font-size: 0.875rem;
	color: rgba(255, 255, 255, 0.7);
	line-height: 1.5;
	margin: 0;
}

.status-section {
	display: flex;
	gap: 0.5rem;
	flex-wrap: wrap;
}

.details-grid {
	display: grid;
	grid-template-columns: 1fr;
	gap: 0.75rem;
	padding-top: 0.75rem;
	border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.detail-item {
	display: flex;
	justify-content: space-between;
	align-items: flex-start;
	gap: 1rem;
}

.detail-label {
	font-size: 0.75rem;
	font-weight: 600;
	color: rgba(255, 255, 255, 0.6);
	text-transform: uppercase;
	letter-spacing: 0.05em;
}

.detail-value {
	font-size: 0.875rem;
	font-weight: 500;
	color: rgba(255, 255, 255, 0.9);
	text-align: right;
	word-break: break-word;
}

.detail-id {
	font-family: monospace;
	font-size: 0.75rem;
	color: rgba(168, 85, 247, 0.9);
}

.connection-status-section {
	background: rgba(0, 0, 0, 0.3);
	border: 1px solid rgba(168, 85, 247, 0.2);
	border-radius: 0.75rem;
	padding: 1rem;
}

.status-indicator {
	display: flex;
	align-items: flex-start;
	gap: 0.75rem;
}

.status-indicator.success {
	color: rgba(34, 197, 94, 0.9);
}

.status-indicator.warning {
	color: rgba(234, 179, 8, 0.9);
}

.status-text {
	display: flex;
	flex-direction: column;
	gap: 0.25rem;
	flex: 1;
}

.status-title {
	font-size: 0.875rem;
	font-weight: 600;
	color: currentColor;
}

.status-subtitle {
	font-size: 0.75rem;
	color: rgba(255, 255, 255, 0.6);
}

/* Credentials Form */
.credentials-form {
	margin-top: 1rem;
	padding: 1rem;
	background: rgba(0, 0, 0, 0.3);
	border: 1px solid rgba(168, 85, 247, 0.2);
	border-radius: 0.5rem;
}

.form-header {
	display: flex;
	align-items: center;
	gap: 0.5rem;
	margin-bottom: 1rem;
	color: rgba(255, 255, 255, 0.8);
}

.form-title {
	font-size: 0.875rem;
	font-weight: 600;
	flex: 1;
}

.edit-credentials-button {
	display: flex;
	align-items: center;
	gap: 0.375rem;
	padding: 0.375rem 0.75rem;
	background: rgba(168, 85, 247, 0.2);
	border: 1px solid rgba(168, 85, 247, 0.3);
	border-radius: 0.375rem;
	color: rgba(168, 85, 247, 0.95);
	font-size: 0.75rem;
	font-weight: 600;
	cursor: pointer;
	transition: all 0.2s ease;
}

.edit-credentials-button:hover {
	background: rgba(168, 85, 247, 0.3);
	border-color: rgba(168, 85, 247, 0.5);
}

.credentials-inputs {
	display: flex;
	flex-direction: column;
	gap: 0.75rem;
}

.form-field {
	display: flex;
	flex-direction: column;
	gap: 0.375rem;
}

.form-label {
	font-size: 0.75rem;
	font-weight: 600;
	color: rgba(255, 255, 255, 0.7);
	text-transform: uppercase;
	letter-spacing: 0.05em;
}

.form-input {
	width: 100%;
	padding: 0.625rem 0.875rem;
	background: rgba(0, 0, 0, 0.4);
	border: 1px solid rgba(168, 85, 247, 0.3);
	border-radius: 0.375rem;
	color: rgba(255, 255, 255, 0.9);
	font-size: 0.875rem;
	transition: all 0.2s ease;
}

.form-input::placeholder {
	color: rgba(255, 255, 255, 0.4);
}

.form-input:focus {
	outline: none;
	border-color: rgba(168, 85, 247, 0.6);
	background: rgba(0, 0, 0, 0.6);
	box-shadow: 0 0 0 3px rgba(168, 85, 247, 0.1);
}

.form-actions {
	display: flex;
	gap: 0.5rem;
	margin-top: 0.5rem;
}

.credentials-status {
	display: flex;
	align-items: center;
	gap: 0.5rem;
	padding: 0.75rem;
	background: rgba(34, 197, 94, 0.1);
	border: 1px solid rgba(34, 197, 94, 0.2);
	border-radius: 0.375rem;
}

/* OAuth Buttons */
.oauth-button {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 0.5rem;
	padding: 0.75rem 1rem;
	border-radius: 0.5rem;
	font-size: 0.875rem;
	font-weight: 600;
	cursor: pointer;
	transition: all 0.2s ease;
	border: 1px solid;
}

.oauth-button.primary {
	background: rgba(168, 85, 247, 0.2);
	border-color: rgba(168, 85, 247, 0.4);
	color: rgba(168, 85, 247, 0.95);
	flex: 1;
}

.oauth-button.primary:hover:not(:disabled) {
	background: rgba(168, 85, 247, 0.3);
	border-color: rgba(168, 85, 247, 0.6);
	transform: translateY(-2px);
	box-shadow: 0 4px 12px rgba(168, 85, 247, 0.3);
}

.oauth-button.primary.large {
	padding: 1rem 1.5rem;
	font-size: 0.9375rem;
	margin-top: 1rem;
	width: 100%;
}

.oauth-button.secondary {
	background: rgba(0, 0, 0, 0.3);
	border-color: rgba(255, 255, 255, 0.2);
	color: rgba(255, 255, 255, 0.8);
	flex: 1;
}

.oauth-button.secondary:hover:not(:disabled) {
	background: rgba(0, 0, 0, 0.5);
	border-color: rgba(255, 255, 255, 0.3);
	color: rgba(255, 255, 255, 0.95);
}

.oauth-button:disabled {
	opacity: 0.5;
	cursor: not-allowed;
}
</style>
