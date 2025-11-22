<template>
	<div class="environment-display-container">
		<!-- Active Environment Card -->
		<div v-if="environment" class="environment-card" :style="cardStyle">
			<div class="environment-header">
				<div class="environment-icon" :style="iconStyle">
					<UIcon :name="environmentIcon" class="size-5" />
				</div>
				<div class="environment-info">
					<span class="environment-name">{{ environment.name }}</span>
					<span v-if="environment.type" class="environment-type">{{ environment.type }}</span>
					<span class="environment-status" :class="statusClass">
						<UIcon :name="statusIcon" class="size-3" />
						{{ environment.active ? 'Active' : 'Inactive' }}
					</span>
				</div>
			</div>

			<div v-if="environment.description" class="environment-description">
				{{ environment.description }}
			</div>

			<!-- Machine Info -->
			<div v-if="environment.machine || environment.id || environment.machineId" class="machine-info">
				<div v-if="environment.id" class="machine-detail">
					<UIcon name="i-lucide-key" class="size-3" />
					<span class="detail-label">Environment ID:</span>
					<span class="detail-value detail-id">{{ environment.id }}</span>
				</div>
				<div v-if="environment.machineId" class="machine-detail">
					<UIcon name="i-lucide-fingerprint" class="size-3" />
					<span class="detail-label">Machine ID:</span>
					<span class="detail-value detail-id">{{ environment.machineId }}</span>
				</div>
				<div v-if="environment.machine" class="machine-detail">
					<UIcon name="i-lucide-monitor" class="size-3" />
					<span class="detail-label">OS:</span>
					<span class="detail-value">{{ environment.machine.osType }} {{ environment.machine.osVersion }}</span>
				</div>
				<div v-if="environment.machine?.cpuCores" class="machine-detail">
					<UIcon name="i-lucide-cpu" class="size-3" />
					<span class="detail-label">CPU:</span>
					<span class="detail-value">{{ environment.machine.cpuCores }} cores</span>
				</div>
				<div v-if="environment.machine?.ramGB" class="machine-detail">
					<UIcon name="i-lucide-database" class="size-3" />
					<span class="detail-label">RAM:</span>
					<span class="detail-value">{{ environment.machine.ramGB }}GB</span>
				</div>
				<div v-if="environment.machine?.username" class="machine-detail">
					<UIcon name="i-lucide-user" class="size-3" />
					<span class="detail-label">User:</span>
					<span class="detail-value">{{ environment.machine.username }}</span>
				</div>
			</div>

			<!-- Actions -->
			<div v-if="showLinkButton || showOpenButton" class="environment-actions">
				<button
					v-if="showLinkButton"
					class="action-button link-button"
					:style="linkButtonStyle"
					:disabled="isLinking"
					@click="handleLink"
				>
					<UIcon :name="isLinking ? 'i-lucide-loader-2' : 'i-lucide-link'" class="size-4" :class="{ 'animate-spin': isLinking }" />
					<span>{{ isLinking ? 'Linking...' : linkButtonText }}</span>
				</button>

				<button
					v-if="showOpenButton"
					class="action-button open-button"
					:style="actionButtonStyle"
					@click="handleOpen"
				>
					<UIcon name="i-lucide-external-link" class="size-4" />
					<span>Open</span>
				</button>
			</div>
		</div>

		<!-- Empty State -->
		<div v-else class="empty-state">
			<UIcon name="i-lucide-server" class="size-12 text-white/20" />
			<p class="text-sm text-white/50">
				{{ emptyMessage }}
			</p>
			<p v-if="emptySubMessage" class="text-xs text-white/40">
				{{ emptySubMessage }}
			</p>
		</div>
	</div>
</template>

