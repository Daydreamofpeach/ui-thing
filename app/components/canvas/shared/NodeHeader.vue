<template>
	<div class="node-header" :style="headerStyles">
		<!-- Left Side: Icon + Title -->
		<div
			class="header-left"
			:class="{ 'is-collapsible': collapsible }"
			@click="handleHeaderClick"
		>
			<slot name="icon">
				<UIcon v-if="icon" :name="icon" class="header-icon" :class="iconClass" />
			</slot>

			<slot name="title">
				<h3 class="header-title" :class="titleClass" :style="titleStyles">
					{{ title }}
				</h3>
			</slot>
		</div>

		<!-- Right Side: Status Badge + Custom Actions + Close -->
		<div class="header-right">
			<!-- Custom Actions Slot -->
			<slot name="actions" />

			<!-- Edit Button (Optional) -->
			<button
				v-if="showEditButton"
				class="action-button edit-button"
				title="Edit node"
				@click.stop="handleEditClick"
			>
				<UIcon name="i-lucide-pencil" class="w-4 h-4" />
			</button>

			<!-- Close/Delete Button -->
			<button
				v-if="showCloseButton"
				class="action-button close-button"
				:title="closeButtonLabel"
				@click.stop="handleCloseClick"
			>
				<UIcon :name="closeButtonIcon" class="w-4 h-4" />
			</button>

			<!-- Collapse Button (Optional) -->
			<button
				v-if="collapsible"
				class="action-button collapse-button"
				:title="computedIsCollapsed ? 'Expand' : 'Collapse'"
				@click.stop="handleToggleCollapse"
			>
				<UIcon
					:name="computedIsCollapsed ? 'i-lucide-chevron-down' : 'i-lucide-chevron-up'"
					class="w-4 h-4"
				/>
			</button>
		</div>
	</div>
</template>

<script setup lang="ts">
	import type { ComputedRef, Ref } from "vue";
	import { computed, inject } from "vue";
	import UIcon from "~/components/Ui/Icon.vue";

	interface Props {
		// Title and Icon
		title?: string
		icon?: string
		iconClass?: string
		titleClass?: string
		titleColor?: string

		// Status Badge
		statusLabel?: string
		statusColor?: string

		// Theming
		backgroundColor?: string
		borderColor?: string
		themeColor?: string
		transparentBackground?: boolean

		// Action Buttons
		showEditButton?: boolean
		showCloseButton?: boolean
		closeButtonLabel?: string
		closeButtonIcon?: string
		collapsible?: boolean
		isCollapsed?: boolean
	}

	const props = withDefaults(defineProps<Props>(), {
		title: "Node",
		icon: undefined,
		iconClass: "",
		titleClass: "",
		titleColor: undefined,
		statusLabel: undefined,
		statusColor: undefined,
		backgroundColor: "rgba(var(--color-primary-rgb), 0.1)",
		borderColor: "rgba(var(--color-primary-rgb), 0.2)",
		themeColor: "var(--color-primary)",
		transparentBackground: false,
		showEditButton: false,
		showCloseButton: true,
		closeButtonLabel: "Close node",
		closeButtonIcon: "i-lucide-x",
		collapsible: false,
		isCollapsed: false
	});

	const emit = defineEmits<{
		close: []
		edit: []
		toggleCollapse: []
	}>();

	// Inject node state if provided by parent (BaseNodeTemplate)
	const nodeState = inject<{
		isCollapsed: Ref<boolean>
		isInConfigPanel: ComputedRef<boolean>
		themeColor: ComputedRef<string>
		borderColor: ComputedRef<string>
		headerColor: ComputedRef<string>
		toggleCollapse: () => void
		handleEdit: () => void
		handleDelete: () => void
	} | null>("nodeState", null);

	// Use injected state if available, otherwise use local handlers
	const handleEditClick = () => {
		if (nodeState?.handleEdit) {
			nodeState.handleEdit();
		} else {
			emit("edit");
		}
	};

	const handleCloseClick = () => {
		if (nodeState?.handleDelete) {
			nodeState.handleDelete();
		} else {
			emit("close");
		}
	};

	const handleToggleCollapse = () => {
		if (nodeState?.toggleCollapse) {
			nodeState.toggleCollapse();
		} else {
			emit("toggleCollapse");
		}
	};

	const handleHeaderClick = () => {
		if (!props.collapsible) return;
		handleToggleCollapse();
	};

	// Computed styles - prefer injected state values
	const headerStyles = computed(() => ({
		backgroundColor: props.transparentBackground ? "transparent" : (nodeState?.headerColor.value || props.backgroundColor),
		borderColor: props.transparentBackground ? "transparent" : (nodeState?.borderColor.value || props.borderColor)
	}));

	const titleStyles = computed(() => ({
		color: props.titleColor || props.themeColor
	}));

	// Use injected collapsed state if available
	const computedIsCollapsed = computed(() => {
		return nodeState?.isCollapsed.value ?? props.isCollapsed;
	});
