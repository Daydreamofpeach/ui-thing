<template>
	<div class="transport-template-node-container">
		<!-- Connection Handles -->
		<Handle id="left" type="target" :position="Position.Left" class="connection-handle" />
		<Handle id="top" type="target" :position="Position.Top" class="connection-handle" />

		<!-- Header -->
		<div class="node-header">
			<div class="flex items-center gap-2">
				<Icon name="lucide:file-code" class="w-4 h-4 text-purple-500" />
				<h3 class="text-sm font-semibold text-purple-500">
					{{ customNodeProps.data?.label || 'Transport Template' }}
				</h3>
			</div>
			<div class="flex items-center gap-2">
				<div class="flex items-center gap-1">
					<div class="w-2 h-2 rounded-full bg-purple-500" />
					<span class="text-xs text-purple-500/70">Template</span>
				</div>
				<button
					class="close-button"
					title="Close template node"
					@click.stop="handleClose"
				>
					<Icon name="lucide:x" class="w-4 h-4" />
				</button>
			</div>
		</div>

		<!-- Template Info -->
		<div class="template-content">
			<div class="template-info-section">
				<div class="info-header">
					<Icon name="lucide:info" class="w-4 h-4 text-purple-400" />
					<span class="info-title">Template Details</span>
				</div>

				<div class="info-grid">
					<div class="info-row">
						<span class="info-label">Template Name</span>
						<span class="info-value">{{ customNodeProps.data?.templateName || 'Unknown' }}</span>
					</div>
					<div class="info-row">
						<span class="info-label">Template ID</span>
						<span class="info-value template-id">{{ customNodeProps.data?.templateId || 'N/A' }}</span>
					</div>
					<div class="info-row">
						<span class="info-label">Transport Type</span>
						<span class="info-value type-badge">TEMPLATE</span>
					</div>
					<div v-if="customNodeProps.data?.templateType" class="info-row">
						<span class="info-label">Email Provider</span>
						<span class="info-value provider-badge">{{ customNodeProps.data.templateType }}</span>
					</div>
				</div>
			</div>

			<!-- Template Code Preview -->
			<div v-if="customNodeProps.data?.templateCode" class="template-code-section">
				<div class="code-header">
					<Icon name="lucide:code" class="w-4 h-4 text-cyan-400" />
					<span class="code-title">Template Code</span>
					<button
						class="copy-button"
						title="Copy template code"
						@click="copyTemplateCode"
					>
						<Icon name="lucide:copy" class="w-3 h-3" />
					</button>
				</div>
				<pre class="code-preview"><code>{{ customNodeProps.data.templateCode }}</code></pre>
			</div>

			<!-- Template Meta Preview -->
			<div v-if="customNodeProps.data?.templateMeta" class="template-meta-section">
				<div class="meta-header">
					<Icon name="lucide:settings" class="w-4 h-4 text-blue-400" />
					<span class="meta-title">Configuration</span>
				</div>
				<pre class="meta-preview"><code>{{ JSON.stringify(customNodeProps.data.templateMeta, null, 2) }}</code></pre>
			</div>

			<!-- Status Badge -->
			<div class="status-section">
				<div class="status-badge" :class="customNodeProps.data?.status || 'active'">
					<Icon name="lucide:check-circle" class="w-3 h-3" />
					<span>{{ customNodeProps.data?.status === 'active' ? 'Active Template' : 'Configured' }}</span>
				</div>
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
	import { useToast } from "#imports";
	import { Handle, Position } from "@vue-flow/core";

	interface Props {
		customNodeProps: any
		updateNodeData: (nodeId: string, key: string, value: any) => void
	}

	const props = defineProps<Props>();
	const emit = defineEmits<{
		closeNode: [nodeId: string]
	}>();

	const toast = useToast();

	// Copy template code to clipboard
	const copyTemplateCode = async () => {
		try {
			await navigator.clipboard.writeText(props.customNodeProps.data?.templateCode || "");
			toast.add({
				title: "Copied!",
				description: "Template code copied to clipboard",
				color: "success"
			});
		} catch (error) {
			console.error("Failed to copy template code:", error);
		}
	};

	// Handle close button click
	const handleClose = () => {
		console.log("🗑️ TransportTemplateNode: Close button clicked");
		emit("closeNode", props.customNodeProps.id);
	};
</script>

<style scoped>
.transport-template-node-container {
	position: relative;
	width: 500px;
	min-width: 500px;
	max-width: 500px;
	height: auto;
	min-height: 400px;
	max-height: 700px;
	display: flex;
	flex-direction: column;
	overflow: hidden;
	background: rgba(var(--color-neutral-rgb), 0.08);
	backdrop-filter: blur(12px);
	border: 1px solid rgba(168, 85, 247, 0.3);
	border-radius: 12px;
}

/* Node Header */
.node-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 0.75rem;
	border-bottom: 1px solid rgba(168, 85, 247, 0.2);
	background-color: rgba(168, 85, 247, 0.1);
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

/* Connection Handles */
.connection-handle {
	width: 0.75rem;
	height: 0.75rem;
	border: 2px solid rgba(168, 85, 247, 0.6);
	background-color: rgba(168, 85, 247, 0.2);
	border-radius: 50%;
	transition: all 0.2s ease;
}

.connection-handle:hover {
	border-color: rgba(168, 85, 247, 1);
	background-color: rgba(168, 85, 247, 0.4);
}

