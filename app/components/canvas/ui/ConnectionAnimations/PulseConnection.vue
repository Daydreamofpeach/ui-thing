<template>
	<!-- This component handles pulse animation styling for connections -->
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';

const props = defineProps<{
	speed: 'slow' | 'normal' | 'fast'
	color?: string
}>();

onMounted(() => {
	const styleId = 'pulse-connection-styles';
	if (!document.getElementById(styleId)) {
		const style = document.createElement('style');
		style.id = styleId;
		style.textContent = getPulseCSS();
		document.head.appendChild(style);
	}
});

onUnmounted(() => {
	const style = document.getElementById('pulse-connection-styles');
	if (style) style.remove();
});

const getSpeedValue = () => {
	switch (props.speed) {
		case 'slow': return '2.5s';
		case 'fast': return '1.2s';
		default: return '1.8s';
	}
};

const getPulseCSS = () => {
	const speed = getSpeedValue();
	const color = props.color || 'currentColor';
	
	return `
		/* Pulse Connection Animation */
		.vue-flow__edge[data-animation="pulse"] .vue-flow__edge-path {
			stroke: ${color} !important;
			stroke-width: 2px !important;
			stroke-dasharray: 6, 6, 12, 6 !important;
			filter: drop-shadow(0 0 4px ${color}) !important;
			animation: pulseWave ${speed} ease-in-out infinite !important;
		}

		.vue-flow__edge[data-animation="pulse"]::before {
			content: '';
			position: absolute;
			top: -3px;
			left: 0;
			right: 0;
			bottom: -3px;
			background: ${color};
			opacity: 0;
			animation: pulseExpansion ${speed} ease-in-out infinite;
			pointer-events: none;
			border-radius: 2px;
		}

		@keyframes pulseWave {
			0%, 100% { 
				stroke-dashoffset: 0;
				stroke-width: 2px;
				opacity: 0.7;
				filter: drop-shadow(0 0 4px ${color});
			}
			50% { 
				stroke-width: 4px;
				opacity: 1;
				filter: drop-shadow(0 0 8px ${color}) brightness(1.2);
			}
		}

		@keyframes pulseExpansion {
			0%, 100% { 
				opacity: 0;
				transform: scaleY(1);
			}
			50% { 
				opacity: 0.3;
				transform: scaleY(2);
			}
		}
	`;
};
</script>
