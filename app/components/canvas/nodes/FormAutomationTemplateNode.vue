<template>
	<div class="form-automation-template-node">
		<!-- Connection Handles -->
		<Handle id="left" type="target" :position="Position.Left" class="connection-handle" />
		<Handle id="right" type="source" :position="Position.Right" class="connection-handle" />
		<Handle id="bottom" type="source" :position="Position.Bottom" class="connection-handle" />

		<!-- Header -->
		<div class="node-header">
			<div class="header-left">
				<Icon name="lucide:file-check-2" class="w-5 h-5 text-purple-400" />
				<h3 class="node-title">{{ customNodeProps.data?.templateName || 'Form Automation Template' }}</h3>
			</div>
			<div class="header-badge">
				<Icon name="lucide:zap" class="w-3 h-3" />
				<span>Configured</span>
			</div>
		</div>

		<!-- Form Info Card -->
		<div class="form-info-card">
			<div class="info-row">
				<span class="info-label">Form Title</span>
				<span class="info-value">{{ customNodeProps.data?.formTitle || 'N/A' }}</span>
			</div>
			<div class="info-row">
				<span class="info-label">Nodes</span>
				<span class="info-value">{{ nodeCount }}</span>
			</div>
			<div class="info-row">
				<span class="info-label">Created</span>
				<span class="info-value">{{ formatDate(customNodeProps.data?.createdAt) }}</span>
			</div>
		</div>

		<!-- Chain Components Preview -->
		<div class="chain-preview">
			<div class="chain-preview-header">
				<Icon name="lucide:workflow" class="w-4 h-4 text-cyan-400" />
				<span>Automation Chain</span>
			</div>
			<div class="chain-components">
				<div v-if="hasFormPanel" class="chain-component">
					<Icon name="lucide:layout-panel-left" class="w-3 h-3 text-purple-400" />
					<span>Forms Panel</span>
				</div>
				<div v-if="hasBrowser" class="chain-component">
					<Icon name="lucide:globe" class="w-3 h-3 text-green-400" />
					<span>Preview</span>
				</div>
				<div v-if="hasHook" class="chain-component">
					<Icon name="lucide:webhook" class="w-3 h-3 text-cyan-400" />
					<span>Hook</span>
				</div>
				<div v-if="transportCount > 0" class="chain-component">
					<Icon name="lucide:truck" class="w-3 h-3 text-teal-400" />
					<span>{{ transportCount }} Transport{{ transportCount > 1 ? 's' : '' }}</span>
				</div>
				<div v-if="templateCount > 0" class="chain-component">
					<Icon name="lucide:file-code" class="w-3 h-3 text-purple-400" />
					<span>{{ templateCount }} Template{{ templateCount > 1 ? 's' : '' }}</span>
				</div>
			</div>
		</div>

		<!-- Action Buttons (similar to form cards) -->
		<div class="action-buttons">
			<button
				class="action-btn preview-btn"
				:class="{ active: isChainShown }"
				@click.stop="handleShowChain"
				@mousedown.stop
			>
				<Icon :name="isChainShown ? 'lucide:eye-off' : 'lucide:eye'" class="w-4 h-4" />
				<span>{{ isChainShown ? 'Hide Chain' : 'Show Chain' }}</span>
			</button>
			<button
				class="action-btn code-btn"
				@click.stop="handleViewCode"
				@mousedown.stop
			>
				<Icon name="lucide:code" class="w-4 h-4" />
				<span>View Code</span>
			</button>
		</div>

		<!-- Description -->
		<div v-if="customNodeProps.data?.templateDescription" class="description">
			<p>{{ customNodeProps.data.templateDescription }}</p>
		</div>
	</div>
</template>

<script lang="ts" setup>
	import { Handle, Position } from "@vue-flow/core";
	import { computed } from "vue";

	interface Props {
		customNodeProps: any
		updateNodeData: (nodeId: string, key: string, value: any) => void
	}

	const props = defineProps<Props>();

	const emit = defineEmits<{
		showChain: [templateId: string, nodeId: string, isShown: boolean]
		viewCode: [templateId: string]
	}>();

	// Track whether chain is currently shown
	const isChainShown = computed(() => props.customNodeProps.data?.chainShown || false);

	// Computed properties from template data
	const nodeCanvas = computed(() => props.customNodeProps.data?.templateNodeCanvas || {});
	const nodes = computed(() => nodeCanvas.value.nodes || []);
	const edges = computed(() => nodeCanvas.value.edges || []);

	const nodeCount = computed(() => nodes.value.length);
	const hasFormPanel = computed(() => nodes.value.some((n: any) => n.type === "formsPanelNode"));
	const hasBrowser = computed(() => nodes.value.some((n: any) => n.type === "browserNode"));
	const hasHook = computed(() => nodes.value.some((n: any) => n.type === "hookNode"));
	const transportCount = computed(() => nodes.value.filter((n: any) => n.type === "transportNode").length);
	const templateCount = computed(() => nodes.value.filter((n: any) => n.type === "transportTemplateNode").length);

	// Format date for display
	const formatDate = (dateString: string) => {
		if (!dateString) return "N/A";
		const date = new Date(dateString);
		return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
	};

	// Handle showing/hiding the chain (toggle)
	const handleShowChain = () => {
		const newState = !isChainShown.value;
		console.log(`👁️ ${newState ? 'Showing' : 'Hiding'} chain for template:`, props.customNodeProps.data?.templateId);
		
		// Update node data to track state
		props.updateNodeData(props.customNodeProps.id, "chainShown", newState);
		
		// Emit event with toggle state
		emit("showChain", props.customNodeProps.data?.templateId || props.customNodeProps.id, props.customNodeProps.id, newState);
	};

	// Handle viewing code
	const handleViewCode = () => {
		console.log("💻 View code clicked for template:", props.customNodeProps.data?.templateId);
		emit("viewCode", props.customNodeProps.data?.templateId || props.customNodeProps.id);
	};
