<template>
	<div ref="resizerRef" class="custom-node-resizer" @mouseenter="onMouseEnter" @mouseleave="onMouseLeave">
		<!-- Corner Resizers -->
		<div
			class="resize-handle corner-handle top-left"
			@mousedown="startResize('top-left', $event)"
		>
			<div class="handle-dot" />
		</div>

		<div
			class="resize-handle corner-handle top-right"
			@mousedown="startResize('top-right', $event)"
		>
			<div class="handle-dot" />
		</div>

		<div
			class="resize-handle corner-handle bottom-left"
			@mousedown="startResize('bottom-left', $event)"
		>
			<div class="handle-dot" />
		</div>

		<div
			class="resize-handle corner-handle bottom-right"
			@mousedown="startResize('bottom-right', $event)"
		>
			<div class="handle-dot" />
		</div>

		<!-- Edge Resizers -->
		<div
			class="resize-handle edge-handle top"
			@mousedown="startResize('top', $event)"
		>
			<div class="handle-line" />
		</div>

		<div
			class="resize-handle edge-handle bottom"
			@mousedown="startResize('bottom', $event)"
		>
			<div class="handle-line" />
		</div>

		<div
			class="resize-handle edge-handle left"
			@mousedown="startResize('left', $event)"
		>
			<div class="handle-line" />
		</div>

		<div
			class="resize-handle edge-handle right"
			@mousedown="startResize('right', $event)"
		>
			<div class="handle-line" />
		</div>

		<!-- Size Indicator -->
		<div v-if="showSizeIndicator && isResizing" class="size-indicator">
			<div class="size-text">
				{{ Math.round(currentWidth) }} × {{ Math.round(currentHeight) }}
			</div>
		</div>

		<!-- Resize Guide Lines -->
		<div v-if="isResizing" class="resize-guides">
			<div class="guide-line guide-horizontal" />
			<div class="guide-line guide-vertical" />
		</div>
	</div>
</template>

