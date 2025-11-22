<template>
	<div class="file-tree-watch-action">
		<button
			class="watch-icon-button"
			:class="{ active: isWatching }"
			:title="isWatching ? 'Watching this file' : 'Start watching file'"
			@click.stop="toggleWatch"
			@dblclick.stop
		>
			<Icon name="lucide:eye" class="w-4 h-4" />
		</button>
	</div>
</template>

<script setup lang="ts">
	import { ref, computed } from 'vue';
	import { useFileWatcher } from '~/composables/useFileWatcher';

	interface Props {
		filePath: string;
		fileName: string;
		fileType?: string;
	}

	const props = defineProps<Props>();

	const emit = defineEmits<{
		watchToggled: [watchId: string, isNowWatching: boolean];
	}>();

	const { watchFile, unwatchFile, getActiveWatches } = useFileWatcher();

	const watchId = ref<string | null>(null);
	const isWatching = computed(() => {
		if (!watchId.value) return false;
		return getActiveWatches().some(w => w.path === props.filePath);
	});

	/**
	 * Toggle watch on/off for this file
	 */
	const toggleWatch = async () => {
		try {
			if (isWatching.value && watchId.value) {
				// Stop watching
				await unwatchFile(watchId.value);
				watchId.value = null;
				emit('watchToggled', '', false);
			} else {
				// Start watching
				const newWatchId = await watchFile(props.filePath, props.fileName, props.fileType);
				watchId.value = newWatchId;
				emit('watchToggled', newWatchId, true);
			}
		} catch (error) {
			console.error('Failed to toggle file watch:', error);
		}
	};

	// Expose watch ID for parent to use
	defineExpose({
		watchId: computed(() => watchId.value),
		isWatching
	});
</script>

<style scoped>
.file-tree-watch-action {
	display: flex;
	align-items: center;
}

.watch-icon-button {
	width: 24px;
	height: 24px;
	display: flex;
	align-items: center;
	justify-content: center;
	background: transparent;
	border: none;
	border-radius: 4px;
	color: rgba(255, 255, 255, 0.4);
	cursor: pointer;
	transition: all 0.2s ease;
	flex-shrink: 0;
}

.watch-icon-button:hover {
	background: rgba(255, 255, 255, 0.1);
	color: rgba(255, 255, 255, 0.7);
}

.watch-icon-button.active {
	background: rgba(34, 197, 94, 0.2);
	color: #22c55e;
	box-shadow: inset 0 0 8px rgba(34, 197, 94, 0.2);
}

.watch-icon-button.active:hover {
	background: rgba(34, 197, 94, 0.3);
	color: #22c55e;
}
</style>