</script>

<style scoped>
.node-header {
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 0.25rem 0.75rem;
	border-bottom: 1px solid;
	background-color: rgba(var(--color-primary-rgb), 0.1);
	border-color: rgba(var(--color-primary-rgb), 0.2);
	border-radius: 0.5rem 0.5rem 0 0;
	flex-shrink: 0;
	gap: 0.75rem;
}

/* Left Side */
.header-left {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 0.5rem;
	width: 100%;
	min-width: 0;
}

.header-left.is-collapsible {
	cursor: pointer;
}

.header-icon {
	width: 1rem;
	height: 1rem;
	flex-shrink: 0;
	display: none; /* Hide icon in header since it's now above */
}

.header-title {
	font-size: 1.375rem;
	font-weight: 700;
	margin: 0;
	padding: 0;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
	color: currentColor;
	letter-spacing: 0.05em;
	text-align: center;
}

/* Right Side */
.header-right {
	position: absolute;
	top: -10px;
	right: -10px;
	display: flex;
	align-items: center;
	gap: 0.5rem;
	flex-shrink: 0;
	z-index: 20;
}

/* Status Badge */
.status-badge {
	display: flex;
	align-items: center;
	gap: 0.25rem;
	padding: 0.25rem 0.5rem;
	border-radius: 0.25rem;
	font-size: 0.75rem;
	font-weight: 600;
	border: 1px solid;
	transition: all 0.2s ease;
}

.status-indicator {
	width: 0.5rem;
	height: 0.5rem;
	border-radius: 50%;
	flex-shrink: 0;
}

/* Action Buttons */
.action-button {
	width: 28px;
	height: 28px;
	display: flex;
	align-items: center;
	justify-content: center;
	border: 2px solid;
	cursor: pointer;
	transition: all 0.2s ease;
	flex-shrink: 0;
}

.action-button:hover {
	transform: scale(1.1);
}

.action-button:active {
	transform: scale(0.95);
}

/* Edit Button */
.edit-button {
	border-radius: 50%;
	background: rgba(59, 130, 246, 0.2);
	border-color: rgba(59, 130, 246, 0.4);
	color: rgba(59, 130, 246, 0.9);
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.edit-button:hover {
	background: rgba(59, 130, 246, 0.3);
	border-color: rgba(59, 130, 246, 0.6);
	color: rgb(59, 130, 246);
	box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
	transform: scale(1.15);
}

/* Close/Delete Button */
.close-button {
	width: 32px;
	height: 32px;
	border-radius: 50%;
	background: rgb(220, 38, 38);
	border-color: rgb(239, 68, 68);
	color: white;
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
}

.close-button:hover {
	background: rgb(239, 68, 68);
	border-color: rgb(248, 113, 113);
	color: white;
	box-shadow: 0 4px 12px rgba(239, 68, 68, 0.6);
	transform: scale(1.15);
}

/* Collapse Button */
.collapse-button {
	border-radius: 50%;
	background: rgba(255, 255, 255, 0.1);
	border-color: rgba(255, 255, 255, 0.2);
	color: rgba(255, 255, 255, 0.7);
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.collapse-button:hover {
	background: rgba(255, 255, 255, 0.15);
	border-color: rgba(255, 255, 255, 0.3);
	color: white;
	transform: scale(1.15);
}
</style>