<script setup lang="ts">
	import { onUnmounted, ref } from "vue";

	interface Props {
		minWidth?: number
		minHeight?: number
		maxWidth?: number
		maxHeight?: number
		showSizeIndicator?: boolean
	}

	const props = withDefaults(defineProps<Props>(), {
		minWidth: 200,
		minHeight: 150,
		maxWidth: Infinity, // No maximum limit
		maxHeight: Infinity, // No maximum limit
		showSizeIndicator: true
	});

	const emit = defineEmits<{
		resize: [width: number, height: number]
	}>();

	// State
	const isResizing = ref(false);
	const isHovering = ref(false);
	const resizeDirection = ref<string>("");
	const startX = ref(0);
	const startY = ref(0);
	const startWidth = ref(0);
	const startHeight = ref(0);
	const startLeft = ref(0);
	const startTop = ref(0);
	const currentWidth = ref(0);
	const currentHeight = ref(0);

	// Template ref for the resizer element
	const resizerRef = ref<HTMLElement | null>(null);

	// Get parent node element - find the closest parent node
	const getParentNode = () => {
		if (!resizerRef.value) return null;
		return resizerRef.value.closest(".enhanced-node, .browser-node, .forms-panel-node") as HTMLElement;
	};

	// Mouse enter/leave handlers
	const onMouseEnter = () => {
		isHovering.value = true;
	};

	const onMouseLeave = () => {
		if (!isResizing.value) {
			isHovering.value = false;
		}
	};

	// Start resize operation
	const startResize = (direction: string, event: MouseEvent) => {
		event.preventDefault();
		event.stopPropagation();

		const parentNode = getParentNode();
		if (!parentNode) return;

		isResizing.value = true;
		resizeDirection.value = direction;
		startX.value = event.clientX;
		startY.value = event.clientY;

		const rect = parentNode.getBoundingClientRect();
		startWidth.value = rect.width;
		startHeight.value = rect.height;
		startLeft.value = rect.left;
		startTop.value = rect.top;
		currentWidth.value = rect.width;
		currentHeight.value = rect.height;

		document.addEventListener("mousemove", handleResize);
		document.addEventListener("mouseup", stopResize);
		document.body.style.cursor = getCursor(direction);
		document.body.style.userSelect = "none";

		// Add smooth transition during resize
		parentNode.style.transition = "none";
	};

	// Handle resize movement with infinite resizing capability
	const handleResize = (event: MouseEvent) => {
		if (!isResizing.value) return;

		const deltaX = event.clientX - startX.value;
		const deltaY = event.clientY - startY.value;

		let newWidth = startWidth.value;
		let newHeight = startHeight.value;
		let newLeft = startLeft.value;
		let newTop = startTop.value;

		// Calculate new dimensions based on direction with infinite capability
		switch (resizeDirection.value) {
		case "top-left":
			newWidth = Math.max(props.minWidth, startWidth.value - deltaX);
			newHeight = Math.max(props.minHeight, startHeight.value - deltaY);
			newLeft = startLeft.value + (startWidth.value - newWidth);
			newTop = startTop.value + (startHeight.value - newHeight);
			break;
		case "top-right":
			newWidth = Math.max(props.minWidth, startWidth.value + deltaX);
			newHeight = Math.max(props.minHeight, startHeight.value - deltaY);
			newTop = startTop.value + (startHeight.value - newHeight);
			break;
		case "bottom-left":
			newWidth = Math.max(props.minWidth, startWidth.value - deltaX);
			newHeight = Math.max(props.minHeight, startHeight.value + deltaY);
			newLeft = startLeft.value + (startWidth.value - newWidth);
			break;
		case "bottom-right":
			newWidth = Math.max(props.minWidth, startWidth.value + deltaX);
			newHeight = Math.max(props.minHeight, startHeight.value + deltaY);
			break;
		case "top":
			newHeight = Math.max(props.minHeight, startHeight.value - deltaY);
			newTop = startTop.value + (startHeight.value - newHeight);
			break;
		case "bottom":
			newHeight = Math.max(props.minHeight, startHeight.value + deltaY);
			break;
		case "left":
			newWidth = Math.max(props.minWidth, startWidth.value - deltaX);
			newLeft = startLeft.value + (startWidth.value - newWidth);
			break;
		case "right":
			newWidth = Math.max(props.minWidth, startWidth.value + deltaX);
			break;
		}

		// Apply maximum constraints only if they're not Infinity
		if (props.maxWidth !== Infinity) {
			newWidth = Math.min(props.maxWidth, newWidth);
		}
		if (props.maxHeight !== Infinity) {
			newHeight = Math.min(props.maxHeight, newHeight);
		}

		currentWidth.value = newWidth;
		currentHeight.value = newHeight;

		// Apply to parent node with smooth updates
		const parentNode = getParentNode();
		if (parentNode) {
			parentNode.style.width = `${newWidth}px`;
			parentNode.style.height = `${newHeight}px`;

			// Update position for corner/edge resizing
			if (resizeDirection.value.includes("left")) {
				parentNode.style.left = `${newLeft}px`;
			}
			if (resizeDirection.value.includes("top")) {
				parentNode.style.top = `${newTop}px`;
			}
		}

		emit("resize", newWidth, newHeight);
	};

	// Stop resize operation
	const stopResize = () => {
		isResizing.value = false;
		resizeDirection.value = "";
		isHovering.value = false;

		document.removeEventListener("mousemove", handleResize);
		document.removeEventListener("mouseup", stopResize);
		document.body.style.cursor = "";
		document.body.style.userSelect = "";

		// Restore smooth transitions
		const parentNode = getParentNode();
		if (parentNode) {
			parentNode.style.transition = "";
		}
	};

	// Get cursor style for direction
	const getCursor = (direction: string) => {
		switch (direction) {
		case "top-left":
		case "bottom-right":
			return "nw-resize";
		case "top-right":
		case "bottom-left":
			return "ne-resize";
		case "top":
		case "bottom":
			return "ns-resize";
		case "left":
		case "right":
			return "ew-resize";
		default:
			return "move";
		}
	};

	// Cleanup on unmount
	onUnmounted(() => {
		document.removeEventListener("mousemove", handleResize);
		document.removeEventListener("mouseup", stopResize);
	});
</script>

<style scoped>
.custom-node-resizer {
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	pointer-events: none;
	z-index: 25;
	overflow: visible;
	border: 2px solid rgba(255, 165, 0, 0.3);
	border-radius: 8px;
	transition: border-color 0.2s ease;
}

.custom-node-resizer:hover {
	border-color: rgba(255, 165, 0, 0.6);
}

.resize-handle {
	position: absolute;
	pointer-events: all;
	opacity: 0.4;
	transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
	cursor: pointer;
}

/* Show handles more prominently when cursor is within the node */
.custom-node-resizer:hover .resize-handle {
	opacity: 1;
	transform: scale(1.05);
}

/* Always show handles subtly for better discoverability */
.custom-node-resizer .resize-handle {
	opacity: 0.5;
	transition: all 0.2s ease;
}

/* Fully visible on hover */
.custom-node-resizer:hover .resize-handle {
	opacity: 1;
	transform: scale(1.1);
}

/* Corner handles - dark black and orange theme */
.corner-handle {
	width: 14px;
	height: 14px;
	border-radius: 50%;
	background: rgba(0, 0, 0, 0.9);
	border: 2px solid rgba(255, 165, 0, 0.8);
	backdrop-filter: blur(8px);
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
	display: flex;
	align-items: center;
	justify-content: center;
}

