<template>
	<NodeController
		v-if="customNodeProps"
		:custom-node-props="customNodeProps"
		:update-node-data="updateNodeData"
		node-type="template"
		icon="i-lucide-file-text"
		icon-class="text-indigo-500"
		:title="customNodeProps.data?.label || 'Template Node'"
		title-class="text-indigo-500"
		border-color="rgba(99, 102, 241, 0.3)"
		:min-width="400"
		:min-height="250"
		:default-collapsed="Boolean(customNodeProps.data?.templateId)"
		@close="handleClose"
		@edit="handleEdit"
		@delete="handleDelete"
	>
		<!-- Custom Header -->
		<template #header>
			<div class="flex items-center gap-2">
				<Icon name="lucide:file-text" class="w-4 h-4 text-indigo-500" />
				<h3 class="text-sm font-semibold text-indigo-500">
					{{ customNodeProps.data?.label || 'Template Node' }}
				</h3>
			</div>
			<div class="flex items-center gap-1">
				<div class="w-2 h-2 rounded-full bg-indigo-500" />
				<span class="text-xs text-indigo-500/70">Template</span>
			</div>
		</template>

		<!-- Node Content -->
		<template #default>
			<div class="template-node-content">
				<!-- Node Details -->
				<div class="node-details">
					<div class="detail-row">
						<span class="detail-label">Type</span>
						<span class="detail-value">Template</span>
					</div>
					<div class="detail-row">
						<span class="detail-label">Template Type</span>
						<span class="detail-value">{{ customNodeProps.data?.templateType || 'component' }}</span>
					</div>
					<div class="detail-row">
						<span class="detail-label">Name</span>
						<span class="detail-value">{{ customNodeProps.data?.templateName || 'MyTemplate' }}</span>
					</div>
					<div class="detail-row">
						<span class="detail-label">Status</span>
						<span class="detail-value" :class="getStatusClass(customNodeProps.data?.status)">
							{{ customNodeProps.data?.status || (customNodeProps.data?.templateId ? 'Configured' : 'Inactive') }}
						</span>
					</div>
				</div>

				<!-- Node Actions -->
				<div class="node-actions">
					<button
						v-if="!customNodeProps.data?.templateId"
						class="define-template-button"
						@click.stop="handleCreateTemplateClick"
					>
						<Icon name="lucide:plus" class="w-3 h-3" />
						Create Template
					</button>
					<button
						v-else-if="customNodeProps.data?.status === 'configured' && customNodeProps.data?.templateId"
						class="setup-template-button"
						@click.stop="handleSetupClick"
					>
						<Icon name="lucide:play" class="w-3 h-3" />
						Setup
					</button>
					<button
						v-else
						class="configure-template-button"
						@click.stop="handleConfigureClick"
					>
						<Icon name="lucide:settings" class="w-3 h-3" />
						Configure Template
					</button>
				</div>
			</div>
		</template>
	</NodeController>
</template>

