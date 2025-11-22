/**
 * Tauri Store Load Composable
 * 
 * Wrapper for Tauri's store plugin that provides a convenient async API
 * for loading and managing persistent stores.
 */

interface StoreOptions {
	autoSave?: boolean;
}

interface StoreInstance {
	get<T = any>(key: string): Promise<T | null>;
	set(key: string, value: any): Promise<void>;
	delete(key: string): Promise<void>;
	save(): Promise<void>;
	keys(): Promise<string[]>;
	clear(): Promise<void>;
}

export async function useTauriStoreLoad<T = any>(
	filename: string,
	options: StoreOptions = {}
): Promise<StoreInstance> {
	// Check if we're in a Tauri environment
	if (typeof window === 'undefined' || !(window as any).__TAURI__?.store) {
		// Fallback to localStorage for web environment
		return createLocalStorageStore(filename);
	}

	const Store = (window as any).__TAURI__?.store;
	const store = new Store(filename);

	// If autoSave is enabled, wrap set/delete/clear to auto-save
	if (options.autoSave) {
		const originalSet = store.set.bind(store);
		const originalDelete = store.delete.bind(store);
		const originalClear = store.clear.bind(store);

		store.set = async (key: string, value: any) => {
			await originalSet(key, value);
			await store.save();
		};

		store.delete = async (key: string) => {
			await originalDelete(key);
			await store.save();
		};

		store.clear = async () => {
			await originalClear();
			await store.save();
		};
	}

	return store;
}

/**
 * Create a localStorage-based store fallback for web environments
 */
function createLocalStorageStore(filename: string): StoreInstance {
	const storageKey = `tauri-store-${filename}`;

	return {
		async get<T = any>(key: string): Promise<T | null> {
			try {
				const data = localStorage.getItem(storageKey);
				if (!data) return null;

				const parsed = JSON.parse(data);
				return parsed[key] ?? null;
			} catch (error) {
				console.error('Error getting from localStorage store:', error);
				return null;
			}
		},

		async set(key: string, value: any): Promise<void> {
			try {
				const data = localStorage.getItem(storageKey);
				const parsed = data ? JSON.parse(data) : {};
				parsed[key] = value;
				localStorage.setItem(storageKey, JSON.stringify(parsed));
			} catch (error) {
				console.error('Error setting in localStorage store:', error);
				throw error;
			}
		},

		async delete(key: string): Promise<void> {
			try {
				const data = localStorage.getItem(storageKey);
				if (!data) return;

				const parsed = JSON.parse(data);
				delete parsed[key];
				localStorage.setItem(storageKey, JSON.stringify(parsed));
			} catch (error) {
				console.error('Error deleting from localStorage store:', error);
				throw error;
			}
		},

		async save(): Promise<void> {
			// localStorage is synchronous, so this is a no-op
		},

		async keys(): Promise<string[]> {
			try {
				const data = localStorage.getItem(storageKey);
				if (!data) return [];

				const parsed = JSON.parse(data);
				return Object.keys(parsed);
			} catch (error) {
				console.error('Error getting keys from localStorage store:', error);
				return [];
			}
		},

		async clear(): Promise<void> {
			try {
				localStorage.removeItem(storageKey);
			} catch (error) {
				console.error('Error clearing localStorage store:', error);
				throw error;
			}
		}
	};
}

