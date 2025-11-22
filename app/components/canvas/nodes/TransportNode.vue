<template>
	<div class="transport-node-container">
		<!-- Connection Handles -->
		<Handle id="left" type="target" :position="Position.Left" class="connection-handle" />
		<Handle id="right" type="source" :position="Position.Right" class="connection-handle" />
		<Handle id="top" type="target" :position="Position.Top" class="connection-handle" />
		<Handle id="bottom" type="source" :position="Position.Bottom" class="connection-handle" />

		<!-- Header -->
		<div class="node-header">
			<div class="flex items-center gap-2">
				<Icon name="lucide:truck" class="w-4 h-4 text-teal-500" />
				<h3 class="text-sm font-semibold text-teal-500">
					{{ customNodeProps.data?.label || 'Transport Node' }}
				</h3>
			</div>
			<div class="flex items-center gap-2">
				<div class="flex items-center gap-1">
					<div class="w-2 h-2 rounded-full bg-teal-500" />
					<span class="text-xs text-teal-500/70">Transport</span>
				</div>
				<button
					class="close-button"
					title="Close transport node"
					@click.stop="handleClose"
				>
					<Icon name="lucide:x" class="w-4 h-4" />
				</button>
			</div>
		</div>

		<!-- Transport Selection/Configuration -->
		<div
			v-if="!customNodeProps.data?.transportId"
			class="transport-config-container"
			@wheel.stop
			@mousedown.stop
		>
			<!-- Mode Selection -->
			<div class="mode-selection">
				<button
					class="mode-button"
					:class="{ active: transportMode === 'select' }"
					@click="transportMode = 'select'"
				>
					<Icon name="lucide:list" class="w-4 h-4" />
					<span>Select Existing</span>
				</button>
				<button
					class="mode-button"
					:class="{ active: transportMode === 'create' }"
					@click="transportMode = 'create'"
				>
					<Icon name="lucide:plus-circle" class="w-4 h-4" />
					<span>Create New</span>
				</button>
			</div>

			<!-- Select Existing Transport -->
			<div v-if="transportMode === 'select'" class="transport-selection-panel" @wheel.stop>
				<div class="section-header">
					<Icon name="lucide:database" class="w-4 h-4 text-teal-400" />
					<span class="text-sm font-medium text-white/80">Available Transports</span>
					<div class="transport-count-badge">
						{{ availableTransports.length }} transports
					</div>
				</div>

				<!-- Scroll Indicator -->
				<div v-if="availableTransports.length > 5" class="scroll-indicator">
					<Icon name="lucide:chevrons-down" class="w-4 h-4 text-teal-400/60 animate-bounce" />
					<span class="text-xs text-white/40">Scroll to see all transports</span>
				</div>

				<div v-if="isLoadingTransports" class="loading-state">
					<Icon name="lucide:loader-2" class="w-5 h-5 animate-spin text-teal-400" />
					<span class="text-sm text-white/60">Loading transports...</span>
				</div>

				<div v-else-if="availableTransports.length === 0" class="empty-state">
					<Icon name="lucide:inbox" class="w-8 h-8 text-white/30" />
					<p class="text-sm text-white/50">
						No transports available
					</p>
					<p class="text-xs text-white/40">
						Switch to "Create New" to add a transport
					</p>
				</div>

				<div v-else class="transports-list" @wheel.stop>
					<button
						v-for="transport in availableTransports"
						:key="transport.id"
						class="transport-item"
						:class="{ selected: selectedTransportId === transport.id }"
						@click.stop="selectTransport(transport)"
						@mousedown.stop
					>
						<div class="transport-item-header">
							<Icon name="lucide:truck" class="w-4 h-4 text-teal-400" />
							<span class="transport-name">{{ transport.name || transport.type }}</span>
							<Icon
								v-if="selectedTransportId === transport.id"
								name="lucide:check-circle"
								class="w-4 h-4 text-green-400 ml-auto"
							/>
						</div>
						<div v-if="transport.description" class="transport-description">
							{{ transport.description }}
						</div>
						<div class="transport-meta">
							<span class="meta-tag">{{ transport.type }}</span>
							<span v-if="transport.enabled" class="meta-tag enabled">Enabled</span>
							<span v-else class="meta-tag disabled">Disabled</span>
						</div>
					</button>
				</div>

				<button
					v-if="selectedTransportId"
					class="attach-selected-transport-btn"
					@click="attachSelectedTransport"
				>
					<Icon name="lucide:link" class="w-4 h-4" />
					<span>Attach Selected Transport to Hook</span>
				</button>
			</div>

			<!-- Create New Transport Form -->
			<div v-else-if="transportMode === 'create'" class="transport-config-form">
				<div class="form-section">
					<label class="form-label">
						<Icon name="lucide:tag" class="w-3 h-3" />
						Transport Name
					</label>
					<input
						:value="customNodeProps.data?.transportName || ''"
						type="text"
						placeholder="Enter transport name"
						class="form-input"
						@input="updateNodeData(customNodeProps.id, 'transportName', ($event.target as HTMLInputElement)?.value)"
					>
				</div>

				<div class="form-section">
					<label class="form-label">
						<Icon name="lucide:file-text" class="w-3 h-3" />
						Description
					</label>
					<textarea
						:value="customNodeProps.data?.transportDescription || ''"
						placeholder="Describe what this transport does"
						rows="2"
						class="form-textarea"
						@input="updateNodeData(customNodeProps.id, 'transportDescription', ($event.target as HTMLTextAreaElement)?.value)"
					/>
				</div>

				<div class="form-section">
					<label class="form-label">
						<Icon name="lucide:type" class="w-3 h-3" />
						Transport Type
					</label>
					<select
						:value="customNodeProps.data?.transportType || 'EMAIL'"
						class="form-input"
						@change="updateNodeData(customNodeProps.id, 'transportType', ($event.target as HTMLSelectElement)?.value)"
					>
						<option value="EMAIL">
							📧 Email
						</option>
						<option value="SLACK">
							💬 Slack
						</option>
						<option value="DISCORD">
							🎮 Discord
						</option>
						<option value="WEBHOOK">
							🔗 Webhook
						</option>
						<option value="HTTP">
							🌐 HTTP
						</option>
						<option value="HTTPS">
							🔒 HTTPS
						</option>
						<option value="WEBSOCKET">
							⚡ WebSocket
						</option>
						<option value="GRPC">
							📡 gRPC
						</option>
						<option value="MQTT">
							📨 MQTT
						</option>
						<option value="AMQP">
							🔄 AMQP
						</option>
					</select>
				</div>

				<!-- Dynamic Target Field Based on Type -->
				<div class="form-section">
					<label class="form-label">
						<Icon name="lucide:globe" class="w-3 h-3" />
						<span v-if="customNodeProps.data?.transportType === 'EMAIL'">Email Address</span>
						<span v-else-if="customNodeProps.data?.transportType === 'SLACK'">Slack Channel</span>
						<span v-else-if="customNodeProps.data?.transportType === 'DISCORD'">Discord Webhook URL</span>
						<span v-else>Target/Endpoint</span>
					</label>
					<input
						:value="customNodeProps.data?.transportTarget || ''"
						:type="customNodeProps.data?.transportType === 'EMAIL' ? 'email' : 'text'"
						:placeholder="getTargetPlaceholder(customNodeProps.data?.transportType)"
						class="form-input"
						@input="updateNodeData(customNodeProps.id, 'transportTarget', ($event.target as HTMLInputElement)?.value)"
					>
					<div v-if="customNodeProps.data?.transportType === 'EMAIL'" class="field-help-text">
						<Icon name="lucide:info" class="w-3 h-3 text-blue-400" />
						<span>Enter the email address to receive form submissions</span>
					</div>
				</div>

				<!-- Create Transport Button -->
				<div class="form-actions">
					<button
						type="button"
						class="create-transport-btn"
						:disabled="!customNodeProps.data?.transportName || isCreating"
						@click="createTransportFromNode"
					>
						<Icon v-if="isCreating" name="lucide:loader-2" class="w-4 h-4 animate-spin" />
						<Icon v-else name="lucide:truck" class="w-4 h-4" />
						{{ isCreating ? 'Creating...' : 'Create Transport' }}
					</button>
				</div>
			</div>
		</div>

		<!-- Transport Status Display -->
		<div v-else class="transport-status-display">
			<div class="transport-info-card">
				<div class="transport-header">
					<Icon name="lucide:check-circle" class="w-4 h-4 text-green-500" />
					<span class="transport-name">{{ customNodeProps.data?.transportName }}</span>
				</div>

				<div class="transport-details">
					<div class="detail-row">
						<span class="detail-label">Type</span>
						<span class="detail-value">{{ customNodeProps.data?.transportType || 'http' }}</span>
					</div>

					<div v-if="customNodeProps.data?.transportTarget" class="detail-row">
						<span class="detail-label">Target</span>
						<span class="detail-value transport-target">{{ customNodeProps.data.transportTarget }}</span>
					</div>
				</div>

				<div class="transport-actions">
					<button class="edit-transport-btn" @click="editTransportFromNode">
						<Icon name="lucide:edit-2" class="w-3 h-3" />
						Edit
					</button>
					<button class="delete-transport-btn" @click="deleteTransportFromNode">
						<Icon name="lucide:trash-2" class="w-3 h-3" />
						Remove
					</button>
				</div>
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
	import { Handle, Position } from "@vue-flow/core";
	import { computed, onMounted, ref } from "vue";
	import { buttClient } from "~/utils/buttClient";

	interface Props {
		customNodeProps: any
		updateNodeData: (nodeId: string, key: string, value: any) => void
		organisationId: string
		availableTransports?: any[]
	}

	const props = withDefaults(defineProps<Props>(), {
		availableTransports: () => []
	});

	const emit = defineEmits<{
		closeNode: [nodeId: string]
		transportAttached: [transportData: any, nodeId: string]
		listenerConfigured: [transportData: any, hookNodeId: string, listenerIndex: number]
		createTemplateNode: [templateData: any, transportNodeId: string]
	}>();

	// Transport selection state
	const transportMode = ref<"select" | "create">("select");
	const selectedTransportId = ref<string | null>(null);
	const isCreating = ref(false);

	// Use transports from props (loaded in NodeCanvasRightPanel)
	const availableTransports = computed(() => {
		console.log("🚛 TransportNode: Using available transports from props:", props.availableTransports?.length);
		return props.availableTransports || [];
	});

	const isLoadingTransports = computed(() => false); // No loading needed, using props

	// Fetch valid transport types on mount
	onMounted(async () => {
		console.log("═══════════════════════════════════════════");
		console.log("🚛 TRANSPORT NODE MOUNTED!");
		console.log("  Node ID:", props.customNodeProps.id);
		console.log("  Organisation ID:", props.organisationId);
		console.log("  Node data keys:", Object.keys(props.customNodeProps.data || {}));
		console.log("  FULL NODE DATA:", JSON.stringify(props.customNodeProps.data, null, 2));
		console.log("  Available transports:", availableTransports.value.length);
		console.log("═══════════════════════════════════════════");

		// Fetch valid transport types from BAPI
		try {
			const validTypes = await buttClient.getAvailableTransportsTypes();
			console.log("═══════════════════════════════════════════");
			console.log("✅ VALID TRANSPORT TYPES FROM BAPI:");
			console.log(JSON.stringify(validTypes, null, 2));
			console.log("═══════════════════════════════════════════");
		} catch (error) {
			console.error("❌ Failed to fetch valid transport types:", error);
		}

		// Log existing template transports to see what types they use
		if (availableTransports.value.length > 0) {
			console.log("═══════════════════════════════════════════");
			console.log("📋 EXISTING TEMPLATE TRANSPORTS:");
			availableTransports.value.forEach((t, i) => {
				console.log(`Transport ${i + 1}:`, {
					id: t.id,
					name: t.name,
					type: t.type,
					target: t.target,
					meta: t.meta
				});
			});
			console.log("═══════════════════════════════════════════");
		}

		// CRITICAL DEBUG: Check if we should re-emit listenerConfigured
		console.log("═══════════════════════════════════════════");
		console.log("🔍 CHECKING IF SHOULD RE-EMIT listenerConfigured");
		console.log("  Has transportId?", !!props.customNodeProps.data?.transportId);
		console.log("  Has attachedToHookId?", !!props.customNodeProps.data?.attachedToHookId);
		console.log("  transportId value:", props.customNodeProps.data?.transportId);
		console.log("  attachedToHookId value:", props.customNodeProps.data?.attachedToHookId);
		console.log("  listenerIndex value:", props.customNodeProps.data?.listenerIndex);
		console.log("  All node data keys:", Object.keys(props.customNodeProps.data || {}));
		console.log("═══════════════════════════════════════════");

		// CRITICAL FIX: If this transport is ALREADY configured and attached to a hook,
		// re-emit listenerConfigured to ensure subscription happens on reload
		if (props.customNodeProps.data?.transportId && props.customNodeProps.data?.attachedToHookId) {
			console.log("═══════════════════════════════════════════");
			console.log("🔄 TRANSPORT ALREADY CONFIGURED - RE-EMITTING LISTENER CONFIGURED");
			console.log("  Transport ID:", props.customNodeProps.data.transportId);
			console.log("  Transport Name:", props.customNodeProps.data.transportName);
			console.log("  Transport Type:", props.customNodeProps.data.transportType);
			console.log("  Transport Target:", props.customNodeProps.data.transportTarget);
			console.log("  Attached to Hook ID:", props.customNodeProps.data.attachedToHookId);
			console.log("  Listener Index:", props.customNodeProps.data.listenerIndex);
			console.log("═══════════════════════════════════════════");

			const transportConfig = {
				id: props.customNodeProps.data.transportId,
				name: props.customNodeProps.data.transportName,
				type: props.customNodeProps.data.transportType,
				target: props.customNodeProps.data.transportTarget,
				nodeId: props.customNodeProps.id
			};

			const listenerIndex = props.customNodeProps.data.listenerIndex ?? 0;

			console.log("📤 RE-EMITTING listenerConfigured on mount to ensure subscription");
			console.log("  Transport Config:", JSON.stringify(transportConfig, null, 2));
			emit("listenerConfigured", transportConfig, props.customNodeProps.data.attachedToHookId, listenerIndex);
			console.log("✅ listenerConfigured re-emitted on mount!");

			// NOTE: We DON'T re-emit createTemplateNode on mount!
			// Template nodes are already saved in the chain and will be restored naturally.
			// Re-emitting would create duplicates.
			console.log("ℹ️ NOT re-emitting createTemplateNode (template nodes restored from saved chain)");
			console.log("═══════════════════════════════════════════");
		} else {
			console.error("❌ NOT RE-EMITTING listenerConfigured - Missing required data!");
			console.error("  This means subscription will NOT happen on page reload");
			console.error("  You need to re-configure the transport to trigger subscription");
		}

		// Smart defaults for transport creation
		if (!props.customNodeProps.data?.transportId && transportMode.value === "create") {
			// Check if this is attached to a hook for a contact form
			const _attachedToHookId = props.customNodeProps.data?.attachedToHookId;
			const _connectedFormId = props.customNodeProps.data?.connectedFormId;
			const formTitle = props.customNodeProps.data?.formTitle?.toLowerCase() || "";

			// Auto-detect contact/support forms
			const isContactForm = formTitle.includes("contact")
				|| formTitle.includes("support")
				|| formTitle.includes("feedback")
				|| formTitle.includes("help");

			if (isContactForm) {
				console.log("📧 Auto-detected contact form - setting EMAIL defaults");

				// Set intelligent defaults
				if (!props.customNodeProps.data?.transportName) {
					props.updateNodeData(props.customNodeProps.id, "transportName", "Support Email Transport");
				}
				if (!props.customNodeProps.data?.transportType) {
					props.updateNodeData(props.customNodeProps.id, "transportType", "EMAIL");
				}
				if (!props.customNodeProps.data?.transportTarget) {
					props.updateNodeData(props.customNodeProps.id, "transportTarget", "support@builditbuilder.com");
				}
				if (!props.customNodeProps.data?.transportDescription) {
					props.updateNodeData(props.customNodeProps.id, "transportDescription", "Sends form submissions to support team");
				}
			}
		}
	});

	// Select a transport
	const selectTransport = (transport: any) => {
		selectedTransportId.value = transport.id;
		console.log("🚛 Selected transport:", transport.name);
	};

	// Attach selected transport to hook
	const attachSelectedTransport = () => {
		const selectedTransport = availableTransports.value.find((t) => t.id === selectedTransportId.value);
		if (!selectedTransport) {
			console.error("❌ No transport selected!");
			return;
		}

		console.log("═══════════════════════════════════════════");
		console.log("🚛 ATTACHING TRANSPORT TO HOOK");
		console.log("═══════════════════════════════════════════");
		console.log("FULL TRANSPORT OBJECT:", JSON.stringify(selectedTransport, null, 2));
		console.log("═══════════════════════════════════════════");
		console.log("TRANSPORT NODE DATA:", JSON.stringify(props.customNodeProps.data, null, 2));
		console.log("═══════════════════════════════════════════");
		console.log("KEY VALUES:");
		console.log("  Transport ID:", selectedTransport.id);
		console.log("  Transport Name:", selectedTransport.name);
		console.log("  Transport Type:", selectedTransport.type);
		console.log("  Transport Target:", selectedTransport.target);
		console.log("  Transport Meta:", selectedTransport.meta);
		console.log("  Attached to Hook ID:", props.customNodeProps.data?.attachedToHookId);
		console.log("  Listener Index:", props.customNodeProps.data?.listenerIndex);
		console.log("═══════════════════════════════════════════");

		// TEMPLATE transports stay as TEMPLATE - they handle email sending internally
		const actualType = selectedTransport.type;
		const actualTarget = selectedTransport.target;

		console.log("📋 Transport configuration (keeping original TEMPLATE type):");
		console.log("  Type:", actualType);
		console.log("  Target:", actualTarget);
		console.log("  Meta:", selectedTransport.meta);

		// Update node data with selected transport
		props.updateNodeData(props.customNodeProps.id, "transportId", selectedTransport.id);
		props.updateNodeData(props.customNodeProps.id, "transportName", selectedTransport.name);
		props.updateNodeData(props.customNodeProps.id, "transportType", actualType);
		props.updateNodeData(props.customNodeProps.id, "transportTarget", actualTarget);
		props.updateNodeData(props.customNodeProps.id, "status", "configured");

		// Emit transport attached event with FULL config to update browser node
		const transportConfig = {
			id: selectedTransport.id,
			name: selectedTransport.name,
			type: actualType,
			target: actualTarget,
			nodeId: props.customNodeProps.id
		};

		console.log("═══════════════════════════════════════════");
		console.log("📤 EMITTING EVENTS");
		console.log("  Event 1: transportAttached");
		console.log("    Config:", JSON.stringify(transportConfig, null, 2));
		console.log("    Node ID:", props.customNodeProps.id);
		console.log("═══════════════════════════════════════════");
		emit("transportAttached", transportConfig, props.customNodeProps.id);
		console.log("✅ transportAttached event emitted");

		// ALWAYS emit listenerConfigured if attached to a hook
		if (props.customNodeProps.data?.attachedToHookId) {
			const listenerIndex = props.customNodeProps.data?.listenerIndex ?? 0;
			console.log("═══════════════════════════════════════════");
			console.log("📤 EMITTING LISTENER CONFIGURED EVENT");
			console.log("  Event: listenerConfigured");
			console.log("  Hook ID:", props.customNodeProps.data.attachedToHookId);
			console.log("  Listener Index:", listenerIndex);
			console.log("  Transport Config:", JSON.stringify(transportConfig, null, 2));
			console.log("═══════════════════════════════════════════");
			emit("listenerConfigured", transportConfig, props.customNodeProps.data.attachedToHookId, listenerIndex);
			console.log("✅ listenerConfigured event emitted - should trigger subscription!");
		} else {
			console.warn("═══════════════════════════════════════════");
			console.warn("⚠️ TRANSPORT NOT ATTACHED TO A HOOK!");
			console.warn("  This transport will NOT be subscribed");
			console.warn("  Missing: attachedToHookId in node data");
			console.warn("  Current node data keys:", Object.keys(props.customNodeProps.data || {}));
			console.warn("═══════════════════════════════════════════");
		}

		// If this is a TEMPLATE transport, emit event to create template node showing code
		if (actualType === "TEMPLATE") {
			console.log("═══════════════════════════════════════════");
			console.log("📄 TEMPLATE TRANSPORT - Creating template code node");
			console.log("  Template ID:", actualTarget);
			console.log("  Template Name:", selectedTransport.name);
			console.log("  Template Meta:", selectedTransport.meta);
			console.log("═══════════════════════════════════════════");

			const templateNodeData = {
				templateId: actualTarget,
				templateName: selectedTransport.name,
				templateType: selectedTransport.meta?.provider || selectedTransport.meta?.type || "Email",
				templateCode: selectedTransport.meta?.code || selectedTransport.meta?.template || "// Template code not available",
				templateMeta: selectedTransport.meta,
				transportNodeId: props.customNodeProps.id,
				status: "active"
			};

			emit("createTemplateNode", templateNodeData, props.customNodeProps.id);
			console.log("✅ Emitted createTemplateNode event");
		}

		console.log("✅ Transport configured successfully!");
		console.log("🔗 SUBMISSION CHAIN NOW COMPLETE:");
		console.log("  Form → Hook → Transport (TEMPLATE)");
		console.log("  Transport Config:", transportConfig);
		console.log("  Next: Submit the form to see data flow through the chain");
		console.log("═══════════════════════════════════════════");
	};

	// Create transport from node data
	const createTransportFromNode = async () => {
		if (!props.customNodeProps.data?.transportName) {
			console.error("❌ Transport name is required!");
			return;
		}

		// Ensure type is set (fallback to EMAIL for contact forms)
		const transportType = props.customNodeProps.data.transportType || "EMAIL";
		const transportTarget = props.customNodeProps.data.transportTarget || "";

		if (!transportTarget) {
			console.error("❌ Transport target is required!");
			return;
		}

		isCreating.value = true;
		try {
			console.log("═══════════════════════════════════════════");
			console.log("🔧 CREATING NEW TRANSPORT FROM NODE DATA");
			console.log("  Transport Name:", props.customNodeProps.data.transportName);
			console.log("  Transport Type:", transportType);
			console.log("  Transport Target:", transportTarget);
			console.log("  Transport Description:", props.customNodeProps.data.transportDescription);
			console.log("  Attached to Hook ID:", props.customNodeProps.data.attachedToHookId);
			console.log("═══════════════════════════════════════════");

			// Validate required fields for BAPI
			if (!transportType) {
				throw new Error("Transport type is required");
			}

			// Create transport via ButtClient API
			const createdTransport = await buttClient.createTransport({
				name: props.customNodeProps.data.transportName,
				description: props.customNodeProps.data.transportDescription || "",
				type: transportType,
				target: transportTarget,
				meta: {},
				hook: props.customNodeProps.data.attachedToHookId || undefined
			});

			console.log("✅ Transport created by API:", createdTransport);

			// Update node with created transport data
			props.updateNodeData(props.customNodeProps.id, "transportId", createdTransport.id);
			props.updateNodeData(props.customNodeProps.id, "transportName", createdTransport.name);
			props.updateNodeData(props.customNodeProps.id, "transportType", createdTransport.type);
			props.updateNodeData(props.customNodeProps.id, "transportTarget", createdTransport.target);
			props.updateNodeData(props.customNodeProps.id, "status", "configured");

			// Emit transport attached event with FULL config
			const transportConfig = {
				id: createdTransport.id,
				name: createdTransport.name,
				type: createdTransport.type,
				target: createdTransport.target,
				nodeId: props.customNodeProps.id
			};

			console.log("═══════════════════════════════════════════");
			console.log("📤 EMITTING EVENTS (CREATE MODE)");
			console.log("  Event 1: transportAttached");
			console.log("    Config:", JSON.stringify(transportConfig, null, 2));
			console.log("    Node ID:", props.customNodeProps.id);
			console.log("═══════════════════════════════════════════");
			emit("transportAttached", transportConfig, props.customNodeProps.id);
			console.log("✅ transportAttached event emitted");

			// ALWAYS emit listenerConfigured if attached to a hook
			if (props.customNodeProps.data?.attachedToHookId) {
				const listenerIndex = props.customNodeProps.data?.listenerIndex ?? 0;
				console.log("═══════════════════════════════════════════");
				console.log("📤 EMITTING LISTENER CONFIGURED EVENT (CREATE MODE)");
				console.log("  Event: listenerConfigured");
				console.log("  Hook ID:", props.customNodeProps.data.attachedToHookId);
				console.log("  Listener Index:", listenerIndex);
				console.log("  Transport Config:", JSON.stringify(transportConfig, null, 2));
				console.log("═══════════════════════════════════════════");
				emit("listenerConfigured", transportConfig, props.customNodeProps.data.attachedToHookId, listenerIndex);
				console.log("✅ listenerConfigured event emitted - should trigger subscription!");
			} else {
				console.warn("═══════════════════════════════════════════");
				console.warn("⚠️ TRANSPORT NOT ATTACHED TO A HOOK! (CREATE MODE)");
				console.warn("  This transport will NOT be subscribed");
				console.warn("  Missing: attachedToHookId in node data");
				console.warn("  Current node data keys:", Object.keys(props.customNodeProps.data || {}));
				console.warn("═══════════════════════════════════════════");
			}

			// If this is a TEMPLATE transport, emit event to create template node
			if (createdTransport.type === "TEMPLATE") {
				console.log("═══════════════════════════════════════════");
				console.log("📄 TEMPLATE TRANSPORT CREATED - Creating template code node");
				console.log("  Template ID:", createdTransport.target);
				console.log("  Template Name:", createdTransport.name);
				console.log("═══════════════════════════════════════════");

				const templateNodeData = {
					templateId: createdTransport.target,
					templateName: createdTransport.name,
					templateType: createdTransport.meta?.provider || "Email",
					templateCode: createdTransport.meta?.code || "// Template code not available",
					templateMeta: createdTransport.meta,
					transportNodeId: props.customNodeProps.id,
					status: "active"
				};

				emit("createTemplateNode", templateNodeData, props.customNodeProps.id);
				console.log("✅ Emitted createTemplateNode event (CREATE MODE)");
			}

			console.log("✅ Transport created successfully");
			console.log("  Transport Config:", transportConfig);
			console.log("═══════════════════════════════════════════");
		} catch (error) {
			console.error("❌ Failed to create transport:", error);
		} finally {
			isCreating.value = false;
		}
	};

	// Edit transport from node
	const editTransportFromNode = () => {
		// Reset transport ID to show form again for editing
		props.updateNodeData(props.customNodeProps.id, "transportId", null);
	};

	// Delete transport from node
	const deleteTransportFromNode = () => {
		// Clear transport data from node
		props.updateNodeData(props.customNodeProps.id, "transportId", null);
		props.updateNodeData(props.customNodeProps.id, "transportName", "");
		props.updateNodeData(props.customNodeProps.id, "transportDescription", "");
		props.updateNodeData(props.customNodeProps.id, "transportType", "http");
		props.updateNodeData(props.customNodeProps.id, "transportTarget", "");
	};

	// Get placeholder text based on transport type
	const getTargetPlaceholder = (type: string | undefined) => {
		switch (type) {
		case "EMAIL":
			return "support@builditbuilder.com";
		case "SLACK":
			return "#support-channel";
		case "DISCORD":
			return "https://discord.com/api/webhooks/...";
		case "WEBHOOK":
			return "https://api.example.com/webhook";
		default:
			return "e.g. https://api.example.com/webhook";
		}
	};

	// Handle close button click
	const handleClose = () => {
		console.log("🗑️ TransportNode: Close button clicked");
		emit("closeNode", props.customNodeProps.id);
	};
