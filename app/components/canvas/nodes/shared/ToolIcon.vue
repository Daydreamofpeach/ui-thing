<template>
	<div 
		class="tool-icon-wrapper"
		@mouseenter="isHovered = true"
		@mouseleave="isHovered = false"
	>
		<!-- Icon Circle -->
		<div 
			class="icon-circle"
			:class="{ 
				'hovered': isHovered,
				'installed': tool.status === 'installed',
				'not-installed': tool.status === 'not-installed',
				'checking': tool.status === 'checking'
			}"
			:style="getCircleStyle"
		>
			<!-- Tool Icon (use SVG or fallback to lucide icon) -->
			<div class="tool-icon" :class="{ 'checking': tool.status === 'checking' }">
				<component 
					v-if="getToolIcon" 
					:is="getToolIcon" 
					class="icon-svg"
				/>
				<UIcon 
					v-else 
					:name="getFallbackIcon" 
					class="w-12 h-12"
				/>
			</div>

			<!-- Status Indicator -->
			<div class="status-indicator" :class="tool.status">
				<UIcon 
					:name="getStatusIcon" 
					class="w-3 h-3"
				/>
			</div>

			<!-- Hover Tooltip (Name & Description Only) -->
			<Transition name="tooltip">
				<div v-if="isHovered" class="tooltip" :style="getCardStyle">
					<div class="tooltip-name">{{ tool.name }}</div>
					<div v-if="tool.version" class="tooltip-version">{{ tool.version }}</div>
					<div v-else-if="tool.status === 'not-installed'" class="tooltip-status">Not Installed</div>
					<div v-else-if="tool.status === 'checking'" class="tooltip-status">Checking...</div>
				</div>
			</Transition>
		</div>

		<!-- Action Buttons (Always Visible Below Icon) -->
		<div class="action-buttons">
			<button
				v-if="tool.status === 'installed' && showConnect"
				class="action-btn connect-btn"
				@click.stop="handleAction('connect')"
			>
				<UIcon name="i-lucide-link" class="w-3.5 h-3.5" />
				<span>Link</span>
			</button>
			<button
				v-if="tool.status === 'installed' && showOpen"
				class="action-btn open-btn"
				@click.stop="handleAction('open')"
			>
				<UIcon name="i-lucide-external-link" class="w-3.5 h-3.5" />
				<span>Open</span>
			</button>
			<button
				v-if="tool.status === 'not-installed'"
				class="action-btn get-btn"
				@click.stop="handleAction('get')"
			>
				<UIcon name="i-lucide-download" class="w-3.5 h-3.5" />
				<span>Get</span>
			</button>
		</div>
	</div>
</template>

<script setup lang="ts">
	import { ref, computed } from 'vue';

	interface Props {
		tool: {
			name: string
			status: 'checking' | 'installed' | 'not-installed'
			version?: string
			icon?: string
		}
		themeColor?: string
		showConnect?: boolean
		showOpen?: boolean
	}

	const props = withDefaults(defineProps<Props>(), {
		themeColor: 'rgba(139, 92, 246, 1)',
		showConnect: true,
		showOpen: true
	});

	const emit = defineEmits<{
		action: [data: { tool: any, action: string }]
	}>();

	const isHovered = ref(false);

	// Icon mapping for popular tools
	const iconMap: Record<string, string> = {
		'VS Code': 'i-logos-visual-studio-code',
		'Cursor': 'i-lucide-code-2',
		'Visual Studio': 'i-logos-visual-studio',
		'Git': 'i-logos-git-icon',
		'npm': 'i-logos-npm-icon',
		'Bun': 'i-logos-bun',
		'pnpm': 'i-logos-pnpm',
		'Husky': 'i-lucide-dog',
		'AWS Amplify CLI': 'i-logos-aws-amplify',
		'AWS CLI': 'i-logos-aws',
		'ESLint': 'i-logos-eslint',
		'TypeScript': 'i-logos-typescript-icon'
	};

	const getToolIcon = computed(() => {
		// Return null for now, we'll add SVG components later if needed
		return null;
	});

	const getFallbackIcon = computed(() => {
		return iconMap[props.tool.name] || 'i-lucide-box';
	});

	const getStatusIcon = computed(() => {
		switch (props.tool.status) {
			case 'installed':
				return 'i-lucide-check-circle';
			case 'not-installed':
				return 'i-lucide-x-circle';
			case 'checking':
				return 'i-lucide-loader-2';
			default:
				return 'i-lucide-circle';
		}
	});

	const getCircleStyle = computed(() => {
		// No background or border - clean transparent design
		return {
			background: 'transparent'
		};
	});

	const getCardStyle = computed(() => {
		return {
			borderColor: props.themeColor,
			backgroundColor: `rgba(17, 24, 39, 0.98)`
		};
	});

	function handleAction(action: string) {
		emit('action', { tool: props.tool, action });
	}
