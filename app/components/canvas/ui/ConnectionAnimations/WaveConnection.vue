<template>
	<!-- This component handles wave animation styling for connections -->
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';

const props = defineProps<{
	speed: 'slow' | 'normal' | 'fast'
	color?: string
}>();

onMounted(() => {
	const styleId = 'wave-connection-styles';
	if (!document.getElementById(styleId)) {
		const style = document.createElement('style');
		style.id = styleId;
		style.textContent = getWaveCSS();
		document.head.appendChild(style);
	}
});

onUnmounted(() => {
	const style = document.getElementById('wave-connection-styles');
	if (style) style.remove();
});

const getSpeedValue = () => {
	switch (props.speed) {
		case 'slow': return '3s';
		case 'fast': return '1.5s';
		default: return '2.2s';
	}
};

const getWaveCSS = () => {
	const speed = getSpeedValue();
	const color = props.color || 'currentColor';
	
	return `
		/* Wave Connection Animation */
		.vue-flow__edge[data-animation="wave"] .vue-flow__edge-path {
			stroke: ${color} !important;
			stroke-width: 3px !important;
			stroke-dasharray: 12, 6, 8, 6 !important;
			filter: drop-shadow(0 0 5px ${color}) !important;
			animation: waveFlow ${speed} ease-in-out infinite, waveRipple ${speed} ease-in-out infinite !important;
		}

		.vue-flow__edge[data-animation="wave"]::before {
			content: '';
			position: absolute;
			top: -5px;
			left: 0;
			right: 0;
			bottom: -5px;
			background: linear-gradient(90deg, transparent, ${color}30, transparent);
			animation: waveUndulation ${speed} ease-in-out infinite;
			pointer-events: none;
			border-radius: 3px;
		}

		.vue-flow__edge[data-animation="wave"]::after {
			content: '';
			position: absolute;
			top: 0;
			left: 0;
			right: 0;
			bottom: 0;
			background: linear-gradient(90deg, transparent, ${color}, transparent);
			opacity: 0;
			animation: waveCrest ${speed} ease-in-out infinite;
			pointer-events: none;
		}

		@keyframes waveFlow {
			0% { 
				stroke-dashoffset: 0;
				opacity: 0.8;
			}
			50% { 
				opacity: 1;
			}
			100% { 
				stroke-dashoffset: -32;
				opacity: 0.8;
			}
		}

		@keyframes waveRipple {
			0%, 100% { 
				stroke-width: 3px;
				filter: drop-shadow(0 0 5px ${color});
			}
			25% { 
				stroke-width: 4px;
				filter: drop-shadow(0 0 7px ${color}) brightness(1.1);
			}
			75% { 
				stroke-width: 4px;
				filter: drop-shadow(0 0 7px ${color}) brightness(1.1);
			}
		}

		@keyframes waveUndulation {
			0%, 100% { 
				opacity: 0.1;
				transform: scaleY(0.5) translateY(0);
			}
			50% { 
				opacity: 0.3;
				transform: scaleY(1) translateY(-2px);
			}
		}

		@keyframes waveCrest {
			0% { 
				opacity: 0;
				transform: translateX(-100%) scaleX(0.5);
			}
			50% { 
				opacity: 0.4;
				transform: translateX(0%) scaleX(1);
			}
			100% { 
				opacity: 0;
				transform: translateX(100%) scaleX(0.5);
			}
		}
	`;
};
</script>
