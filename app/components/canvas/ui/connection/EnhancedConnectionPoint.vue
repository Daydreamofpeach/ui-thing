<template>
	<div class="enhanced-connection-container">
		<!-- Connection Point -->
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
			<div class="connection-pulse-ring" v-if="isHovered || isConnecting" />
			
			<!-- Enhanced Label -->
			<div v-if="showLabel && label" class="enhanced-connection-label">
				<span class="label-text">{{ label }}</span>
				<div class="label-connector" />
			</div>
		</div>

		<!-- Connection Type Indicator -->
		<div v-if="showTypeIndicator" class="connection-type-indicator">
			<UIcon :name="getTypeIcon()" class="size-3" />
		</div>
	</div>
</template>

<script setup lang="ts">
	import { computed, ref } from "vue";

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
		showTypeIndicator?: boolean;
		connectionType?: string;
	}

	const props = withDefaults(defineProps<Props>(), {
		color: "#3b82f6",
		size: 12,
		showLabel: true,
		disabled: false,
		connected: false,
		hovered: false,
		showTypeIndicator: true,
		connectionType: "default"
	});

	const emit = defineEmits<{
		connectionStart: [event: MouseEvent, handle: { nodeId: string; handleId: string; type: "source" | "target" | "both"; position: "top" | "bottom" | "left" | "right" }];
		connectionEnd: [event: MouseEvent, handle: { nodeId: string; handleId: string; type: "source" | "target" | "both"; position: "top" | "bottom" | "left" | "right" }];
		connectionHover: [event: MouseEvent, handle: { nodeId: string; handleId: string; type: "source" | "target" | "both"; position: "top" | "bottom" | "left" | "right" }];
		connectionLeave: [event: MouseEvent, handle: { nodeId: string; handleId: string; type: "source" | "target" | "both"; position: "top" | "bottom" | "left" | "right" }];
	}>();

	const isHovered = ref(false);
	const isConnecting = ref(false);

	const connectionPointClasses = computed(() => [
		"enhanced-connection-point",
		`connection-point--${props.position}`,
		`connection-point--${props.type}`,
		{
			"connection-point--disabled": props.disabled,
			"connection-point--connected": props.connected,
			"connection-point--hovered": props.hovered || isHovered.value,
			"connection-point--connecting": isConnecting.value
		}
	]);

	const connectionPointStyle = computed(() => ({
		"--connection-color": props.connected ? "#10b981" : props.color,
		"--connection-size": `${props.size}px`
	}));

	const getTypeIcon = () => {
		switch (props.type) {
			case "source": return "i-lucide-arrow-right";
			case "target": return "i-lucide-arrow-left";
			case "both": return "i-lucide-arrow-left-right";
			default: return "i-lucide-circle";
		}
	};

	const handleMouseDown = (event: MouseEvent) => {
		if (props.disabled || props.type === "target") return;
		event.preventDefault();
		isConnecting.value = true;
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
		isConnecting.value = false;
		emit("connectionEnd", event, {
			nodeId: props.nodeId,
			handleId: props.handleId,
			type: props.type,
			position: props.position
		});
	};

	const handleMouseEnter = (event: MouseEvent) => {
		isHovered.value = true;
		emit("connectionHover", event, {
			nodeId: props.nodeId,
			handleId: props.handleId,
			type: props.type,
			position: props.position
		});
	};

	const handleMouseLeave = (event: MouseEvent) => {
		isHovered.value = false;
		isConnecting.value = false;
		emit("connectionLeave", event, {
			nodeId: props.nodeId,
			handleId: props.handleId,
			type: props.type,
			position: props.position
		});
	};
</script>

