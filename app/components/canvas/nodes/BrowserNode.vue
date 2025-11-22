<template>
	<div class="enhanced-node browser-node">
		<!-- Connection Handles -->
		<Handle id="left" type="target" :position="Position.Left" class="connection-handle" />
		<Handle id="right" type="source" :position="Position.Right" class="connection-handle" />
		<Handle id="top" type="target" :position="Position.Top" class="connection-handle" />
		<Handle id="bottom" type="source" :position="Position.Bottom" class="connection-handle" />

		<!-- Custom Resizer -->
		<CustomNodeResizer
			:min-width="600"
			:min-height="500"
			:max-width="Infinity"
			:max-height="Infinity"
			:show-size-indicator="true"
			@resize="handleResize"
		/>

		<!-- Node Header -->
		<div class="node-header">
			<div class="flex items-center gap-2">
				<Icon name="lucide:globe" class="w-4 h-4 text-green-600" />
				<h3 class="text-sm font-semibold text-green-600">
					{{ customNodeProps.data?.label || 'Browser Node' }}
				</h3>
			</div>
			<div class="flex items-center gap-2">
				<div class="flex items-center gap-1">
					<div class="w-2 h-2 rounded-full" :class="getStatusColor(customNodeProps.data?.status)" />
					<span class="text-xs" :class="getStatusTextColor(customNodeProps.data?.status)">
						{{ getStatusText(customNodeProps.data?.status) }}
					</span>
				</div>
				<button
					class="close-node-btn"
					title="Close browser node"
					@click.stop="closeBrowserNode"
				>
					<Icon name="lucide:x" class="w-3 h-3" />
				</button>
			</div>
		</div>

		<!-- URL Input Section -->
		<div class="browser-url-section">
			<div class="url-input-container">
				<Icon name="lucide:link" class="url-icon" />
				<input
					:value="customNodeProps.data?.url || ''"
					type="url"
					placeholder="Enter URL (https://example.com)"
					class="url-input"
					@input="handleUrlInput"
					@keyup.enter="loadUrl"
				>
				<button
					class="load-url-button"
					:disabled="!customNodeProps.data?.url"
					@click="loadUrl"
				>
					<Icon name="lucide:arrow-right" class="w-4 h-4" />
				</button>
			</div>
			<div class="url-actions">
				<button
					class="action-button refresh-button"
					:disabled="!customNodeProps.data?.url"
					@click="refreshBrowser"
				>
					<Icon name="lucide:refresh-cw" class="w-3 h-3" />
					Refresh
				</button>
				<button
					class="action-button open-external-button"
					:disabled="!customNodeProps.data?.url"
					@click="openInExternalBrowser"
				>
					<Icon name="lucide:external-link" class="w-3 h-3" />
					Open External
				</button>
			</div>
		</div>

		<!-- Child Viewports Status -->
		<div v-if="childViewports.length > 0" class="child-viewports-status">
			<div class="status-content">
				<UIcon name="i-lucide-monitor-check" class="w-4 h-4 text-green-400" />
				<span class="status-text">
					{{ childViewports.length }} Connected Viewport{{ childViewports.length > 1 ? 's' : '' }}
				</span>
				<div class="status-indicator">
					<div class="pulse-dot" />
					<span class="status-label">Synced</span>
				</div>
			</div>
		</div>

		<!-- Automation Pipeline Status -->
		<div v-if="connectedHook || connectedTransport" class="automation-pipeline-status">
			<div class="pipeline-header">
				<UIcon name="i-lucide-zap" class="w-4 h-4 text-yellow-400" />
				<span class="pipeline-title">Automation Active</span>
			</div>
			<div class="pipeline-flow">
				<div v-if="connectedHook" class="pipeline-item hook-item">
					<UIcon name="i-lucide-webhook" class="w-3 h-3 text-cyan-400" />
					<span class="item-label">{{ connectedHook.data?.hookName || 'Hook' }}</span>
					<div class="item-status connected">
						<UIcon name="i-lucide-check-circle" class="w-3 h-3" />
					</div>
				</div>
				<UIcon v-if="connectedHook && connectedTransport" name="i-lucide-arrow-right" class="w-3 h-3 text-white/40" />
				<div v-if="connectedTransport" class="pipeline-item transport-item">
					<UIcon name="i-lucide-truck" class="w-3 h-3 text-teal-400" />
					<span class="item-label">{{ connectedTransport.data?.transportName || 'Transport' }}</span>
					<div class="item-status connected">
						<UIcon name="i-lucide-check-circle" class="w-3 h-3" />
					</div>
				</div>
			</div>
			<div v-if="isTriggeringHook" class="triggering-indicator">
				<UIcon name="i-lucide-loader-2" class="w-3 h-3 animate-spin text-yellow-400" />
				<span class="text-xs text-yellow-400">Processing submission...</span>
			</div>

			<!-- Save Configuration Button (when chain is fully configured) -->
			<div v-if="connectedHook && connectedTransport && !isTriggeringHook" class="save-config-section">
				<button
					class="save-config-button"
					@click="handleSaveConfiguration"
				>
					<UIcon name="i-lucide-save" class="w-4 h-4" />
					<span>Save Configuration as Template</span>
				</button>
			</div>
		</div>

		<!-- Device Size Presets - Spawn Viewports -->
		<div class="device-presets">
			<span class="presets-label">Spawn Viewports:</span>
			<div class="preset-buttons">
				<button
					class="preset-button spawn-button"
					:class="{ active: isViewportActive('mobile') }"
					:title="isViewportActive('mobile') ? 'Hide Mobile View' : 'Spawn Mobile View (375×667)'"
					@click="spawnViewport('mobile')"
				>
					<Icon name="lucide:smartphone" class="w-3 h-3" />
					<span>Mobile</span>
					<Icon
						:name="isViewportActive('mobile') ? 'i-lucide-check-circle' : 'i-lucide-plus-circle'"
						class="w-2 h-2 ml-1"
						:class="isViewportActive('mobile') ? 'text-green-400' : 'text-white/40'"
					/>
				</button>
				<button
					class="preset-button spawn-button"
					:class="{ active: isViewportActive('tablet') }"
					:title="isViewportActive('tablet') ? 'Hide Tablet View' : 'Spawn Tablet View (768×1024)'"
					@click="spawnViewport('tablet')"
				>
					<Icon name="lucide:tablet" class="w-3 h-3" />
					<span>Tablet</span>
					<Icon
						:name="isViewportActive('tablet') ? 'i-lucide-check-circle' : 'i-lucide-plus-circle'"
						class="w-2 h-2 ml-1"
						:class="isViewportActive('tablet') ? 'text-purple-400' : 'text-white/40'"
					/>
				</button>
				<button
					class="preset-button spawn-button"
					:class="{ active: isViewportActive('desktop') }"
					:title="isViewportActive('desktop') ? 'Hide Desktop View' : 'Spawn Desktop View (1920×1080)'"
					@click="spawnViewport('desktop')"
				>
					<Icon name="lucide:monitor" class="w-3 h-3" />
					<span>Desktop</span>
					<Icon
						:name="isViewportActive('desktop') ? 'i-lucide-check-circle' : 'i-lucide-plus-circle'"
						class="w-2 h-2 ml-1"
						:class="isViewportActive('desktop') ? 'text-green-400' : 'text-white/40'"
					/>
				</button>
				<button
					class="preset-button spawn-button"
					:class="{ active: isViewportActive('4k') }"
					:title="isViewportActive('4k') ? 'Hide 4K View' : 'Spawn 4K View (3840×2160)'"
					@click="spawnViewport('4k')"
				>
					<Icon name="lucide:tv" class="w-3 h-3" />
					<span>4K</span>
					<Icon
						:name="isViewportActive('4k') ? 'i-lucide-check-circle' : 'i-lucide-plus-circle'"
						class="w-2 h-2 ml-1"
						:class="isViewportActive('4k') ? 'text-orange-400' : 'text-white/40'"
					/>
				</button>
			</div>
		</div>

		<!-- Browser Content -->
		<div class="browser-content">
			<div v-if="!customNodeProps.data?.url" class="no-url-state">
				<Icon name="lucide:globe" class="w-12 h-12 text-gray-400 mb-4" />
				<h4 class="text-sm font-medium text-gray-300 mb-2">
					No URL Loaded
				</h4>
				<p class="text-xs text-gray-500">
					Enter a URL above to start browsing
				</p>
			</div>
			<div v-else class="browser-iframe-container">
				<div v-if="isLoading" class="loading-overlay">
					<div class="loading-spinner" />
					<span class="loading-text">Loading...</span>
				</div>
				<iframe
					v-if="customNodeProps.data?.url"
					ref="iframeRef"
					:src="shouldUseSrcdoc ? undefined : iframeSrc"
					:srcdoc="shouldUseSrcdoc ? htmlContentForSrcdoc : undefined"
					class="browser-iframe"
					sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
					@load="onIframeLoad"
					@error="onIframeError"
				/>
				<div v-else class="no-url-state">
					<Icon name="lucide:alert-circle" class="w-12 h-12 text-red-400 mb-4" />
					<h4 class="text-sm font-medium text-red-300 mb-2">
						No URL Found
					</h4>
					<p class="text-xs text-gray-500">
						Browser node data.url is missing or empty
					</p>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
	import { Handle, Position } from "@vue-flow/core";
	import { computed, onBeforeUnmount, onMounted, ref } from "vue";
	import CustomNodeResizer from "~/components/canvas/shared/CustomNodeResizer.vue";
	import { buttClient } from "~/utils/buttClient";
	import { localhostHtmlServer } from "~/utils/localhostHtmlServer";
	import { useHookTrigger } from "../composables/useHookTrigger";
	import Icon from "~/components/Ui/Icon.vue";
	import UIcon from "~/components/Ui/Icon.vue";

	interface Props {
		customNodeProps: any
		updateNodeData: (nodeId: string, key: string, value: any) => void
		activeViewportTypes?: string[]
		connectedHookNode?: any
		connectedTransportNode?: any
	}

	const props = withDefaults(defineProps<Props>(), {
		activeViewportTypes: () => [],
		connectedHookNode: undefined,
		connectedTransportNode: undefined
	});
	const emit = defineEmits<{
		spawnViewport: [viewportType: string, url: string, sourceNodeId: string, htmlContent?: string]
		urlChanged: [nodeId: string, url: string]
		refreshViewports: [nodeId: string]
		openExternalViewports: [nodeId: string]
		saveFormChainConfig: [browserNodeId: string, formTitle: string]
		closeNode: [nodeId: string]
	}>();

	const isLoading = ref(false);
	const currentPreset = ref<string | null>(null);
	const iframeRef = ref<HTMLIFrameElement | null>(null);

	// Computed property for child viewports from node data
	const childViewports = computed(() => props.customNodeProps.data?.childViewportIds || []);

	// Computed property to determine if we should use srcdoc instead of src
	const shouldUseSrcdoc = computed(() => {
		const url = props.customNodeProps.data?.url;
		const htmlContent = props.customNodeProps.data?.htmlContent;

		// Use srcdoc for data URLs and blob URLs when we have HTML content
		// This is more reliable in Tauri webviews
		if (htmlContent && url && (url.startsWith("data:") || url.startsWith("blob:"))) {
			console.log("📝 BrowserNode: Using srcdoc for iframe instead of src URL");
			return true;
		}

		return false;
	});

	// Computed property for HTML content to use in srcdoc
	const htmlContentForSrcdoc = computed(() => {
		if (!shouldUseSrcdoc.value) return "";
		return props.customNodeProps.data?.htmlContent || "";
	});

	// Computed property for iframe source URL with localhost handling
	const iframeSrc = computed(() => {
		const url = props.customNodeProps.data?.url;
		if (!url) return "";

		// Don't use src if we're using srcdoc
		if (shouldUseSrcdoc.value) {
			return "";
		}

		// For production builds, check if we need to convert to localhost
		if (typeof window !== "undefined" && (window as any).__TAURI__) {
			if (localhostHtmlServer.shouldUseLocalhost(url)) {
				const htmlContent = props.customNodeProps.data?.htmlContent;
				const convertedUrl = localhostHtmlServer.convertToLocalhostUrl(url, htmlContent);
				console.log("🌐 BrowserNode: Converted iframe URL to localhost:", { original: url, converted: convertedUrl });
				return convertedUrl;
			}
		}

		return url;
	});

	// Hook trigger composable
	const { processFormSubmission, isTriggeringHook } = useHookTrigger();

	// Computed properties for connected nodes (reactive)
	const connectedHook = computed(() => {
		console.log("🔄 BrowserNode: Computing connected hook...");
		console.log("  Props.connectedHookNode:", props.connectedHookNode);
		return props.connectedHookNode;
	});

	const connectedTransport = computed(() => {
		console.log("🔄 BrowserNode: Computing connected transport...");
		console.log("  Props.connectedTransportNode:", props.connectedTransportNode);
		return props.connectedTransportNode;
	});

	// Helper to check if a viewport type is currently active
	const isViewportActive = (viewportType: string) => {
		return props.activeViewportTypes?.includes(viewportType) || false;
	};

	// Device size presets with accurate dimensions
	const deviceSizes = {
		mobile: { width: 375, height: 667, label: "iPhone SE" },
		tablet: { width: 768, height: 1024, label: "iPad" },
		desktop: { width: 1920, height: 1080, label: "Full HD" },
		"4k": { width: 3840, height: 2160, label: "4K UHD" }
	};

	// Viewport types for compact navbar
	const _viewportTypes = [
		{ type: "mobile", label: "Mobile", width: 375, height: 667, icon: "lucide:smartphone" },
		{ type: "tablet", label: "Tablet", width: 768, height: 1024, icon: "lucide:tablet" },
		{ type: "desktop", label: "Desktop", width: 1920, height: 1080, icon: "lucide:monitor" },
		{ type: "4k", label: "4K", width: 3840, height: 2160, icon: "lucide:tv" }
	];

	// Extract the main form processing logic (defined early to avoid "used before defined" issues)
	const processFormSubmissionWithConfig = async (formData: any) => {
		// Check for submission chain configuration in node data first
		const submissionChain = props.customNodeProps.data?.submissionChain;
		let hookConfig = props.customNodeProps.data?.hookConfig;

		// PRODUCTION FIX: Ensure hook configuration is up-to-date before processing
		// This addresses timing issues where hook config might not be properly stored
		if (props.connectedHookNode?.data?.hookToken && (!hookConfig || !hookConfig.token)) {
			console.log("🔄 PRODUCTION FIX: Updating hook config from connected hook node");
			const updatedHookConfig = {
				id: props.connectedHookNode.data.hookId,
				name: props.connectedHookNode.data.hookName,
				type: props.connectedHookNode.data.hookType,
				token: props.connectedHookNode.data.hookToken,
				webhookUrl: props.connectedHookNode.data.webhookUrl,
				organisationId: props.connectedHookNode.data.organisationId,
				triggers: props.connectedHookNode.data.hookTriggers
			};
			props.updateNodeData(props.customNodeProps.id, "hookConfig", updatedHookConfig);
			// Use the updated config immediately
			hookConfig = updatedHookConfig;
			console.log("✅ Hook config updated from connected hook node before processing");
		}

		console.log("🔍 Checking submission chain configuration:");
		console.log("  Submission chain:", submissionChain);
		console.log("  Hook config:", hookConfig);
		console.log("  Connected hook (prop):", connectedHook.value);
		console.log("  Connected hook data:", connectedHook.value?.data);
		console.log("  All browser node data keys:", Object.keys(props.customNodeProps.data || {}));

		// Log all potential hook-related data
		console.log("🔍 Full hook debugging:");
		console.log("  props.customNodeProps.data.hookConfig:", props.customNodeProps.data?.hookConfig);
		console.log("  props.customNodeProps.data.submissionChain:", props.customNodeProps.data?.submissionChain);
		console.log("  props.connectedHookNode:", props.connectedHookNode);
		console.log("  props.connectedTransportNode:", props.connectedTransportNode);

		// Determine hook source (node data has priority over props)
		let effectiveHookConfig = null;
		let effectiveHookSource = "none";

		console.log("🔍 Evaluating hook configuration sources:");
		console.log("  1. hookConfig check:", { exists: !!hookConfig, hasToken: !!(hookConfig && hookConfig.token) });
		if (hookConfig) {
			console.log("     hookConfig details:", hookConfig);
		}

		console.log("  2. connectedHook check:", {
			exists: !!connectedHook.value,
			hasData: !!(connectedHook.value?.data),
			hasToken: !!(connectedHook.value?.data?.hookToken)
		});
		if (connectedHook.value?.data) {
			console.log("     connectedHook.data:", connectedHook.value.data);
		}

		console.log("  3. submissionChain check:", {
			exists: !!submissionChain,
			hasHookConfig: !!(submissionChain?.hookConfig),
			hasToken: !!(submissionChain?.hookConfig?.token)
		});
		if (submissionChain?.hookConfig) {
			console.log("     submissionChain.hookConfig:", submissionChain.hookConfig);
		}

		if (hookConfig && hookConfig.token) {
			// Hook config stored in node data (highest priority)
			effectiveHookConfig = hookConfig;
			effectiveHookSource = "node-data";
			console.log("✅ Using hook config from node data");
		} else if (connectedHook.value?.data?.hookToken) {
			// Connected hook via props (fallback)
			effectiveHookConfig = {
				id: connectedHook.value.data.hookId,
				name: connectedHook.value.data.hookName,
				type: connectedHook.value.data.hookType,
				token: connectedHook.value.data.hookToken,
				webhookUrl: connectedHook.value.data.webhookUrl,
				organisationId: connectedHook.value.data.organisationId,
				triggers: connectedHook.value.data.hookTriggers
			};
			effectiveHookSource = "connected-prop";
			console.log("✅ Using hook config from connected prop");
		} else if (submissionChain?.hookConfig?.token) {
			// Submission chain config (alternative source)
			effectiveHookConfig = submissionChain.hookConfig;
			effectiveHookSource = "submission-chain";
			console.log("✅ Using hook config from submission chain");
		} else {
			console.log("❌ No valid hook configuration found from any source");

			// FINAL FALLBACK: Try to get hook config from connected hook props and store it
			if (props.connectedHookNode?.data?.hookToken) {
				console.log("🔄 Final fallback: Getting hook config from connected hook props");
				const fallbackHookConfig = {
					id: props.connectedHookNode.data.hookId,
					name: props.connectedHookNode.data.hookName,
					type: props.connectedHookNode.data.hookType,
					token: props.connectedHookNode.data.hookToken,
					webhookUrl: props.connectedHookNode.data.webhookUrl,
					organisationId: props.connectedHookNode.data.organisationId,
					triggers: props.connectedHookNode.data.hookTriggers
				};

				// Store it in node data for future use
				props.updateNodeData(props.customNodeProps.id, "hookConfig", fallbackHookConfig);
				console.log("✅ Stored hook config from connected hook props in node data");

				effectiveHookConfig = fallbackHookConfig;
				effectiveHookSource = "connected-prop-fallback";
			}
		}

		// Check if we have a valid hook configuration
		if (!effectiveHookConfig || !effectiveHookConfig.token) {
			console.warn("⚠️ No hook configured for this form");
			console.log("🔍 Debug info:");
			console.log("  Browser node ID:", props.customNodeProps.id);
			console.log("  Browser node data:", props.customNodeProps.data);
			console.log("  Parent forms panel ID:", props.customNodeProps.data?.parentFormsPanelId);
			console.log("  Form submitted with data:", formData);
			console.log("  All browser node props:", props);
			console.log("  Checked sources: node data, connected prop, submission chain");
			console.log("  All sources were empty or invalid");

			// Show toast notification
			const { useToast } = await import("#ui/composables/useToast");
			const toast = useToast();
			toast.add({
				title: "Form Received But No Hook Configured",
				description: "Form was submitted but no hook is connected. Please connect a hook node to process submissions.",
				color: "warning"
			});

			// Log the form data anyway for debugging
			console.log("📋 Form data received (no hook to process):", formData);
			return;
		}

		console.log(`✅ Found valid hook configuration from ${effectiveHookSource}:`, effectiveHookConfig);

		// Trigger the hook with form data
		try {
			console.log("🪝 Triggering hook with form data...");
			console.log("  Hook ID:", effectiveHookConfig.id);
			console.log("  Hook name:", effectiveHookConfig.name);
			console.log("  Hook type:", effectiveHookConfig.type);
			console.log("  Hook token:", effectiveHookConfig.token ? "(present)" : "(missing)");
			console.log("  Form Data:", formData);

			// Get organisation ID, hook triggers, and transport config
			let organisationId: string | undefined;
			let hookTriggers: string[] | undefined;
			let transportConfig: { type?: string, target?: string, name?: string } | undefined;

			// Try to find the hook node to get additional config
			const connectedHookNode = connectedHook.value;
			let webhookUrl = effectiveHookConfig.webhookUrl || "";

			if (connectedHookNode) {
				organisationId = connectedHookNode.data?.organisationId;
				hookTriggers = connectedHookNode.data?.hookTriggers;

				// Try to get webhook URL from connected hook node data - check all possible locations
				console.log("🔍 Searching for webhook URL in hook node data...");
				console.log("  connectedHookNode.data.webhookUrl:", connectedHookNode.data?.webhookUrl);
				console.log("  connectedHookNode.data.hookWebhookUrl:", connectedHookNode.data?.hookWebhookUrl);
				console.log("  connectedHookNode.data.webhook:", connectedHookNode.data?.webhook);
				console.log("  connectedHookNode.data.hookData:", connectedHookNode.data?.hookData);
				console.log("  connectedHookNode.data.hookData?.webhookUrl:", connectedHookNode.data?.hookData?.webhookUrl);

				if (connectedHookNode.data?.webhookUrl && !webhookUrl) {
					webhookUrl = connectedHookNode.data.webhookUrl;
					console.log("✅ Found webhook URL from connectedHookNode.data.webhookUrl");
				} else if (connectedHookNode.data?.hookWebhookUrl && !webhookUrl) {
					webhookUrl = connectedHookNode.data.hookWebhookUrl;
					console.log("✅ Found webhook URL from connectedHookNode.data.hookWebhookUrl");
				} else if (connectedHookNode.data?.webhook && !webhookUrl) {
					webhookUrl = connectedHookNode.data.webhook;
					console.log("✅ Found webhook URL from connectedHookNode.data.webhook");
				} else if (connectedHookNode.data?.hookData?.webhookUrl && !webhookUrl) {
					webhookUrl = connectedHookNode.data.hookData.webhookUrl;
					console.log("✅ Found webhook URL from connectedHookNode.data.hookData.webhookUrl");
				}

				console.log("📋 Found hook node config:");
				console.log("  Organisation ID:", organisationId);
				console.log("  Triggers:", hookTriggers);
				console.log("  Webhook URL from hook node:", webhookUrl);
				console.log("  Full hook node data:", connectedHookNode.data);
			} else {
				// Fallback: try to get from effective hook config if it has the data
				if (effectiveHookConfig?.organisationId) {
					organisationId = effectiveHookConfig.organisationId;
					console.log("📋 Using organisation ID from hook config:", organisationId);
				}
				if (effectiveHookConfig?.triggers) {
					hookTriggers = effectiveHookConfig.triggers;
					console.log("📋 Using triggers from hook config:", hookTriggers);
				}
			}

			// Try to find connected transport node
			const connectedTransportNode = connectedTransport.value;
			if (connectedTransportNode) {
				transportConfig = {
					type: connectedTransportNode.data?.transportType,
					target: connectedTransportNode.data?.transportTarget,
					name: connectedTransportNode.data?.transportName
				};
				console.log("📋 Found transport config:");
				console.log("  Type:", transportConfig.type);
				console.log("  Target:", transportConfig.target);
				console.log("  Name:", transportConfig.name);
			} else {
				// Check if transport config is stored in browser node data
				transportConfig = props.customNodeProps.data?.transportConfig || props.customNodeProps.data?.submissionChain?.transportConfig;
				if (transportConfig) {
					console.log("📋 Found transport config from browser node data:", transportConfig);
				}
			}

			// Final fallback: Try to get webhook URL from submission chain
			if (!webhookUrl && props.customNodeProps.data?.submissionChain?.hookConfig?.webhookUrl) {
				webhookUrl = props.customNodeProps.data.submissionChain.hookConfig.webhookUrl;
				console.log("📋 Using webhook URL from submission chain:", webhookUrl);
			}

			// Additional debugging for effectiveHookConfig
			console.log("🔍 Debugging effectiveHookConfig:");
			console.log("  effectiveHookConfig:", effectiveHookConfig);
			console.log("  effectiveHookConfig.webhookUrl:", effectiveHookConfig?.webhookUrl);
			console.log("  effectiveHookConfig.id:", effectiveHookConfig?.id);

			// If we still don't have a webhook URL but we have a hook ID, try to fetch it
			if (!webhookUrl && effectiveHookConfig?.id) {
				console.log("🔧 No webhook URL found, attempting to fetch it from API...");
				console.log("  Hook ID:", effectiveHookConfig.id);

				try {
					const webhookUrlResponse = await buttClient.getWebhookUrl(effectiveHookConfig.id);
					if (webhookUrlResponse && webhookUrlResponse.url) {
						webhookUrl = webhookUrlResponse.url;
						console.log("✅ Successfully fetched webhook URL:", webhookUrl);

						// Store it in the connected hook node data for future use
						if (connectedHookNode) {
							props.updateNodeData(connectedHookNode.id, "webhookUrl", webhookUrl);
							console.log("✅ Stored webhook URL in hook node data for future use");
						}
					} else {
						console.warn("⚠️ getWebhookUrl returned empty response:", webhookUrlResponse);
					}
				} catch (error) {
					console.error("❌ Failed to fetch webhook URL:", error);
				}
			}

			console.log("🌐 Final webhook URL for submission:", webhookUrl);

			// Call processFormSubmission with full context including transport and webhook URL
			await processFormSubmission(
				formData,
				effectiveHookConfig.token,
				effectiveHookConfig.type || "BUTT",
				organisationId,
				hookTriggers,
				transportConfig,
				webhookUrl
			);

			// Update node data with submission status
			props.updateNodeData(props.customNodeProps.id, "lastSubmission", {
				timestamp: new Date().toISOString(),
				status: "success",
				data: formData,
				hookUsed: effectiveHookConfig.name,
				transportUsed: transportConfig?.name || transportConfig?.type
			});

			// Show success toast with specific message based on what was sent
			const { useToast } = await import("#ui/composables/useToast");
			const toast = useToast();

			// Determine what was sent
			const isContactForm = formData.Email && (formData.Subject || formData.Message);
			if (isContactForm && transportConfig) {
				toast.add({
					title: "Emails Sent Successfully! ✅",
					description: `Sent to support (${transportConfig.target || "support@builditbuilder.com"}) and confirmation to ${formData.Email}`,
					color: "success"
				});
			} else {
				toast.add({
					title: "Form Submitted Successfully! ✅",
					description: `Processed via ${effectiveHookConfig.name || "hook"}${transportConfig ? ` → ${transportConfig.name}` : ""}`,
					color: "success"
				});
			}

			console.log("✅ Form submission processed through hook and transport system");
		} catch (error) {
			console.error("❌ Error processing form submission:", error);

			// Update node data with error status
			props.updateNodeData(props.customNodeProps.id, "lastSubmission", {
				timestamp: new Date().toISOString(),
				status: "error",
				error: error instanceof Error ? error.message : "Unknown error"
			});

			// Show error toast
			const { useToast } = await import("#ui/composables/useToast");
			const toast = useToast();
			toast.add({
				title: "Submission Failed",
				description: error instanceof Error ? error.message : "Unknown error",
				color: "error"
			});
		}
	};

	// Shared form submission processing function (defined early to avoid "used before defined" issues)
	const handleFormSubmission = async (formData: any) => {
		console.log("🚀 Processing form submission (direct detection):", formData);
		console.log("📨 BrowserNode: Node data:", props.customNodeProps.data);

		// Use the same processing logic as handleIframeMessage
		await processFormSubmissionWithConfig(formData);
	};

	// Debounce tracking for form submissions
	const lastSubmissionTime = ref<number>(0);
	const lastSubmissionData = ref<string>("");
	const SUBMISSION_DEBOUNCE_MS = 2000; // 2 seconds

	// Handle messages from iframe (form submissions) - defined early to avoid "used before defined" issues
	const handleIframeMessage = async (event: MessageEvent) => {
		console.log("📨 BrowserNode: Message received from window:", event.data);
		console.log("  Message type:", event.data?.type);
		console.log("  Origin:", event.origin);
		console.log("  Using srcdoc:", shouldUseSrcdoc.value);
		console.log("  Current node ID:", props.customNodeProps.id);

		// Only process our custom form submission messages
		if (event.data?.type !== "BUILDIT_FORM_SUBMISSION") {
			console.log("  ℹ️ Ignoring - not a form submission message");
			return;
		}

		const { formData } = event.data;

		// Debounce duplicate submissions
		const now = Date.now();
		const dataHash = JSON.stringify(formData);

		if (
			lastSubmissionTime.value > 0
			&& now - lastSubmissionTime.value < SUBMISSION_DEBOUNCE_MS
			&& lastSubmissionData.value === dataHash
		) {
			console.warn("⚠️ DUPLICATE SUBMISSION BLOCKED - Same form data submitted within 2 seconds");
			console.log("  Time since last submission:", now - lastSubmissionTime.value, "ms");
			return;
		}

		console.log("🚀 BUILDIT_FORM_SUBMISSION message received - processing form submission!");
		console.log("📨 BrowserNode: ✅ Form submission message detected!");
		console.log("📨 BrowserNode: Received form submission from iframe:", event.data);

		// Update debounce tracking
		lastSubmissionTime.value = now;
		lastSubmissionData.value = dataHash;

		await processFormSubmissionWithConfig(formData);
	};

	// Inject form submission listener into iframe (defined early to avoid "used before defined" issues)
	const injectFormSubmissionListener = () => {
		try {
			if (!iframeRef.value || !iframeRef.value.contentWindow) {
				console.warn("⚠️ BrowserNode: Cannot inject - iframe not ready");
				return;
			}

			const iframe = iframeRef.value;
			const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;

			if (!iframeDoc) {
				console.warn("⚠️ BrowserNode: Cannot access iframe document (CORS restriction)");
				// For srcdoc content, the HTML already includes form submission handling
				if (shouldUseSrcdoc.value) {
					console.log("📝 BrowserNode: Using srcdoc - form submission handling is built into the HTML");
				}
				return;
			}

			console.log("📝 BrowserNode: Injecting form submission listener...");

			// Inject script to listen for form submissions
			const script = iframeDoc.createElement("script");
			script.textContent = `
				(function() {
					console.log("🔧 Form submission listener injected by Buildit");
					
					// Listen for all form submissions
					document.addEventListener('submit', function(event) {
						console.log("📋 Form submission detected!", event);
						event.preventDefault(); // Prevent default submission
						
						const form = event.target;
						const formData = new FormData(form);
						const formDataObject = {};
						
						// Convert FormData to plain object
						for (const [key, value] of formData.entries()) {
							formDataObject[key] = value;
						}
						
						console.log("📦 Form data captured:", formDataObject);
						
						// Send form data to parent window
						window.parent.postMessage({
							type: 'BUILDIT_FORM_SUBMISSION',
							formData: formDataObject,
							formAction: form.action || window.location.href,
							formMethod: form.method || 'POST'
						}, '*');
						
						console.log("✅ Form data sent to parent window");
					}, true);
					
					console.log("✅ Form submission listener active");
				})();
			`;

			iframeDoc.head.appendChild(script);
			console.log("✅ BrowserNode: Form submission listener injected successfully");
		} catch (error) {
			console.warn("⚠️ BrowserNode: Error injecting form listener (likely CORS):", error);
		}
	};

	// Debug logging for browser node data
	console.log("═══════════════════════════════════════════");
	console.log("🌐 BrowserNode mounted/updated");
	console.log("  Node ID:", props.customNodeProps.id);
	console.log("  URL:", `${props.customNodeProps.data?.url?.substring(0, 100)}...`);
	console.log("  URL type:", props.customNodeProps.data?.url?.startsWith("data:")
		? "DATA URL ✅"
		: props.customNodeProps.data?.url?.startsWith("blob:")
			? "BLOB URL ❌"
			: props.customNodeProps.data?.url?.startsWith("http") ? "HTTP URL" : "UNKNOWN");
	console.log("  Has htmlContent:", !!props.customNodeProps.data?.htmlContent, `(${props.customNodeProps.data?.htmlContent?.length || 0} chars)`);
	console.log("  Form Title:", props.customNodeProps.data?.formTitle);
	console.log("  Is Form Preview:", props.customNodeProps.data?.isFormPreview);
	console.log("═══════════════════════════════════════════");

	// URL input handler
	const handleUrlInput = (event: Event) => {
		const target = event.target as HTMLInputElement;
		const newUrl = target.value;
		console.log("🔍 BrowserNode: handleUrlInput called with:", newUrl);
		console.log("🔍 BrowserNode: Calling updateNodeData for node:", props.customNodeProps.id);
		props.updateNodeData(props.customNodeProps.id, "url", newUrl);

		// Propagate URL change to all child viewports
		emit("urlChanged", props.customNodeProps.id, newUrl);
	};

	// Load URL function
	const loadUrl = () => {
		const url = props.customNodeProps.data?.url;
		if (!url) return;

		// Validate URL format
		try {
			// Validate URL format
			const urlObj = new URL(url);
			console.log("✅ URL is valid:", urlObj.href);
			isLoading.value = true;
			props.updateNodeData(props.customNodeProps.id, "status", "loading");
			console.log("📡 BrowserNode: Loading URL:", url);

			// Propagate URL to all child viewports
			emit("urlChanged", props.customNodeProps.id, url);
		} catch {
			console.error("Invalid URL:", url);
			props.updateNodeData(props.customNodeProps.id, "status", "error");
		}
	};

	// Refresh browser
	const refreshBrowser = () => {
		const url = props.customNodeProps.data?.url;
		if (!url) return;

		isLoading.value = true;
		props.updateNodeData(props.customNodeProps.id, "status", "loading");
		console.log("🔄 BrowserNode: Refreshing browser and all child viewports");

		// Emit refresh event to all child viewports
		emit("refreshViewports", props.customNodeProps.id);

		// Force iframe reload by updating the URL with a timestamp
		const timestamp = Date.now();
		const refreshUrl = url.includes("?") ? `${url}&t=${timestamp}` : `${url}?t=${timestamp}`;
		props.updateNodeData(props.customNodeProps.id, "url", refreshUrl);

		// Also propagate the refreshed URL to children
		emit("urlChanged", props.customNodeProps.id, refreshUrl);
	};

	// Close browser node
	const closeBrowserNode = () => {
		console.log("❌ BrowserNode: Closing browser node");
		emit("closeNode", props.customNodeProps.id);
	};

	// Open in external browser
	const openInExternalBrowser = () => {
		const url = props.customNodeProps.data?.url;
		if (!url) return;

		console.log("🌐 BrowserNode: Opening in external browser (parent and all viewports)");

		// Emit to open in external for all child viewports
		emit("openExternalViewports", props.customNodeProps.id);

		// Use Tauri's shell API to open external browser
		if (typeof window !== "undefined" && (window as any).__TAURI__) {
			const { open } = (window as any).__TAURI__.shell;
			open(url);
		} else {
			// Fallback for web environment
			window.open(url, "_blank");
		}
	};

	// Setup iframe message listener (more reliable for srcdoc content)
	const setupIframeListener = () => {
		if (iframeRef.value && iframeRef.value.contentWindow) {
			try {
				iframeRef.value.contentWindow.addEventListener("message", handleIframeMessage);
				console.log("✅ BrowserNode: Message listener also attached to iframe contentWindow");
			} catch (e) {
				console.log("⚠️ Could not add listener to iframe contentWindow (likely CORS):", e);
			}
		}
	};

	// Tauri production form submission monitoring
	let formMonitoringInterval: any = null;

	const startFormMonitoring = () => {
		// Clear any existing monitoring
		if (formMonitoringInterval) {
			clearInterval(formMonitoringInterval);
		}

		// Set up polling to monitor for form submissions in production
		formMonitoringInterval = setInterval(() => {
			try {
				if (!iframeRef.value || !iframeRef.value.contentWindow) return;

				const iframe = iframeRef.value;
				const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;

				if (!iframeDoc) return;

				// Check for form submissions by looking for success messages or form state changes
				const successMessage = iframeDoc.querySelector("#success-message.show");
				const form = iframeDoc.querySelector(".buildit-form");
				const processedMarker = iframeDoc.querySelector("[data-buildit-processed]");
				const submittingMarker = iframeDoc.querySelector("[data-buildit-submitting]");

				// Multiple detection methods for Tauri production reliability
				const isFormSubmitted = (successMessage && form && !processedMarker)
					|| (form && submittingMarker && !processedMarker);

				if (isFormSubmitted) {
					console.log("🔍 Production poll detected form submission!", {
						viaSuccessMessage: !!successMessage,
						viaSubmittingMarker: !!submittingMarker
					});

					// Mark as processed to prevent duplicate processing
					form.setAttribute("data-buildit-processed", "true");

					// Extract form data
					const formData = new FormData(form as HTMLFormElement);
					const formDataObj = Object.fromEntries(formData.entries());

					// Process as if it came from postMessage
					handleFormSubmission(formDataObj);
				} else if (form && !processedMarker) { // Alternative detection: check for form submission buttons that have been clicked
					const submitButton = iframeDoc.querySelector(".buildit-form button[type=\"submit\"]");
					const submitInput = iframeDoc.querySelector(".buildit-form input[type=\"submit\"]");

					// Check if submit button was recently clicked (by checking for disabled state or success styling)
					const isRecentlySubmitted = (submitButton as HTMLButtonElement)?.disabled
						|| (submitButton as any)?.style?.opacity === "0.5"
						|| submitButton?.classList.contains("submitted")
						|| (submitInput as HTMLInputElement)?.disabled;

					if (isRecentlySubmitted) {
						console.log("🔍 Production poll detected form submission via button state!");

						// Mark as processed to prevent duplicate processing
						form.setAttribute("data-buildit-processed", "true");

						// Extract form data
						const formData = new FormData(form as HTMLFormElement);
						const formDataObj = Object.fromEntries(formData.entries());

						// Process as if it came from postMessage
						handleFormSubmission(formDataObj);
					}
				}
			} catch {
				// Silently handle CORS errors - this is expected for some iframes
			}
		}, 1000); // Check every second

		console.log("✅ Started production form monitoring for Tauri");
	};

	const stopFormMonitoring = () => {
		if (formMonitoringInterval) {
			clearInterval(formMonitoringInterval);
			formMonitoringInterval = null;
			console.log("🛑 Stopped production form monitoring");
		}
	};

	// Iframe event handlers
	const onIframeLoad = () => {
		isLoading.value = false;
		props.updateNodeData(props.customNodeProps.id, "status", "loaded");
		console.log("✅ BrowserNode: URL loaded successfully");
		console.log("  Using srcdoc:", shouldUseSrcdoc.value);
		console.log("  Message listener ready:", !!handleIframeMessage);

		// Set up iframe message listener when iframe loads
		setupIframeListener();

		// Inject form submission listener (fallback for non-srcdoc content)
		injectFormSubmissionListener();

		// Start production monitoring for Tauri compatibility
		setTimeout(() => {
			startFormMonitoring();
		}, 2000); // Wait 2 seconds for iframe to fully load
	};

	const onIframeError = () => {
		isLoading.value = false;
		props.updateNodeData(props.customNodeProps.id, "status", "error");
		console.error("❌ BrowserNode: URL load error");
	};

	// Set up message listener on mount
	onMounted(() => {
		console.log("═══════════════════════════════════════════");
		console.log("🎧 BrowserNode MOUNTED!");
		console.log("  Browser node ID:", props.customNodeProps.id);
		console.log("  Label:", props.customNodeProps.data?.label);
		console.log("  URL:", props.customNodeProps.data?.url);
		console.log("  Is form preview?:", props.customNodeProps.data?.isFormPreview);
		console.log("  Form ID:", props.customNodeProps.data?.formId);
		console.log("  Parent Forms Panel ID:", props.customNodeProps.data?.parentFormsPanelId);
		console.log("  Connected Hook (from props):", props.connectedHookNode);
		console.log("  Connected Transport (from props):", props.connectedTransportNode);
		console.log("═══════════════════════════════════════════");

		// Add listener to window
		window.addEventListener("message", handleIframeMessage);
		console.log("✅ BrowserNode: Message listener attached to window");

		// Set up iframe listener immediately if iframe is already loaded
		setupIframeListener();

		// Test that listener is working
		console.log("🧪 Testing message listener by sending test message...");
		window.postMessage({ type: "TEST_MESSAGE", test: true }, "*");
	});

	// Clean up message listener on unmount
	onBeforeUnmount(() => {
		window.removeEventListener("message", handleIframeMessage);
		stopFormMonitoring();
		console.log("🧹 BrowserNode: Removed message listener and stopped form monitoring");
	});

	// Status helper functions
	const getStatusColor = (status: string) => {
		switch (status) {
		case "loading": return "bg-yellow-500";
		case "loaded": return "bg-green-500";
		case "error": return "bg-red-500";
		default: return "bg-gray-500";
		}
	};

	const getStatusTextColor = (status: string) => {
		switch (status) {
		case "loading": return "text-yellow-500/70";
		case "loaded": return "text-green-500/70";
		case "error": return "text-red-500/70";
		default: return "text-gray-500/70";
		}
	};

	const getStatusText = (status: string) => {
		switch (status) {
		case "loading": return "Loading";
		case "loaded": return "Loaded";
		case "error": return "Error";
		default: return "Inactive";
		}
	};

	// Handle resize events from CustomNodeResizer
	const handleResize = (width: number, height: number) => {
		console.log("🔧 BrowserNode: Resized to", width, "×", height);
		// Update node data with new dimensions
		props.updateNodeData(props.customNodeProps.id, "width", width);
		props.updateNodeData(props.customNodeProps.id, "height", height);
		// Clear preset when manually resized
		currentPreset.value = null;
	};

	// Handle save configuration button click
	const handleSaveConfiguration = () => {
		console.log("═══════════════════════════════════════════");
		console.log("💾 SAVE CONFIGURATION BUTTON CLICKED");
		console.log("  Browser Node ID:", props.customNodeProps.id);
		console.log("  Form Title:", props.customNodeProps.data?.formTitle || "Unnamed Form");
		console.log("  Connected Hook:", connectedHook.value?.data?.hookName);
		console.log("  Connected Transport:", connectedTransport.value?.data?.transportName);
		console.log("═══════════════════════════════════════════");

		const formTitle = props.customNodeProps.data?.formTitle || "Unnamed Form";
		emit("saveFormChainConfig", props.customNodeProps.id, formTitle);

		console.log("✅ Emitted save-form-chain-config event");
	};

	// Apply device size preset
	// Toggle viewport - spawn or hide based on current state
	const spawnViewport = (device: keyof typeof deviceSizes) => {
		const url = props.customNodeProps.data?.url;
		const htmlContent = props.customNodeProps.data?.htmlContent;

		if (!url) {
			console.warn("⚠️ Cannot spawn viewport without URL");
			return;
		}

		// Emit toggle event - parent will check if viewport exists and toggle accordingly
		emit("spawnViewport", device, url, props.customNodeProps.id, htmlContent);

		console.log(`🔄 Toggled ${device} viewport with HTML content:`, htmlContent ? `${htmlContent.length} chars` : "none");
	};

	const _applyDeviceSize = (device: "mobile" | "tablet" | "desktop") => {
		const size = deviceSizes[device];
		console.log("📱 BrowserNode: Applying", device, "size:", size);

		// Find the actual node element - VueFlow wraps nodes with data-id attribute
		const nodeElement = document.querySelector(`[data-id="${props.customNodeProps.id}"]`) as HTMLElement;

		if (nodeElement) {
			// Apply size directly to the VueFlow node wrapper
			nodeElement.style.width = `${size.width}px`;
			nodeElement.style.height = `${size.height + 160}px`; // Add height for header, controls, and device bar

			console.log("✅ Applied size to node element:", size.width, "×", size.height + 160);
		} else {
			console.warn("⚠️ Could not find node element with ID:", props.customNodeProps.id);
		}

		// Update node data for persistence
		props.updateNodeData(props.customNodeProps.id, "width", size.width);
		props.updateNodeData(props.customNodeProps.id, "height", size.height + 160);

		// Set active preset
		currentPreset.value = device;
	};
