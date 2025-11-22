<template>
	<div class="connection-flow-visualizer">
		<div class="visualizer-header">
			<UIcon name="i-lucide-zap" class="size-3 text-primary" />
			<span class="header-title">Connection Flow Preview</span>
			<button
				v-if="sequence.length >= 2"
				class="animate-btn"
				@click="triggerAnimation"
			>
				<UIcon name="i-lucide-play" class="size-3" />
				Animate
			</button>
		</div>

		<div class="visualizer-canvas">
			<svg class="flow-svg" viewBox="0 0 600 400" preserveAspectRatio="xMidYMid meet">
				<!-- Grid Background -->
				<defs>
					<pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
						<path
							d="M 40 0 L 0 0 0 40"
							fill="none"
							stroke="rgba(255,255,255,0.05)"
							stroke-width="1"
						/>
					</pattern>
				</defs>
				<rect width="600" height="400" fill="url(#grid)" />

				<!-- Nodes -->
				<g
					v-for="(nodeId, index) in sequence"
					:key="nodeId"
					:transform="`translate(${getNodePosition(index).x}, ${getNodePosition(index).y})`"
				>
					<!-- Node Circle -->
					<circle
						:r="nodeRadius"
						:fill="getNodeColor(index)"
						:stroke="isAnimating && animationStep >= index ? '#10b981' : 'rgba(255,255,255,0.2)'"
						:stroke-width="isAnimating && animationStep >= index ? 3 : 2"
						class="node-circle"
					/>
					<!-- Node Icon -->
					<text
						text-anchor="middle"
						dy="0.3em"
						font-size="14"
						font-weight="600"
						fill="white"
					>
						{{ index + 1 }}
					</text>
					<!-- Node Label -->
					<text
						text-anchor="middle"
						y="35"
						font-size="10"
						fill="rgba(255,255,255,0.7)"
						class="node-label"
					>
						{{ getNodeLabel(nodeId) }}
					</text>
				</g>

				<!-- Connections -->
				<g v-for="(nodeId, index) in sequence.slice(0, -1)" :key="`conn-${nodeId}`">
					<path
						:d="getConnectionPath(index)"
						fill="none"
						:stroke="connectionStyle.color"
						:stroke-width="connectionStyle.strokeWidth"
						stroke-linecap="round"
						:class="{ 'flow-active': isAnimating && animationStep > index }"
						class="connection-path"
					/>
					<!-- Animated flow particle -->
					<circle
						v-if="isAnimating && animationStep > index && animationStep <= index + 1"
						:r="4"
						:fill="connectionStyle.color"
						class="flow-particle"
					>
						<animateMotion
							:path="getConnectionPath(index)"
							:dur="`${getAnimationDuration()}ms`"
							repeatCount="indefinite"
						/>
					</circle>
					<!-- Arrow marker -->
					<polygon
						:points="getArrowPoints(index)"
						:fill="isAnimating && animationStep > index ? '#10b981' : connectionStyle.color"
						class="arrow-marker"
					/>
				</g>
			</svg>
		</div>

		<div class="visualizer-controls">
			<div class="control-group">
				<label class="control-label">Preview Speed</label>
				<select v-model="previewSpeed" class="control-select">
					<option value="slow">
						Slow
					</option>
					<option value="normal">
						Normal
					</option>
					<option value="fast">
						Fast
					</option>
				</select>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
	import { computed, ref } from "vue";

	interface Props {
		sequence: string[]
		nodes: any[]
		connectionStyle: {
			color: string
			strokeWidth: number
			type: string
		}
		layout: string
		spacing: number
	}

	const props = defineProps<Props>();

	const emit = defineEmits<{
		animateOnCanvas: [sequence: string[], duration: number]
	}>();

	const nodeRadius = 20;
	const isAnimating = ref(false);
	const animationStep = ref(0);
	const previewSpeed = ref("normal");

	const getNodeLabel = (nodeId: string) => {
		const node = props.nodes.find((n: any) => n.id === nodeId);
		const label = node?.data?.label || node?.type || "";
		return label.length > 12 ? `${label.substring(0, 12)}...` : label;
	};

	const getNodePosition = (index: number) => {
		const centerX = 300;
		const centerY = 200;
		const totalNodes = props.sequence.length;

		switch (props.layout) {
		case "horizontal": {
			const totalWidth = (totalNodes - 1) * props.spacing;
			return {
				x: centerX - totalWidth / 2 + index * props.spacing,
				y: centerY
			};
		}
		case "vertical": {
			const totalHeight = (totalNodes - 1) * props.spacing;
			return {
				x: centerX,
				y: centerY - totalHeight / 2 + index * props.spacing
			};
		}
		case "grid": {
			const cols = Math.ceil(Math.sqrt(totalNodes));
			const row = Math.floor(index / cols);
			const col = index % cols;
			return {
				x: centerX - ((cols - 1) * props.spacing) / 2 + col * props.spacing,
				y: centerY - ((Math.ceil(totalNodes / cols) - 1) * props.spacing) / 2 + row * props.spacing
			};
		}
		case "circle": {
			const angle = (index / totalNodes) * 2 * Math.PI - Math.PI / 2;
			return {
				x: centerX + Math.cos(angle) * props.spacing,
				y: centerY + Math.sin(angle) * props.spacing
			};
		}
		default:
			return {
				x: centerX - ((totalNodes - 1) * props.spacing) / 2 + index * props.spacing,
				y: centerY
			};
		}
	};

	const getNodeColor = (index: number) => {
		if (isAnimating.value && animationStep.value >= index) {
			return "rgba(16, 185, 129, 0.3)";
		}
		return "rgba(139, 92, 246, 0.2)";
	};

	const getConnectionPath = (index: number) => {
		const start = getNodePosition(index);
		const end = getNodePosition(index + 1);

		if (props.connectionStyle.type === "straight") {
			return `M ${start.x} ${start.y} L ${end.x} ${end.y}`;
		} else {
			// Smooth curve
			const midX = (start.x + end.x) / 2;
			const midY = (start.y + end.y) / 2;
			return `M ${start.x} ${start.y} Q ${midX} ${midY} ${end.x} ${end.y}`;
		}
	};

	const getArrowPoints = (index: number) => {
		const end = getNodePosition(index + 1);
		const start = getNodePosition(index);
		const angle = Math.atan2(end.y - start.y, end.x - start.x);
		const arrowSize = 8;

		const tipX = end.x - Math.cos(angle) * nodeRadius;
		const tipY = end.y - Math.sin(angle) * nodeRadius;
		const left = {
			x: tipX - Math.cos(angle - Math.PI / 6) * arrowSize,
			y: tipY - Math.sin(angle - Math.PI / 6) * arrowSize
		};
		const right = {
			x: tipX - Math.cos(angle + Math.PI / 6) * arrowSize,
			y: tipY - Math.sin(angle + Math.PI / 6) * arrowSize
		};

		return `${tipX},${tipY} ${left.x},${left.y} ${right.x},${right.y}`;
	};

	const getAnimationDuration = () => {
		const speeds = { slow: 2000, normal: 1000, fast: 500 };
		return speeds[previewSpeed.value as keyof typeof speeds] || 1000;
	};

	const triggerAnimation = async () => {
		isAnimating.value = true;
		animationStep.value = 0;

		const duration = getAnimationDuration();

		// Emit to animate on actual canvas
		emit("animateOnCanvas", props.sequence, duration);

		// Animate preview
		for (let i = 0; i <= props.sequence.length; i++) {
			animationStep.value = i;
			await new Promise((resolve) => setTimeout(resolve, duration));
		}

		setTimeout(() => {
			isAnimating.value = false;
			animationStep.value = 0;
		}, duration);
	};