</script>

<style scoped>
.tool-icon-wrapper {
	position: relative;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: flex-start;
	min-width: 90px;
}

.icon-circle {
	width: 80px;
	height: 80px;
	border-radius: 50%;
	border: none;
	display: flex;
	align-items: center;
	justify-content: center;
	position: relative;
	cursor: pointer;
	transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	background: transparent;
}

.icon-circle:hover,
.icon-circle.hovered {
	transform: scale(1.2);
}

.icon-circle.checking {
	animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
	0%, 100% {
		opacity: 1;
	}
	50% {
		opacity: 0.5;
	}
}

.tool-icon {
	display: flex;
	align-items: center;
	justify-content: center;
	transition: transform 0.3s ease;
}

.tool-icon.checking {
	animation: spin 2s linear infinite;
}

@keyframes spin {
	from {
		transform: rotate(0deg);
	}
	to {
		transform: rotate(360deg);
	}
}

.icon-svg {
	width: 48px;
	height: 48px;
}

.status-indicator {
	position: absolute;
	bottom: 2px;
	right: 2px;
	width: 18px;
	height: 18px;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	border: 2px solid rgba(17, 24, 39, 0.8);
	transition: all 0.2s ease;
	backdrop-filter: blur(4px);
}

.status-indicator.installed {
	background: rgba(16, 185, 129, 0.95);
	color: white;
}

.status-indicator.not-installed {
	background: rgba(239, 68, 68, 0.95);
	color: white;
}

.status-indicator.checking {
	background: rgba(139, 92, 246, 0.95);
	color: white;
}

/* Tooltip (Hover Info) */
.tooltip {
	position: absolute;
	top: -15px;
	left: 50%;
	transform: translateX(-50%) translateY(-100%);
	min-width: 140px;
	max-width: 200px;
	padding: 0.625rem 0.875rem;
	border-radius: 0.625rem;
	border: 1px solid rgba(139, 92, 246, 0.3);
	backdrop-filter: blur(12px);
	background: linear-gradient(135deg, rgba(17, 24, 39, 0.95), rgba(31, 41, 55, 0.95));
	box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
	z-index: 100;
	text-align: center;
	pointer-events: none;
}

.tooltip-enter-active,
.tooltip-leave-active {
	transition: all 0.2s ease;
}

.tooltip-enter-from,
.tooltip-leave-to {
	opacity: 0;
	transform: translateX(-50%) translateY(-90%);
}

.tooltip-name {
	font-size: 0.875rem;
	font-weight: 600;
	color: rgba(255, 255, 255, 0.98);
	margin-bottom: 0.125rem;
	letter-spacing: 0.01em;
}

.tooltip-version {
	font-size: 0.75rem;
	color: rgba(134, 239, 172, 1);
	font-family: monospace;
	font-weight: 500;
}

.tooltip-status {
	font-size: 0.75rem;
	color: rgba(255, 255, 255, 0.65);
	font-weight: 500;
}

/* Action Buttons (Always Visible Below Icon) */
.action-buttons {
	display: flex;
	gap: 0.5rem;
	flex-direction: column;
	align-items: stretch;
	margin-top: 0.75rem;
	min-width: 90px;
}

.action-btn {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 0.375rem;
	padding: 0.5rem 0.875rem;
	border-radius: 0.5rem;
	font-size: 0.75rem;
	font-weight: 600;
	cursor: pointer;
	transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
	border: none;
	white-space: nowrap;
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.connect-btn {
	background: linear-gradient(135deg, rgba(59, 130, 246, 0.4), rgba(37, 99, 235, 0.4));
	color: rgba(191, 219, 254, 1);
}

.connect-btn:hover {
	background: linear-gradient(135deg, rgba(59, 130, 246, 0.6), rgba(37, 99, 235, 0.6));
	transform: translateY(-2px);
	box-shadow: 0 4px 16px rgba(59, 130, 246, 0.4);
}

.open-btn {
	background: linear-gradient(135deg, rgba(16, 185, 129, 0.4), rgba(5, 150, 105, 0.4));
	color: rgba(167, 243, 208, 1);
}

.open-btn:hover {
	background: linear-gradient(135deg, rgba(16, 185, 129, 0.6), rgba(5, 150, 105, 0.6));
	transform: translateY(-2px);
	box-shadow: 0 4px 16px rgba(16, 185, 129, 0.4);
}

.get-btn {
	background: linear-gradient(135deg, rgba(251, 146, 60, 0.4), rgba(249, 115, 22, 0.4));
	color: rgba(254, 215, 170, 1);
}

.get-btn:hover {
	background: linear-gradient(135deg, rgba(251, 146, 60, 0.6), rgba(249, 115, 22, 0.6));
	transform: translateY(-2px);
	box-shadow: 0 4px 16px rgba(251, 146, 60, 0.4);
}
</style>

