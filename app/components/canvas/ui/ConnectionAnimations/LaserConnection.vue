<template>
	<!-- This component handles laser animation styling for connections -->
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';

const props = defineProps<{
	speed: 'slow' | 'normal' | 'fast'
	color?: string
}>();

onMounted(() => {
	const styleId = 'laser-connection-styles';
	if (!document.getElementById(styleId)) {
		const style = document.createElement('style');
		style.id = styleId;
		style.textContent = getLaserCSS();
		document.head.appendChild(style);
	}
});

onUnmounted(() => {
	const style = document.getElementById('laser-connection-styles');
	if (style) style.remove();
});

const getSpeedValue = () => {
	switch (props.speed) {
		case 'slow': return '1.5s';
		case 'fast': return '0.6s';
		default: return '1s';
	}
};

const getLaserCSS = () => {
	const speed = getSpeedValue();
	const color = props.color || 'currentColor';
	
	return `
		/* Laser Connection Animation */
		.vue-flow__edge[data-animation="laser"] {
			position: relative;
		}

		.vue-flow__edge[data-animation="laser"] .vue-flow__edge-path {
			stroke: ${color} !important;
			stroke-width: 2px !important;
			stroke-dasharray: 30, 2, 50, 2 !important;
			filter: drop-shadow(0 0 15px ${color}) drop-shadow(0 0 30px ${color}) brightness(2) !important;
			animation: laserScan ${speed} linear infinite, laserIntensity ${speed} ease-in-out infinite !important;
		}

		.vue-flow__edge[data-animation="laser"]::before {
			content: '';
			position: absolute;
			top: -10px;
			left: -10px;
			right: -10px;
			bottom: -10px;
			background: linear-gradient(90deg, transparent, ${color}40, transparent);
			opacity: 0;
			animation: laserTrail ${speed} linear infinite;
			pointer-events: none;
		}

		.vue-flow__edge[data-animation="laser"]::after {
			content: '';
			position: absolute;
			top: -4px;
			left: 0;
			right: 0;
			bottom: -4px;
			background: 
				radial-gradient(ellipse 100% 20px, ${color}60, transparent 70%),
				linear-gradient(90deg, transparent, ${color}, transparent);
			opacity: 0;
			animation: laserGlow ${speed} ease-in-out infinite;
			pointer-events: none;
		}

		@keyframes laserScan {
			0% { 
				stroke-dashoffset: 0;
				opacity: 0.8;
			}
			10% { 
				opacity: 1;
			}
			90% { 
				opacity: 1;
			}
			100% { 
				stroke-dashoffset: -84;
				opacity: 0.8;
			}
		}

		@keyframes laserIntensity {
			0%, 100% { 
				filter: drop-shadow(0 0 15px ${color}) drop-shadow(0 0 30px ${color}) brightness(2);
			}
			50% { 
				filter: drop-shadow(0 0 25px ${color}) drop-shadow(0 0 50px ${color}) brightness(2.5);
			}
		}

		@keyframes laserTrail {
			0% { 
				opacity: 0;
				transform: translateX(-50px);
			}
			10% { 
				opacity: 0.6;
			}
			90% { 
				opacity: 0.8;
			}
			100% { 
				opacity: 0;
				transform: translateX(50px);
			}
		}

		@keyframes laserGlow {
			0%, 100% { 
				opacity: 0;
			}
			45%, 55% { 
				opacity: 0.4;
			}
			50% { 
				opacity: 0.7;
			}
		}
	`;
};
</script>
