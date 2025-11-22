<template>
	<!-- This component handles light animation styling for connections -->
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';

const props = defineProps<{
	speed: 'slow' | 'normal' | 'fast'
	color?: string
}>();

onMounted(() => {
	const styleId = 'light-connection-styles';
	if (!document.getElementById(styleId)) {
		const style = document.createElement('style');
		style.id = styleId;
		style.textContent = getLightCSS();
		document.head.appendChild(style);
	}
});

onUnmounted(() => {
	const style = document.getElementById('light-connection-styles');
	if (style) style.remove();
});

const getSpeedValue = () => {
	switch (props.speed) {
		case 'slow': return '2.5s';
		case 'fast': return '1s';
		default: return '1.8s';
	}
};

const getLightCSS = () => {
	const speed = getSpeedValue();
	const color = props.color || 'currentColor';
	
	return `
		/* Light Connection Animation */
		.vue-flow__edge[data-animation="light"] {
			position: relative;
		}

		.vue-flow__edge[data-animation="light"] .vue-flow__edge-path {
			stroke: ${color} !important;
			stroke-width: 3px !important;
			stroke-dasharray: 8, 4, 16, 4 !important;
			filter: drop-shadow(0 0 10px ${color}) drop-shadow(0 0 20px ${color}) brightness(1.2) !important;
			animation: lightFlow ${speed} linear infinite, lightShimmer ${speed} ease-in-out infinite !important;
		}

		.vue-flow__edge[data-animation="light"]::before {
			content: '';
			position: absolute;
			top: -8px;
			left: -8px;
			right: -8px;
			bottom: -8px;
			background: radial-gradient(ellipse 200px 20px, ${color}20, transparent 70%);
			animation: lightAura ${speed} ease-in-out infinite;
			pointer-events: none;
			border-radius: 10px;
		}

		.vue-flow__edge[data-animation="light"]::after {
			content: '';
			position: absolute;
			top: 0;
			left: 0;
			right: 0;
			bottom: 0;
			background: linear-gradient(90deg, transparent, ${color}, transparent);
			opacity: 0;
			animation: lightSweep ${speed} ease-in-out infinite;
			pointer-events: none;
		}

		@keyframes lightFlow {
			0% { 
				stroke-dashoffset: 0;
				opacity: 0.9;
			}
			100% { 
				stroke-dashoffset: -32;
				opacity: 1;
			}
		}

		@keyframes lightShimmer {
			0%, 100% { 
				filter: drop-shadow(0 0 10px ${color}) drop-shadow(0 0 20px ${color}) brightness(1.2);
			}
			25% { 
				filter: drop-shadow(0 0 15px ${color}) drop-shadow(0 0 30px ${color}) brightness(1.5);
			}
			50% { 
				filter: drop-shadow(0 0 20px ${color}) drop-shadow(0 0 40px ${color}) brightness(1.8);
			}
			75% { 
				filter: drop-shadow(0 0 15px ${color}) drop-shadow(0 0 30px ${color}) brightness(1.5);
			}
		}

		@keyframes lightAura {
			0%, 100% { 
				opacity: 0.1;
				transform: scale(1);
			}
			50% { 
				opacity: 0.3;
				transform: scale(1.1);
			}
		}

		@keyframes lightSweep {
			0% { 
				opacity: 0;
				transform: translateX(-100%) skewX(-15deg);
			}
			50% { 
				opacity: 0.4;
			}
			100% { 
				opacity: 0;
				transform: translateX(100%) skewX(-15deg);
			}
		}
	`;
};
</script>
