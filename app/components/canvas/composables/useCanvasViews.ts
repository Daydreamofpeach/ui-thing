import type { View, ViewMeta } from "./useViews";
import { useOscarData } from "@composables/useOscarData";
import { computed, ref } from "vue";
import { useViews } from "./useViews";

export interface CanvasData {
	id: string
	name: string
	description: string
	nodes: any[]
	edges: any[]
	viewport: {
		x: number
		y: number
		zoom: number
	}
	createdAt: string
	updatedAt: string
}

export function useCanvasViews() {
	const {
		views,
		currentView: _currentView,
		isLoading,
		error,
		fetchAllViews,
		createView,
		getViewById,
		updateView,
		deleteView
	} = useViews();

	const currentCanvasId = ref<string>("");
	const currentCanvasName = ref<string>("Untitled Canvas");

	// Save queue to prevent concurrent saves
	let isSaving = false;

	// Local storage key for last edited canvas
	const LAST_CANVAS_KEY = "last-edited-canvas";

	/**
	 * Get the last edited canvas ID from localStorage
	 */
	const getLastEditedCanvasId = (): string | null => {
		if (typeof window === "undefined") return null;
		return localStorage.getItem(LAST_CANVAS_KEY);
	};

	/**
	 * Set the last edited canvas ID in localStorage
	 */
	const setLastEditedCanvasId = (canvasId: string) => {
		if (typeof window === "undefined") return;
		localStorage.setItem(LAST_CANVAS_KEY, canvasId);
		console.log("💾 Saved last edited canvas ID:", canvasId);
	};

	/**
	 * Get the last edited canvas and load it if it exists
	 */
	const loadLastEditedCanvas = async (): Promise<CanvasData | null> => {
		const lastCanvasId = getLastEditedCanvasId();
		if (!lastCanvasId) {
			console.log("📋 No last edited canvas found in localStorage");
			return null;
		}

		console.log("📋 Loading last edited canvas:", lastCanvasId);
		return await loadCanvas(lastCanvasId);
	};

	// Convert View to CanvasData
	const viewToCanvas = (view: View): CanvasData => {
		return {
			id: view.id,
			name: view.name,
			description: view.description,
			nodes: view.meta?.nodes || [],
			edges: view.meta?.edges || [],
			viewport: view.meta?.viewport || { x: 0, y: 0, zoom: 1 },
			createdAt: view.createdAt,
			updatedAt: view.updatedAt
		};
	};

	// Computed canvases (views filtered by type)
	const savedCanvases = computed(() => {
		return views.value
			.filter((view) => view.meta?.canvasType === "node-canvas" || !view.meta?.canvasType)
			.map(viewToCanvas)
			.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
	});

	/**
	 * Load all canvases from the API
	 */
	const loadAllCanvases = async () => {
		await fetchAllViews();
	};

	/**
	 * Create a new canvas
	 */
	const createNewCanvas = async (name: string = "Untitled Canvas"): Promise<CanvasData | null> => {
		// Get organization and project context from global state
		let orgId: string | undefined;
		let projectId: string | undefined;

		try {
			const oscarData = useOscarData();
			orgId = oscarData.selectedOrganisationId.value?.toString();
			projectId = oscarData.selectedProjectId.value?.toString();
			console.log("📊 Creating canvas for:", { orgId, projectId, name });
		} catch (err) {
			console.warn("⚠️ Could not get org/project context, creating without:", err);
		}

		// Add project ID to description for reliable filtering
		const description = projectId
			? `Node canvas: ${name} [PROJECT:${projectId}]`
			: `Node canvas: ${name}`;

		const meta: ViewMeta = {
			nodes: [],
			edges: [],
			viewport: { x: 0, y: 0, zoom: 1 },
			canvasType: "node-canvas",
			// Add organization and project IDs for proper filtering
			organizationId: orgId,
			projectId
		};

		const view = await createView(name, description, meta);

		if (view) {
			currentCanvasId.value = view.id;
			currentCanvasName.value = view.name;
			console.log("🆕 Created new canvas with name:", view.name, "ID:", view.id, "Org:", orgId, "Project:", projectId);
			return viewToCanvas(view);
		}

		return null;
	};

	/**
	 * Load a specific canvas
	 */
	const loadCanvas = async (canvasId: string): Promise<CanvasData | null> => {
		const view = await getViewById(canvasId);

		if (view) {
			currentCanvasId.value = view.id;
			currentCanvasName.value = view.name;
			// Save as last edited canvas
			setLastEditedCanvasId(view.id);
			return viewToCanvas(view);
		}

		return null;
	};

	/**
	 * Save/update canvas
	 */
	const saveCanvas = async (
		nodes: any[],
		edges: any[],
		viewport: { x: number, y: number, zoom: number }
	): Promise<CanvasData | null> => {
		// Wait for any pending save to complete (with timeout)
		const maxWaitTime = 1000; // 1 second max wait
		const startTime = Date.now();
		while (isSaving && (Date.now() - startTime) < maxWaitTime) {
			console.log("⏳ Waiting for previous save to complete...");
			await new Promise((resolve) => setTimeout(resolve, 50));
		}

		isSaving = true;

		try {
			// If no current canvas, DO NOT auto-create - require explicit user action
			if (!currentCanvasId.value) {
				console.warn("⚠️ Cannot save: No active canvas. User must create or load a canvas first.");
				console.log("💡 Skipping autosave - no canvas loaded yet");
				isSaving = false;
				return null;
			}

			console.log("💾 useCanvasViews: Saving", nodes.length, "nodes with exact positions");

			// Deep clone nodes and clean up VueFlow internal properties
			const clonedNodes = nodes.map((node) => {
				// Deep clone data but exclude circular references (canvasNodes, canvasEdges, canvasViewport)
				const cleanedData: any = {};
				if (node.data) {
					for (const [key, value] of Object.entries(node.data)) {
						// Skip properties that cause circular references
						if (key === "canvasNodes" || key === "canvasEdges" || key === "canvasViewport") {
							continue;
						}
						// Deep clone the value
						try {
							cleanedData[key] = JSON.parse(JSON.stringify(value));
						} catch {
							// If can't serialize, just copy the reference
							cleanedData[key] = value;
						}
					}
				}

				const cleaned: any = {
					id: node.id,
					type: node.type,
					position: {
						x: node.position.x,
						y: node.position.y
					},
					data: cleanedData
				};

				// Include style if present
				if (node.style) {
					cleaned.style = { ...node.style };
				}

				// Include other essential properties but exclude VueFlow internals
				if (node.draggable !== undefined) cleaned.draggable = node.draggable;
				if (node.selectable !== undefined) cleaned.selectable = node.selectable;

				return cleaned;
			});

			// Log positions being saved
			console.log("💾 useCanvasViews: Node positions being saved:");
			clonedNodes.forEach((node: any) => {
				console.log(`  - ${node.id}: (${node.position.x}, ${node.position.y})`);
			});

			console.log("💾 useCanvasViews: Saving", edges.length, "edges");
			edges.forEach((edge: any) => {
				console.log(`  - ${edge.id}: ${edge.source} → ${edge.target}`);
			});

			// Get organization and project context from global state
			let orgId: string | undefined;
			let projectId: string | undefined;

			try {
				const oscarData = useOscarData();
				orgId = oscarData.selectedOrganisationId.value?.toString();
				projectId = oscarData.selectedProjectId.value?.toString();
				console.log("📊 Canvas context for save:", { orgId, projectId });
			} catch (err) {
				console.warn("⚠️ Could not get org/project context, saving without:", err);
			}

			// Add project ID to description for reliable filtering
			const description = projectId
				? `Node canvas: ${currentCanvasName.value} [PROJECT:${projectId}]`
				: `Node canvas: ${currentCanvasName.value}`;

			const meta: ViewMeta = {
				nodes: clonedNodes,
				edges: JSON.parse(JSON.stringify(edges)),
				viewport: { ...viewport },
				canvasType: "node-canvas",
				// Add organization and project IDs for proper filtering
				organizationId: orgId,
				projectId
			};

			const view = await updateView(
				currentCanvasId.value,
				currentCanvasName.value,
				description,
				meta
			);

			if (view) {
				console.log("✅ useCanvasViews: Canvas saved successfully to API");
				// Save as last edited canvas when canvas is updated
				setLastEditedCanvasId(currentCanvasId.value);
				return viewToCanvas(view);
			}

			console.error("❌ useCanvasViews: Failed to save canvas");
			return null;
		} finally {
			isSaving = false;
		}
	};

	/**
	 * Delete a canvas
	 */
	const deleteCanvas = async (canvasId: string): Promise<boolean> => {
		const success = await deleteView(canvasId);

		if (success && currentCanvasId.value === canvasId) {
			// Reset to new canvas
			currentCanvasId.value = "";
			currentCanvasName.value = "Untitled Canvas";
		}

		return success;
	};

	/**
	 * Rename a canvas
	 */
	const renameCanvas = async (canvasId: string, newName: string): Promise<boolean> => {
		const canvas = savedCanvases.value.find((c) => c.id === canvasId);
		if (!canvas) return false;

		// Preserve all existing metadata including org/project IDs
		const meta: ViewMeta = {
			nodes: canvas.nodes,
			edges: canvas.edges,
			viewport: canvas.viewport,
			canvasType: "node-canvas",
			// Preserve organization and project IDs from existing canvas
			organizationId: canvas.meta?.organizationId || canvas.organizationId,
			projectId: canvas.meta?.projectId || canvas.projectId
		};

		const view = await updateView(canvasId, newName, canvas.description, meta);

		if (view) {
			if (currentCanvasId.value === canvasId) {
				currentCanvasName.value = newName;
			}
			return true;
		}

		return false;
	};

	/**
	 * Set current canvas name (for editing before save)
	 */
	const setCurrentCanvasName = (name: string) => {
		currentCanvasName.value = name;
	};

	/**
	 * Set current canvas ID (when loading canvas data directly)
	 */
	const setCurrentCanvas = (id: string, name: string) => {
		currentCanvasId.value = id;
		currentCanvasName.value = name;
		// Save as last edited canvas
		setLastEditedCanvasId(id);
		console.log("🎯 Current canvas set to:", id, "-", name);
	};

	return {
		// State
		savedCanvases,
		currentCanvasId: computed(() => currentCanvasId.value),
		currentCanvasName: computed(() => currentCanvasName.value),
		isLoading,
		error,

		// Methods
		loadAllCanvases,
		createNewCanvas,
		loadCanvas,
		saveCanvas,
		deleteCanvas,
		renameCanvas,
		setCurrentCanvasName,
		setCurrentCanvas,
		loadLastEditedCanvas,
		getLastEditedCanvasId
	};
}
