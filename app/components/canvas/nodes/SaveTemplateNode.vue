<template>
	<div class="save-template-node">
		<CustomNodeResizer
			:min-width="500"
			:min-height="400"
			@resize="handleResize"
		/>

		<!-- Header -->
		<div class="node-header">
			<UIcon name="i-lucide-save" class="w-5 h-5 text-purple-400" />
			<span class="node-title">Save Template</span>
			<div class="status-badge" :class="getStatusColorClass(saveStatus)">
				<span class="status-text" :class="getStatusTextColor(saveStatus)">
					{{ getStatusText(saveStatus) }}
				</span>
			</div>
		</div>

		<!-- Template Info -->
		<div class="section">
			<div class="section-header">
				<UIcon name="i-lucide-file-text" class="w-4 h-4 text-blue-400" />
				<span class="text-sm font-medium text-white/80">Template Information</span>
			</div>
			<div class="template-info">
				<div class="info-row">
					<span class="label">Name:</span>
					<span class="value">{{ templateName || 'Untitled Template' }}</span>
				</div>
				<div class="info-row">
					<span class="label">Template ID:</span>
					<span class="value text-xs">{{ templateId || 'Not set' }}</span>
				</div>
				<div class="info-row">
					<span class="label">Nodes in Chain:</span>
					<span class="value">{{ customNodeProps.data?.chainNodeCount || 0 }}</span>
				</div>
				<div class="info-row">
					<span class="label">Scripts:</span>
					<span class="value">{{ customNodeProps.data?.scriptCount || 0 }}</span>
				</div>
			</div>
		</div>

		<!-- Configuration Summary -->
		<div class="section">
			<div class="section-header">
				<UIcon name="i-lucide-package" class="w-4 h-4 text-green-400" />
				<span class="text-sm font-medium text-white/80">Configuration Summary</span>
			</div>
			<div class="config-summary">
				<div class="config-item">
					<UIcon
						:name="customNodeProps.data?.hasBJson ? 'i-lucide-check-circle' : 'i-lucide-circle'"
						:class="customNodeProps.data?.hasBJson ? 'text-green-400' : 'text-gray-400'"
						class="w-4 h-4"
					/>
					<span>b.json Configuration</span>
				</div>
				<div class="config-item">
					<UIcon
						:name="customNodeProps.data?.hasBlJson ? 'i-lucide-check-circle' : 'i-lucide-circle'"
						:class="customNodeProps.data?.hasBlJson ? 'text-green-400' : 'text-gray-400'"
						class="w-4 h-4"
					/>
					<span>bl.json Environment</span>
				</div>
				<div class="config-item">
					<UIcon
						:name="customNodeProps.data?.hasNodeChain ? 'i-lucide-check-circle' : 'i-lucide-circle'"
						:class="customNodeProps.data?.hasNodeChain ? 'text-green-400' : 'text-gray-400'"
						class="w-4 h-4"
					/>
					<span>Node Chain Layout</span>
				</div>
			</div>
		</div>

		<!-- Actions -->
		<div class="actions-section">
			<button
				class="action-button primary"
				:disabled="isSaving || !canSaveTemplate"
				@click="saveTemplateToApi"
			>
				<UIcon name="i-lucide-save" class="w-4 h-4" />
				<span>{{ saveStatus === 'complete' ? 'Update Template' : 'Save Template' }}</span>
			</button>
		</div>

		<!-- Process Log -->
		<div v-if="processLog.length > 0" class="process-log">
			<div class="log-header">
				<UIcon name="i-lucide-scroll-text" class="w-3 h-3" />
				<span class="text-xs font-medium text-white/60">Process Log</span>
			</div>
			<div class="log-content">
				<div v-for="(log, index) in processLog" :key="index" class="log-entry" :class="`log-${log.type}`">
					<UIcon
						:name="log.type === 'success' ? 'i-lucide-check' : log.type === 'error' ? 'i-lucide-x' : 'i-lucide-info'"
						class="w-3 h-3"
					/>
					<span class="text-xs">{{ log.message }}</span>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
	import { useToast } from "#ui/composables/useToast";
	import { computed, ref, watch } from "vue";
	import { buttClient } from "~/utils/buttClient";
	import CustomNodeResizer from "../shared/CustomNodeResizer.vue";

	interface Props {
		customNodeProps: any
		updateNodeData: (nodeId: string, key: string, value: any) => void
		projectId: string
		canvasNodes?: any[]
		canvasEdges?: any[]
		canvasViewport?: any
	}

	const props = defineProps<Props>();
	const emit = defineEmits<{
		"save-status-changed": [status: "idle" | "saving" | "saved" | "error"]
		"template-saved": [templateId: string]
	}>();

	const toast = useToast();

	// State
	const saveStatus = ref<"idle" | "reading" | "saving" | "complete" | "error">("idle");
	const isSaving = ref(false);
	const processLog = ref<Array<{ type: string, message: string }>>([]);

	const templateId = computed(() => {
		const id = props.customNodeProps.data?.templateId;
		console.log("🎯 SaveTemplateNode: Computed templateId:", id);
		console.log("🎯 SaveTemplateNode: Node data:", props.customNodeProps.data);
		return id;
	});
	const templateName = computed(() => props.customNodeProps.data?.templateName);
	const projectPath = computed(() => props.customNodeProps.data?.projectPath);
	const bFolderPath = computed(() => `${projectPath.value}\\b`);

	const canSaveTemplate = computed(() => {
		// For NEW templates: only need projectPath + b.json + templateName
		// For EXISTING templates: need templateId + projectPath + b.json
		const canSave = templateName.value && projectPath.value && props.customNodeProps.data?.hasBJson;
		console.log("🎯 SaveTemplateNode: Can save?", canSave, {
			hasTemplateName: !!templateName.value,
			templateId: templateId.value,
			projectPath: projectPath.value,
			hasBJson: props.customNodeProps.data?.hasBJson,
			mode: (!templateId.value || templateId.value.startsWith("templateNode_")) ? "CREATE NEW" : "UPDATE EXISTING"
		});
		return canSave;
	});

	// Add log entry
	const addLog = (type: "info" | "success" | "error", message: string) => {
		processLog.value.push({ type, message });
		if (processLog.value.length > 10) {
			processLog.value.shift();
		}
	};

	// Read b.json and bl.json
	const readBFolderFiles = async () => {
		try {
			const { readTextFile } = await import("@tauri-apps/plugin-fs");

			addLog("info", "Reading b.json...");
			const bJsonContent = await readTextFile(`${bFolderPath.value}\\b.json`);
			const bJson = JSON.parse(bJsonContent);

			addLog("info", "Reading bl.json...");
			const blJsonContent = await readTextFile(`${bFolderPath.value}\\bl.json`);
			const blJson = JSON.parse(blJsonContent);

			return { bJson, blJson };
		} catch (error) {
			addLog("error", `Failed to read files: ${error}`);
			throw error;
		}
	};

	// Save template to API - supports BOTH create and update
	const saveTemplateToApi = async () => {
		isSaving.value = true;
		saveStatus.value = "reading";
		processLog.value = [];

		try {
			console.log("💾 SaveTemplateNode: Starting save process");

			// Read b.json and bl.json for script/environment data
			const { bJson, blJson } = await readBFolderFiles();

			addLog("success", `Found ${bJson.setup?.all?.scripts?.length || 0} scripts`);
			addLog("success", `Found ${Object.keys(blJson.detectedTools || {}).length} tools`);

			// Gather canvas data WITHOUT positions (templates are position-agnostic)
			// Positions are managed separately in canvas views
			const nodeCanvas = {
				nodes: (props.canvasNodes || []).map((node: any) => ({
					id: node.id,
					type: node.type,
					// DO NOT save position data to templates
					// Templates should be reusable and position-independent
					data: node.data || {},
					style: node.style || {},
					draggable: node.draggable !== false,
					selectable: node.selectable !== false
				})),
				edges: (props.canvasEdges || []).map((edge: any) => ({
					id: edge.id,
					source: edge.source,
					target: edge.target,
					type: edge.type || "default",
					animated: edge.animated || false,
					animationType: edge.animationType,
					animationSpeed: edge.animationSpeed,
					label: edge.label,
					style: edge.style || {},
					markerEnd: edge.markerEnd
				})),
				viewport: props.canvasViewport || { x: 0, y: 0, zoom: 1 }
			};

			console.log("═══════════════════════════════════════════");
			console.log("💾 SAVE TEMPLATE: Determining mode");
			console.log("═══════════════════════════════════════════");
			console.log("📋 Template ID:", templateId.value);
			console.log("📋 Template Name:", templateName.value);

			// Determine if CREATE or UPDATE
			const isNewTemplate = !templateId.value || templateId.value.startsWith("templateNode_");

			if (isNewTemplate) {
				// ═══════════════════════════════════════════
				// CREATE NEW TEMPLATE
				// ═══════════════════════════════════════════
				console.log("🆕 MODE: CREATE NEW TEMPLATE");
				addLog("info", "Creating NEW template in database...");

				// Generate a BUTT identifier
				const buttId = `TEMPLATE.${(templateName.value || "Untitled").replace(/\s+/g, "")}.${Date.now()}`;

				// Determine if this is a form automation chain or regular template
				const hasFormNodes = nodeCanvas.nodes.some((n: any) => 
					n.type === "browserNode" || n.type === "formsPanelNode"
				);
				const templateType = hasFormNodes ? "FORM_AUTOMATION_CHAIN" : "TEMPLATE";

				// Prepare template creation payload (following dashboard.vue pattern)
				const createPayload = {
					name: templateName.value || "Untitled Template",
					description: `Template with ${nodeCanvas.nodes.length} nodes and ${nodeCanvas.edges.length} connections`,
					template: {
						type: templateType,
						nodeCanvas,
						setup: bJson.setup || {},
						environment: blJson || {},
						actions: bJson.setup?.all?.scripts || [],
						projectId: props.projectId // 🔑 ADD projectId to template
					},
					author: "CANVAS",
					public: false,
					elevated: false,
					meta: {
						projectId: props.projectId, // 🔑 ADD projectId to meta
						projectPath: projectPath.value,
						butt: buttId,
						createdFrom: "node-canvas",
						nodeCount: nodeCanvas.nodes.length,
						edgeCount: nodeCanvas.edges.length,
						hasSetup: !!bJson.setup,
						hasEnvironment: !!blJson
					}
				};

				console.log("📦 CREATE Payload:", {
					name: createPayload.name,
					nodeCount: nodeCanvas.nodes.length,
					edgeCount: nodeCanvas.edges.length,
					hasSetup: !!bJson.setup,
					hasEnvironment: !!blJson
				});

				saveStatus.value = "saving";
				emit("save-status-changed", "saving");
				addLog("info", "Calling createTemplate API...");

				// Call CREATE API
				const createdTemplate = await buttClient.createTemplate(createPayload);

				addLog("success", `✓ Template created! ID: ${createdTemplate.id}`);
				console.log("✅ Template CREATED successfully:", createdTemplate);

				// Update THIS node with new database ID
				props.updateNodeData(props.customNodeProps.id, "templateId", createdTemplate.id);
				props.updateNodeData(props.customNodeProps.id, "templateName", createdTemplate.name);
				props.updateNodeData(props.customNodeProps.id, "status", "complete");
				props.updateNodeData(props.customNodeProps.id, "lastSaved", new Date().toISOString());

				// Emit events
				saveStatus.value = "complete";
				emit("save-status-changed", "saved");
				if (createdTemplate.id) {
					emit("template-saved", createdTemplate.id);
				}

				toast.add({
					title: "Template Created",
					description: `"${createdTemplate.name}" has been saved to the database`,
					color: "success",
					icon: "i-lucide-check-circle"
				});
			} else {
				// ═══════════════════════════════════════════
				// UPDATE EXISTING TEMPLATE
				// ═══════════════════════════════════════════
				console.log("📝 MODE: UPDATE EXISTING TEMPLATE");
				console.log("   Database ID:", templateId.value);
				addLog("info", "Updating existing template in database...");

				// Determine if this is a form automation chain or regular template
				const hasFormNodes = nodeCanvas.nodes.some((n: any) => 
					n.type === "browserNode" || n.type === "formsPanelNode"
				);
				const templateType = hasFormNodes ? "FORM_AUTOMATION_CHAIN" : "TEMPLATE";

				// Prepare update payload
				const updatePayload = {
					template: {
						type: templateType,
						nodeCanvas,
						setup: bJson.setup || {},
						environment: blJson || {},
						actions: bJson.setup?.all?.scripts || [],
						projectId: props.projectId // 🔑 ADD projectId to template
					},
					meta: {
						projectId: props.projectId // 🔑 ADD projectId to meta
					}
				};

				console.log("📦 UPDATE Payload:", {
					templateId: templateId.value,
					nodeCount: nodeCanvas.nodes.length,
					edgeCount: nodeCanvas.edges.length,
					hasSetup: !!bJson.setup,
					hasEnvironment: !!blJson
				});

				saveStatus.value = "saving";
				emit("save-status-changed", "saving");
				addLog("info", "Calling updateTemplate API...");

				// Call UPDATE API
				const updatedTemplate = await buttClient.updateTemplate(templateId.value, updatePayload);

				addLog("success", "✓ Template updated!");
				console.log("✅ Template UPDATED successfully:", updatedTemplate);

				// Update node status
				props.updateNodeData(props.customNodeProps.id, "status", "complete");
				props.updateNodeData(props.customNodeProps.id, "lastSaved", new Date().toISOString());

				emit("save-status-changed", "saved");
				emit("template-saved", templateId.value);

				toast.add({
					title: "Template Updated",
					description: `"${templateName.value}" has been updated successfully`,
					color: "success",
					icon: "i-lucide-check-circle"
				});
			}

			console.log("═══════════════════════════════════════════");
			saveStatus.value = "complete";

			// Auto-fade to idle after 3s
			setTimeout(() => {
				emit("save-status-changed", "idle");
			}, 3000);
		} catch (error: any) {
			console.error("❌ SaveTemplateNode: Error saving template:", error);
			console.error("❌ Error details:", {
				message: error?.message,
				stack: error?.stack,
				error
			});

			saveStatus.value = "error";
			emit("save-status-changed", "error");
			addLog("error", `Save failed: ${error?.message || error}`);

			toast.add({
				title: "Save Failed",
				description: error?.message || String(error),
				color: "error",
				icon: "i-lucide-x-circle"
			});
		} finally {
			isSaving.value = false;
		}
	};

	// Status helpers
	const getStatusColorClass = (status: string) => {
		switch (status) {
		case "reading": return "bg-blue-500";
		case "saving": return "bg-yellow-500";
		case "complete": return "bg-green-500";
		case "error": return "bg-red-500";
		default: return "bg-gray-500";
		}
	};

	const getStatusTextColor = (status: string) => {
		switch (status) {
		case "reading": return "text-blue-500/70";
		case "saving": return "text-yellow-500/70";
		case "complete": return "text-green-500/70";
		case "error": return "text-red-500/70";
		default: return "text-gray-500/70";
		}
	};

	const getStatusText = (status: string) => {
		switch (status) {
		case "reading": return "Reading Files";
		case "saving": return "Saving";
		case "complete": return "Saved";
		case "error": return "Error";
		default: return "Ready";
		}
	};

	const handleResize = (width: number, height: number) => {
		props.updateNodeData(props.customNodeProps.id, "width", width);
		props.updateNodeData(props.customNodeProps.id, "height", height);
	};

	// Watch for b.json creation to enable saving
	watch(() => props.customNodeProps.data?.hasBJson, (hasBJson) => {
		if (hasBJson && saveStatus.value === "idle") {
			addLog("success", "b.json detected - ready to save!");
		}
	});
