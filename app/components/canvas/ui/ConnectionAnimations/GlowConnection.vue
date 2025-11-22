<template>
	<!-- This component handles glow animation styling for connections -->
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';

const props = defineProps<{
	speed: 'slow' | 'normal' | 'fast'
	color?: string
}>();

onMounted(() => {
	const styleId = 'glow-connection-styles';
	if (!document.getElementById(styleId)) {
		const style = document.createElement('style');
		style.id = styleId;
		style.textContent = getGlowCSS();
		document.head.appendChild(style);
	}
});

onUnmounted(() => {
	const style = document.getElementById('glow-connection-styles');
	if (style) style.remove();
});

const getSpeedValue = () => {
	switch (props.speed) {
		case 'slow': return '4s';
		case 'fast': return '2s';
		default: return '3s';
	}
};

const getGlowCSS = () => {
	const speed = getSpeedValue();
	const color = props.color || 'currentColor';
	
	return `
		/* Glow Connection Animation */
		.vue-flow__edge[data-animation="glow"] {
			position: relative;
		}

		.vue-flow__edge[data-animation="glow"] .vue-flow__edge-path {
			stroke: ${color} !important;
			stroke-width: 4px !important;
			stroke-dasharray: 4, 8, 12, 8 !important;
			filter: drop-shadow(0 0 12px ${color}) drop-shadow(0 0 24px ${color}) brightness(1.3) !important;
			animation: glowPulse ${speed} ease-in-out infinite !important;
		}

		.vue-flow__edge[data-animation="glow"]::before {
			content: '';
			position: absolute;
			top: -12px;
			left: -12px;
			right: -12px;
			bottom: -12px;
			background: 
				radial-gradient(ellipse 300px 100px, ${color}25, transparent 60%),
				linear-gradient(90deg, transparent, ${color}15, transparent);
			animation: glowAura ${speed} ease-in-out infinite;
			pointer-events: none;
			border-radius: 15px;
		}

		.vue-flow__edge[data-animation="glow"]::after {
			content: '';
			position: absolute;
			top: -6px;
			left: 0;
			right: 0;
			bottom: -6px;
			background: linear-gradient(90deg, transparent, ${color}40, transparent);
			opacity: 0;
			animation: glowSweep ${speed} ease-in-out infinite;
			pointer-events: none;
		}

		@keyframes glowPulse {
			0%, 100% { 
				stroke-width: 4px;
				opacity: 0.8;
				filter: drop-shadow(0 0 12px ${color}) drop-shadow(0 0 24px ${color}) brightness(1.3);
			}
			50% { 
				stroke-width: 6px;
				opacity: 1;
				filter: drop-shadow(0 0 20px ${color}) drop-shadow(0 0 40px ${color}) brightness(1.6);
			}
		}

		@keyframes glowAura {
			0%, 100% { 
				opacity: 0.2;
				transform: scale(1);
			}
			50% { 
				opacity: 0.4;
				transform: scale(1.2);
			}
		}

		@keyframes glowSweep {
			0% { 
				opacity: 0;
				transform: translateX(-100%) scaleX(0.3);
			}
			25% { 
				opacity: 0.6;
				transform: translateX(-50%) scaleX(0.8);
			}
			75% { 
				opacity: 0.6;
				transform: translateX(50%) scaleX(0.8);
			}
			100% { 
				opacity: 0;
				transform: translateX(100%) scaleX(0.3);
			}
		}
	`;
};
</script>
