<template>
	<BaseNodeTemplate
		:custom-node-props="nodeProps"
		:update-node-data="updateNodeData"
		icon="lucide:eye"
		:theme-color="themeColor"
		:title="headerTitle"
		:show-default-header="true"
		:show-edit-button="false"
		:show-close-button="true"
		:collapsible="true"
		:default-collapsed="false"
		:show-resizer="true"
		:min-width="500"
		:min-height="400"
		@close-node="closeWatcher"
	>
		<template #header-actions>
			<div class="header-actions">
				<div class="watch-status" :class="{ active: isWatching }">
					<div class="status-indicator" />
					<span class="text-xs">{{ isWatching ? 'Watching' : 'Stopped' }}</span>
				</div>
				<button
					class="header-button"
					type="button"
					:title="isWatching ? 'Stop watching' : 'Resume watching'"
					@click.stop="toggleWatcher"
				>
					<Icon :name="isWatching ? 'lucide:pause' : 'lucide:play'" class="w-4 h-4" />
				</button>
				<button
					class="header-button"
					type="button"
					title="Clear change history"
					@click.stop="clearChanges"
				>
					<Icon name="lucide:trash-2" class="w-4 h-4" />
				</button>
			</div>
		</template>

		<div class="watcher-content">
			<!-- File Info Section -->
			<div class="file-info-section">
				<div class="file-info-header">
					<Icon name="lucide:file-text" class="w-4 h-4" />
					<div class="file-info-details">
						<h4 class="file-name">{{ watchedFile?.fileName }}</h4>
						<p class="file-path">{{ watchedFile?.path }}</p>
					</div>
				</div>

				<!-- Quick Stats -->
				<div class="stats-grid">
					<div class="stat-item">
						<div class="stat-value">{{ changeSummary?.totalChanges ?? 0 }}</div>
						<div class="stat-label">Total Changes</div>
					</div>
					<div class="stat-item">
						<div class="stat-value">{{ changeSummary?.modifiedCount ?? 0 }}</div>
						<div class="stat-label">Modified</div>
					</div>
					<div class="stat-item">
						<div class="stat-value">{{ changeSummary?.metadataCount ?? 0 }}</div>
						<div class="stat-label">Metadata</div>
					</div>
					<div class="stat-item">
						<div class="stat-value">{{ changeSummary?.accessCount ?? 0 }}</div>
						<div class="stat-label">Access</div>
					</div>
				</div>
			</div>

			<!-- Filter Section -->
			<div class="filter-section">
				<div class="filter-tabs">
					<button
						v-for="filterType in filterTypes"
						:key="filterType"
						class="filter-tab"
						:class="{ active: activeFilter === filterType }"
						@click="activeFilter = filterType"
					>
						{{ formatFilterType(filterType) }}
					</button>
				</div>
			</div>

			<!-- Changes List -->
			<div class="changes-list">
				<div v-if="filteredChanges.length === 0" class="empty-state">
					<Icon name="lucide:inbox" class="w-8 h-8" />
					<p>{{ activeFilter === 'all' ? 'No changes detected yet' : `No ${activeFilter} changes` }}</p>
				</div>

				<div v-else class="changes-container">
					<FileChangeBlock
						v-for="change in filteredChanges"
						:key="change.id"
						:change="change"
						@dismiss="dismissChange(change.id)"
					/>
				</div>
			</div>

			<!-- Watch Duration -->
			<div class="watch-duration">
				<Icon name="lucide:clock" class="w-3 h-3" />
				<span>Watching for {{ formatDuration(watchDuration) }}</span>
			</div>
		</div>
	</BaseNodeTemplate>
</template>