</script>

<style scoped>
.save-template-node {
	background: rgba(var(--color-neutral-rgb), 0.2);
	border: 2px solid rgba(var(--color-primary-rgb), 0.3);
	border-radius: 12px;
	padding: 16px;
	min-width: 500px;
	min-height: 400px;
	display: flex;
	flex-direction: column;
	gap: 12px;
	backdrop-filter: blur(10px);
}

.node-header {
	display: flex;
	align-items: center;
	gap: 8px;
	padding-bottom: 12px;
	border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.node-title {
	font-weight: 600;
	font-size: 1rem;
	color: white;
	flex: 1;
}

.status-badge {
	padding: 4px 12px;
	border-radius: 12px;
	font-size: 0.75rem;
	font-weight: 600;
}

.section {
	display: flex;
	flex-direction: column;
	gap: 8px;
}

.section-header {
	display: flex;
	align-items: center;
	gap: 6px;
	padding: 6px 0;
}

.template-info, .config-summary {
	display: flex;
	flex-direction: column;
	gap: 8px;
	padding: 8px;
	background: rgba(0, 0, 0, 0.2);
	border-radius: 6px;
}

.info-row {
	display: flex;
	justify-content: space-between;
	align-items: center;
	gap: 8px;
}

.label {
	font-size: 0.75rem;
	color: rgba(255, 255, 255, 0.6);
	font-weight: 500;
}

.value {
	font-size: 0.875rem;
	color: rgba(255, 255, 255, 0.9);
	font-weight: 400;
}

.config-item {
	display: flex;
	align-items: center;
	gap: 8px;
	font-size: 0.875rem;
	color: rgba(255, 255, 255, 0.8);
}

.actions-section {
	display: flex;
	flex-wrap: wrap;
	gap: 8px;
	margin-top: auto;
}

.action-button {
	flex: 1;
	min-width: 120px;
	padding: 10px 16px;
	border-radius: 8px;
	border: 1px solid rgba(255, 255, 255, 0.2);
	background: rgba(var(--color-primary-rgb), 0.1);
	color: white;
	font-size: 0.875rem;
	font-weight: 500;
	cursor: pointer;
	transition: all 0.2s;
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 6px;
}

.action-button:hover:not(:disabled) {
	background: rgba(var(--color-primary-rgb), 0.2);
	border-color: rgba(var(--color-primary-rgb), 0.5);
	transform: translateY(-1px);
}

.action-button:disabled {
	opacity: 0.5;
	cursor: not-allowed;
}

.action-button.primary {
	background: rgba(var(--color-primary-rgb), 0.3);
	border-color: rgba(var(--color-primary-rgb), 0.5);
}

.process-log {
	display: flex;
	flex-direction: column;
	gap: 6px;
	padding: 8px;
	background: rgba(0, 0, 0, 0.3);
	border-radius: 6px;
	max-height: 150px;
	overflow-y: auto;
}

.log-header {
	display: flex;
	align-items: center;
	gap: 4px;
	margin-bottom: 4px;
	padding-bottom: 4px;
	border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.log-content {
	display: flex;
	flex-direction: column;
	gap: 4px;
}

.log-entry {
	display: flex;
	align-items: center;
	gap: 6px;
	padding: 4px 6px;
	border-radius: 4px;
	background: rgba(0, 0, 0, 0.2);
}

.log-entry.log-success {
	border-left: 2px solid #10b981;
}

.log-entry.log-error {
	border-left: 2px solid #ef4444;
}

.log-entry.log-info {
	border-left: 2px solid #3b82f6;
}

.process-log::-webkit-scrollbar {
	width: 6px;
}

.process-log::-webkit-scrollbar-track {
	background: rgba(0, 0, 0, 0.2);
	border-radius: 3px;
}

.process-log::-webkit-scrollbar-thumb {
	background: rgba(255, 255, 255, 0.2);
	border-radius: 3px;
}

.process-log::-webkit-scrollbar-thumb:hover {
	background: rgba(255, 255, 255, 0.3);
}
</style>
