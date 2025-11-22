<template>
	<div class="hook-node-container node-container">
		<!-- Connection Handles -->
		<Handle id="left" type="target" :position="Position.Left" class="connection-handle" />
		<Handle id="right" type="source" :position="Position.Right" class="connection-handle" />

		<!-- Circular Icon Above Node -->
		<div class="node-icon-wrapper">
			<Icon name="i-lucide-webhook" class="w-8 h-8 text-primary" />
		</div>

		<!-- Shared Header -->
		<NodeHeader
			title="HOOK"
			title-color="var(--color-primary)"
			theme-color="var(--color-primary)"
			:transparent-background="true"
			:show-edit-button="false"
			:show-close-button="true"
			close-button-label="Delete hook node"
			@close="handleClose"
		/>

		<!-- Hook Selection/Configuration -->
		<NodePanel
			v-if="!customNodeProps.data?.hookId"
			panel-class="hook-config-container p-4 space-y-4"
			scrollbar-color="rgba(var(--color-primary-rgb), 0.4)"
		>
			<!-- Mode Selection -->
			<ModeSelector
				v-model="hookMode"
				active-color="var(--color-primary-rgb)"
			/>

			<!-- Select Existing Hook -->
			<RecordSelector
				v-if="hookMode === 'select'"
				:records="availableHooks"
				:is-loading="isLoadingHooks"
				:selected-id="selectedHookId"
				record-type-singular="hook"
				record-type-plural="hooks"
				header-title="Available Hooks"
				header-icon="i-lucide-database"
				item-icon="i-lucide-webhook"
				icon-class="text-primary"
				theme-color="var(--color-primary-rgb)"
				:show-meta="false"
				@select="selectHook"
				@attach="attachSelectedHook"
			>
				<template #empty-state>
					<div class="flex flex-col items-center justify-center p-6 text-center space-y-2">
						<Icon name="i-lucide-inbox" class="w-8 h-8 text-muted-foreground/30" />
						<p class="text-sm text-muted-foreground">
							No hooks available
						</p>
						<p class="text-xs text-muted-foreground/60">
							Check console for hook loading details
						</p>
						<UiBadge variant="outline" size="sm" class="mt-2">
							Available hooks: {{ props.availableHooks?.length || 0 }}
						</UiBadge>
						<p class="text-xs text-muted-foreground/60">
							Switch to "Create New" to add a hook
						</p>
					</div>
				</template>
			</RecordSelector>

			<!-- Create New Hook Form -->
			<HookForm
				v-else-if="hookMode === 'create'"
				mode="create"
				:hook-data="{
					name: customNodeProps.data?.hookName,
					description: customNodeProps.data?.hookDescription,
					listeners: customNodeProps.data?.listeners || []
				}"
				:is-loading="isCreating"
				@update-field="(key, value) => updateNodeData(customNodeProps.id, `hook${key.charAt(0).toUpperCase() + key.slice(1)}`, value)"
				@add-listener="addListener"
				@remove-listener="removeListener"
				@update-listener="updateListener"
				@submit="createHookFromNode"
			/>
		</NodePanel>

		<!-- Hook Status Display (Edit Mode) -->
		<NodePanel
			v-else
			panel-class="hook-status-display p-4"
			scrollbar-color="rgba(var(--color-primary-rgb), 0.4)"
		>
			<HookForm
				mode="edit"
				:hook-data="{
					name: customNodeProps.data?.hookName,
					type: customNodeProps.data?.hookType,
					token: customNodeProps.data?.hookToken,
					trigger: customNodeProps.data?.hookTriggers?.[0],
					listeners: customNodeProps.data?.listeners || []
				}"
				@add-listener="addListener"
				@remove-listener="removeListener"
				@update-listener="updateListener"
				@change-hook="changeHookSelection"
				@resubscribe="resubscribeAllListeners"
				@delete="deleteHookFromNode"
			/>
		</NodePanel>
	</div>
</template>