<script setup lang="ts">
	import BaseNodeTemplate from "./templates/BaseNodeTemplate.vue";
	import FileChangeBlock from '../shared/FileChangeBlock.vue';
	import { useFileWatcher, type WatchedFile, type FileChange } from '~/composables/useFileWatcher';
	import { computed, onMounted, onBeforeUnmount, ref, watch as vueWatch } from 'vue';

	interface Props {
		customNodeProps: any;
		updateNodeData?: (nodeId: string, key: string, value: any) => void;
		watchId?: string;
	}

	const props = withDefaults(defineProps<Props>(), {
		watchId: undefined,
		updateNodeData: undefined
	});

	const emit = defineEmits<{
		closeWatcher: [watchId: string];
	}>();

	const { getWatchedFile, getFileChanges, clearFileChanges, unwatchFile, getChangeSummary } = useFileWatcher();

	// State
	const watchedFile = ref<WatchedFile | undefined>();
	const isWatching = ref(true);
	const activeFilter = ref<'all' | 'modified' | 'metadata' | 'access'>('all');
	const filteredChanges = ref<FileChange[]>([]);
	const changeSummary = ref<any>();
	const watchDuration = ref(0);
	const dismissedChangeIds = ref<Set<string>>(new Set());

	const nodeProps = computed(() => props.customNodeProps ?? { id: '', data: {} });
	const themeColor = 'var(--color-primary)';
	const headerTitle = computed(() => `Watching: ${watchedFile.value?.fileName || 'File'}`);

	const filterTypes = computed(() => (['all', 'modified', 'metadata', 'access'] as const));

	/**
	 * Update watched file and changes
	 */
	const updateWatchData = () => {
		if (!props.watchId) return;

		watchedFile.value = getWatchedFile(props.watchId);
		if (watchedFile.value) {
			const changes = getFileChanges(props.watchId).filter(
				c => !dismissedChangeIds.value.has(c.id)
			);
			filteredChanges.value = applyFilter(changes);
			changeSummary.value = getChangeSummary(props.watchId);
		}
	};

	/**
	 * Apply filter to changes
	 */
	const applyFilter = (changes: FileChange[]): FileChange[] => {
		if (activeFilter.value === 'all') return changes;
		return changes.filter(c => c.type === activeFilter.value);
	};

	/**
	 * Toggle watcher on/off
	 */
	const toggleWatcher = async () => {
		if (!props.watchId) return;

		if (isWatching.value) {
			// Stop watching
			await unwatchFile(props.watchId);
			isWatching.value = false;
		} else {
			// Resume would require re-watching - for now just enable UI
			isWatching.value = true;
		}
	};

	/**
	 * Clear all changes
	 */
	const clearChanges = () => {
		if (!props.watchId) return;
		clearFileChanges(props.watchId);
		filteredChanges.value = [];
		updateWatchData();
	};

	/**
	 * Dismiss individual change
	 */
	const dismissChange = (changeId: string) => {
		dismissedChangeIds.value.add(changeId);
		updateWatchData();
	};

	/**
	 * Format filter type for display
	 */
	const formatFilterType = (type: string): string => {
		return type.charAt(0).toUpperCase() + type.slice(1);
	};

	/**
	 * Format duration
	 */
	const formatDuration = (ms: number): string => {
		const seconds = Math.floor(ms / 1000);
		const minutes = Math.floor(seconds / 60);
		const hours = Math.floor(minutes / 60);

		if (hours > 0) return `${hours}h ${minutes % 60}m`;
		if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
		return `${seconds}s`;
	};

	/**
	 * Close watcher
	 */
	const closeWatcher = async () => {
		if (props.watchId) {
			await unwatchFile(props.watchId);
		}
		emit('closeWatcher', props.watchId || '');
	};

	// Update on filter change
	vueWatch(() => activeFilter.value, () => {
		updateWatchData();
	});

	// Update watch duration every second
	const durationInterval = setInterval(() => {
		if (watchedFile.value && isWatching.value) {
			watchDuration.value = Date.now() - watchedFile.value.watchStartTime;
		}
	}, 1000);

	// Poll for changes
	const pollInterval = setInterval(() => {
		updateWatchData();
	}, 500);

	onMounted(() => {
		updateWatchData();
	});

	onBeforeUnmount(() => {
		clearInterval(durationInterval);
		clearInterval(pollInterval);
	});
</script>

<style scoped>
.watcher-content {
	display: flex;
	flex-direction: column;
	gap: 1rem;
	padding: 1rem;
	height: 100%;
	overflow-y: auto;
}

.header-actions {
	display: flex;
	align-items: center;
	gap: 0.5rem;
}

.watch-status {
	display: flex;
	align-items: center;
	gap: 0.25rem;
	padding: 0.25rem 0.5rem;
	border-radius: 4px;
	background: rgba(239, 68, 68, 0.15);
	color: #ef4444;
	font-size: 0.75rem;
	transition: all 0.2s ease;
}

.watch-status.active {
	background: rgba(34, 197, 94, 0.15);
	color: #22c55e;
}

.status-indicator {
	width: 0.4rem;
	height: 0.4rem;
	border-radius: 50%;
	background: currentColor;
	animation: pulse 2s infinite;
}

