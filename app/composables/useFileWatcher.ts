import { ref, computed } from "vue";

export interface FileChange {
	id: string;
	timestamp: number;
	type: 'modified' | 'metadata' | 'access' | 'unknown';
	details?: {
		beforeSize?: number;
		afterSize?: number;
		beforeModified?: string;
		afterModified?: string;
		accessedBy?: string;
	};
}

export interface WatchedFile {
	path: string;
	fileName: string;
	fileType?: string;
	isWatching: boolean;
	changes: FileChange[];
	lastChange?: FileChange;
	watchStartTime: number;
	unwatch?: () => void;
}

const watchedFiles = ref<Map<string, WatchedFile>>(new Map());
const activeWatches = ref<Set<string>>(new Set());

const normalizePath = (path: string) => path.replace(/\\/g, "/");

const toTimestamp = (value?: number | string | Date | null): number => {
	if (value === null || value === undefined) return 0;
	if (typeof value === "number") return value;
	if (value instanceof Date) return value.getTime();
	const parsed = Date.parse(String(value));
	return Number.isNaN(parsed) ? 0 : parsed;
};

const getModifiedTime = (info: any) => toTimestamp(
	info?.modified
	|| info?.modificationTime
	|| info?.mtimeMs
	|| info?.mtime
);

const getAccessTime = (info: any) => toTimestamp(
	info?.accessed
	|| info?.accessTime
	|| info?.atimeMs
	|| info?.atime
);

export async function watchFile(filePath: string, fileName: string, fileType?: string): Promise<string> {
	const normalizedPath = normalizePath(filePath);
	const statTarget = filePath;
	const existingEntry = Array.from(watchedFiles.value.entries()).find(([, watched]) => watched.path === normalizedPath && watched.isWatching);
	if (existingEntry) {
		const [existingWatchId] = existingEntry;
		console.log(`ℹ️ File already being watched under ID ${existingWatchId}: ${normalizedPath}`);
		return existingWatchId;
	}

	const watchId = `watch_${normalizedPath.replace(/[^a-z0-9]/gi, '_')}_${Date.now()}`;

	try {
		const { stat } = await import('@tauri-apps/plugin-fs');

		console.log(`👁️ Starting file watch: ${normalizedPath}`);

		let lastModified = 0;
		let lastSize = 0;
		let lastAccessTime = 0;
			
		try {
			const initialStat = await stat(statTarget);
			lastModified = getModifiedTime(initialStat);
			lastSize = initialStat.size || 0;
			lastAccessTime = getAccessTime(initialStat);
		} catch (err) {
			console.warn(`⚠️ Could not stat file initially:`, err);
		}

		const pollInterval = setInterval(async () => {
			const watched = watchedFiles.value.get(watchId);
			if (!watched || !watched.isWatching) {
				clearInterval(pollInterval);
				return;
			}

			try {
				const currentStat = await stat(statTarget);
				const currentModified = getModifiedTime(currentStat);
				const currentSize = currentStat.size || 0;
				const currentAccessTime = getAccessTime(currentStat);

				if (currentModified !== lastModified || currentSize !== lastSize) {
					const change: FileChange = {
						id: `change_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
						timestamp: Date.now(),
						type: 'modified',
						details: {
							beforeSize: lastSize,
							afterSize: currentSize
						}
					};

					watched.changes.push(change);
					watched.lastChange = change;

					lastModified = currentModified;
					lastSize = currentSize;
				}

				if (currentAccessTime !== lastAccessTime && currentModified === lastModified) {
					const change: FileChange = {
						id: `change_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
						timestamp: Date.now(),
						type: 'access',
						details: {
							accessedBy: 'external'
						}
					};

					watched.changes.push(change);
					watched.lastChange = change;

					lastAccessTime = currentAccessTime;
				}
			} catch (pollError) {
				console.error(`⚠️ Error polling file ${normalizedPath}:`, pollError);
			}
		}, 1000);

		const watchedFile: WatchedFile = {
			path: normalizedPath,
			fileName,
			fileType,
			isWatching: true,
			changes: [],
			watchStartTime: Date.now(),
			unwatch: async () => {
				clearInterval(pollInterval);
			}
		};

		watchedFiles.value.set(watchId, watchedFile);
		activeWatches.value.add(watchId);
		return watchId;
	} catch (error) {
		console.error(`❌ Failed to watch file ${normalizedPath}:`, error);
		throw error;
	}
}

export async function unwatchFile(watchId: string): Promise<void> {
	const watched = watchedFiles.value.get(watchId);
	if (!watched) return;
	try {
		if (watched.unwatch) await watched.unwatch();
		watched.isWatching = false;
		activeWatches.value.delete(watchId);
	} catch {}
}

export function useFileWatcher() {
	return {
		watchedFiles: computed(() => Array.from(watchedFiles.value.values())),
		activeWatches: computed(() => Array.from(activeWatches.value)),
		watchFile,
		unwatchFile,
		getWatchedFile: (watchId: string) => watchedFiles.value.get(watchId),
		getActiveWatches: (): WatchedFile[] => Array.from(watchedFiles.value.values()).filter(w => w.isWatching),
		getFileChanges: (watchId: string): FileChange[] => watchedFiles.value.get(watchId)?.changes || [],
		clearFileChanges: (watchId: string): void => {
			const watched = watchedFiles.value.get(watchId);
			if (watched) {
				watched.changes = [];
				watched.lastChange = undefined;
			}
		},
		stopAllWatches: async (): Promise<void> => {
			const unwatchPromises = Array.from(activeWatches.value).map(watchId => unwatchFile(watchId));
			await Promise.all(unwatchPromises);
		},
		formatChangeTime: (timestamp: number): string => new Date(timestamp).toLocaleTimeString()
	};
}

