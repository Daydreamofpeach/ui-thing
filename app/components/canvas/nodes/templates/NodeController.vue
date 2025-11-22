<template>
	<BaseNodeTemplate
		:custom-node-props="customNodeProps"
		:update-node-data="updateNodeData"
		:node-class="nodeClass"
		:background-color="backgroundColor"
		:border-color="borderColor"
		:border-width="borderWidth"
		:border-radius="borderRadius"
		:icon="icon"
		:icon-class="iconClass"
		:title="title"
		:title-class="titleClass"
		:min-width="minWidth"
		:min-height="minHeight"
		:max-width="maxWidth"
		:max-height="maxHeight"
		:show-resizer="showResizer"
		:show-handles="showHandles"
		:handle-color="handleColor"
		:collapsible="collapsible"
		:default-collapsed="defaultCollapsed"
		:show-default-header="showDefaultHeader"
		:show-edit-button="showEditButton"
		:show-close-button="showCloseButton"
		@resize="handleResize"
		@collapsed="handleCollapsed"
		@edit="handleEditClick"
		@delete="handleDeleteClick"
		@close-node="$emit('closeNode')"
	>
		<!-- Header Slot -->
		<template v-if="$slots.header" #header="{ isCollapsed, toggleCollapse }">
			<div class="node-controller-header">
				<div class="header-content">
					<slot name="header" :is-collapsed="isCollapsed" :toggle-collapse="toggleCollapse" />
				</div>

				<!-- Close button (only in config panel) -->
				<button
					v-if="isInConfigPanel && showCloseButton"
					class="node-close-button"
					title="Close configuration"
					@click.stop="handleCloseClick"
				>
					<UIcon name="i-lucide-x" class="w-4 h-4" />
				</button>
			</div>
		</template>

		<!-- Header Actions Slot (for buttons in header) -->
		<template v-if="$slots.headerActions" #header-actions>
			<slot name="header-actions" />

			<!-- Close button (only in config panel) when using default header -->
			<button
				v-if="isInConfigPanel && showCloseButton && !$slots.header"
				class="node-close-button"
				title="Close configuration"
				@click.stop="handleCloseClick"
			>
				<UIcon name="i-lucide-x" class="w-4 h-4" />
			</button>
		</template>

		<!-- Main Content -->
		<template #default="{ isInConfigPanel: inPanel, updateData }">
			<slot :is-in-config-panel="inPanel" :update-data="updateData" />
		</template>

		<!-- Footer Slot -->
		<template v-if="$slots.footer" #footer>
			<slot name="footer" />
		</template>
	</BaseNodeTemplate>
</template>

<script setup lang="ts">
	import { computed } from "vue";
	import BaseNodeTemplate from "./BaseNodeTemplate.vue";

	interface Props {
		customNodeProps?: any
		updateNodeData?: (nodeId: string, key: string, value: any) => void

		// Node identification
		nodeType?: string
		icon?: string
		iconClass?: string
		title?: string
		titleClass?: string

		// Styling
		nodeClass?: string
		backgroundColor?: string
		borderColor?: string
		borderWidth?: number
		borderRadius?: number

		// Behavior
		minWidth?: number
		minHeight?: number
		maxWidth?: number
		maxHeight?: number
		showResizer?: boolean
		showHandles?: boolean
		handleColor?: string
		collapsible?: boolean
		defaultCollapsed?: boolean
		showDefaultHeader?: boolean
		showEditButton?: boolean
		showCloseButton?: boolean

		// Handlers
		onClose?: () => void
		onEdit?: () => void
		onDelete?: () => void
		onResize?: (width: number, height: number) => void
		onCollapsed?: (collapsed: boolean) => void
	}

	const props = withDefaults(defineProps<Props>(), {
		customNodeProps: undefined,
		updateNodeData: undefined,
		nodeType: "unknown",
		icon: undefined,
		iconClass: "text-primary",
		title: undefined,
		titleClass: "text-primary",
		nodeClass: "",
		backgroundColor: "rgba(0, 0, 0, 0.95)",
		borderColor: "rgba(var(--color-primary-rgb), 0.3)",
		borderWidth: 1,
		borderRadius: 12,
		minWidth: 400,
		minHeight: 300,
		maxWidth: Infinity,
		maxHeight: Infinity,
		showResizer: true,
		showHandles: true,
		handleColor: "var(--color-primary)",
		collapsible: true,
		defaultCollapsed: true,
		showDefaultHeader: true,
		showEditButton: true,
		showCloseButton: true,
		onClose: undefined,
		onEdit: undefined,
		onDelete: undefined,
		onResize: undefined,
		onCollapsed: undefined
	});

	const emit = defineEmits<{
		close: []
		closeNode: []
		edit: []
		delete: []
		resize: [width: number, height: number]
		collapsed: [collapsed: boolean]
	}>();

	/**
	 * Detect if in configuration panel
	 */
	const isInConfigPanel = computed(() => {
		return props.customNodeProps?.draggable === false;
	});

	/**
	 * Handle close button click
	 */
	const handleCloseClick = () => {
		console.log("🚪 NodeController: Close button clicked");
		console.log("  Node ID:", props.customNodeProps?.id);
		console.log("  Node Type:", props.nodeType);

		// Call custom handler if provided
		if (props.onClose) {
			props.onClose();
		}

		// Emit both events for compatibility
		emit("close");
		emit("closeNode");
	};

	/**
	 * Handle resize event from BaseNodeTemplate
	 */
	const handleResize = (width: number, height: number) => {
		if (props.onResize) {
			props.onResize(width, height);
		}
		emit("resize", width, height);
	};

	/**
	 * Handle collapsed event from BaseNodeTemplate
	 */
	const handleCollapsed = (collapsed: boolean) => {
		if (props.onCollapsed) {
			props.onCollapsed(collapsed);
		}
		emit("collapsed", collapsed);
	};

	/**
	 * Handle edit button click
	 */
	const handleEditClick = () => {
		console.log("✏️ NodeController: Edit button clicked");
		console.log("  Node ID:", props.customNodeProps?.id);
		console.log("  Node Type:", props.nodeType);

		// Call custom handler if provided
		if (props.onEdit) {
			props.onEdit();
		}

		// Emit edit event
		emit("edit");
	};

	/**
	 * Handle delete button click
	 */
	const handleDeleteClick = () => {
		console.log("🗑️ NodeController: Delete button clicked");
		console.log("  Node ID:", props.customNodeProps?.id);
		console.log("  Node Type:", props.nodeType);

		// Call custom handler if provided
		if (props.onDelete) {
			props.onDelete();
		}

		// Emit both events for compatibility
		emit("delete");
		emit("closeNode");
	};
</script>

<style scoped>
.node-controller-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	width: 100%;
	gap: 12px;
}

.header-content {
	flex: 1;
	min-width: 0;
	display: flex;
	align-items: center;
	gap: 8px;
}

.node-close-button {
	width: 28px;
	height: 28px;
	display: flex;
	align-items: center;
	justify-content: center;
	background: rgba(239, 68, 68, 0.1);
	border: 1px solid rgba(239, 68, 68, 0.3);
	border-radius: 6px;
	color: rgba(239, 68, 68, 0.8);
	cursor: pointer;
	transition: all 0.2s ease;
	flex-shrink: 0;
}

.node-close-button:hover {
	background: rgba(239, 68, 68, 0.2);
	border-color: rgba(239, 68, 68, 0.5);
	color: rgb(239, 68, 68);
	transform: scale(1.05);
}

.node-close-button:active {
	transform: scale(0.95);
}
</style>