</script>

<style scoped>
/* Browser Node Styles */
.browser-node {
	border-color: rgba(34, 197, 94, 0.3);
	min-width: 400px;
	min-height: 300px;
	display: flex;
	flex-direction: column;
	height: 100%;
	position: relative;
}

/* Keep connection handles accessible - only slightly dim on hover */
.browser-node:hover .connection-handle {
	opacity: 0.7;
	transition: opacity 0.15s ease;
}

.browser-node .connection-handle {
	transition: opacity 0.15s ease;
	z-index: 30;
}

.browser-node.selected {
	border-color: rgba(34, 197, 94, 0.6);
	box-shadow: 0 0 0 2px rgba(34, 197, 94, 0.2);
}

.browser-node .node-header {
	background: rgba(34, 197, 94, 0.1);
	border-color: rgba(34, 197, 94, 0.2);
}

.close-node-btn {
	width: 24px;
	height: 24px;
	display: flex;
	align-items: center;
	justify-content: center;
	background: rgba(239, 68, 68, 0.15);
	border: 1px solid rgba(239, 68, 68, 0.3);
	border-radius: 5px;
	color: rgba(239, 68, 68, 1);
	cursor: pointer;
	transition: all 0.2s ease;
}

.close-node-btn:hover {
	background: rgba(239, 68, 68, 0.25);
	border-color: rgba(239, 68, 68, 0.5);
	transform: scale(1.1);
}