<script setup lang="ts">
	import type { Environment } from "@composables/useEnvironmentStore";
	import { computed } from "vue";

	interface Props {
		environment?: Environment | null
		themeColor?: string
		showLinkButton?: boolean
		showOpenButton?: boolean
		isLinking?: boolean
		linkButtonText?: string
		emptyMessage?: string
		emptySubMessage?: string
	}

	const props = withDefaults(defineProps<Props>(), {
		environment: null,
		themeColor: "rgba(16, 185, 129, 1)",
		showLinkButton: false,
		showOpenButton: false,
		isLinking: false,
		linkButtonText: "Link",
		emptyMessage: "No environment selected",
		emptySubMessage: "Select an environment to continue"
	});

	const emit = defineEmits<{
		link: []
		open: [environment: Environment]
	}>();

	// Computed styles
	const activeColorRGB = computed(() => {
		const match = props.themeColor?.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
		return match ? `${match[1]}, ${match[2]}, ${match[3]}` : "16, 185, 129";
	});

	const cardStyle = computed(() => ({
		borderColor: `rgba(${activeColorRGB.value}, 0.3)`,
		backgroundColor: `rgba(${activeColorRGB.value}, 0.05)`
	}));

	const iconStyle = computed(() => ({
		backgroundColor: `rgba(${activeColorRGB.value}, 0.2)`,
		borderColor: `rgba(${activeColorRGB.value}, 0.3)`,
		color: props.themeColor
	}));

	const actionButtonStyle = computed(() => ({
		borderColor: `rgba(${activeColorRGB.value}, 0.4)`,
		backgroundColor: `rgba(${activeColorRGB.value}, 0.2)`,
		color: `rgba(134, 239, 172, 1)`
	}));

	const linkButtonStyle = computed(() => ({
		borderColor: `rgba(59, 130, 246, 0.4)`,
		backgroundColor: `rgba(59, 130, 246, 0.2)`,
		color: `rgba(147, 197, 253, 1)`
	}));

	// Computed properties
	const environmentIcon = computed(() => {
		if (!props.environment) return "i-lucide-server";
		return props.environment.type === "LOCAL" ? "i-lucide-laptop" : "i-lucide-cloud";
	});

	const statusIcon = computed(() => {
		return props.environment?.active ? "i-lucide-check-circle" : "i-lucide-circle";
	});

	const statusClass = computed(() => ({
		"status-active": props.environment?.active,
		"status-inactive": !props.environment?.active
	}));

	// Methods
	function handleLink() {
		emit("link");
	}

	function handleOpen() {
		if (props.environment) {
			emit("open", props.environment);
		}
	}
</script>

<style scoped>
.environment-display-container {
	width: 100%;
}

.environment-card {
	display: flex;
	flex-direction: column;
	gap: 0.75rem;
	padding: 1rem;
	border: 1px solid;
	border-radius: 0.75rem;
	transition: all 0.2s ease;
}

.environment-card:hover {
	transform: translateY(-2px);
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.environment-header {
	display: flex;
	align-items: center;
	gap: 0.75rem;
}

.environment-icon {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 2.5rem;
	height: 2.5rem;
	border: 1px solid;
	border-radius: 0.5rem;
	flex-shrink: 0;
}

.environment-info {
	display: flex;
	flex-direction: column;
	gap: 0.25rem;
	flex: 1;
}

.environment-name {
	font-size: 0.875rem;
	font-weight: 600;
	color: rgba(255, 255, 255, 0.9);
}

.environment-type {
	font-size: 0.7rem;
	padding: 0.125rem 0.5rem;
	background: rgba(139, 92, 246, 0.15);
	border: 1px solid rgba(139, 92, 246, 0.3);
	border-radius: 0.375rem;
	color: rgba(196, 181, 253, 1);
	font-weight: 500;
	width: fit-content;
}

.environment-status {
	display: flex;
	align-items: center;
	gap: 0.375rem;
	font-size: 0.75rem;
	font-weight: 500;
}

.environment-status.status-active {
	color: rgba(134, 239, 172, 1);
}

.environment-status.status-inactive {
	color: rgba(156, 163, 175, 1);
}

.environment-description {
	font-size: 0.75rem;
	color: rgba(156, 163, 175, 1);
	line-height: 1.4;
}

.machine-info {
	display: flex;
	flex-direction: column;
	gap: 0.375rem;
	padding: 0.75rem;
	background: rgba(0, 0, 0, 0.2);
	border: 1px solid rgba(255, 255, 255, 0.05);
	border-radius: 0.5rem;
}

.machine-detail {
	display: flex;
	align-items: center;
	gap: 0.5rem;
	font-size: 0.75rem;
	color: rgba(156, 163, 175, 1);
}

.machine-detail .detail-label {
	font-weight: 500;
	color: rgba(156, 163, 175, 1);
}

.machine-detail .detail-value {
	color: rgba(255, 255, 255, 0.8);
	font-weight: 400;
}

.machine-detail .detail-id {
	font-family: monospace;
	font-size: 0.7rem;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	max-width: 200px;
}

.environment-actions {
	display: flex;
	gap: 0.5rem;
	padding-top: 0.5rem;
	border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.action-button {
	display: flex;
	align-items: center;
	gap: 0.5rem;
	padding: 0.5rem 1rem;
	border-radius: 0.5rem;
	font-size: 0.8125rem;
	font-weight: 600;
	cursor: pointer;
	transition: all 0.2s ease;
	border: 1px solid;
	flex: 1;
	justify-content: center;
}

.action-button:hover:not(:disabled) {
	transform: translateY(-1px);
	box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

.action-button:disabled {
	opacity: 0.5;
	cursor: not-allowed;
}

.link-button:hover:not(:disabled) {
	background: rgba(59, 130, 246, 0.3) !important;
	border-color: rgba(59, 130, 246, 0.6) !important;
}

.open-button:hover:not(:disabled) {
	background: rgba(16, 185, 129, 0.3) !important;
	border-color: rgba(16, 185, 129, 0.6) !important;
}

.empty-state {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 2rem;
	text-align: center;
	gap: 0.5rem;
}
</style>