<style scoped>
	.enhanced-connection-container {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.enhanced-connection-point {
		position: absolute;
		width: var(--connection-size);
		height: var(--connection-size);
		background: var(--connection-color);
		border: 2px solid rgba(255, 255, 255, 0.9);
		border-radius: 50%;
		cursor: pointer;
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		z-index: 10;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
	}

	.connection-point-inner {
		width: 40%;
		height: 40%;
		background: rgba(255, 255, 255, 0.9);
		border-radius: 50%;
		opacity: 0;
		transition: opacity 0.3s ease;
	}

	.connection-pulse-ring {
		position: absolute;
		top: -4px;
		left: -4px;
		right: -4px;
		bottom: -4px;
		border: 2px solid var(--connection-color);
		border-radius: 50%;
		animation: connectionPulse 1.5s infinite;
		opacity: 0.6;
	}

	.enhanced-connection-label {
		position: absolute;
		background: rgba(var(--color-neutral-rgb), 0.95);
		backdrop-filter: blur(8px);
		border: 1px solid rgba(var(--color-primary-rgb), 0.2);
		border-radius: 6px;
		padding: 4px 8px;
		font-size: 11px;
		font-weight: 600;
		color: rgba(255, 255, 255, 0.9);
		white-space: nowrap;
		pointer-events: none;
		z-index: 20;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
		transition: all 0.2s ease;
	}

	.label-connector {
		position: absolute;
		width: 1px;
		height: 6px;
		background: var(--connection-color);
	}

	.connection-type-indicator {
		position: absolute;
		top: -8px;
		right: -8px;
		width: 16px;
		height: 16px;
		background: rgba(var(--color-primary-rgb), 0.9);
		border: 1px solid rgba(255, 255, 255, 0.2);
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		color: white;
		font-size: 8px;
		z-index: 15;
	}

	/* Position variants with improved spacing */
	.connection-point--top {
		top: -8px;
		left: 50%;
		transform: translateX(-50%);
	}

	.connection-point--bottom {
		bottom: -8px;
		left: 50%;
		transform: translateX(-50%);
	}

	.connection-point--left {
		left: -8px;
		top: 50%;
		transform: translateY(-50%);
	}

	.connection-point--right {
		right: -8px;
		top: 50%;
		transform: translateY(-50%);
	}

	/* Enhanced label positioning */
	.connection-point--top .enhanced-connection-label {
		top: 100%;
		left: 50%;
		transform: translateX(-50%);
		margin-top: 6px;
	}

	.connection-point--top .label-connector {
		top: -6px;
		left: 50%;
		transform: translateX(-50%);
	}

	.connection-point--bottom .enhanced-connection-label {
		bottom: 100%;
		left: 50%;
		transform: translateX(-50%);
		margin-bottom: 6px;
	}

	.connection-point--bottom .label-connector {
		bottom: -6px;
		left: 50%;
		transform: translateX(-50%);
	}

	.connection-point--left .enhanced-connection-label {
		left: 100%;
		top: 50%;
		transform: translateY(-50%);
		margin-left: 6px;
	}

	.connection-point--left .label-connector {
		left: -6px;
		top: 50%;
		transform: translateY(-50%);
		width: 6px;
		height: 1px;
	}

	.connection-point--right .enhanced-connection-label {
		right: 100%;
		top: 50%;
		transform: translateY(-50%);
		margin-right: 6px;
	}

	.connection-point--right .label-connector {
		right: -6px;
		top: 50%;
		transform: translateY(-50%);
		width: 6px;
		height: 1px;
	}

	/* Type variants with improved cursors */
	.connection-point--source {
		cursor: crosshair;
	}

	.connection-point--target {
		cursor: alias;
	}

	.connection-point--both {
		cursor: grab;
	}

	/* Enhanced states */
	.connection-point--disabled {
		opacity: 0.3;
		cursor: not-allowed;
		transform: scale(0.8);
	}

	.connection-point--connected {
		background: #10b981;
		border-color: rgba(16, 185, 129, 0.8);
		box-shadow: 
			0 2px 8px rgba(0, 0, 0, 0.15),
			0 0 12px rgba(16, 185, 129, 0.4);
	}

	.connection-point--hovered {
		transform: scale(1.3);
		box-shadow: 
			0 4px 16px rgba(0, 0, 0, 0.2),
			0 0 16px var(--connection-color);
	}

	.connection-point--connecting {
		transform: scale(1.4);
		box-shadow: 
			0 4px 20px rgba(0, 0, 0, 0.25),
			0 0 20px var(--connection-color);
		animation: connectionGlow 0.8s ease-in-out infinite alternate;
	}

	.connection-point--hovered .connection-point-inner,
	.connection-point--connecting .connection-point-inner {
		opacity: 1;
	}

	.connection-point--hovered .enhanced-connection-label,
	.connection-point--connecting .enhanced-connection-label {
		opacity: 1;
		transform: translateX(-50%) translateY(-50%) scale(1.05);
	}

	/* Animations */
	@keyframes connectionPulse {
		0%, 100% {
			transform: scale(1);
			opacity: 0.6;
		}
		50% {
			transform: scale(1.4);
			opacity: 0.2;
		}
	}

	@keyframes connectionGlow {
		0% {
			box-shadow: 
				0 4px 20px rgba(0, 0, 0, 0.25),
				0 0 20px var(--connection-color);
		}
		100% {
			box-shadow: 
				0 4px 20px rgba(0, 0, 0, 0.25),
				0 0 30px var(--connection-color);
		}
	}

	/* Hover effects */
	.connection-point:hover:not(.connection-point--disabled) {
		transform: scale(1.2);
		box-shadow: 
			0 4px 16px rgba(0, 0, 0, 0.15),
			0 0 12px var(--connection-color);
	}

	.connection-point:hover:not(.connection-point--disabled) .connection-point-inner {
		opacity: 0.8;
	}

	.connection-point:hover:not(.connection-point--disabled) .enhanced-connection-label {
		opacity: 1;
	}

	/* Active state */
	.connection-point:active:not(.connection-point--disabled) {
		transform: scale(1.1);
	}
</style>
