<template>
	<div
		:class="nodeContainerClasses"
		:style="computedNodeStyle"
	>
		<!-- Connection Handles (auto-hidden in config panel) -->
		<Handle
			v-if="!isInConfigPanel && showHandles"
			id="left"
			type="target"
			:position="Position.Left"
			class="connection-handle"
			:style="handleStyle"
		/>
		<Handle
			v-if="!isInConfigPanel && showHandles"
			id="right"
			type="source"
			:position="Position.Right"
			class="connection-handle"
			:style="handleStyle"
		/>
		<Handle
			v-if="!isInConfigPanel && showHandles"
			id="top"
			type="target"
			:position="Position.Top"
			class="connection-handle"
			:style="handleStyle"
		/>
		<Handle
			v-if="!isInConfigPanel && showHandles"
			id="bottom"
			type="source"
			:position="Position.Bottom"
			class="connection-handle"
			:style="handleStyle"
		/>

		<!-- Custom Resizer (auto-hidden in config panel) -->
		<CustomNodeResizer
			v-if="!isInConfigPanel && props.customNodeProps?.selected && showResizer && !isCollapsed"
			:min-width="minWidth"
			:min-height="minHeight"
			:max-width="maxWidth"
			:max-height="maxHeight"
			:show-size-indicator="showSizeIndicator"
			@resize="handleResize"
		/>

		<!-- Sophisticated Icon and Title Header -->
		<NodeIconHeader
			v-if="showDefaultHeader && (icon || iconImage || title)"
			:icon="icon"
			:icon-image="iconImage"
			:icon-class="iconClass"
			:title="title || customNodeProps?.data?.label || 'Node'"
			:title-class="titleClass"
			:status-label="statusLabel"
			:status-color="statusColor"
			:theme-color="themeColor"
			:collapsed="isCollapsed"
		/>

		<!-- Node Header Slot (for custom headers) -->
		<div v-if="$slots.header" :style="headerStyle">
			<slot name="header" :is-collapsed="isCollapsed" :toggle-collapse="toggleCollapse" />
		</div>

		<!-- Default Header with Actions (if no header slot provided) -->
		<NodeHeader
			v-else-if="showDefaultHeader && !(icon || iconImage || title)"
			:title="title || customNodeProps?.data?.label || 'Node'"
			:title-class="titleClass"
			:title-color="themeColor"
			:status-label="statusLabel"
			:status-color="statusColor"
			:show-edit-button="!isInConfigPanel && showEditButton"
			:show-close-button="!isInConfigPanel && showCloseButton"
			:collapsible="collapsible"
			:is-collapsed="isCollapsed"
			:transparent-background="true"
			@toggle-collapse="toggleCollapse"
		>
			<template #actions>
				<slot name="header-actions" />
			</template>
		</NodeHeader>

		<!-- Node Content (Collapsible) -->
		<div v-show="!isCollapsed" :class="contentClasses" :style="contentStyle">
			<slot :is-in-config-panel="isInConfigPanel" :update-data="updateData" />
		</div>

		<!-- Node Footer Slot -->
		<div v-if="$slots.footer && !isCollapsed" :class="footerClasses" :style="footerStyle">
			<slot name="footer" />
		</div>

		<!-- Overlay Slot (renders above node content) -->
		<div v-if="$slots.overlay" class="node-overlay-slot">
			<slot name="overlay" />
		</div>
	</div>
</template>