.corner-handle:hover {
	background: rgba(0, 0, 0, 1);
	border-color: rgba(255, 165, 0, 1);
	transform: scale(1.3);
	box-shadow: 0 4px 16px rgba(255, 165, 0, 0.4);
}

.handle-dot {
	width: 4px;
	height: 4px;
	background: rgba(255, 165, 0, 0.9);
	border-radius: 50%;
}

/* Position corner handles closer to corners */
.top-left {
	top: -7px;
	left: -7px;
	cursor: nw-resize;
}

.top-right {
	top: -7px;
	right: -7px;
	cursor: ne-resize;
}

.bottom-left {
	bottom: -7px;
	left: -7px;
	cursor: sw-resize;
}

.bottom-right {
	bottom: -7px;
	right: -7px;
	cursor: se-resize;
}

/* Edge handles - dark black and orange theme with borders */
.edge-handle {
	background: rgba(0, 0, 0, 0.9);
	border: 2px solid rgba(255, 165, 0, 0.8);
	backdrop-filter: blur(8px);
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
	display: flex;
	align-items: center;
	justify-content: center;
}

.edge-handle:hover {
	background: rgba(0, 0, 0, 1);
	border-color: rgba(255, 165, 0, 1);
	transform: scale(1.2);
	box-shadow: 0 4px 16px rgba(255, 165, 0, 0.4);
}

.handle-line {
	background: rgba(255, 165, 0, 0.9);
	border-radius: 1px;
}

.top {
	top: -5px;
	left: 50%;
	transform: translateX(-50%);
	width: 24px;
	height: 8px;
	cursor: ns-resize;
	border-radius: 4px;
}

.bottom {
	bottom: -5px;
	left: 50%;
	transform: translateX(-50%);
	width: 24px;
	height: 8px;
	cursor: ns-resize;
	border-radius: 4px;
}

.left {
	left: -5px;
	top: 50%;
	transform: translateY(-50%);
	width: 8px;
	height: 24px;
	cursor: ew-resize;
	border-radius: 4px;
}

.right {
	right: -5px;
	top: 50%;
	transform: translateY(-50%);
	width: 8px;
	height: 24px;
	cursor: ew-resize;
	border-radius: 4px;
}

.top .handle-line {
	width: 16px;
	height: 2px;
}

.bottom .handle-line {
	width: 16px;
	height: 2px;
}

.left .handle-line {
	width: 2px;
	height: 16px;
}

.right .handle-line {
	width: 2px;
	height: 16px;
}

/* Size indicator - elegant and minimal */
.size-indicator {
	position: absolute;
	top: -40px;
	left: 50%;
	transform: translateX(-50%);
	background: rgba(0, 0, 0, 0.9);
	color: rgba(255, 255, 255, 0.95);
	padding: 6px 12px;
	border-radius: 6px;
	font-size: 11px;
	font-weight: 500;
	backdrop-filter: blur(12px);
	border: 1px solid rgba(255, 255, 255, 0.2);
	white-space: nowrap;
	font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
	box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
	animation: slideIn 0.2s ease-out;
}

.size-text {
	letter-spacing: 0.5px;
}

/* Resize guide lines */
.resize-guides {
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	pointer-events: none;
	z-index: 1;
}

.guide-line {
	position: absolute;
	background: rgba(255, 165, 0, 0.6);
	backdrop-filter: blur(2px);
}

.guide-horizontal {
	top: 50%;
	left: 0;
	right: 0;
	height: 1px;
	transform: translateY(-50%);
}

.guide-vertical {
	left: 50%;
	top: 0;
	bottom: 0;
	width: 1px;
	transform: translateX(-50%);
}

/* Animations */
@keyframes slideIn {
	from {
		opacity: 0;
		transform: translateX(-50%) translateY(-10px);
	}
	to {
		opacity: 1;
		transform: translateX(-50%) translateY(0);
	}
}

/* Hide connection handles when hovering over resizer */
.custom-node-resizer:hover ~ .connection-handle {
	opacity: 0.6;
	transition: opacity 0.2s ease;
}

/* Smooth transitions for all elements */
.resize-handle {
	transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Hover effects */
.resize-handle:hover {
	transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Focus states for accessibility */
.resize-handle:focus {
	outline: 2px solid rgba(255, 165, 0, 0.6);
	outline-offset: 2px;
}

/* High contrast mode support */
@media (prefers-contrast: high) {
	.resize-handle {
		border-width: 3px;
	}

	.corner-handle {
		background: rgba(0, 0, 0, 1);
		border-color: rgba(255, 165, 0, 1);
	}

	.edge-handle {
		background: rgba(0, 0, 0, 1);
		border-color: rgba(255, 165, 0, 1);
	}
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
	.resize-handle {
		transition: opacity 0.1s ease;
	}

	.resize-handle:hover {
		transform: none;
	}

	.size-indicator {
		animation: none;
	}
}
</style>
