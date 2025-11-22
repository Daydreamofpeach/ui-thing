<template>
	<div class="file-change-block">
		<div class="change-header">
			<div class="change-type-badge" :class="`badge-${change.type}`">
				<Icon :name="getChangeIcon(change.type)" class="w-3 h-3" />
				<span class="text-xs font-medium">{{ formatChangeType(change.type) }}</span>
			</div>
			<span class="change-time">{{ formatTime(change.timestamp) }}</span>
		</div>

		<div v-if="change.details" class="change-details">
			<div v-if="change.details.beforeSize !== undefined && change.details.afterSize !== undefined" class="detail-row">
				<span class="detail-label">Size:</span>
				<span class="detail-value">
					{{ formatSize(change.details.beforeSize) }} → {{ formatSize(change.details.afterSize) }}
				</span>
			</div>
			<div v-if="change.details.accessedBy" class="detail-row">
				<span class="detail-label">Accessed by:</span>
				<span class="detail-value">{{ change.details.accessedBy }}</span>
			</div>
		</div>

		<button
			v-if="showDismiss"
			class="change-dismiss"
			type="button"
			title="Dismiss change"
			@click="$emit('dismiss')"
		>
			<Icon name="lucide:x" class="w-3 h-3" />
		</button>
	</div>
</template>

<script setup lang="ts">
	import type { FileChange } from '~/composables/useFileWatcher';

	interface Props {
		change: FileChange;
		showDismiss?: boolean;
	}

	const props = withDefaults(defineProps<Props>(), {
		showDismiss: true
	});

	const emit = defineEmits<{
		dismiss: []
	}>();

	const getChangeIcon = (type: FileChange['type']): string => {
		switch (type) {
			case 'modified':
				return 'lucide:file-check';
			case 'metadata':
				return 'lucide:info';
			case 'access':
				return 'lucide:eye';
			default:
				return 'lucide:file';
		}
	};

	const formatChangeType = (type: FileChange['type']): string => {
		return type.charAt(0).toUpperCase() + type.slice(1);
	};

	const formatTime = (timestamp: number): string => {
		const date = new Date(timestamp);
		const now = new Date();
		const diff = now.getTime() - date.getTime();

		// Show relative time for recent changes
		if (diff < 60000) return `${Math.floor(diff / 1000)}s ago`;
		if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
		if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;

		return date.toLocaleString();
	};

	const formatSize = (bytes: number): string => {
		if (bytes === 0) return '0 B';
		const k = 1024;
		const sizes = ['B', 'KB', 'MB', 'GB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return `${Number.parseFloat((bytes / k ** i).toFixed(1))} ${sizes[i]}`;
	};
</script>

<style scoped>
.file-change-block {
	display: flex;
	flex-direction: column;
	gap: 0.5rem;
	padding: 0.75rem;
	background: rgba(255, 255, 255, 0.03);
	border: 1px solid rgba(255, 255, 255, 0.1);
	border-radius: 6px;
	position: relative;
	transition: all 0.2s ease;
}

.file-change-block:hover {
	background: rgba(255, 255, 255, 0.05);
	border-color: rgba(255, 255, 255, 0.15);
}

.change-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 0.5rem;
}

.change-type-badge {
	display: inline-flex;
	align-items: center;
	gap: 0.25rem;
	padding: 0.25rem 0.5rem;
	border-radius: 4px;
	font-size: 0.7rem;
	font-weight: 600;
	text-transform: uppercase;
	letter-spacing: 0.5px;
	white-space: nowrap;
}

.badge-modified {
	background: rgba(34, 197, 94, 0.15);
	color: #22c55e;
	border: 0.5px solid rgba(34, 197, 94, 0.3);
}

.badge-metadata {
	background: rgba(59, 130, 246, 0.15);
	color: #3b82f6;
	border: 0.5px solid rgba(59, 130, 246, 0.3);
}

.badge-access {
	background: rgba(168, 85, 247, 0.15);
	color: #a855f7;
	border: 0.5px solid rgba(168, 85, 247, 0.3);
}

.badge-unknown {
	background: rgba(107, 114, 128, 0.15);
	color: #9ca3af;
	border: 0.5px solid rgba(107, 114, 128, 0.3);
}

.change-time {
	font-size: 0.7rem;
	color: rgba(255, 255, 255, 0.5);
	flex-shrink: 0;
}

.change-details {
	display: flex;
	flex-direction: column;
	gap: 0.25rem;
	padding-top: 0.25rem;
	border-top: 1px solid rgba(255, 255, 255, 0.05);
	font-size: 0.75rem;
}

.detail-row {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 0.5rem;
}

.detail-label {
	color: rgba(255, 255, 255, 0.5);
	font-weight: 500;
}

.detail-value {
	color: rgba(255, 255, 255, 0.7);
	font-family: monospace;
	word-break: break-word;
}

.change-dismiss {
	position: absolute;
	top: 0.5rem;
	right: 0.5rem;
	width: 20px;
	height: 20px;
	display: flex;
	align-items: center;
	justify-content: center;
	background: rgba(255, 255, 255, 0.1);
	border: none;
	border-radius: 4px;
	color: rgba(255, 255, 255, 0.5);
	cursor: pointer;
	transition: all 0.2s ease;
	opacity: 0;
}

.file-change-block:hover .change-dismiss {
	opacity: 1;
}

.change-dismiss:hover {
	background: rgba(255, 255, 255, 0.2);
	color: rgba(255, 255, 255, 0.8);
}
</style>