.close-node-btn:active {
	transform: scale(0.95);
}

/* Browser URL Section */
.browser-url-section {
	margin-bottom: 12px;
	padding: 8px;
	background: rgba(34, 197, 94, 0.05);
	border: 1px solid rgba(34, 197, 94, 0.1);
	border-radius: 8px;
}

.url-input-container {
	display: flex;
	align-items: center;
	gap: 8px;
	margin-bottom: 8px;
}

.url-icon {
	width: 16px;
	height: 16px;
	color: rgba(34, 197, 94, 0.7);
	flex-shrink: 0;
}

.url-input {
	flex: 1;
	padding: 6px 8px;
	background: rgba(0, 0, 0, 0.2);
	border: 1px solid rgba(34, 197, 94, 0.3);
	border-radius: 4px;
	color: white;
	font-size: 12px;
	transition: all 0.2s ease;
}

.url-input:focus {
	outline: none;
	border-color: rgba(34, 197, 94, 0.5);
	background: rgba(0, 0, 0, 0.3);
}

.url-input::placeholder {
	color: rgba(255, 255, 255, 0.4);
}

.load-url-button {
	padding: 6px 8px;
	background: rgba(34, 197, 94, 0.2);
	border: 1px solid rgba(34, 197, 94, 0.3);
	border-radius: 4px;
	color: rgba(34, 197, 94, 0.8);
	cursor: pointer;
	transition: all 0.2s ease;
	display: flex;
	align-items: center;
	justify-content: center;
}