<script lang="ts" setup>
	import ModeSelector from "@canvas/shared/ModeSelector.vue";
	import NodeHeader from "@canvas/shared/NodeHeader.vue";
	import NodePanel from "@canvas/shared/NodePanel.vue";
	import RecordSelector from "@canvas/shared/RecordSelector.vue";
	import { buttClient } from "@utils/buttClient";
	import { Handle, Position } from "@vue-flow/core";
	import { computed, onMounted, ref, watch } from "vue";
	import { useHookNodeManagement } from "../../composables/useHookNodeManagement";
	import HookForm from "./HookForm.vue";
	import Icon from "~/components/Ui/Icon.vue";
	import UiBadge from "~/components/Ui/Badge.vue";
	import "../styles/nodeContainer.css";

	interface Props {
		customNodeProps: any
		updateNodeData: (nodeId: string, key: string, value: any) => void
		organisationId: string
		availableHooks?: any[]
	}

	const props = withDefaults(defineProps<Props>(), {
		availableHooks: () => []
	});

	const emit = defineEmits<{
		closeNode: [nodeId: string]
		hookAttached: [hookData: any, nodeId: string]
		createTransportListener: [hookNodeId: string, listenerIndex: number]
		removeTransportListener: [hookNodeId: string, listenerIndex: number, transportNodeId: string]
	}>();

	const { isCreating, createHookFromNodeData } = useHookNodeManagement();

	// Hook selection state
	const hookMode = ref<"select" | "create">("select");
	const selectedHookId = ref<string | null>(null);

	// Use hooks from props (loaded in NodeCanvasRightPanel)
	const availableHooks = computed(() => {
		console.log("🪝 HookNode: Using available hooks from props:", props.availableHooks?.length);
		return props.availableHooks || [];
	});

	const isLoadingHooks = computed(() => false); // No loading needed, using props

	// Watch for hooks changes to debug loading
	watch(() => props.availableHooks, (newHooks) => {
		console.log("🔄 HookNode: availableHooks changed!");
		console.log("  New hooks count:", newHooks?.length);
		console.log("  Hooks:", newHooks);
	}, { immediate: true, deep: true });

	// Auto-populate fields based on connected form
	onMounted(() => {
		console.log("🪝 HookNode mounted! Organisation ID:", props.organisationId);
		console.log("🪝 Node data:", props.customNodeProps.data);
		console.log("🪝 Available hooks from props:", availableHooks.value.length);
		console.log("🪝 Hooks:", availableHooks.value);

		// Smart defaults for hook creation
		if (!props.customNodeProps.data?.hookId && hookMode.value === "create") {
			// Check if this is attached to a form
			const _connectedFormId = props.customNodeProps.data?.connectedFormId;
			const formTitle = props.customNodeProps.data?.formTitle?.toLowerCase() || "";

			// Auto-detect form type
			const isContactForm = formTitle.includes("contact")
				|| formTitle.includes("support")
				|| formTitle.includes("feedback");

			if (isContactForm) {
				console.log("📋 Auto-detected contact form - setting defaults");

				// Set intelligent defaults
				if (!props.customNodeProps.data?.hookName) {
					props.updateNodeData(props.customNodeProps.id, "hookName", `${formTitle.charAt(0).toUpperCase() + formTitle.slice(1)} Hook`);
				}
				if (!props.customNodeProps.data?.hookDescription) {
					props.updateNodeData(props.customNodeProps.id, "hookDescription", "Captures form submissions and triggers actions");
				}

				// Auto-add form.submitted trigger if not already present
				const existingTriggers = props.customNodeProps.data?.hookTriggers || [];
				if (!existingTriggers.includes("form.submitted")) {
					console.log("✅ Auto-adding 'form.submitted' trigger");
					props.updateNodeData(props.customNodeProps.id, "hookTriggers", ["form.submitted"]);
				}
			}
		}
	});

	// Select a hook
	const selectHook = (hook: any) => {
		selectedHookId.value = hook.id;
		console.log("🪝 Selected hook:", hook.name);
	};

	// Attach selected hook to form
	const attachSelectedHook = async (selectedHook: any) => {
		if (!selectedHook) return;

		console.log("═══════════════════════════════════════════");
		console.log("🪝 ATTACHING SELECTED HOOK TO FORM");
		console.log("  Selected hook:", selectedHook);
		console.log("  Hook ID:", selectedHook.id);
		console.log("  Hook Name:", selectedHook.name);
		console.log("  Hook Type:", selectedHook.type);
		console.log("  Hook Token:", selectedHook.token);
		console.log("  Hook Triggers:", selectedHook.trigger);
		console.log("  Organisation ID:", selectedHook.organisationId);
		console.log("═══════════════════════════════════════════");

		// Update node data with selected hook INCLUDING triggers and organisation ID
		props.updateNodeData(props.customNodeProps.id, "hookId", selectedHook.id);
		props.updateNodeData(props.customNodeProps.id, "hookName", selectedHook.name || selectedHook.type);
		props.updateNodeData(props.customNodeProps.id, "hookType", selectedHook.type);
		props.updateNodeData(props.customNodeProps.id, "hookToken", selectedHook.token);
		props.updateNodeData(props.customNodeProps.id, "hookTriggers", selectedHook.trigger || []);
		props.updateNodeData(props.customNodeProps.id, "organisationId", selectedHook.organisationId || props.organisationId);
		props.updateNodeData(props.customNodeProps.id, "status", "configured");

		console.log("📝 Node data updated with full hook config, now fetching webhook URL...");

		// Fetch webhook URL from API
		try {
			const webhookUrlResponse = await buttClient.getWebhookUrl(selectedHook.id);
			const webhookUrl = webhookUrlResponse.url;
			console.log("✅ Webhook URL fetched:", webhookUrl);
			props.updateNodeData(props.customNodeProps.id, "webhookUrl", webhookUrl);
		} catch (error) {
			console.error("❌ Failed to fetch webhook URL:", error);
		}

		// Emit hook attached event to trigger transport node creation with complete data
		const hookDataToEmit = {
			id: selectedHook.id,
			name: selectedHook.name || selectedHook.type,
			type: selectedHook.type,
			token: selectedHook.token,
			triggers: selectedHook.trigger || [],
			organisationId: selectedHook.organisationId || props.organisationId,
			webhookUrl: props.customNodeProps.data?.webhookUrl || ""
		};

		console.log("📤 Emitting hookAttached with complete data:", hookDataToEmit);
		emit("hookAttached", hookDataToEmit, props.customNodeProps.id);

		console.log("✅ hookAttached event emitted!");
		console.log("═══════════════════════════════════════════");
	};

	// Update listener field
	const updateListener = (index: number, key: string, value: any) => {
		const currentListeners = props.customNodeProps.data?.listeners || [];
		if (currentListeners[index]) {
			currentListeners[index][key] = value;
			props.updateNodeData(props.customNodeProps.id, "listeners", [...currentListeners]);
		}
	};

	// Add listener (transport) to hook
	const addListener = () => {
		console.log("➕ Adding new transport listener to hook");

		const currentListeners = props.customNodeProps.data?.listeners || [];
		const newListenerIndex = currentListeners.length;

		// Create placeholder listener entry
		const newListener = {
			id: `listener_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
			name: `Transport Listener ${newListenerIndex + 1}`,
			type: "EMAIL",
			status: "pending"
		};

		const updatedListeners = [...currentListeners, newListener];
		props.updateNodeData(props.customNodeProps.id, "listeners", updatedListeners);

		console.log("✅ Listener placeholder created, emitting event to create transport node");

		// Emit event to create transport node connected to this hook
		emit("createTransportListener", props.customNodeProps.id, newListenerIndex);
	};

	// Remove listener (transport) from hook
	const removeListener = (index: number) => {
		console.log("➖ Removing listener at index:", index);

		const currentListeners = props.customNodeProps.data?.listeners || [];
		const listenerToRemove = currentListeners[index];

		if (listenerToRemove?.transportNodeId) {
			console.log("🗑️ Emitting event to remove transport node:", listenerToRemove.transportNodeId);
			emit("removeTransportListener", props.customNodeProps.id, index, listenerToRemove.transportNodeId);
		}

		const updatedListeners = currentListeners.filter((_: any, i: number) => i !== index);
		props.updateNodeData(props.customNodeProps.id, "listeners", updatedListeners);

		console.log("✅ Listener removed from hook");
	};

	// Create hook from node data
	const createHookFromNode = async () => {
		try {
			console.log("═══════════════════════════════════════════");
			console.log("🔧 CREATING NEW HOOK FROM NODE DATA");
			console.log("  Node data:", props.customNodeProps.data);
			console.log("  Organisation ID:", props.organisationId);
			console.log("═══════════════════════════════════════════");

			// Ensure trigger is set to form.submitted
			if (!props.customNodeProps.data?.hookTriggers || props.customNodeProps.data.hookTriggers.length === 0) {
				console.log("🔧 Auto-setting trigger to form.submitted");
				props.updateNodeData(props.customNodeProps.id, "hookTriggers", ["form.submitted"]);
			}

			// Prepare listeners for hook creation
			const listeners = props.customNodeProps.data?.listeners || [];
			const listenersObject: Record<string, any> = {};
			listeners.forEach((listener: any, index: number) => {
				listenersObject[`transport_${index}`] = {
					type: listener.type,
					id: listener.transportId,
					enabled: true
				};
			});

			// Create node data with listeners
			const nodeDataWithListeners = {
				...props.customNodeProps.data,
				hookTriggers: props.customNodeProps.data?.hookTriggers || ["form.submitted"],
				listeners: listenersObject
			};

			const createdHook = await createHookFromNodeData(
				nodeDataWithListeners,
				props.organisationId
			);

			console.log("✅ Hook created by API:", createdHook);
			console.log("  Hook ID:", createdHook.id);
			console.log("  Hook Token:", createdHook.token);
			console.log("  Hook Type:", createdHook.type);
			console.log("  Hook Name:", createdHook.name);
			console.log("  Hook Triggers:", createdHook.trigger);

			// Update node with created hook data INCLUDING organisation ID and triggers
			props.updateNodeData(props.customNodeProps.id, "hookId", createdHook.id);
			props.updateNodeData(props.customNodeProps.id, "hookToken", createdHook.token);
			props.updateNodeData(props.customNodeProps.id, "hookName", createdHook.name || props.customNodeProps.data?.hookName);
			props.updateNodeData(props.customNodeProps.id, "hookType", createdHook.type || props.customNodeProps.data?.hookType);
			props.updateNodeData(props.customNodeProps.id, "organisationId", props.organisationId);
			props.updateNodeData(props.customNodeProps.id, "hookTriggers", createdHook.trigger || props.customNodeProps.data?.hookTriggers);
			props.updateNodeData(props.customNodeProps.id, "status", "configured");

			console.log("📝 Node data updated with full config, now fetching webhook URL...");

			// Fetch webhook URL from API
			let webhookUrl = "";
			try {
				const webhookUrlResponse = await buttClient.getWebhookUrl(createdHook.id);
				webhookUrl = webhookUrlResponse.url || "";
				console.log("✅ Webhook URL fetched:", webhookUrl);
				props.updateNodeData(props.customNodeProps.id, "webhookUrl", webhookUrl);
			} catch (error) {
				console.error("❌ Failed to fetch webhook URL:", error);
			}

			// Emit hook attached event with consistent structure
			const hookDataToEmit = {
				id: createdHook.id,
				name: createdHook.name || props.customNodeProps.data?.hookName,
				type: createdHook.type || props.customNodeProps.data?.hookType,
				token: createdHook.token,
				triggers: createdHook.trigger || props.customNodeProps.data?.hookTriggers,
				organisationId: props.organisationId,
				webhookUrl
			};

			console.log("📤 Emitting hookAttached with:", hookDataToEmit);
			emit("hookAttached", hookDataToEmit, props.customNodeProps.id);

			console.log("✅ hookAttached event emitted!");
			console.log("═══════════════════════════════════════════");
		} catch (error) {
			console.error("❌ Failed to create hook in node:", error);
		}
	};

	// Edit hook from node (currently unused - listeners are managed directly in configured state)
	const _editHookFromNode = () => {
		// Reset hook ID to show form again for editing
		props.updateNodeData(props.customNodeProps.id, "hookId", null);
	};

	// Delete hook from node
	const deleteHookFromNode = () => {
		// Clear hook data from node
		props.updateNodeData(props.customNodeProps.id, "hookId", null);
		props.updateNodeData(props.customNodeProps.id, "hookToken", null);
		props.updateNodeData(props.customNodeProps.id, "hookName", "");
		props.updateNodeData(props.customNodeProps.id, "hookDescription", "");
		props.updateNodeData(props.customNodeProps.id, "hookTriggers", []);
	};

	// Change hook selection (allows user to select a different hook)
	const changeHookSelection = () => {
		console.log("🔄 Changing hook selection - clearing hookId to show selection screen");
		props.updateNodeData(props.customNodeProps.id, "hookId", null);
		// Switch back to select mode
		hookMode.value = "select";
	};

	// Re-subscribe all configured listeners (diagnostic tool)
	const resubscribeAllListeners = () => {
		console.log("═══════════════════════════════════════════");
		console.log("🔄 RE-SUBSCRIBING ALL LISTENERS");
		console.log("  Hook Node ID:", props.customNodeProps.id);
		console.log("  Hook ID:", props.customNodeProps.data?.hookId);
		console.log("═══════════════════════════════════════════");

		const listeners = props.customNodeProps.data?.listeners || [];
		console.log(`  Found ${listeners.length} listeners to re-subscribe`);

		// This will be caught by CanvasPanel which will trigger subscription
		// We need to emit a custom event that CanvasPanel can listen to
		// For now, log the issue so the user can see what's wrong

		listeners.forEach((listener: any, index: number) => {
			console.log(`═══════════════════════════════════════════`);
			console.log(`📋 Listener ${index + 1}:`);
			console.log(`  Name: ${listener.name}`);
			console.log(`  Type: ${listener.type}`);
			console.log(`  Status: ${listener.status}`);
			console.log(`  Transport ID: ${listener.transportId || listener.id}`);
			console.log(`  Transport Node ID: ${listener.transportNodeId}`);

			if (listener.status === "configured" && (listener.transportId || listener.id)) {
				console.log(`  ✅ This listener is ready to be subscribed`);
				console.log(`  💡 TO FIX: Transport nodes need to re-emit listenerConfigured event`);
				console.log(`  💡 SOLUTION: Open the transport node and click "Attach Selected Transport" again`);
			} else {
				console.log(`  ⚠️ This listener is not yet configured`);
				console.log(`  💡 TO FIX: Open the transport node and configure it`);
			}
			console.log(`═══════════════════════════════════════════`);
		});

		console.log("\n🎯 DIAGNOSIS COMPLETE!");
		console.log("If you see '✅ ready to be subscribed' above but emails aren't working:");
		console.log("1. The transport nodes haven't emitted the listenerConfigured event");
		console.log("2. Navigate to each transport node");
		console.log("3. Click the 'Attach Selected Transport' button again");
		console.log("4. Watch for '📡 SUBSCRIBING TRANSPORT TO HOOK VIA BAPI' logs");
		console.log("5. If you see those logs, the subscription will work!");
		console.log("═══════════════════════════════════════════");
	};

	// Handle close button click
	const handleClose = () => {
		emit("closeNode", props.customNodeProps.id);
	};
</script>

<style scoped>
/* Hook node specific styles - shared container styles are in nodeContainer.css */
.hook-node-container {
	width: 600px;
	min-width: 600px;
	max-width: 600px;
	height: 650px;
	min-height: 650px;
	max-height: 650px;
	display: flex;
	flex-direction: column;
	border: 2px solid var(--color-primary);
	overflow: hidden;
}

/* Icon wrapper styling */
.hook-node-container .node-icon-wrapper {
	position: absolute;
	top: -32px;
	left: 50%;
	transform: translateX(-50%);
	width: 64px;
	height: 64px;
	border-radius: 50%;
	background: hsl(var(--card));
	border: 3px solid hsl(var(--primary));
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 10;
	overflow: hidden;
}

.hook-node-container .node-icon-wrapper svg,
.hook-node-container .node-icon-wrapper i {
	width: 32px;
	height: 32px;
}

/* Connection Handles */
.connection-handle {
	width: 0.75rem;
	height: 0.75rem;
	border: 2px solid rgba(var(--color-primary-rgb), 0.6);
	background-color: rgba(var(--color-primary-rgb), 0.2);
	border-radius: 50%;
	transition: all 0.2s ease;
}

.connection-handle:hover {
	border-color: rgba(var(--color-primary-rgb), 1);
	background-color: rgba(var(--color-primary-rgb), 0.4);
}

/* Trigger Input Section */
.trigger-inputs {
	display: flex;
	gap: 0.5rem;
	align-items: center;
}

.trigger-inputs .form-input {
	margin-bottom: 0;
}

.add-trigger-btn {
	padding: 0.75rem;
	background: rgba(34, 197, 94, 0.2);
	border: 1px solid rgba(34, 197, 94, 0.4);
	border-radius: 0.5rem;
	color: rgba(34, 197, 94, 0.9);
	cursor: pointer;
	transition: all 0.2s ease;
	display: flex;
	align-items: center;
	justify-content: center;
	min-width: 3rem;
}

.add-trigger-btn:hover {
	background: rgba(34, 197, 94, 0.3);
	border-color: rgba(34, 197, 94, 0.6);
	color: rgb(34, 197, 94);
	transform: translateY(-2px);
}

/* Trigger List */
.trigger-list {
	margin-top: 0.75rem;
	display: flex;
	flex-direction: column;
	gap: 0.5rem;
}

.trigger-item {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 0.5rem 0.75rem;
	background: rgba(234, 179, 8, 0.1);
	border: 1px solid rgba(234, 179, 8, 0.2);
	border-radius: 0.375rem;
	backdrop-filter: blur(4px);
}

.trigger-text {
	font-size: 0.75rem;
	color: rgba(255, 255, 255, 0.9);
	font-weight: 500;
}

.remove-trigger-btn {
	padding: 0.25rem;
	background: rgba(239, 68, 68, 0.2);
	border: 1px solid rgba(239, 68, 68, 0.3);
	border-radius: 0.25rem;
	color: rgba(239, 68, 68, 0.9);
	cursor: pointer;
	transition: all 0.2s ease;
	display: flex;
	align-items: center;
	justify-content: center;
}

.remove-trigger-btn:hover {
	background: rgba(239, 68, 68, 0.3);
	border-color: rgba(239, 68, 68, 0.5);
	color: rgb(239, 68, 68);
}

/* Hook Status Display */
.hook-status-display {
	display: flex;
	flex-direction: column;
	min-height: 0;
	overflow: hidden;
}

/* Hook Config Container */
.hook-config-container {
	display: flex;
	flex-direction: column;
	min-height: 0;
	overflow: hidden;
}

.hook-info-card {
	border-radius: 0.75rem;
	padding: 1.5rem;
	background: rgba(var(--color-neutral-rgb), 0.12);
	border: 1px solid rgba(var(--color-success-rgb), 0.25);
	backdrop-filter: blur(24px) saturate(1.8);
	box-shadow:
		0 4px 12px rgba(0, 0, 0, 0.15),
		0 0 0 1px rgba(var(--color-success-rgb), 0.1),
		inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.hook-header {
	display: flex;
	align-items: center;
	gap: 0.75rem;
	margin-bottom: 1rem;
	padding-bottom: 0.75rem;
	border-bottom: 1px solid rgba(34, 197, 94, 0.2);
}

.hook-name {
	font-size: 1.125rem;
	font-weight: 700;
	color: rgba(34, 197, 94, 0.9);
}

.hook-details {
	display: flex;
	flex-direction: column;
	gap: 0.75rem;
	margin-bottom: 1.5rem;
}

.detail-row {
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.detail-label {
	font-size: 0.875rem;
	font-weight: 500;
	color: rgba(255, 255, 255, 0.7);
}

.detail-value {
	font-size: 0.875rem;
	color: rgba(255, 255, 255, 0.9);
	font-weight: 600;
}

.hook-actions {
	display: flex;
	gap: 0.75rem;
}

.edit-hook-btn,
.delete-hook-btn {
	padding: 0.75rem 1rem;
	border-radius: 0.5rem;
	font-size: 0.75rem;
	font-weight: 600;
	cursor: pointer;
	transition: all 0.2s ease;
	display: flex;
	align-items: center;
	gap: 0.5rem;
	flex: 1;
	justify-content: center;
}

.edit-hook-btn {
	background: rgba(59, 130, 246, 0.2);
	border: 1px solid rgba(59, 130, 246, 0.4);
	color: rgba(59, 130, 246, 0.9);
}

.edit-hook-btn:hover {
	background: rgba(59, 130, 246, 0.3);
	border-color: rgba(59, 130, 246, 0.6);
	color: rgb(59, 130, 246);
	transform: translateY(-2px);
}

.delete-hook-btn {
	background: rgba(239, 68, 68, 0.2);
	border: 1px solid rgba(239, 68, 68, 0.4);
	color: rgba(239, 68, 68, 0.9);
}

.delete-hook-btn:hover {
	background: rgba(239, 68, 68, 0.3);
	border-color: rgba(239, 68, 68, 0.6);
	color: rgb(239, 68, 68);
	transform: translateY(-2px);
}

.token-value {
	font-family: 'JetBrains Mono', 'Fira Code', monospace;
	font-size: 0.75rem;
	background: rgba(0, 0, 0, 0.3);
	padding: 0.25rem 0.5rem;
	border-radius: 0.25rem;
	border: 1px solid rgba(255, 255, 255, 0.1);
}

/* Auto-configured Badge */
.auto-badge {
	margin-left: auto;
	padding: 0.25rem 0.5rem;
	background: rgba(34, 197, 94, 0.2);
	border: 1px solid rgba(34, 197, 94, 0.3);
	border-radius: 0.25rem;
	font-size: 0.625rem;
	font-weight: 700;
	color: rgb(34, 197, 94);
	text-transform: uppercase;
}

/* Trigger Display */
.trigger-display {
	display: flex;
	align-items: center;
	gap: 0.75rem;
	padding: 0.75rem 1rem;
	background: rgba(34, 197, 94, 0.1);
	border: 1px solid rgba(34, 197, 94, 0.2);
	border-radius: 0.5rem;
}

.trigger-event-text {
	font-size: 0.875rem;
	font-weight: 700;
	color: rgba(34, 197, 94, 0.9);
	font-family: 'JetBrains Mono', 'Fira Code', monospace;
}

.trigger-help-text {
	margin-left: auto;
	font-size: 0.75rem;
	color: rgba(255, 255, 255, 0.5);
	font-style: italic;
}

/* Listeners Section */
.listener-count-badge {
	margin-left: auto;
	padding: 0.25rem 0.5rem;
	background: rgba(20, 184, 166, 0.2);
	border: 1px solid rgba(20, 184, 166, 0.3);
	border-radius: 0.25rem;
	font-size: 0.625rem;
	font-weight: 700;
	color: rgb(20, 184, 166);
}

.listeners-list {
	display: flex;
	flex-direction: column;
	gap: 0.5rem;
	margin-bottom: 0.75rem;
	max-height: 200px;
	overflow-y: auto;
}

.listener-item {
	display: flex;
	align-items: center;
	gap: 0.75rem;
	padding: 0.75rem 1rem;
	background: rgba(20, 184, 166, 0.1);
	border: 1px solid rgba(20, 184, 166, 0.2);
	border-radius: 0.5rem;
	transition: all 0.2s ease;
}

.listener-item:hover {
	background: rgba(20, 184, 166, 0.15);
	border-color: rgba(20, 184, 166, 0.3);
}

.listener-info {
	flex: 1;
	display: flex;
	flex-direction: column;
	gap: 0.5rem;
}

.listener-name-input {
	width: 100%;
	padding: 0.5rem 0.75rem;
	background: rgba(17, 24, 39, 0.8);
	border: 1px solid rgba(20, 184, 166, 0.3);
	border-radius: 0.375rem;
	color: white;
	font-size: 0.875rem;
	font-weight: 600;
	transition: all 0.2s ease;
}

.listener-name-input:focus {
	outline: none;
	border-color: rgba(20, 184, 166, 0.6);
	background: rgba(17, 24, 39, 0.9);
	box-shadow: 0 0 0 2px rgba(20, 184, 166, 0.1);
}

.listener-type-select {
	width: 100%;
	padding: 0.5rem 0.75rem;
	background: rgba(17, 24, 39, 0.8);
	border: 1px solid rgba(20, 184, 166, 0.3);
	border-radius: 0.375rem;
	color: white;
	font-size: 0.8125rem;
	font-weight: 600;
	cursor: pointer;
	transition: all 0.2s ease;
}

.listener-type-select option {
	background: rgba(17, 24, 39, 0.95);
	color: white;
	font-size: 0.8125rem;
	padding: 0.5rem;
}

.listener-type-select:focus {
	outline: none;
	border-color: rgba(20, 184, 166, 0.6);
	background: rgba(17, 24, 39, 0.9);
	box-shadow: 0 0 0 2px rgba(20, 184, 166, 0.1);
}

.listener-name {
	font-size: 0.875rem;
	font-weight: 600;
	color: rgba(255, 255, 255, 0.9);
}

.listener-type {
	font-size: 0.75rem;
	color: rgba(20, 184, 166, 0.9);
	font-weight: 600;
	text-transform: uppercase;
}

.remove-listener-btn {
	padding: 0.5rem;
	background: rgba(239, 68, 68, 0.2);
	border: 1px solid rgba(239, 68, 68, 0.3);
	border-radius: 0.375rem;
	color: rgba(239, 68, 68, 0.9);
	cursor: pointer;
	transition: all 0.2s ease;
	display: flex;
	align-items: center;
	justify-content: center;
}

.remove-listener-btn:hover {
	background: rgba(239, 68, 68, 0.3);
	border-color: rgba(239, 68, 68, 0.5);
	color: rgb(239, 68, 68);
}

.add-listener-btn {
	width: 100%;
	padding: 0.875rem 1.25rem;
	background: linear-gradient(135deg, rgba(20, 184, 166, 0.2), rgba(20, 184, 166, 0.1));
	border: 1px solid rgba(20, 184, 166, 0.4);
	border-radius: 0.5rem;
	color: rgba(20, 184, 166, 0.9);
	font-size: 0.875rem;
	font-weight: 600;
	cursor: pointer;
	transition: all 0.2s ease;
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 0.5rem;
}

.add-listener-btn:hover {
	background: linear-gradient(135deg, rgba(20, 184, 166, 0.3), rgba(20, 184, 166, 0.2));
	border-color: rgba(20, 184, 166, 0.6);
	color: rgb(20, 184, 166);
	transform: translateY(-2px);
	box-shadow: 0 6px 20px rgba(20, 184, 166, 0.3);
}

/* Configured Listeners Display */
.configured-listeners {
	margin-top: 1rem;
	padding: 1rem;
	background: rgba(20, 184, 166, 0.05);
	border: 1px solid rgba(20, 184, 166, 0.2);
	border-radius: 0.5rem;
}

.listeners-header {
	display: flex;
	align-items: center;
	gap: 0.5rem;
	font-size: 0.75rem;
	font-weight: 600;
	color: rgba(20, 184, 166, 0.9);
	text-transform: uppercase;
	margin-bottom: 0.75rem;
	padding-bottom: 0.5rem;
	border-bottom: 1px solid rgba(20, 184, 166, 0.2);
}

.configured-listeners-list {
	display: flex;
	flex-direction: column;
	gap: 0.5rem;
	margin-bottom: 0.75rem;
}

.configured-listener-item {
	display: flex;
	align-items: center;
	gap: 0.5rem;
	padding: 0.5rem 0.75rem;
	background: rgba(20, 184, 166, 0.1);
	border: 1px solid rgba(20, 184, 166, 0.2);
	border-radius: 0.375rem;
	font-size: 0.75rem;
	color: rgba(255, 255, 255, 0.9);
}

.add-more-listeners-btn {
	width: 100%;
	padding: 0.5rem 0.75rem;
	background: rgba(20, 184, 166, 0.1);
	border: 1px solid rgba(20, 184, 166, 0.3);
	border-radius: 0.375rem;
	color: rgba(20, 184, 166, 0.9);
	font-size: 0.75rem;
	font-weight: 600;
	cursor: pointer;
	transition: all 0.2s ease;
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 0.5rem;
}

.add-more-listeners-btn:hover {
	background: rgba(20, 184, 166, 0.2);
	border-color: rgba(20, 184, 166, 0.5);
	color: rgb(20, 184, 166);
}

.trigger-badge {
	padding: 0.25rem 0.5rem;
	background: rgba(34, 197, 94, 0.2);
	border: 1px solid rgba(34, 197, 94, 0.3);
	border-radius: 0.25rem;
	font-size: 0.75rem;
	font-weight: 700;
	color: rgb(34, 197, 94);
	font-family: 'JetBrains Mono', 'Fira Code', monospace;
}

.listener-status-badge {
	padding: 0.25rem 0.5rem;
	border-radius: 0.25rem;
	font-size: 0.625rem;
	font-weight: 700;
	text-transform: uppercase;
}

.listener-status-badge.status-configured {
	background: rgba(34, 197, 94, 0.2);
	border: 1px solid rgba(34, 197, 94, 0.3);
	color: rgb(34, 197, 94);
}

.listener-status-badge.status-pending {
	background: rgba(234, 179, 8, 0.2);
	border: 1px solid rgba(234, 179, 8, 0.3);
	color: rgb(234, 179, 8);
}

.trigger-text {

	font-size: 0.75rem;

	color: rgba(255, 255, 255, 0.9);

	font-weight: 500;

}

.remove-trigger-btn {

	padding: 0.25rem;

	background: rgba(239, 68, 68, 0.2);

	border: 1px solid rgba(239, 68, 68, 0.3);

	border-radius: 0.25rem;

	color: rgba(239, 68, 68, 0.9);

	cursor: pointer;

	transition: all 0.2s ease;

	display: flex;

	align-items: center;

	justify-content: center;

}

.remove-trigger-btn:hover {

	background: rgba(239, 68, 68, 0.3);

	border-color: rgba(239, 68, 68, 0.5);

	color: rgb(239, 68, 68);

}

/* Hook Status Display */

.hook-status-display {

	padding: 1.5rem;

}

.hook-info-card {

	border-radius: 0.75rem;

	padding: 1.5rem;

	background: rgba(var(--color-neutral-rgb), 0.12);

	border: 1px solid rgba(var(--color-success-rgb), 0.25);

	backdrop-filter: blur(24px) saturate(1.8);

	box-shadow:

		0 4px 12px rgba(0, 0, 0, 0.15),

		0 0 0 1px rgba(var(--color-success-rgb), 0.1),

		inset 0 1px 0 rgba(255, 255, 255, 0.1);

}

.hook-header {

	display: flex;

	align-items: center;

	gap: 0.75rem;

	margin-bottom: 1rem;

	padding-bottom: 0.75rem;

	border-bottom: 1px solid rgba(34, 197, 94, 0.2);

}

.hook-name {

	font-size: 1.125rem;

	font-weight: 700;

	color: rgba(34, 197, 94, 0.9);

}

.hook-details {

	display: flex;

	flex-direction: column;

	gap: 0.75rem;

	margin-bottom: 1.5rem;

}

.detail-row {

	display: flex;

	justify-content: space-between;

	align-items: center;

}

.detail-label {

	font-size: 0.875rem;

	font-weight: 500;

	color: rgba(255, 255, 255, 0.7);

}

.detail-value {

	font-size: 0.875rem;

	color: rgba(255, 255, 255, 0.9);

	font-weight: 600;

}

.hook-actions {

	display: flex;

	gap: 0.75rem;

}

.edit-hook-btn,

.delete-hook-btn {

	padding: 0.75rem 1rem;

	border-radius: 0.5rem;

	font-size: 0.75rem;

	font-weight: 600;

	cursor: pointer;

	transition: all 0.2s ease;

	display: flex;

	align-items: center;

	gap: 0.5rem;

	flex: 1;

	justify-content: center;

}

.edit-hook-btn {

	background: rgba(59, 130, 246, 0.2);

	border: 1px solid rgba(59, 130, 246, 0.4);

	color: rgba(59, 130, 246, 0.9);

}

.edit-hook-btn:hover {

	background: rgba(59, 130, 246, 0.3);

	border-color: rgba(59, 130, 246, 0.6);

	color: rgb(59, 130, 246);

	transform: translateY(-2px);

}

.delete-hook-btn {

	background: rgba(239, 68, 68, 0.2);

	border: 1px solid rgba(239, 68, 68, 0.4);

	color: rgba(239, 68, 68, 0.9);

}

.delete-hook-btn:hover {

	background: rgba(239, 68, 68, 0.3);

	border-color: rgba(239, 68, 68, 0.6);

	color: rgb(239, 68, 68);

	transform: translateY(-2px);

}

.token-value {

	font-family: 'JetBrains Mono', 'Fira Code', monospace;

	font-size: 0.75rem;

	background: rgba(0, 0, 0, 0.3);

	padding: 0.25rem 0.5rem;

	border-radius: 0.25rem;

	border: 1px solid rgba(255, 255, 255, 0.1);

}

/* Auto-configured Badge */

.auto-badge {

	margin-left: auto;

	padding: 0.25rem 0.5rem;

	background: rgba(34, 197, 94, 0.2);

	border: 1px solid rgba(34, 197, 94, 0.3);

	border-radius: 0.25rem;

	font-size: 0.625rem;

	font-weight: 700;

	color: rgb(34, 197, 94);

	text-transform: uppercase;

}

/* Trigger Display */

.trigger-display {

	display: flex;

	align-items: center;

	gap: 0.75rem;

	padding: 0.75rem 1rem;

	background: rgba(34, 197, 94, 0.1);

	border: 1px solid rgba(34, 197, 94, 0.2);

	border-radius: 0.5rem;

}

.trigger-event-text {

	font-size: 0.875rem;

	font-weight: 700;

	color: rgba(34, 197, 94, 0.9);

	font-family: 'JetBrains Mono', 'Fira Code', monospace;

}

.trigger-help-text {

	margin-left: auto;

	font-size: 0.75rem;

	color: rgba(255, 255, 255, 0.5);

	font-style: italic;

}

/* Listeners Section */

.listener-count-badge {

	margin-left: auto;

	padding: 0.25rem 0.5rem;

	background: rgba(20, 184, 166, 0.2);

	border: 1px solid rgba(20, 184, 166, 0.3);

	border-radius: 0.25rem;

	font-size: 0.625rem;

	font-weight: 700;

	color: rgb(20, 184, 166);

}

.listeners-list {

	display: flex;

	flex-direction: column;

	gap: 0.5rem;

	margin-bottom: 0.75rem;

	max-height: 200px;

	overflow-y: auto;

}

.listener-item {

	display: flex;

	align-items: center;

	gap: 0.75rem;

	padding: 0.75rem 1rem;

	background: rgba(20, 184, 166, 0.1);

	border: 1px solid rgba(20, 184, 166, 0.2);

	border-radius: 0.5rem;

	transition: all 0.2s ease;

}

.listener-item:hover {

	background: rgba(20, 184, 166, 0.15);

	border-color: rgba(20, 184, 166, 0.3);

}

.listener-info {

	flex: 1;

	display: flex;

	flex-direction: column;

	gap: 0.5rem;

}

.listener-name-input {

	width: 100%;

	padding: 0.5rem 0.75rem;

	background: rgba(17, 24, 39, 0.8);

	border: 1px solid rgba(20, 184, 166, 0.3);

	border-radius: 0.375rem;

	color: white;

	font-size: 0.875rem;

	font-weight: 600;

	transition: all 0.2s ease;

}

.listener-name-input:focus {

	outline: none;

	border-color: rgba(20, 184, 166, 0.6);

	background: rgba(17, 24, 39, 0.9);

	box-shadow: 0 0 0 2px rgba(20, 184, 166, 0.1);

}

.listener-type-select {

	width: 100%;

	padding: 0.5rem 0.75rem;

	background: rgba(17, 24, 39, 0.8);

	border: 1px solid rgba(20, 184, 166, 0.3);

	border-radius: 0.375rem;

	color: white;

	font-size: 0.8125rem;

	font-weight: 600;

	cursor: pointer;

	transition: all 0.2s ease;

}

.listener-type-select option {

	background: rgba(17, 24, 39, 0.95);

	color: white;

	font-size: 0.8125rem;

	padding: 0.5rem;

}

.listener-type-select:focus {

	outline: none;

	border-color: rgba(20, 184, 166, 0.6);

	background: rgba(17, 24, 39, 0.9);

	box-shadow: 0 0 0 2px rgba(20, 184, 166, 0.1);

}

.listener-name {

	font-size: 0.875rem;

	font-weight: 600;

	color: rgba(255, 255, 255, 0.9);

}

.listener-type {

	font-size: 0.75rem;

	color: rgba(20, 184, 166, 0.9);

	font-weight: 600;

	text-transform: uppercase;

}

.remove-listener-btn {

	padding: 0.5rem;

	background: rgba(239, 68, 68, 0.2);

	border: 1px solid rgba(239, 68, 68, 0.3);

	border-radius: 0.375rem;

	color: rgba(239, 68, 68, 0.9);

	cursor: pointer;

	transition: all 0.2s ease;

	display: flex;

	align-items: center;

	justify-content: center;

}

.remove-listener-btn:hover {

	background: rgba(239, 68, 68, 0.3);

	border-color: rgba(239, 68, 68, 0.5);

	color: rgb(239, 68, 68);

}

.add-listener-btn {

	width: 100%;

	padding: 0.875rem 1.25rem;

	background: linear-gradient(135deg, rgba(20, 184, 166, 0.2), rgba(20, 184, 166, 0.1));

	border: 1px solid rgba(20, 184, 166, 0.4);

	border-radius: 0.5rem;

	color: rgba(20, 184, 166, 0.9);

	font-size: 0.875rem;

	font-weight: 600;

	cursor: pointer;

	transition: all 0.2s ease;

	display: flex;

	align-items: center;

	justify-content: center;

	gap: 0.5rem;

}

.add-listener-btn:hover {

	background: linear-gradient(135deg, rgba(20, 184, 166, 0.3), rgba(20, 184, 166, 0.2));

	border-color: rgba(20, 184, 166, 0.6);

	color: rgb(20, 184, 166);

	transform: translateY(-2px);

	box-shadow: 0 6px 20px rgba(20, 184, 166, 0.3);

}

/* Configured Listeners Display */

.configured-listeners {

	margin-top: 1rem;

	padding: 1rem;

	background: rgba(20, 184, 166, 0.05);

	border: 1px solid rgba(20, 184, 166, 0.2);

	border-radius: 0.5rem;

}

.listeners-header {

	display: flex;

	align-items: center;

	gap: 0.5rem;

	font-size: 0.75rem;

	font-weight: 600;

	color: rgba(20, 184, 166, 0.9);

	text-transform: uppercase;

	margin-bottom: 0.75rem;

	padding-bottom: 0.5rem;

	border-bottom: 1px solid rgba(20, 184, 166, 0.2);

}

.configured-listeners-list {

	display: flex;

	flex-direction: column;

	gap: 0.5rem;

	margin-bottom: 0.75rem;

}

.configured-listener-item {

	display: flex;

	align-items: center;

	gap: 0.5rem;

	padding: 0.5rem 0.75rem;

	background: rgba(20, 184, 166, 0.1);

	border: 1px solid rgba(20, 184, 166, 0.2);

	border-radius: 0.375rem;

	font-size: 0.75rem;

	color: rgba(255, 255, 255, 0.9);

}

.add-more-listeners-btn {

	width: 100%;

	padding: 0.5rem 0.75rem;

	background: rgba(20, 184, 166, 0.1);

	border: 1px solid rgba(20, 184, 166, 0.3);

	border-radius: 0.375rem;

	color: rgba(20, 184, 166, 0.9);

	font-size: 0.75rem;

	font-weight: 600;

	cursor: pointer;

	transition: all 0.2s ease;

	display: flex;

	align-items: center;

	justify-content: center;

	gap: 0.5rem;

}

.add-more-listeners-btn:hover {

	background: rgba(20, 184, 166, 0.2);

	border-color: rgba(20, 184, 166, 0.5);

	color: rgb(20, 184, 166);

}

.trigger-badge {

	padding: 0.25rem 0.5rem;

	background: rgba(34, 197, 94, 0.2);

	border: 1px solid rgba(34, 197, 94, 0.3);

	border-radius: 0.25rem;

	font-size: 0.75rem;

	font-weight: 700;

	color: rgb(34, 197, 94);

	font-family: 'JetBrains Mono', 'Fira Code', monospace;

}

.listener-status-badge {

	padding: 0.25rem 0.5rem;

	border-radius: 0.25rem;

	font-size: 0.625rem;

	font-weight: 700;

	text-transform: uppercase;

}

.listener-status-badge.status-configured {

	background: rgba(34, 197, 94, 0.2);

	border: 1px solid rgba(34, 197, 94, 0.3);

	color: rgb(34, 197, 94);

}

.listener-status-badge.status-pending {

	background: rgba(234, 179, 8, 0.2);

	border: 1px solid rgba(234, 179, 8, 0.3);

	color: rgb(234, 179, 8);

}
</style>
