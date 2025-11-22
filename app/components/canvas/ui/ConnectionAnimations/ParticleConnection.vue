<template>
	<!-- This component handles particle animation styling for connections -->
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';

const props = defineProps<{
	speed: 'slow' | 'normal' | 'fast'
	color?: string
	edgeId?: string
}>();

onMounted(() => {
	// Inject unique particle animation styles for this specific edge
	if (props.edgeId) {
		const styleId = `particle-connection-${props.edgeId.replace(/[^a-zA-Z0-9]/g, '')}-styles`;
		if (!document.getElementById(styleId)) {
			const style = document.createElement('style');
			style.id = styleId;
			style.textContent = getParticleCSS();
			document.head.appendChild(style);
		}
	}
});

onUnmounted(() => {
	const style = document.getElementById('particle-connection-styles');
	if (style) style.remove();
});

const getSpeedValue = () => {
	switch (props.speed) {
		case 'slow': return '4s';
		case 'fast': return '1.2s';
		default: return '2.5s';
	}
};

const getParticleCSS = () => {
	const defaultSpeed = getSpeedValue();
	const defaultColor = props.color || 'currentColor';
	const edgeId = props.edgeId ? `#${props.edgeId.replace(/[^a-zA-Z0-9]/g, '')}` : '';
	
	// Target the specific edge by ID if available, otherwise use general selectors
	const edgeSelector = edgeId ? `${edgeId} .vue-flow__edge-path` : '.vue-flow__edge .vue-flow__edge-path';
	const edgeContainerSelector = edgeId ? edgeId : '.vue-flow__edge';
	
	return `
		/* Particle Connection Animation for Edge ${props.edgeId || 'general'} */
		${edgeSelector} {
			stroke: var(--edge-color, ${defaultColor}) !important;
			stroke-width: 2px !important;
			stroke-dasharray: 1, 12, 1, 12 !important;
			filter: drop-shadow(0 0 3px var(--edge-color, ${defaultColor})) drop-shadow(0 0 6px var(--edge-color, ${defaultColor})) !important;
			animation: particleFlow var(--edge-speed, ${defaultSpeed}) linear infinite, particleGlow var(--edge-speed, ${defaultSpeed}) ease-in-out infinite !important;
		}

		${edgeContainerSelector} {
			position: relative;
			--edge-color: ${defaultColor};
			--edge-speed: ${defaultSpeed};
		}

		.vue-flow__edge.connection-animation-particle::before,
		.vue-flow__edge[data-animation="particle"]::before {
			content: '';
			position: absolute;
			top: 0;
			left: 0;
			right: 0;
			bottom: 0;
			background: linear-gradient(90deg, transparent, var(--edge-color, ${defaultColor}), transparent);
			opacity: 0;
			animation: particleTrail var(--edge-speed, ${defaultSpeed}) ease-in-out infinite;
			pointer-events: none;
		}

		@keyframes particleFlow {
			0% { 
				stroke-dashoffset: 0;
				opacity: 0.8;
			}
			25% { 
				opacity: 1;
			}
			75% { 
				opacity: 0.9;
			}
			100% { 
				stroke-dashoffset: -26;
				opacity: 0.8;
			}
		}

		@keyframes particleGlow {
			0%, 100% { 
				filter: drop-shadow(0 0 3px var(--edge-color, ${defaultColor})) drop-shadow(0 0 6px var(--edge-color, ${defaultColor}));
			}
			50% { 
				filter: drop-shadow(0 0 6px var(--edge-color, ${defaultColor})) drop-shadow(0 0 12px var(--edge-color, ${defaultColor})) brightness(1.3);
			}
		}

		@keyframes particleTrail {
			0% { 
				opacity: 0;
				transform: translateX(-100%);
			}
			20% { 
				opacity: 0.8;
			}
			80% { 
				opacity: 0.6;
			}
			100% { 
				opacity: 0;
				transform: translateX(100%);
			}
		}
	`;
};
</script>
