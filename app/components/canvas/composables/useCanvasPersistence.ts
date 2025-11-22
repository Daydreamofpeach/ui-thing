import { ref, computed } from 'vue';
import { useToast } from '#imports';

export interface CanvasData {
	id: string;
	name: string;
	nodes: any[];
	edges: any[];
	viewport: {
		x: number;
		y: number;
		zoom: number;
	};
	createdAt: string;
	updatedAt: string;
}

export function useCanvasPersistence() {
	const toast = useToast();
	const store = ref<any>(null);
	const savedCanvases = ref<CanvasData[]>([]);
	const currentCanvasId = ref<string>('');
	const currentCanvasName = ref<string>('Untitled Canvas');
	const isAutoSave = ref(true);

	// Initialize Tauri store
	const initializeStore = async () => {
		try {
			// Check if we're in a Tauri environment
			if (typeof window !== 'undefined' && window.__TAURI__) {
				store.value = await (globalThis as any).useTauriStoreLoad("canvas-store.bin", {
					autoSave: isAutoSave.value
				});
				await loadSavedCanvases();
			} else {
				// Fallback to localStorage for web environment
				console.log('Running in web environment, using localStorage fallback');
				store.value = {
					get: (key: string) => {
						const item = localStorage.getItem(key);
						return item ? JSON.parse(item) : null;
					},
					set: (key: string, value: any) => {
						localStorage.setItem(key, JSON.stringify(value));
					}
				};
				await loadSavedCanvases();
			}
		} catch (error) {
			console.error('Failed to initialize canvas store:', error);
			// Only show toast in Tauri environment
			if (typeof window !== 'undefined' && window.__TAURI__) {
				toast.add({
					title: "Error",
					description: "Failed to initialize canvas storage",
					color: "error"
				});
			}
		}
	};

	// Load all saved canvases
	const loadSavedCanvases = async () => {
		try {
			const canvases = await store.value?.get("savedCanvases") as CanvasData[] || [];
			savedCanvases.value = canvases;
		} catch (error) {
			console.error('Failed to load saved canvases:', error);
		}
	};

	// Generate unique ID for new canvas
	const generateCanvasId = () => {
		return `canvas_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
	};

	// Create new canvas
	const createNewCanvas = (name?: string) => {
		const canvasName = name || `Canvas ${savedCanvases.value.length + 1}`;
		const newCanvasId = generateCanvasId();
		
		currentCanvasId.value = newCanvasId;
		currentCanvasName.value = canvasName;
		
		return {
			id: newCanvasId,
			name: canvasName,
			nodes: [],
			edges: [],
			viewport: { x: 0, y: 0, zoom: 1 },
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString()
		};
	};

	// Save current canvas (with debouncing for autosave)
	let saveTimeout: NodeJS.Timeout | null = null;
	
	const saveCanvas = async (nodes: any[], edges: any[], viewport: { x: number; y: number; zoom: number }, isAutosave = false, customCanvasId?: string) => {
		if (!store.value) {
			await initializeStore();
		}

		// Debounce autosave to avoid too frequent saves
		if (isAutosave) {
			if (saveTimeout) {
				clearTimeout(saveTimeout);
			}
			saveTimeout = setTimeout(async () => {
				await performSave(nodes, edges, viewport, isAutosave, customCanvasId);
			}, 1000); // 1 second debounce
			return;
		}

		return await performSave(nodes, edges, viewport, isAutosave, customCanvasId);
	};

	const performSave = async (nodes: any[], edges: any[], viewport: { x: number; y: number; zoom: number }, isAutosave: boolean, customCanvasId?: string) => {
		try {
			const now = new Date().toISOString();
			const canvasId = customCanvasId || currentCanvasId.value || generateCanvasId();
			const canvasData: CanvasData = {
				id: canvasId,
				name: currentCanvasName.value,
				nodes: JSON.parse(JSON.stringify(nodes)), // Deep clone
				edges: JSON.parse(JSON.stringify(edges)), // Deep clone
				viewport: { ...viewport },
				createdAt: savedCanvases.value.find(c => c.id === canvasId)?.createdAt || now,
				updatedAt: now
			};

			// Update or add canvas to saved canvases
			const existingIndex = savedCanvases.value.findIndex(c => c.id === canvasData.id);
			if (existingIndex >= 0) {
				savedCanvases.value[existingIndex] = canvasData;
			} else {
				savedCanvases.value.push(canvasData);
			}

			// Save to store
			if (store.value) {
				await store.value.set("savedCanvases", savedCanvases.value);
			}
			
			// Update current canvas ID if it was new and no custom ID was provided
			if (!currentCanvasId.value && !customCanvasId) {
				currentCanvasId.value = canvasData.id;
			}

			// Only show toast for manual saves, not autosave
			if (!isAutosave) {
				toast.add({
					title: "Success",
					description: `Canvas "${canvasData.name}" saved successfully`,
					color: "success"
				});
			}

			return canvasData;
		} catch (error) {
			console.error('Failed to save canvas:', error);
			if (!isAutosave) {
				toast.add({
					title: "Error",
					description: "Failed to save canvas",
					color: "error"
				});
			}
			throw error;
		}
	};

	// Load specific canvas
	const loadCanvas = async (canvasId: string) => {
		try {
			const canvas = savedCanvases.value.find(c => c.id === canvasId);
			if (!canvas) {
				throw new Error('Canvas not found');
			}

			currentCanvasId.value = canvas.id;
			currentCanvasName.value = canvas.name;

			return canvas;
		} catch (error) {
			console.error('Failed to load canvas:', error);
			toast.add({
				title: "Error",
				description: "Failed to load canvas",
				color: "error"
			});
			throw error;
		}
	};

	// Delete canvas
	const deleteCanvas = async (canvasId: string) => {
		try {
			savedCanvases.value = savedCanvases.value.filter(c => c.id !== canvasId);
			if (store.value) {
				await store.value.set("savedCanvases", savedCanvases.value);
			}

			toast.add({
				title: "Success",
				description: "Canvas deleted successfully",
				color: "success"
			});

			// If we deleted the current canvas, create a new one
			if (currentCanvasId.value === canvasId) {
				createNewCanvas();
			}
		} catch (error) {
			console.error('Failed to delete canvas:', error);
			toast.add({
				title: "Error",
				description: "Failed to delete canvas",
				color: "error"
			});
		}
	};

	// Rename canvas
	const renameCanvas = async (canvasId: string, newName: string) => {
		try {
			const canvasIndex = savedCanvases.value.findIndex(c => c.id === canvasId);
			if (canvasIndex >= 0 && savedCanvases.value[canvasIndex]) {
				savedCanvases.value[canvasIndex].name = newName;
				savedCanvases.value[canvasIndex].updatedAt = new Date().toISOString();
				
				if (store.value) {
					await store.value.set("savedCanvases", savedCanvases.value);
				}

				// Update current canvas name if it's the active one
				if (currentCanvasId.value === canvasId) {
					currentCanvasName.value = newName;
				}

				toast.add({
					title: "Success",
					description: `Canvas renamed to "${newName}"`,
					color: "success"
				});
			}
		} catch (error) {
			console.error('Failed to rename canvas:', error);
			toast.add({
				title: "Error",
				description: "Failed to rename canvas",
				color: "error"
			});
		}
	};

	// Computed properties
	const hasUnsavedChanges = computed(() => {
		// This could be enhanced to track actual changes
		return false;
	});

	const sortedCanvases = computed(() => {
		return [...savedCanvases.value].sort((a, b) => 
			new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
		);
	});

	// Initialize on first use
	initializeStore();

	return {
		// State
		savedCanvases: computed(() => sortedCanvases.value),
		currentCanvasId: computed(() => currentCanvasId.value),
		currentCanvasName: computed(() => currentCanvasName.value),
		isAutoSave,
		hasUnsavedChanges,

		// Actions
		initializeStore,
		createNewCanvas,
		saveCanvas,
		loadCanvas,
		deleteCanvas,
		renameCanvas,
		setCurrentCanvasName: (name: string) => {
			currentCanvasName.value = name;
		}
	};
}
