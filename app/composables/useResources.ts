// Resources Composable for BuildIt API Integration

import type {
	CreateResourceRequest,
	Resource,
	ResourceFilters,
	ResourceStats,
	UpdateResourceRequest
} from "~/types/resource";

import { computed, readonly, ref } from "vue";
import { buttClient } from "~/utils/buttClient";

export const useResources = () => {
	// State
	const resources = ref<Resource[]>([]);
	const isLoading = ref(false);
	const error = ref<string | null>(null);

	// Computed properties
	const resourceStats = computed((): ResourceStats => {
		const total = resources.value.length;

		const byPart = resources.value.reduce((acc, resource) => {
			acc[resource.partId] = (acc[resource.partId] || 0) + 1;
			return acc;
		}, {} as Record<string, number>);

		const byCreator = resources.value.reduce((acc, resource) => {
			if (resource.creator) {
				acc[resource.creator] = (acc[resource.creator] || 0) + 1;
			}
			return acc;
		}, {} as Record<string, number>);

		const now = new Date();
		const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

		const recentlyCreated = resources.value.filter(
			(resource) => new Date(resource.createdAt) > dayAgo
		).length;

		const recentlyUpdated = resources.value.filter(
			(resource) => new Date(resource.updatedAt) > dayAgo
		).length;

		return {
			total,
			byPart,
			byCreator,
			recentlyCreated,
			recentlyUpdated
		};
	});

	// Filter resources
	const filterResources = (filters: ResourceFilters) => {
		return computed(() => {
			return resources.value.filter((resource) => {
				if (filters.partId && resource.partId !== filters.partId) {
					return false;
				}
				if (filters.name && !resource.name.toLowerCase().includes(filters.name.toLowerCase())) {
					return false;
				}
				if (filters.creator && resource.creator !== filters.creator) {
					return false;
				}
				if (filters.deletedAt !== undefined) {
					const isDeleted = resource.deletedAt !== null;
					if (filters.deletedAt !== isDeleted) {
						return false;
					}
				}
				return true;
			});
		});
	};

	// API Methods
	const fetchResources = async () => {
		console.log("🔍 useResources.fetchResources - Starting");
		isLoading.value = true;
		error.value = null;

		try {
			const response = await buttClient.findAllResource();
			resources.value = response || [];
			console.log("✅ useResources.fetchResources - Success:", resources.value.length, "resources");
		} catch (err: any) {
			error.value = err.message || "Failed to fetch resources";
			console.error("❌ useResources.fetchResources - Error:", err);
			throw err;
		} finally {
			isLoading.value = false;
		}
	};

	const createResource = async (resourceData: CreateResourceRequest): Promise<Resource> => {
		console.log("🔍 useResources.createResource - Starting");
		console.log("📦 Resource data:", resourceData);
		isLoading.value = true;
		error.value = null;

		try {
			// Transform CreateResourceRequest to match BApi payload structure
			const apiPayload = {
				butt: (resourceData as any).butt,
				name: (resourceData as any).name || "",
				partId: (resourceData as any).partId || "",
				pathFragment: (resourceData as any).pathFragment || "",
				description: (resourceData as any).description || "",
				owners: (resourceData as any).owners || [],
				subscribers: (resourceData as any).subscribers || []
			};
			
			const apiResponse = await buttClient.createResource(apiPayload);
			
			// Convert API response to Resource type
			const newResource: Resource = {
				id: apiResponse.id || "",
				butt: (apiResponse as any).butt,
				name: apiResponse.name || "",
				partId: apiPayload.partId,
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
			
			resources.value.push(newResource);
			console.log("✅ useResources.createResource - Success:", newResource);
			return newResource;
		} catch (err: any) {
			error.value = err.message || "Failed to create resource";
			console.error("❌ useResources.createResource - Error:", err);
			throw err;
		} finally {
			isLoading.value = false;
		}
	};

	const getResource = async (id: string): Promise<Resource> => {
		console.log("🔍 useResources.getResource - Starting");
		console.log("📍 Resource ID:", id);
		isLoading.value = true;
		error.value = null;

		try {
			const resource = await buttClient.findByIdResource(id);
			console.log("✅ useResources.getResource - Success:", resource);
			return resource;
		} catch (err: any) {
			error.value = err.message || "Failed to fetch resource";
			console.error("❌ useResources.getResource - Error:", err);
			throw err;
		} finally {
			isLoading.value = false;
		}
	};

	const updateResource = async (id: string, resourceData: UpdateResourceRequest): Promise<Resource> => {
		console.log("🔍 useResources.updateResource - Starting");
		console.log("📍 Resource ID:", id);
		console.log("📦 Update data:", resourceData);
		isLoading.value = true;
		error.value = null;

		try {
			// Transform UpdateResourceRequest to match BApi payload structure
			const apiPayload = {
				name: (resourceData as any).name,
				description: (resourceData as any).description,
				owners: (resourceData as any).owners || [],
				subscribers: (resourceData as any).subscribers || []
			};
			
			const updatedResource = await buttClient.updateResource(id, apiPayload);

			// Update the resource in the local array
			const index = resources.value.findIndex((resource) => resource.id === id);
			if (index !== -1) {
				resources.value[index] = updatedResource;
			}

			console.log("✅ useResources.updateResource - Success:", updatedResource);
			return updatedResource;
		} catch (err: any) {
			error.value = err.message || "Failed to update resource";
			console.error("❌ useResources.updateResource - Error:", err);
			throw err;
		} finally {
			isLoading.value = false;
		}
	};

	const deleteResource = async (id: string): Promise<void> => {
		console.log("🔍 useResources.deleteResource - Starting");
		console.log("📍 Resource ID:", id);
		isLoading.value = true;
		error.value = null;

		try {
			await buttClient.deleteResource(id);

			// Remove the resource from the local array
			const index = resources.value.findIndex((resource) => resource.id === id);
			if (index !== -1) {
				resources.value.splice(index, 1);
			}

			console.log("✅ useResources.deleteResource - Success");
		} catch (err: any) {
			error.value = err.message || "Failed to delete resource";
			console.error("❌ useResources.deleteResource - Error:", err);
			throw err;
		} finally {
			isLoading.value = false;
		}
	};

	// Utility methods
	const clearError = () => {
		error.value = null;
	};

	const findResourceById = (id: string) => {
		return resources.value.find((resource) => resource.id === id);
	};

	const getResourcesByPart = (partId: string) => {
		return resources.value.filter((resource) => resource.partId === partId);
	};

	const getResourcesByCreator = (creatorId: string) => {
		return resources.value.filter((resource) => resource.creator === creatorId);
	};

	return {
		// State
		resources: readonly(resources),
		isLoading: readonly(isLoading),
		error: readonly(error),

		// Computed
		resourceStats,

		// Methods
		fetchResources,
		createResource,
		getResource,
		updateResource,
		deleteResource,
		filterResources,
		clearError,
		findResourceById,
		getResourcesByPart,
		getResourcesByCreator
	};
}; 