</script>

<style scoped>
	.connection-flow-visualizer {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.visualizer-header {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.header-title {
		flex: 1;
		font-size: 11px;
		font-weight: 700;
		color: rgba(255, 255, 255, 0.9);
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.animate-btn {
		display: flex;
		align-items: center;
		gap: 4px;
		padding: 4px 10px;
		background: rgba(16, 185, 129, 0.15);
		border: 1px solid rgba(16, 185, 129, 0.3);
		border-radius: 5px;
		color: rgba(16, 185, 129, 1);
		font-size: 10px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.animate-btn:hover {
		background: rgba(16, 185, 129, 0.25);
		border-color: rgba(16, 185, 129, 0.5);
		transform: translateY(-1px);
	}

	.visualizer-canvas {
		background: rgba(0, 0, 0, 0.3);
		border: 1px solid rgba(255, 255, 255, 0.08);
		border-radius: 8px;
		overflow: hidden;
	}

	.flow-svg {
		width: 100%;
		height: auto;
	}

	.node-circle {
		transition: all 0.3s ease;
	}

	.connection-path {
		transition: all 0.3s ease;
	}

	.flow-active {
		stroke: #10b981;
		filter: drop-shadow(0 0 4px #10b981);
	}

	.flow-particle {
		filter: drop-shadow(0 0 4px currentColor);
	}

	.arrow-marker {
		transition: all 0.3s ease;
	}

	.node-label {
		font-family: system-ui, -apple-system, sans-serif;
	}

	.visualizer-controls {
		display: flex;
		gap: 12px;
		padding: 10px 12px;
		background: rgba(0, 0, 0, 0.2);
		border: 1px solid rgba(255, 255, 255, 0.08);
		border-radius: 6px;
	}

	.control-group {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.control-label {
		font-size: 10px;
		font-weight: 600;
		color: rgba(255, 255, 255, 0.6);
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.control-select {
		padding: 4px 8px;
		background: rgba(0, 0, 0, 0.3);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 4px;
		color: white;
		font-size: 11px;
		cursor: pointer;
	}
</style>