/* Template Content */
.template-content {
	flex: 1;
	overflow-y: auto;
	overflow-x: hidden;
	padding: 1.5rem;
	display: flex;
	flex-direction: column;
	gap: 1.5rem;
}

.template-content::-webkit-scrollbar {
	width: 8px;
}

.template-content::-webkit-scrollbar-track {
	background: rgba(255, 255, 255, 0.05);
	border-radius: 4px;
}

.template-content::-webkit-scrollbar-thumb {
	background: rgba(168, 85, 247, 0.4);
	border-radius: 4px;
}

/* Info Section */
.template-info-section {
	background: rgba(var(--color-neutral-rgb), 0.12);
	border: 1px solid rgba(168, 85, 247, 0.25);
	border-radius: 0.75rem;
	padding: 1rem;
}

.info-header,
.code-header,
.meta-header {
	display: flex;
	align-items: center;
	gap: 0.5rem;
	margin-bottom: 1rem;
	padding-bottom: 0.75rem;
	border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.info-title,
.code-title,
.meta-title {
	font-size: 0.875rem;
	font-weight: 600;
	color: rgba(255, 255, 255, 0.9);
}

.copy-button {
	margin-left: auto;
	padding: 0.5rem;
	background: rgba(6, 182, 212, 0.2);
	border: 1px solid rgba(6, 182, 212, 0.3);
	border-radius: 0.375rem;
	color: rgba(6, 182, 212, 0.9);
	cursor: pointer;
	transition: all 0.2s ease;
	display: flex;
	align-items: center;
	justify-content: center;
}

.copy-button:hover {
	background: rgba(6, 182, 212, 0.3);
	border-color: rgba(6, 182, 212, 0.5);
	color: rgb(6, 182, 212);
}

.info-grid {
	display: flex;
	flex-direction: column;
	gap: 0.75rem;
}

.info-row {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 0.5rem 0;
	border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.info-row:last-child {
	border-bottom: none;
}

.info-label {
	font-size: 0.75rem;
	font-weight: 600;
	color: rgba(255, 255, 255, 0.6);
	text-transform: uppercase;
}

.info-value {
	font-size: 0.875rem;
	font-weight: 600;
	color: rgba(255, 255, 255, 0.9);
}

.template-id {
	font-family: 'JetBrains Mono', 'Fira Code', monospace;
	font-size: 0.75rem;
	background: rgba(0, 0, 0, 0.3);
	padding: 0.25rem 0.5rem;
	border-radius: 0.25rem;
}

.type-badge {
	padding: 0.25rem 0.5rem;
	background: rgba(168, 85, 247, 0.2);
	border: 1px solid rgba(168, 85, 247, 0.3);
	border-radius: 0.25rem;
	font-size: 0.75rem;
	font-weight: 700;
	color: rgb(168, 85, 247);
	text-transform: uppercase;
}

.provider-badge {
	padding: 0.25rem 0.5rem;
	background: rgba(59, 130, 246, 0.2);
	border: 1px solid rgba(59, 130, 246, 0.3);
	border-radius: 0.25rem;
	font-size: 0.75rem;
	font-weight: 700;
	color: rgb(59, 130, 246);
	text-transform: uppercase;
}

/* Code Section */
.template-code-section,
.template-meta-section {
	background: rgba(17, 24, 39, 0.8);
	border: 1px solid rgba(168, 85, 247, 0.25);
	border-radius: 0.75rem;
	padding: 1rem;
}

.code-preview,
.meta-preview {
	margin: 0;
	padding: 1rem;
	background: rgba(0, 0, 0, 0.4);
	border: 1px solid rgba(255, 255, 255, 0.1);
	border-radius: 0.5rem;
	color: rgba(255, 255, 255, 0.9);
	font-family: 'JetBrains Mono', 'Fira Code', monospace;
	font-size: 0.75rem;
	line-height: 1.5;
	overflow-x: auto;
	max-height: 300px;
	overflow-y: auto;
}

.code-preview::-webkit-scrollbar,
.meta-preview::-webkit-scrollbar {
	width: 6px;
	height: 6px;
}

.code-preview::-webkit-scrollbar-track,
.meta-preview::-webkit-scrollbar-track {
	background: rgba(0, 0, 0, 0.3);
	border-radius: 3px;
}

.code-preview::-webkit-scrollbar-thumb,
.meta-preview::-webkit-scrollbar-thumb {
	background: rgba(168, 85, 247, 0.5);
	border-radius: 3px;
}

/* Status Section */
.status-section {
	display: flex;
	justify-content: center;
	padding-top: 1rem;
	border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.status-badge {
	display: flex;
	align-items: center;
	gap: 0.5rem;
	padding: 0.75rem 1.25rem;
	background: rgba(34, 197, 94, 0.2);
	border: 1px solid rgba(34, 197, 94, 0.3);
	border-radius: 0.5rem;
	font-size: 0.875rem;
	font-weight: 600;
	color: rgb(34, 197, 94);
}

.status-badge.active {
	background: rgba(34, 197, 94, 0.2);
	border-color: rgba(34, 197, 94, 0.4);
	color: rgb(34, 197, 94);
}

.status-badge.configured {
	background: rgba(59, 130, 246, 0.2);
	border-color: rgba(59, 130, 246, 0.4);
	color: rgb(59, 130, 246);
}
</style>
