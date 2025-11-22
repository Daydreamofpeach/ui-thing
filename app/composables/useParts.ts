// Parts Composable for BuildIt API Integration

import type {
	CreatePartRequest,
	Part,
	PartFilters,
	PartStats,
	UpdatePartRequest
} from "~/types/part";

import { computed, readonly, ref } from "vue";
import { buttClient } from "~/utils/buttClient";

export const useParts = () => {
	// State
	const parts = ref<Part[]>([]);
	const isLoading = ref(false);
	const error = ref<string | null>(null);

	// Computed properties
	const partStats = computed((): PartStats => {
		const total = parts.value.length;

		const byComponent = parts.value.reduce((acc, part) => {
			acc[part.componentId] = (acc[part.componentId] || 0) + 1;
			return acc;
		}, {} as Record<string, number>);

		const byCreator = parts.value.reduce((acc, part) => {
			if (part.creator) {
				acc[part.creator] = (acc[part.creator] || 0) + 1;
			}
			return acc;
		}, {} as Record<string, number>);

		const now = new Date();
		const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

		const recentlyCreated = parts.value.filter(
			(part) => new Date(part.createdAt) > dayAgo
		).length;

		const recentlyUpdated = parts.value.filter(
			(part) => new Date(part.updatedAt) > dayAgo
		).length;

		return {
			total,
			byComponent,
			byCreator,
			recentlyCreated,
			recentlyUpdated
		};
	});

	// Filter parts
	const filterParts = (filters: PartFilters) => {
		return computed(() => {
			return parts.value.filter((part) => {
				if (filters.componentId && part.componentId !== filters.componentId) {
					return false;
				}
				if (filters.name && !part.name.toLowerCase().includes(filters.name.toLowerCase())) {
					return false;
				}
				if (filters.creator && part.creator !== filters.creator) {
					return false;
				}
				if (filters.deletedAt !== undefined) {
					const isDeleted = part.deletedAt !== null;
					if (filters.deletedAt !== isDeleted) {
						return false;
					}
				}
				return true;
			});
		});
	};

	// API Methods
	const fetchParts = async () => {
		console.log("🔍 useParts.fetchParts - Starting");
		isLoading.value = true;
		error.value = null;

		try {
			const response = await buttClient.findAllPart();
			parts.value = response || [];
			console.log("✅ useParts.fetchParts - Success:", parts.value.length, "parts");
		} catch (err: any) {
			error.value = err.message || "Failed to fetch parts";
			console.error("❌ useParts.fetchParts - Error:", err);
			throw err;
		} finally {
			isLoading.value = false;
		}
	};

	const createPart = async (partData: CreatePartRequest): Promise<Part> => {
		console.log("🔍 useParts.createPart - Starting");
		console.log("📦 Part data:", partData);
		isLoading.value = true;
		error.value = null;

		try {
			// Transform CreatePartRequest to match BApi payload structure
			const apiPayload = {
				butt: (partData as any).butt,
				name: (partData as any).name || "",
				componentId: (partData as any).componentId || "",
				pathFragment: (partData as any).pathFragment || "",
				description: (partData as any).description || "",
				version: (partData as any).version,
				category: (partData as any).category,
				owners: (partData as any).owners || [],
				subscribers: (partData as any).subscribers || []
			};
			
			const apiResponse = await buttClient.createPart(apiPayload);
			
			// Convert API response to Part type
			const newPart: Part = {
				id: apiResponse.id || "",
				butt: (apiResponse as any).butt,
				name: apiResponse.name || "",
				componentId: apiPayload.componentId,
				pathFragment: apiPayload.pathFragment,
				description: apiResponse.description || "",
				creator: apiResponse.creator || "",
				owners: apiPayload.owners,
				subscribers: apiPayload.subscribers,
				history: [],
				deletedAt: apiResponse.deletedAt,
				createdAt: apiResponse.createdAt || new Date().toISOString(),
				updatedAt: apiResponse.updatedAt || new Date().toISOString()
			};
			
			parts.value.push(newPart);
			console.log("✅ useParts.createPart - Success:", newPart);
			return newPart;
		} catch (err: any) {
			error.value = err.message || "Failed to create part";
			console.error("❌ useParts.createPart - Error:", err);
			throw err;
		} finally {
			isLoading.value = false;
		}
	};

	const getPart = async (id: string): Promise<Part> => {
		console.log("🔍 useParts.getPart - Starting");
		console.log("📍 Part ID:", id);
		isLoading.value = true;
		error.value = null;

		try {
			const part = await buttClient.findByIdPart(id);
			console.log("✅ useParts.getPart - Success:", part);
			return part;
		} catch (err: any) {
			error.value = err.message || "Failed to fetch part";
			console.error("❌ useParts.getPart - Error:", err);
			throw err;
		} finally {
			isLoading.value = false;
		}
	};

	const updatePart = async (id: string, partData: UpdatePartRequest): Promise<Part> => {
		console.log("🔍 useParts.updatePart - Starting");
		console.log("📍 Part ID:", id);
		console.log("📦 Update data:", partData);
		isLoading.value = true;
		error.value = null;

		try {
			// Transform UpdatePartRequest to match BApi payload structure
			const apiPayload = {
				name: (partData as any).name,
				description: (partData as any).description,
				version: (partData as any).version,
				category: (partData as any).category,
				owners: (partData as any).owners || [],
				subscribers: (partData as any).subscribers || []
			};
			
			const updatedPart = await buttClient.updatePart(id, apiPayload);

			// Update the part in the local array
			const index = parts.value.findIndex((part) => part.id === id);
			if (index !== -1) {
				parts.value[index] = updatedPart;
			}

			console.log("✅ useParts.updatePart - Success:", updatedPart);
			return updatedPart;
		} catch (err: any) {
			error.value = err.message || "Failed to update part";
			console.error("❌ useParts.updatePart - Error:", err);
			throw err;
		} finally {
			isLoading.value = false;
		}
	};

	const deletePart = async (id: string): Promise<void> => {
		console.log("🔍 useParts.deletePart - Starting");
		console.log("📍 Part ID:", id);
		isLoading.value = true;
		error.value = null;

		try {
			await buttClient.deletePart(id);

			// Remove the part from the local array
			const index = parts.value.findIndex((part) => part.id === id);
			if (index !== -1) {
				parts.value.splice(index, 1);
			}

			console.log("✅ useParts.deletePart - Success");
		} catch (err: any) {
			error.value = err.message || "Failed to delete part";
			console.error("❌ useParts.deletePart - Error:", err);
			throw err;
		} finally {
			isLoading.value = false;
		}
	};

	// Utility methods
	const clearError = () => {
		error.value = null;
	};

	const findPartById = (id: string) => {
		return parts.value.find((part) => part.id === id);
	};

	const getPartsByComponent = (componentId: string) => {
		return parts.value.filter((part) => part.componentId === componentId);
	};

	const getPartsByCreator = (creatorId: string) => {
		return parts.value.filter((part) => part.creator === creatorId);
	};

	return {
		// State
		parts: readonly(parts),
		isLoading: readonly(isLoading),
		error: readonly(error),

		// Computed
		partStats,

		// Methods
		fetchParts,
		createPart,
		getPart,
		updatePart,
		deletePart,
		filterParts,
		clearError,
		findPartById,
		getPartsByComponent,
		getPartsByCreator
	};
};