.watch-status.active .status-indicator {
	animation: pulse 1.5s infinite;
}

@keyframes pulse {
	0%, 100% {
		opacity: 1;
	}
	50% {
		opacity: 0.5;
	}
}

.header-button {
	width: 28px;
	height: 28px;
	display: flex;
	align-items: center;
	justify-content: center;
	background: rgba(255, 255, 255, 0.08);
	border: 1px solid rgba(255, 255, 255, 0.15);
	border-radius: 6px;
	color: rgba(255, 255, 255, 0.8);
	cursor: pointer;
	transition: all 0.2s ease;
}

.header-button:hover {
	background: rgba(255, 255, 255, 0.15);
	border-color: rgba(255, 255, 255, 0.25);
	color: rgba(255, 255, 255, 0.95);
}

.file-info-section {
	display: flex;
	flex-direction: column;
	gap: 0.75rem;
	padding: 0.75rem;
	background: rgba(0, 0, 0, 0.2);
	border: 1px solid rgba(255, 255, 255, 0.08);
	border-radius: 8px;
}

.file-info-header {
	display: flex;
	align-items: flex-start;
	gap: 0.75rem;
	color: rgba(255, 255, 255, 0.9);
}

.file-info-details {
	flex: 1;
	min-width: 0;
}

.file-name {
	margin: 0;
	font-size: 0.95rem;
	font-weight: 600;
	color: rgba(255, 255, 255, 0.95);
	word-break: break-word;
}

.file-path {
	margin: 0.25rem 0 0 0;
	font-size: 0.75rem;
	color: rgba(255, 255, 255, 0.5);
	font-family: monospace;
	word-break: break-all;
	line-height: 1.3;
}

.stats-grid {
	display: grid;
	grid-template-columns: repeat(4, 1fr);
	gap: 0.5rem;
}

.stat-item {
	text-align: center;
	padding: 0.5rem;
	background: rgba(0, 0, 0, 0.3);
	border-radius: 6px;
	border: 1px solid rgba(255, 255, 255, 0.05);
}

.stat-value {
	font-size: 1.25rem;
	font-weight: 700;
	color: var(--color-primary);
}

.stat-label {
	font-size: 0.7rem;
	color: rgba(255, 255, 255, 0.5);
	margin-top: 0.25rem;
	text-transform: uppercase;
	letter-spacing: 0.5px;
}

.filter-section {
	display: flex;
	flex-direction: column;
	gap: 0.5rem;
}

.filter-tabs {
	display: flex;
	gap: 0.5rem;
	flex-wrap: wrap;
}

.filter-tab {
	padding: 0.5rem 1rem;
	background: rgba(255, 255, 255, 0.05);
	border: 1px solid rgba(255, 255, 255, 0.1);
	border-radius: 6px;
	color: rgba(255, 255, 255, 0.6);
	font-size: 0.8rem;
	cursor: pointer;
	transition: all 0.2s ease;
	white-space: nowrap;
}

.filter-tab:hover {
	background: rgba(255, 255, 255, 0.08);
	border-color: rgba(255, 255, 255, 0.15);
}

.filter-tab.active {
	background: rgba(var(--color-primary-rgb), 0.2);
	border-color: rgba(var(--color-primary-rgb), 0.3);
	color: var(--color-primary);
}

.changes-list {
	flex: 1;
	min-height: 200px;
	display: flex;
	flex-direction: column;
	overflow-y: auto;
	border: 1px solid rgba(255, 255, 255, 0.08);
	border-radius: 8px;
	background: rgba(0, 0, 0, 0.1);
}

.empty-state {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	gap: 0.5rem;
	padding: 2rem 1rem;
	color: rgba(255, 255, 255, 0.4);
	text-align: center;
}

.empty-state :deep(svg) {
	opacity: 0.5;
}

.changes-container {
	display: flex;
	flex-direction: column;
	gap: 0.5rem;
	padding: 0.75rem;
}

.watch-duration {
	display: flex;
	align-items: center;
	gap: 0.5rem;
	padding: 0.75rem;
	background: rgba(0, 0, 0, 0.2);
	border: 1px solid rgba(255, 255, 255, 0.08);
	border-radius: 6px;
	font-size: 0.85rem;
	color: rgba(255, 255, 255, 0.6);
}

.watch-duration :deep(svg) {
	flex-shrink: 0;
}
</style>