</script>

<style scoped>
.form-automation-template-node {
	background: linear-gradient(135deg, rgba(168, 85, 247, 0.15), rgba(139, 92, 246, 0.15));
	border: 2px solid rgba(168, 85, 247, 0.4);
	border-radius: 12px;
	width: 450px;
	min-width: 450px;
	padding: 16px;
	display: flex;
	flex-direction: column;
	gap: 14px;
	backdrop-filter: blur(10px);
	box-shadow: 0 8px 32px rgba(168, 85, 247, 0.2);
	position: relative;
}

/* Connection Handles */
.connection-handle {
	width: 12px;
	height: 12px;
	background: rgba(168, 85, 247, 0.8);
	border: 2px solid rgba(168, 85, 247, 1);
	border-radius: 50%;
}

/* Header */
.node-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding-bottom: 12px;
	border-bottom: 1px solid rgba(168, 85, 247, 0.2);
}

.header-left {
	display: flex;
	align-items: center;
	gap: 10px;
}

.node-title {
	font-size: 1rem;
	font-weight: 700;
	color: rgba(255, 255, 255, 0.95);
	margin: 0;
}

.header-badge {
	display: flex;
	align-items: center;
	gap: 6px;
	padding: 4px 12px;
	background: rgba(168, 85, 247, 0.2);
	border: 1px solid rgba(168, 85, 247, 0.4);
	border-radius: 12px;
	font-size: 0.75rem;
	font-weight: 600;
	color: rgba(168, 85, 247, 1);
}

/* Form Info Card */
.form-info-card {
	background: rgba(0, 0, 0, 0.3);
	border: 1px solid rgba(168, 85, 247, 0.2);
	border-radius: 8px;
	padding: 12px;
	display: flex;
	flex-direction: column;
	gap: 8px;
}

.info-row {
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.info-label {
	font-size: 0.75rem;
	color: rgba(255, 255, 255, 0.6);
	font-weight: 500;
}

.info-value {
	font-size: 0.875rem;
	color: rgba(255, 255, 255, 0.95);
	font-weight: 600;
}

/* Chain Preview */
.chain-preview {
	background: rgba(6, 182, 212, 0.08);
	border: 1px solid rgba(6, 182, 212, 0.2);
	border-radius: 8px;
	padding: 12px;
}

.chain-preview-header {
	display: flex;
	align-items: center;
	gap: 8px;
	margin-bottom: 10px;
	font-size: 0.875rem;
	font-weight: 600;
	color: rgba(6, 182, 212, 1);
}

.chain-components {
	display: flex;
	flex-wrap: wrap;
	gap: 6px;
}

.chain-component {
	display: flex;
	align-items: center;
	gap: 6px;
	padding: 6px 10px;
	background: rgba(0, 0, 0, 0.4);
	border: 1px solid rgba(255, 255, 255, 0.1);
	border-radius: 6px;
	font-size: 0.75rem;
	color: rgba(255, 255, 255, 0.85);
}

/* Action Buttons (similar to form cards) */
.action-buttons {
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: 8px;
}

.action-btn {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 6px;
	padding: 10px 14px;
	background: rgba(0, 0, 0, 0.3);
	border: 1px solid rgba(168, 85, 247, 0.3);
	border-radius: 8px;
	color: rgba(255, 255, 255, 0.9);
	font-size: 0.875rem;
	font-weight: 600;
	cursor: pointer;
	transition: all 0.2s ease;
}

.action-btn:hover {
	background: rgba(168, 85, 247, 0.2);
	border-color: rgba(168, 85, 247, 0.5);
	transform: translateY(-2px);
	box-shadow: 0 4px 12px rgba(168, 85, 247, 0.3);
}

.preview-btn:hover {
	background: rgba(34, 197, 94, 0.2);
	border-color: rgba(34, 197, 94, 0.5);
	box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);
}

.preview-btn.active {
	background: rgba(34, 197, 94, 0.25);
	border-color: rgba(34, 197, 94, 0.6);
	box-shadow: 0 0 20px rgba(34, 197, 94, 0.4);
}

.code-btn:hover {
	background: rgba(59, 130, 246, 0.2);
	border-color: rgba(59, 130, 246, 0.5);
	box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

/* Description */
.description {
	padding: 12px;
	background: rgba(0, 0, 0, 0.2);
	border-radius: 6px;
	font-size: 0.875rem;
	color: rgba(255, 255, 255, 0.7);
	line-height: 1.5;
}

.description p {
	margin: 0;
}
</style>

