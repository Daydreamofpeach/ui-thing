<template>
	<div
		:class="connectionPointClasses"
		:style="connectionPointStyle"
		@mousedown="handleMouseDown"
		@mouseup="handleMouseUp"
		@mouseenter="handleMouseEnter"
		@mouseleave="handleMouseLeave"
		:data-node-id="nodeId"
		:data-handle-id="handleId"
		:data-handle-type="type"
		:data-position="position"
	>
		<div class="connection-point-inner" />
		<div v-if="showLabel" class="connection-point-label">
			{{ label }}
		</div>
	</div>
</template>

<script lang="ts" setup>
	import { computed } from "vue";

	interface Props {
		nodeId: string;
		handleId: string;
		type: "source" | "target" | "both";
		position: "top" | "bottom" | "left" | "right";
		color?: string;
		size?: number;
		label?: string;
		showLabel?: boolean;
		disabled?: boolean;
		connected?: boolean;
		hovered?: boolean;
	}

	const props = withDefaults(defineProps<Props>(), {
		color: "#3b82f6",
		size: 8,
		showLabel: false,
		disabled: false,
		connected: false,
		hovered: false
	});

	const emit = defineEmits<{
		connectionStart: [event: MouseEvent, handle: { nodeId: string; handleId: string; type: "source" | "target" | "both"; position: "top" | "bottom" | "left" | "right" }];
		connectionEnd: [event: MouseEvent, handle: { nodeId: string; handleId: string; type: "source" | "target" | "both"; position: "top" | "bottom" | "left" | "right" }];
		connectionHover: [event: MouseEvent, handle: { nodeId: string; handleId: string; type: "source" | "target" | "both"; position: "top" | "bottom" | "left" | "right" }];
		connectionLeave: [event: MouseEvent, handle: { nodeId: string; handleId: string; type: "source" | "target" | "both"; position: "top" | "bottom" | "left" | "right" }];
	}>();

	const connectionPointClasses = computed(() => [
		"connection-point",
		`connection-point--${props.position}`,
		`connection-point--${props.type}`,
		{
			"connection-point--disabled": props.disabled,
			"connection-point--connected": props.connected,
			"connection-point--hovered": props.hovered
		}
	]);

	const connectionPointStyle = computed(() => ({
		"--connection-color": props.color,
		"--connection-size": `${props.size}px`
	}));

	const handleMouseDown = (event: MouseEvent) => {
		if (props.disabled || props.type === "target") return;
		event.preventDefault();
		emit("connectionStart", event, {
			nodeId: props.nodeId,
			handleId: props.handleId,
			type: props.type,
			position: props.position
		});
	};

	const handleMouseUp = (event: MouseEvent) => {
		if (props.disabled || props.type === "source") return;
		event.preventDefault();
		emit("connectionEnd", event, {
			nodeId: props.nodeId,
			handleId: props.handleId,
			type: props.type,
			position: props.position
		});
	};

	const handleMouseEnter = (event: MouseEvent) => {
		emit("connectionHover", event, {
			nodeId: props.nodeId,
			handleId: props.handleId,
			type: props.type,
			position: props.position
		});
	};

	const handleMouseLeave = (event: MouseEvent) => {
		emit("connectionLeave", event, {
			nodeId: props.nodeId,
			handleId: props.handleId,
			type: props.type,
			position: props.position
		});
	};
</script>

<style scoped>
	.connection-point {
		position: absolute;
		width: var(--connection-size);
		height: var(--connection-size);
		background: var(--connection-color);
		border: 2px solid white;
		border-radius: 50%;
		cursor: pointer;
		transition: all 0.2s ease;
		z-index: 10;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.connection-point-inner {
		width: 60%;
		height: 60%;
		background: white;
		border-radius: 50%;
		opacity: 0;
		transition: opacity 0.2s ease;
	}

	.connection-point-label {
		position: absolute;
		background: rgba(0, 0, 0, 0.8);
		color: white;
		padding: 2px 6px;
		border-radius: 4px;
		font-size: 10px;
		white-space: nowrap;
		pointer-events: none;
		z-index: 20;
	}

	/* Position variants */
	.connection-point--top {
		top: -6px;
		left: 50%;
		transform: translateX(-50%);
	}

	.connection-point--bottom {
		bottom: -6px;
		left: 50%;
		transform: translateX(-50%);
	}

	.connection-point--left {
		left: -6px;
		top: 50%;
		transform: translateY(-50%);
	}

	.connection-point--right {
		right: -6px;
		top: 50%;
		transform: translateY(-50%);
	}

	/* Label positioning */
	.connection-point--top .connection-point-label {
		top: 100%;
		left: 50%;
		transform: translateX(-50%);
		margin-top: 4px;
	}

	.connection-point--bottom .connection-point-label {
		bottom: 100%;
		left: 50%;
		transform: translateX(-50%);
		margin-bottom: 4px;
	}

	.connection-point--left .connection-point-label {
		left: 100%;
		top: 50%;
		transform: translateY(-50%);
		margin-left: 4px;
	}

	.connection-point--right .connection-point-label {
		right: 100%;
		top: 50%;
		transform: translateY(-50%);
		margin-right: 4px;
	}

	/* Type variants */
	.connection-point--source {
		cursor: crosshair;
	}

	.connection-point--target {
		cursor: alias;
	}

	.connection-point--both {
		cursor: grab;
	}

	/* States */
	.connection-point--disabled {
		opacity: 0.3;
		cursor: not-allowed;
	}

	.connection-point--connected {
		background: #10b981;
		box-shadow: 0 0 8px rgba(16, 185, 129, 0.4);
	}

	.connection-point--hovered {
		transform: scale(1.2);
		box-shadow: 0 0 12px rgba(59, 130, 246, 0.6);
	}

	.connection-point--hovered .connection-point-inner {
		opacity: 1;
	}

	/* Hover effects */
	.connection-point:hover:not(.connection-point--disabled) {
		transform: scale(1.1);
		box-shadow: 0 0 8px var(--connection-color);
	}

	.connection-point:hover:not(.connection-point--disabled) .connection-point-inner {
		opacity: 0.7;
	}

	/* Active state */
	.connection-point:active:not(.connection-point--disabled) {
		transform: scale(0.95);
	}
</style>