.load-url-button:hover:not(:disabled) {
	background: rgba(34, 197, 94, 0.3);
	border-color: rgba(34, 197, 94, 0.5);
	color: rgba(34, 197, 94, 1);
}

.load-url-button:disabled {
	opacity: 0.5;
	cursor: not-allowed;
}

.url-actions {
	display: flex;
	gap: 6px;
}

.action-button {
	padding: 4px 8px;
	background: rgba(0, 0, 0, 0.2);
	border: 1px solid rgba(34, 197, 94, 0.2);
	border-radius: 4px;
	color: rgba(255, 255, 255, 0.6);
	font-size: 11px;
	cursor: pointer;
	transition: all 0.2s ease;
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 4px;
}

.action-button:hover:not(:disabled) {
	background: rgba(34, 197, 94, 0.1);
	border-color: rgba(34, 197, 94, 0.3);
	color: rgba(255, 255, 255, 0.8);
}

.action-button:disabled {
	opacity: 0.5;
	cursor: not-allowed;
}

/* Child Viewports Status */
.child-viewports-status {
	padding: 10px 14px;
	background: linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(16, 185, 129, 0.05));
	border-top: 1px solid rgba(34, 197, 94, 0.3);
	border-bottom: 1px solid rgba(34, 197, 94, 0.3);
}