<script lang="ts" setup>
	import NodeController from "./templates/NodeController.vue";

	interface Props {
		customNodeProps: any
		updateNodeData: (nodeId: string, key: string, value: any) => void
		getStatusClass: (status: string) => string
		openTemplateCreationModal: (nodeId: string) => void
		triggerTemplateChain?: (nodeId: string) => void
	}

	const props = defineProps<Props>();

	const emit = defineEmits<{
		close: [];
		edit: [];
		delete: [];
	}>();

	/**
	 * Handle close button click
	 */
	const handleClose = () => {
		console.log("🚪 TemplateNodeInline: Close event received");
		emit("close");
	};

	/**
	 * Handle edit button click
	 */
	const handleEdit = () => {
		console.log("✏️ TemplateNodeInline: Edit event received");
		emit("edit");
	};

	/**
	 * Handle delete button click
	 */
	const handleDelete = () => {
		console.log("🗑️ TemplateNodeInline: Delete event received");
		emit("delete");
	};

	/**
	 * Handle create template button click
	 */
	const handleCreateTemplateClick = () => {
		console.log("═══════════════════════════════════════");
		console.log("🎯 TEMPLATE NODE: Create Template Button Clicked");
		console.log("  Node ID:", props.customNodeProps.id);
		console.log("  Has openTemplateCreationModal:", !!props.openTemplateCreationModal);
		console.log("  Current templateId:", props.customNodeProps.data?.templateId);
		console.log("═══════════════════════════════════════");
		
		if (props.openTemplateCreationModal) {
			console.log("✅ Calling openTemplateCreationModal with ID:", props.customNodeProps.id);
			props.openTemplateCreationModal(props.customNodeProps.id);
		} else {
			console.error("❌ openTemplateCreationModal prop is not defined!");
		}
	};

	/**
	 * Handle setup button click (for configured templates)
	 */
	const handleSetupClick = () => {
		console.log("⚡ TEMPLATE NODE: Setup Button Clicked");
		console.log("  Node ID:", props.customNodeProps.id);
		
		if (props.triggerTemplateChain) {
			console.log("✅ Calling triggerTemplateChain");
			props.triggerTemplateChain(props.customNodeProps.id);
		} else {
			console.error("❌ triggerTemplateChain prop is not defined!");
		}
	};

	/**
	 * Handle configure button click (for existing templates)
	 */
	const handleConfigureClick = () => {
		console.log("🔧 TEMPLATE NODE: Configure Template Button Clicked");
		console.log("  Node ID:", props.customNodeProps.id);
		
		if (props.openTemplateCreationModal) {
			console.log("✅ Calling openTemplateCreationModal (edit mode)");
			props.openTemplateCreationModal(props.customNodeProps.id);
		} else {
			console.error("❌ openTemplateCreationModal prop is not defined!");
		}
	};
</script>

<style scoped>
.template-node-content {
	display: flex;
	flex-direction: column;
	gap: 16px;
}

.node-details {
	display: flex;
	flex-direction: column;
	gap: 8px;
	padding: 12px;
	background: rgba(99, 102, 241, 0.05);
	border: 1px solid rgba(99, 102, 241, 0.15);
	border-radius: 8px;
}

.detail-row {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 6px 0;
	border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.detail-row:last-child {
	border-bottom: none;
}

.detail-label {
	font-size: 0.75rem;
	color: rgba(255, 255, 255, 0.5);
	font-weight: 500;
}

.detail-value {
	font-size: 0.8125rem;
	color: rgba(255, 255, 255, 0.9);
	font-weight: 600;
}

.node-actions {
	display: flex;
	flex-direction: column;
	gap: 8px;
}

.define-template-button,
.setup-template-button,
.configure-template-button {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 6px;
	padding: 10px 16px;
	border-radius: 8px;
	font-size: 0.8125rem;
	font-weight: 600;
	cursor: pointer;
	transition: all 0.2s ease;
	border: 1px solid;
}

.define-template-button {
	background: rgba(99, 102, 241, 0.1);
	border-color: rgba(99, 102, 241, 0.3);
	color: rgb(99, 102, 241);
}

.define-template-button:hover {
	background: rgba(99, 102, 241, 0.2);
	border-color: rgba(99, 102, 241, 0.5);
	transform: translateY(-1px);
}

.setup-template-button {
	background: rgba(34, 197, 94, 0.1);
	border-color: rgba(34, 197, 94, 0.3);
	color: rgb(34, 197, 94);
}

.setup-template-button:hover {
	background: rgba(34, 197, 94, 0.2);
	border-color: rgba(34, 197, 94, 0.5);
	transform: translateY(-1px);
}

.configure-template-button {
	background: rgba(234, 179, 8, 0.1);
	border-color: rgba(234, 179, 8, 0.3);
	color: rgb(234, 179, 8);
}

.configure-template-button:hover {
	background: rgba(234, 179, 8, 0.2);
	border-color: rgba(234, 179, 8, 0.5);
	transform: translateY(-1px);
}
</style>
