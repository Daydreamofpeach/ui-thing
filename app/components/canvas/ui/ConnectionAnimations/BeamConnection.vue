<template>
	<!-- This component handles beam animation styling for connections -->
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';

const props = defineProps<{
	speed: 'slow' | 'normal' | 'fast'
	color?: string
}>();

onMounted(() => {
	const styleId = 'beam-connection-styles';
	if (!document.getElementById(styleId)) {
		const style = document.createElement('style');
		style.id = styleId;
		style.textContent = getBeamCSS();
		document.head.appendChild(style);
	}
});

onUnmounted(() => {
	const style = document.getElementById('beam-connection-styles');
	if (style) style.remove();
});

const getSpeedValue = () => {
	switch (props.speed) {
		case 'slow': return '3s';
		case 'fast': return '1.5s';
		default: return '2s';
	}
};

const getBeamCSS = () => {
	const defaultSpeed = getSpeedValue();
	const defaultColor = props.color || 'currentColor';
	
	return `
		/* Beam Connection Animation */
		.vue-flow__edge.connection-animation-beam .vue-flow__edge-path,
		.vue-flow__edge[data-animation="beam"] .vue-flow__edge-path {
			stroke: var(--edge-color, ${defaultColor}) !important;
			stroke-width: 4px !important;
			stroke-dasharray: 20, 3, 40, 3 !important;
			filter: drop-shadow(0 0 8px var(--edge-color, ${defaultColor})) drop-shadow(0 0 16px var(--edge-color, ${defaultColor})) !important;
			animation: beamPulse var(--edge-speed, ${defaultSpeed}) ease-in-out infinite, beamScan var(--edge-speed, ${defaultSpeed}) linear infinite !important;
		}

		.vue-flow__edge.connection-animation-beam,
		.vue-flow__edge[data-animation="beam"] {
			position: relative;
			--edge-color: ${defaultColor};
			--edge-speed: ${defaultSpeed};
		}

		.vue-flow__edge.connection-animation-beam::after,
		.vue-flow__edge[data-animation="beam"]::after {
			content: '';
			position: absolute;
			top: -2px;
			left: 0;
			right: 0;
			bottom: -2px;
			background: linear-gradient(90deg, transparent, var(--edge-color, ${defaultColor}), transparent);
			opacity: 0;
			animation: beamFlare var(--edge-speed, ${defaultSpeed}) ease-in-out infinite;
			pointer-events: none;
			border-radius: 2px;
		}

		@keyframes beamPulse {
			0%, 100% { 
				stroke-width: 4px;
				filter: drop-shadow(0 0 8px var(--edge-color, ${defaultColor})) drop-shadow(0 0 16px var(--edge-color, ${defaultColor}));
			}
			50% { 
				stroke-width: 6px;
				filter: drop-shadow(0 0 12px var(--edge-color, ${defaultColor})) drop-shadow(0 0 24px var(--edge-color, ${defaultColor})) brightness(1.4);
			}
		}

		@keyframes beamScan {
			0% { 
				stroke-dashoffset: 0;
			}
			100% { 
				stroke-dashoffset: -66;
			}
		}

		@keyframes beamFlare {
			0%, 100% { 
				opacity: 0;
			}
			40%, 60% { 
				opacity: 0.3;
			}
			50% { 
				opacity: 0.6;
			}
		}
	`;
};
</script>