</script>

<style scoped>
.transport-node-container {
	position: relative;
	width: 600px;
	height: 650px;
	min-width: 600px;
	min-height: 650px;
	max-height: 650px;
	display: flex;
	flex-direction: column;
	overflow: hidden;
	background: rgba(var(--color-neutral-rgb), 0.08);
	backdrop-filter: blur(12px);
	border: 1px solid rgba(20, 184, 166, 0.3);
	border-radius: 12px;
}

/* Node Header */
.node-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 0.75rem;
	border-bottom: 1px solid rgba(20, 184, 166, 0.2);
	background-color: rgba(20, 184, 166, 0.1);
	border-radius: 0.5rem 0.5rem 0 0;
	flex-shrink: 0;
}

.close-button {
	width: 24px;
	height: 24px;
	display: flex;
	align-items: center;
	justify-content: center;
	background: rgba(239, 68, 68, 0.15);
	border: 1px solid rgba(239, 68, 68, 0.3);
	border-radius: 4px;
	color: rgba(239, 68, 68, 0.9);
	cursor: pointer;
	transition: all 0.2s ease;
	flex-shrink: 0;
}

.close-button:hover {
	background: rgba(239, 68, 68, 0.25);
	border-color: rgba(239, 68, 68, 0.5);
	transform: scale(1.1);
	box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

.close-button:active {
	transform: scale(0.95);
}

/* Connection Handles */
.connection-handle {
	width: 0.75rem;
	height: 0.75rem;
	border: 2px solid rgba(20, 184, 166, 0.6);
	background-color: rgba(20, 184, 166, 0.2);
	border-radius: 50%;
	transition: all 0.2s ease;
}

.connection-handle:hover {
	border-color: rgba(20, 184, 166, 1);
	background-color: rgba(20, 184, 166, 0.4);
}

/* Transport Config Container - Scrollable wrapper */
.transport-config-container {
	flex: 1;
	overflow-y: auto;
	overflow-x: hidden;
	min-height: 0;
	cursor: default;
	position: relative;
}

.transport-config-container::-webkit-scrollbar {
	width: 8px;
}

.transport-config-container::-webkit-scrollbar-track {
	background: rgba(255, 255, 255, 0.05);
	border-radius: 4px;
}

.transport-config-container::-webkit-scrollbar-thumb {
	background: rgba(20, 184, 166, 0.4);
	border-radius: 4px;
	border: 2px solid transparent;
	background-clip: padding-box;
}

.transport-config-container::-webkit-scrollbar-thumb:hover {
	background: rgba(20, 184, 166, 0.6);
	background-clip: padding-box;
}

/* Mode Selection */
.mode-selection {
	display: flex;
	gap: 0.5rem;
	padding: 1rem;
	background: rgba(0, 0, 0, 0.2);
	border-radius: 0.5rem;
	margin: 1rem;
	flex-shrink: 0;
}

.mode-button {
	flex: 1;
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 0.5rem;
	padding: 0.75rem 1rem;
	background: rgba(255, 255, 255, 0.05);
	border: 1px solid rgba(255, 255, 255, 0.1);
	border-radius: 0.5rem;
	color: rgba(255, 255, 255, 0.6);
	font-size: 0.875rem;
	font-weight: 600;
	cursor: pointer;
	transition: all 0.2s ease;
}

.mode-button:hover {
	background: rgba(255, 255, 255, 0.08);
	color: rgba(255, 255, 255, 0.9);
	border-color: rgba(255, 255, 255, 0.2);
}

.mode-button.active {
	background: rgba(20, 184, 166, 0.2);
	border-color: rgba(20, 184, 166, 0.4);
	color: rgb(20, 184, 166);
	box-shadow: 0 4px 12px rgba(20, 184, 166, 0.2);
}

/* Transport Selection Panel */
.transport-selection-panel {
	padding: 1rem;
	flex: 1;
	min-height: 0;
	display: flex;
	flex-direction: column;
}

.section-header {
	display: flex;
	align-items: center;
	gap: 0.5rem;
	padding: 0.75rem 1rem;
	background: rgba(20, 184, 166, 0.1);
	border-radius: 0.5rem;
	margin-bottom: 0.5rem;
	flex-shrink: 0;
}

.scroll-indicator {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 0.5rem;
	padding: 0.5rem;
	margin-bottom: 0.5rem;
	background: rgba(20, 184, 166, 0.05);
	border: 1px solid rgba(20, 184, 166, 0.2);
	border-radius: 0.5rem;
	flex-shrink: 0;
}

.transport-count-badge {
	margin-left: auto;
	padding: 0.25rem 0.5rem;
	background: rgba(20, 184, 166, 0.2);
	border: 1px solid rgba(20, 184, 166, 0.3);
	border-radius: 0.25rem;
	font-size: 0.75rem;
	font-weight: 700;
	color: rgb(20, 184, 166);
}

.loading-state,
.empty-state {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	gap: 0.75rem;
	padding: 3rem 1rem;
	text-align: center;
}

.transports-list {
	display: flex;
	flex-direction: column;
	gap: 0.5rem;
	margin-bottom: 1rem;
	flex: 1;
	overflow-y: scroll !important;
	overflow-x: hidden;
	min-height: 200px;
	max-height: 400px;
	cursor: default;
	padding-right: 4px;
}

.transports-list::-webkit-scrollbar {
	width: 8px;
}

.transports-list::-webkit-scrollbar-track {
	background: rgba(255, 255, 255, 0.05);
	border-radius: 4px;
}

.transports-list::-webkit-scrollbar-thumb {
	background: rgba(20, 184, 166, 0.5);
	border-radius: 4px;
	border: 2px solid transparent;
	background-clip: padding-box;
}

.transports-list::-webkit-scrollbar-thumb:hover {
	background: rgba(20, 184, 166, 0.7);
	background-clip: padding-box;
}

.transport-item {
	padding: 1rem;
	background: rgba(255, 255, 255, 0.05);
	border: 1px solid rgba(255, 255, 255, 0.1);
	border-radius: 0.5rem;
	cursor: pointer;
	transition: all 0.2s ease;
	text-align: left;
	width: 100%;
	flex-shrink: 0;
	position: relative;
}

.transport-item:hover {
	background: rgba(255, 255, 255, 0.08);
	border-color: rgba(20, 184, 166, 0.3);
	transform: translateY(-2px);
	box-shadow: 0 4px 12px rgba(20, 184, 166, 0.2);
}

.transport-item.selected {
	background: rgba(20, 184, 166, 0.15);
	border-color: rgba(20, 184, 166, 0.5);
	box-shadow: 0 4px 12px rgba(20, 184, 166, 0.3);
}

.transport-item-header {
	display: flex;
	align-items: center;
	gap: 0.5rem;
	margin-bottom: 0.5rem;
}

.transport-name {
	font-size: 0.875rem;
	font-weight: 600;
	color: rgba(255, 255, 255, 0.9);
}

.transport-description {
	font-size: 0.75rem;
	color: rgba(255, 255, 255, 0.6);
	margin-bottom: 0.5rem;
	line-height: 1.4;
}

.transport-meta {
	display: flex;
	gap: 0.5rem;
	flex-wrap: wrap;
}

.meta-tag {
	padding: 0.25rem 0.5rem;
	background: rgba(99, 102, 241, 0.2);
	border: 1px solid rgba(99, 102, 241, 0.3);
	border-radius: 0.25rem;
	font-size: 0.625rem;
	font-weight: 700;
	color: rgb(99, 102, 241);
	text-transform: uppercase;
}

.meta-tag.enabled {
	background: rgba(34, 197, 94, 0.2);
	border-color: rgba(34, 197, 94, 0.3);
	color: rgb(34, 197, 94);
}

.meta-tag.disabled {
	background: rgba(239, 68, 68, 0.2);
	border-color: rgba(239, 68, 68, 0.3);
	color: rgb(239, 68, 68);
}

.attach-selected-transport-btn {
	width: 100%;
	padding: 1rem 1.5rem;
	background: linear-gradient(135deg, rgba(20, 184, 166, 0.2), rgba(20, 184, 166, 0.1));
	border: 1px solid rgba(20, 184, 166, 0.4);
	border-radius: 0.75rem;
	color: rgba(20, 184, 166, 0.9);
	font-size: 0.875rem;
	font-weight: 600;
	cursor: pointer;
	transition: all 0.3s ease;
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 0.5rem;
	backdrop-filter: blur(12px);
	flex-shrink: 0;
	margin-top: auto;
}

.attach-selected-transport-btn:hover {
	background: linear-gradient(135deg, rgba(20, 184, 166, 0.3), rgba(20, 184, 166, 0.2));
	border-color: rgba(20, 184, 166, 0.6);
	color: rgb(20, 184, 166);
	transform: translateY(-2px);
	box-shadow: 0 8px 25px rgba(20, 184, 166, 0.2);
}

/* Transport Configuration Form */
.transport-config-form {
	padding: 1.5rem;
	margin: 1rem;
	border-radius: 0.5rem;
	background: rgba(var(--color-neutral-rgb), 0.12);
	backdrop-filter: blur(24px) saturate(1.8);
	border: 1px solid rgba(var(--color-primary-rgb), 0.25);
	box-shadow:
		0 4px 12px rgba(0, 0, 0, 0.15),
		0 0 0 1px rgba(var(--color-primary-rgb), 0.1),
		inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.form-section {
	margin-bottom: 1.5rem;
}

.form-label {
	display: flex;
	align-items: center;
	gap: 0.5rem;
	font-size: 0.875rem;
	font-weight: 600;
	color: rgba(255, 255, 255, 0.8);
	margin-bottom: 0.5rem;
}

.form-input,
.form-textarea {
	width: 100%;
	padding: 0.75rem 1rem;
	background: rgba(17, 24, 39, 0.8);
	border: 1px solid rgba(20, 184, 166, 0.3);
	border-radius: 0.5rem;
	color: white;
	font-size: 0.9375rem;
	font-weight: 500;
	line-height: 1.5;
	transition: all 0.2s ease;
}

.form-input option {
	background: rgba(17, 24, 39, 0.95);
	color: white;
	font-size: 0.9375rem;
	padding: 0.75rem;
	line-height: 1.5;
}

.form-input::placeholder,
.form-textarea::placeholder {
	color: rgba(255, 255, 255, 0.4);
}

.form-input:focus,
.form-textarea:focus {
	outline: none;
	border-color: rgba(20, 184, 166, 0.5);
	background: rgba(var(--color-neutral-rgb), 0.12);
	box-shadow: 0 0 0 3px rgba(20, 184, 166, 0.1);
}

.form-textarea {
	resize: vertical;
	min-height: 4rem;
}

.form-actions {
	margin-top: 1.5rem;
	padding-top: 1rem;
	border-top: 1px solid rgba(20, 184, 166, 0.2);
}

.create-transport-btn {
	width: 100%;
	padding: 1rem 1.5rem;
	background: linear-gradient(135deg, rgba(20, 184, 166, 0.2), rgba(20, 184, 166, 0.1));
	border: 1px solid rgba(20, 184, 166, 0.4);
	border-radius: 0.75rem;
	color: rgba(20, 184, 166, 0.9);
	font-size: 0.875rem;
	font-weight: 600;
	cursor: pointer;
	transition: all 0.3s ease;
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 0.5rem;
	backdrop-filter: blur(12px);
}

.create-transport-btn:hover:not(:disabled) {
	background: linear-gradient(135deg, rgba(20, 184, 166, 0.3), rgba(20, 184, 166, 0.2));
	border-color: rgba(20, 184, 166, 0.6);
	color: rgb(20, 184, 166);
	transform: translateY(-2px);
	box-shadow: 0 8px 25px rgba(20, 184, 166, 0.2);
}

.create-transport-btn:disabled {
	opacity: 0.5;
	cursor: not-allowed;
	transform: none;
}

/* Transport Status Display */
.transport-status-display {
	padding: 1.5rem;
}

.transport-info-card {
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

.transport-header {
	display: flex;
	align-items: center;
	gap: 0.75rem;
	margin-bottom: 1rem;
	padding-bottom: 0.75rem;
	border-bottom: 1px solid rgba(34, 197, 94, 0.2);
}

.transport-name {
	font-size: 0.875rem;
	color: rgba(255, 255, 255, 0.9);
	font-weight: 600;
}

.transport-details {
	display: flex;
	flex-direction: column;
	gap: 0.75rem;
	margin-bottom: 1rem;
}

.detail-row {
	display: flex;
	justify-content: space-between;
	align-items: center;
	gap: 0.5rem;
}

.detail-label {
	font-size: 0.75rem;
	color: rgba(255, 255, 255, 0.5);
	font-weight: 600;
	text-transform: uppercase;
}

.detail-value {
	font-size: 0.875rem;
	color: rgba(255, 255, 255, 0.9);
	font-weight: 600;
}

.transport-target {
	font-family: 'JetBrains Mono', 'Fira Code', monospace;
	font-size: 0.75rem;
	background: rgba(0, 0, 0, 0.3);
	padding: 0.25rem 0.5rem;
	border-radius: 0.25rem;
	border: 1px solid rgba(255, 255, 255, 0.1);
}

.field-help-text {
	display: flex;
	align-items: center;
	gap: 0.5rem;
	margin-top: 0.5rem;
	padding: 0.5rem 0.75rem;
	background: rgba(59, 130, 246, 0.1);
	border: 1px solid rgba(59, 130, 246, 0.2);
	border-radius: 0.375rem;
	font-size: 0.75rem;
	color: rgba(59, 130, 246, 0.9);
}

.transport-actions {
	display: flex;
	gap: 0.75rem;
}

.edit-transport-btn,
.delete-transport-btn {
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

.edit-transport-btn {
	background: rgba(59, 130, 246, 0.2);
	border: 1px solid rgba(59, 130, 246, 0.4);
	color: rgba(59, 130, 246, 0.9);
}

.edit-transport-btn:hover {
	background: rgba(59, 130, 246, 0.3);
	border-color: rgba(59, 130, 246, 0.6);
	color: rgb(59, 130, 246);
	transform: translateY(-2px);
}

.delete-transport-btn {
	background: rgba(239, 68, 68, 0.2);
	border: 1px solid rgba(239, 68, 68, 0.4);
	color: rgba(239, 68, 68, 0.9);
}

.delete-transport-btn:hover {
	background: rgba(239, 68, 68, 0.3);
	border-color: rgba(239, 68, 68, 0.6);
	color: rgb(239, 68, 68);
	transform: translateY(-2px);
}
</style>