.status-content {
	display: flex;
	align-items: center;
	gap: 10px;
}

.status-text {
	font-size: 0.875rem;
	font-weight: 600;
	color: rgba(255, 255, 255, 0.95);
}

.status-indicator {
	display: flex;
	align-items: center;
	gap: 6px;
	margin-left: auto;
	padding: 4px 10px;
	background: rgba(34, 197, 94, 0.15);
	border: 1px solid rgba(34, 197, 94, 0.3);
	border-radius: 12px;
}

.pulse-dot {
	width: 8px;
	height: 8px;
	background: rgba(34, 197, 94, 1);
	border-radius: 50%;
	animation: pulse 2s infinite;
	box-shadow: 0 0 8px rgba(34, 197, 94, 0.6);
}

@keyframes pulse {
	0%, 100% {
		opacity: 1;
		transform: scale(1);
	}
	50% {
		opacity: 0.6;
		transform: scale(1.2);
	}
}

.status-label {
	font-size: 0.75rem;
	font-weight: 600;
	color: rgba(34, 197, 94, 1);
	text-transform: uppercase;
	letter-spacing: 0.5px;
}

/* Device Size Presets */
.device-presets {
	display: flex;
	align-items: center;
	gap: 12px;
	padding: 8px 12px;
	background: rgba(0, 0, 0, 0.3);
	border-top: 1px solid rgba(34, 197, 94, 0.2);
	border-bottom: 1px solid rgba(34, 197, 94, 0.2);
}