<script setup lang="ts">
	import CustomNodeResizer from "@canvas/shared/CustomNodeResizer.vue";
	import NodeHeader from "@canvas/shared/NodeHeader.vue";
	import NodeIconHeader from "@canvas/shared/NodeIconHeader.vue";
	import { Handle, Position } from "@vue-flow/core";
	import { computed, provide, ref, watch } from "vue";
	import { tv } from "tailwind-variants";
	import "../styles/nodeContainer.css";

	interface Props {
		customNodeProps?: any
		updateNodeData?: (nodeId: string, key: string, value: any) => void

		// Styling props
		nodeClass?: string
		backgroundColor?: string
		borderColor?: string
		borderWidth?: number
		borderRadius?: number
		headerColor?: string

		// Icon and title
		icon?: string
		iconImage?: string
		iconClass?: string
		title?: string
		titleClass?: string

		// Status and theme
		statusLabel?: string
		statusColor?: string
		themeColor?: string

		// Resizer configuration
		minWidth?: number
		minHeight?: number
		maxWidth?: number
		maxHeight?: number
		showResizer?: boolean
		showSizeIndicator?: boolean

		// Handle configuration
		showHandles?: boolean
		handleColor?: string
		handleSize?: number

		// Header/Footer styling
		headerStyle?: any
		contentStyle?: any
		footerStyle?: any
		showDefaultHeader?: boolean

		// Collapse functionality
		collapsible?: boolean
		defaultCollapsed?: boolean
		collapsedMinWidth?: number
		collapsedMinHeight?: number

		// Action buttons
		showEditButton?: boolean
		showCloseButton?: boolean
	}

	const props = withDefaults(defineProps<Props>(), {
		customNodeProps: undefined,
		updateNodeData: undefined,
		nodeClass: "",
		backgroundColor: undefined, // Will use theme classnames
		borderColor: undefined, // Will use theme classnames
		borderWidth: 1,
		borderRadius: 12,
		headerColor: undefined, // Will use theme classnames
		icon: undefined,
		iconImage: undefined,
		iconClass: "",
		title: undefined,
		titleClass: "",
		statusLabel: undefined,
		statusColor: undefined,
		themeColor: undefined, // Will use primary color from theme
		minWidth: 400,
		minHeight: 300,
		maxWidth: Infinity,
		maxHeight: Infinity,
		showResizer: true,
		showSizeIndicator: true,
		showHandles: true,
		handleColor: undefined, // Will use theme classnames
		handleSize: 8,
		headerStyle: () => ({}),
		contentStyle: () => ({}),
		footerStyle: () => ({}),
		showDefaultHeader: true,
		collapsible: true,
		defaultCollapsed: true,
		collapsedMinWidth: 220,
		collapsedMinHeight: 96,
		showEditButton: true,
		showCloseButton: true
	});

	const emit = defineEmits<{
		edit: []
		delete: []
		collapsed: [collapsed: boolean]
		closeNode: []
	}>();

	// Detect if in configuration panel
	const isInConfigPanel = computed(() => {
		return props.customNodeProps?.draggable === false;
	});

	// Internal state - managed within the component
	const resolveInitialCollapsed = () => {
		if (typeof props.customNodeProps?.data?.collapsed === "boolean") {
			return props.customNodeProps.data.collapsed;
		}
		return props.defaultCollapsed;
	};

	const isCollapsed = ref(resolveInitialCollapsed());
	const currentWidth = ref(props.customNodeProps?.data?.width || props.minWidth);
	const currentHeight = ref(props.customNodeProps?.data?.height || props.minHeight);

	// Sync with external updates to collapsed state
	watch(
		() => props.customNodeProps?.data?.collapsed,
		(next) => {
			if (typeof next === "boolean" && next !== isCollapsed.value) {
				isCollapsed.value = next;
			}
		}
	);

	// Node container styles using tailwind-variants
	const nodeContainerStyles = tv({
		base: [
			"base-node-template",
			"node-container",
			"relative",
			"flex",
			"flex-col",
			"overflow-visible",
			"bg-card",
			"border",
			"border-border",
			"text-card-foreground",
			"backdrop-blur-sm",
			"shadow-lg",
			"transition-all",
			"duration-200",
			"pt-8" // Space for the icon (half inside) and title
		],
		variants: {
			selected: {
				true: "ring-2 ring-ring ring-offset-2 ring-offset-background",
			},
			collapsed: {
				true: "min-h-auto w-[220px] pt-6",
			},
			inConfigPanel: {
				true: "shadow-2xl",
			},
		},
	});

	// Node container classes
	const nodeContainerClasses = computed(() => 
		nodeContainerStyles({
			selected: props.customNodeProps?.selected,
			collapsed: isCollapsed.value,
			inConfigPanel: isInConfigPanel.value,
		}) + (props.nodeClass ? ` ${props.nodeClass}` : "")
	);

	// Icon wrapper styles (kept for backward compatibility if needed)
	// Note: NodeIconHeader component now handles icon positioning
	const _iconWrapperStyles = tv({
		base: [
			"node-icon-wrapper",
			"absolute",
			"-top-7",
			"left-1/2",
			"-translate-x-1/2",
			"w-[60px]",
			"h-[60px]",
			"rounded-full",
			"flex",
			"items-center",
			"justify-center",
			"bg-card",
			"border-[3px]",
			"border-primary",
			"shadow-lg",
			"z-10",
			"overflow-hidden"
		],
		variants: {
			collapsed: {
				true: "-top-6 w-[52px] h-[52px]",
			},
		},
	});

	const _iconWrapperClasses = computed(() => 
		_iconWrapperStyles({
			collapsed: isCollapsed.value,
		})
	);

	// Icon wrapper style (for dynamic themeColor) - kept for backward compatibility
	const _iconWrapperStyle = computed(() => {
		if (props.themeColor) {
			return { borderColor: props.themeColor };
		}
		return {};
	});

	// Provide internal state to child components (defined later after helper declarations)
	const nodeThemeColor = computed(() => props.themeColor || "hsl(var(--primary))");
	const nodeBorderColor = computed(() => props.borderColor || "hsl(var(--border))");
	const nodeHeaderColor = computed(() => props.headerColor || "hsl(var(--muted))");

	// Computed node style (only for dynamic dimensions, colors come from classes)
	const computedNodeStyle = computed(() => {
		const style: any = {
			borderWidth: `${props.borderWidth}px`,
			borderRadius: `${props.borderRadius}px`,
		};

		// Override background if explicitly provided
		if (props.backgroundColor) {
			style.background = props.backgroundColor;
		}

		// Override border color if explicitly provided (allows dynamic theming)
		if (props.borderColor) {
			style.borderColor = props.borderColor;
		} else if (props.themeColor) {
			// Use themeColor for border if no explicit borderColor
			// Convert hex to rgba for border with opacity
			const hexToRgba = (hex: string, alpha: number) => {
				const r = parseInt(hex.slice(1, 3), 16);
				const g = parseInt(hex.slice(3, 5), 16);
				const b = parseInt(hex.slice(5, 7), 16);
				return `rgba(${r}, ${g}, ${b}, ${alpha})`;
			};
			if (props.themeColor.startsWith('#')) {
				style.borderColor = hexToRgba(props.themeColor, 0.3);
			} else {
				style.borderColor = props.themeColor;
			}
		}

		// Dynamic dimensions
		style.width = isCollapsed.value 
			? `${props.collapsedMinWidth}px` 
			: (props.customNodeProps?.data?.width ? `${props.customNodeProps.data.width}px` : undefined);
		style.height = isCollapsed.value 
			? undefined 
			: (props.customNodeProps?.data?.height ? `${props.customNodeProps.data.height}px` : undefined);
		style.minWidth = `${isCollapsed.value ? props.collapsedMinWidth : props.minWidth}px`;
		style.minHeight = `${isCollapsed.value ? props.collapsedMinHeight : props.minHeight}px`;

		// Merge with custom styles
		return { ...style, ...props.customNodeProps?.style };
	});

	// Handle style (using theme colors)
	const handleStyle = computed(() => {
		const style: any = {
			width: `${props.handleSize}px`,
			height: `${props.handleSize}px`,
		};

		// Use theme color if provided, otherwise use primary from theme
		if (props.handleColor) {
			style.background = props.handleColor;
		} else if (props.themeColor) {
			style.background = props.themeColor;
		}

		return style;
	});

	// Content and footer classes using theme
	const contentClasses = computed(() => "node-content");
	const footerClasses = computed(() => "node-footer");

	/**
	 * Handle resize event - updates internal state
	 */
	const handleResize = (width: number, height: number) => {
		console.log("📐 BaseNodeTemplate resize:", { width, height });
		currentWidth.value = width;
		currentHeight.value = height;

		// Update parent data if needed
		if (props.updateNodeData && props.customNodeProps?.id) {
			props.updateNodeData(props.customNodeProps.id, "width", width);
			props.updateNodeData(props.customNodeProps.id, "height", height);
		}
	};

	/**
	 * Toggle collapse state - managed internally
	 */
	function toggleCollapse() {
		isCollapsed.value = !isCollapsed.value;
	}

	/**
	 * Helper to update node data (proxy to parent)
	 */
	const updateData = (key: string, value: any) => {
		if (props.updateNodeData && props.customNodeProps?.id) {
			props.updateNodeData(props.customNodeProps.id, key, value);
		}
	};

	/**
	 * Handle edit button click - emit to parent component
	 */
	function handleEdit() {
		console.log("✏️ BaseNodeTemplate: Edit button clicked");
		console.log("  Node ID:", props.customNodeProps?.id);
		console.log("  Node Type:", props.customNodeProps?.type);
		emit("edit");
	}

	/**
	 * Handle delete/close button click - emit to parent component
	 */
	function handleDelete() {
		console.log("🗑️ BaseNodeTemplate: Close button clicked");
		console.log("  Node ID:", props.customNodeProps?.id);
		console.log("  Node Type:", props.customNodeProps?.type);
		
		// Emit both events for compatibility
		emit("delete");
		emit("closeNode");
	}

	function persistCollapsedState() {
		if (props.updateNodeData && props.customNodeProps?.id && props.customNodeProps?.data?.collapsed !== isCollapsed.value) {
			props.updateNodeData(props.customNodeProps.id, "collapsed", isCollapsed.value);
		}
		emit("collapsed", isCollapsed.value);
	}

	watch(isCollapsed, (_, oldValue) => {
		if (oldValue !== undefined) {
			persistCollapsedState();
		}
	});

	provide("nodeState", {
		isCollapsed,
		isInConfigPanel,
		themeColor: nodeThemeColor,
		borderColor: nodeBorderColor,
		headerColor: nodeHeaderColor,
		toggleCollapse,
		handleEdit,
		handleDelete
	});

	function setCollapsedState(value: boolean) {
		if (isCollapsed.value !== value) {
			isCollapsed.value = value;
		}
	}

	provide("nodeCollapseController", {
		setCollapsed: setCollapsedState
	});
</script>

<style scoped>
/* Base node template specific styles - shared styles are in nodeContainer.css */
</style>