.presets-label {
	font-size: 11px;
	font-weight: 600;
	color: rgba(255, 255, 255, 0.6);
	text-transform: uppercase;
	letter-spacing: 0.5px;
}

.preset-buttons {
	display: flex;
	gap: 6px;
	flex: 1;
}

.preset-button {
	flex: 1;
	padding: 6px 10px;
	background: rgba(0, 0, 0, 0.2);
	border: 1px solid rgba(34, 197, 94, 0.2);
	border-radius: 6px;
	color: rgba(255, 255, 255, 0.6);
	cursor: pointer;
	transition: all 0.2s ease;
	font-size: 11px;
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 6px;
	font-weight: 500;
}

.preset-button:hover {
	background: rgba(34, 197, 94, 0.1);
	border-color: rgba(34, 197, 94, 0.4);
	color: rgba(34, 197, 94, 0.8);
	transform: translateY(-1px);
}

.preset-button.active {
	background: rgba(34, 197, 94, 0.15);
	border-color: rgba(34, 197, 94, 0.5);
	color: rgba(34, 197, 94, 1);
	box-shadow: 0 0 8px rgba(34, 197, 94, 0.3);
}

.preset-button.active:hover {
	background: rgba(239, 68, 68, 0.15);
	border-color: rgba(239, 68, 68, 0.5);
	color: rgba(239, 68, 68, 1);
}

/* Browser Content */
.browser-content {
	height: 100%;
	min-height: 200px;
	position: relative;
	flex: 1;
	pointer-events: auto;
}

.no-url-state {
	height: 100%;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	text-align: center;
}

.browser-iframe-container {
	height: 100%;
	width: 100%;
	border-radius: 4px;
	overflow: hidden;
	position: relative;
	pointer-events: auto;
}

.browser-iframe {
	width: 100%;
	height: 100%;
	border: none;
	background: white;
	pointer-events: auto;
	z-index: 1;
}

.loading-overlay {
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: rgba(0, 0, 0, 0.8);
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	gap: 12px;
	z-index: 10;
}

.loading-spinner {
	width: 24px;
	height: 24px;
	border: 2px solid rgba(34, 197, 94, 0.3);
	border-top: 2px solid rgba(34, 197, 94, 1);
	border-radius: 50%;
	animation: spin 1s linear infinite;
}

.loading-text {
	color: rgba(255, 255, 255, 0.8);
	font-size: 12px;
}

@keyframes spin {
	0% { transform: rotate(0deg); }
	100% { transform: rotate(360deg); }
}

/* Automation Pipeline Status */
.automation-pipeline-status {
	padding: 12px 14px;
	background: linear-gradient(135deg, rgba(234, 179, 8, 0.1), rgba(234, 179, 8, 0.05));
	border-top: 1px solid rgba(234, 179, 8, 0.3);
	border-bottom: 1px solid rgba(234, 179, 8, 0.3);
	margin-top: 8px;
}

.pipeline-header {
	display: flex;
	align-items: center;
	gap: 8px;
	margin-bottom: 10px;
}

.pipeline-title {
	font-size: 0.875rem;
	font-weight: 700;
	color: rgba(234, 179, 8, 1);
	text-transform: uppercase;
	letter-spacing: 0.5px;
}

.pipeline-flow {
	display: flex;
	align-items: center;
	gap: 8px;
	flex-wrap: wrap;
}

.pipeline-item {
	display: flex;
	align-items: center;
	gap: 6px;
	padding: 6px 10px;
	background: rgba(0, 0, 0, 0.3);
	border-radius: 8px;
	border: 1px solid;
}

.pipeline-item.hook-item {
	border-color: rgba(6, 182, 212, 0.4);
	background: rgba(6, 182, 212, 0.1);
}

.pipeline-item.transport-item {
	border-color: rgba(20, 184, 166, 0.4);
	background: rgba(20, 184, 166, 0.1);
}

.item-label {
	font-size: 0.75rem;
	font-weight: 600;
	color: rgba(255, 255, 255, 0.9);
}

.item-status.connected {
	display: flex;
	align-items: center;
	color: rgba(34, 197, 94, 1);
}

.triggering-indicator {
	display: flex;
	align-items: center;
	gap: 8px;
	margin-top: 8px;
	padding: 8px 10px;
	background: rgba(234, 179, 8, 0.15);
	border: 1px solid rgba(234, 179, 8, 0.3);
	border-radius: 8px;
}

/* Save Configuration Section */
.save-config-section {
	margin-top: 12px;
	padding-top: 12px;
	border-top: 1px solid rgba(234, 179, 8, 0.2);
}

.save-config-button {
	width: 100%;
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 8px;
	padding: 10px 16px;
	background: linear-gradient(135deg, rgba(168, 85, 247, 0.2), rgba(139, 92, 246, 0.2));
	border: 1px solid rgba(168, 85, 247, 0.4);
	border-radius: 8px;
	color: rgba(255, 255, 255, 0.9);
	font-size: 0.875rem;
	font-weight: 600;
	cursor: pointer;
	transition: all 0.2s ease;
}

.save-config-button:hover {
	background: linear-gradient(135deg, rgba(168, 85, 247, 0.3), rgba(139, 92, 246, 0.3));
	border-color: rgba(168, 85, 247, 0.6);
	transform: translateY(-1px);
	box-shadow: 0 4px 12px rgba(168, 85, 247, 0.3);
}

.save-config-button:active {
	transform: translateY(0);
}
</style>
