// Components Composable for BuildIt API Integration

import type {
	Component,
	ComponentFilters,
	ComponentStats,
	CreateComponentRequest,
	UpdateComponentRequest
} from "~/types/component";

import { computed, readonly, ref } from "vue";
import { buttClient } from "~/utils/buttClient";

export const useComponents = () => {
	// State
	const components = ref<Component[]>([]);
	const isLoading = ref(false);
	const error = ref<string | null>(null);

	// Computed properties
	const componentStats = computed((): ComponentStats => {
		const total = components.value.length;

		const bySolution = components.value.reduce((acc, component) => {
			acc[component.solutionId] = (acc[component.solutionId] || 0) + 1;
			return acc;
		}, {} as Record<string, number>);

		const byCreator = components.value.reduce((acc, component) => {
			if (component.creator) {
				acc[component.creator] = (acc[component.creator] || 0) + 1;
			}
			return acc;
		}, {} as Record<string, number>);

		const now = new Date();
		const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

		const recentlyCreated = components.value.filter(
			(component) => new Date(component.createdAt) > dayAgo
		).length;

		const recentlyUpdated = components.value.filter(
			(component) => new Date(component.updatedAt) > dayAgo
		).length;

		return {
			total,
			bySolution,
			byCreator,
			recentlyCreated,
			recentlyUpdated
		};
	});

	// Filter components
	const filterComponents = (filters: ComponentFilters) => {
		return computed(() => {
			return components.value.filter((component) => {
				if (filters.solutionId && component.solutionId !== filters.solutionId) {
					return false;
				}
				if (filters.name && !component.name.toLowerCase().includes(filters.name.toLowerCase())) {
					return false;
				}
				if (filters.creator && component.creator !== filters.creator) {
					return false;
				}
				if (filters.deletedAt !== undefined) {
					const isDeleted = component.deletedAt !== null;
					if (filters.deletedAt !== isDeleted) {
						return false;
					}
				}
				return true;
			});
		});
	};

	// API Methods
	const fetchComponents = async () => {
		console.log("🔍 useComponents.fetchComponents - Starting");
		isLoading.value = true;
		error.value = null;

		try {
			const response = await buttClient.findAllComponent();
			components.value = response || [];
			console.log("✅ useComponents.fetchComponents - Success:", components.value.length, "components");
		} catch (err: any) {
			error.value = err.message || "Failed to fetch components";
			console.error("❌ useComponents.fetchComponents - Error:", err);
			throw err;
		} finally {
			isLoading.value = false;
		}
	};

	const createComponent = async (componentData: CreateComponentRequest): Promise<Component> => {
		console.log("🔍 useComponents.createComponent - Starting");
		console.log("📦 Component data:", componentData);
		isLoading.value = true;
		error.value = null;

		try {
			// Convert CreateComponentRequest to BApi format
			const apiPayload = {
				name: componentData.name,
				description: componentData.description || "",
				type: "COMPONENT",
				technology: "Vue.js",
				version: "1.0.0",
				category: "UI Component",
				tags: [],
				dependencies: [],
				props: {},
				documentation: ""
			};

			const newComponent = await buttClient.createComponent(apiPayload);

			// Convert BApi response to Component type
			const convertedComponent: Component = {
				id: newComponent.id || "",
				name: newComponent.name || "",
				description: newComponent.description || "",
				solutionId: componentData.solutionId,
				pathFragment: componentData.pathFragment,
				creator: newComponent.creator || "",
				owners: [],
				subscribers: [],
				history: [],
				createdAt: newComponent.createdAt || new Date().toISOString(),
				updatedAt: newComponent.updatedAt || new Date().toISOString(),
				deletedAt: newComponent.deletedAt
			};

			components.value.push(convertedComponent);
			console.log("✅ useComponents.createComponent - Success:", convertedComponent);
			return convertedComponent;
		} catch (err: any) {
			error.value = err.message || "Failed to create component";
			console.error("❌ useComponents.createComponent - Error:", err);
			throw err;
		} finally {
			isLoading.value = false;
		}
	};

	const getComponent = async (id: string): Promise<Component> => {
		console.log("🔍 useComponents.getComponent - Starting");
		console.log("📍 Component ID:", id);
		isLoading.value = true;
		error.value = null;

		try {
			const component = await buttClient.findByIdComponent(id);
			console.log("✅ useComponents.getComponent - Success:", component);
			return component;
		} catch (err: any) {
			error.value = err.message || "Failed to fetch component";
			console.error("❌ useComponents.getComponent - Error:", err);
			throw err;
		} finally {
			isLoading.value = false;
		}
	};

	const updateComponent = async (id: string, componentData: UpdateComponentRequest): Promise<Component> => {
		console.log("🔍 useComponents.updateComponent - Starting");
		console.log("📍 Component ID:", id);
		console.log("📦 Update data:", componentData);
		isLoading.value = true;
		error.value = null;

		try {
			const updatedComponent = await buttClient.updateComponent(id, componentData);

			// Update the component in the local array
			const index = components.value.findIndex((component) => component.id === id);
			if (index !== -1) {
				components.value[index] = updatedComponent;
			}

			console.log("✅ useComponents.updateComponent - Success:", updatedComponent);
			return updatedComponent;
		} catch (err: any) {
			error.value = err.message || "Failed to update component";
			console.error("❌ useComponents.updateComponent - Error:", err);
			throw err;
		} finally {
			isLoading.value = false;
		}
	};

	const deleteComponent = async (id: string): Promise<void> => {
		console.log("🔍 useComponents.deleteComponent - Starting");
		console.log("📍 Component ID:", id);
		isLoading.value = true;
		error.value = null;

		try {
			await buttClient.deleteComponent(id);

			// Remove the component from the local array
			const index = components.value.findIndex((component) => component.id === id);
			if (index !== -1) {
				components.value.splice(index, 1);
			}

			console.log("✅ useComponents.deleteComponent - Success");
		} catch (err: any) {
			error.value = err.message || "Failed to delete component";
			console.error("❌ useComponents.deleteComponent - Error:", err);
			throw err;
		} finally {
			isLoading.value = false;
		}
	};

	// Utility methods
	const clearError = () => {
		error.value = null;
	};

	const findComponentById = (id: string) => {
		return components.value.find((component) => component.id === id);
	};

	const getComponentsBySolution = async (solutionId: string) => {
		console.log("🔍 useComponents.getComponentsBySolution - Starting");
		console.log("📍 Solution ID:", solutionId);
		isLoading.value = true;
		error.value = null;

		try {
			const solutionComponents = await buttClient.findBySolutionIdComponent(solutionId);
			console.log("✅ useComponents.getComponentsBySolution - Success:", solutionComponents);
			return solutionComponents;
		} catch (err: any) {
			error.value = err.message || "Failed to fetch components by solution";
			console.error("❌ useComponents.getComponentsBySolution - Error:", err);
			throw err;
		} finally {
			isLoading.value = false;
		}
	};

	const getComponentsByCreator = (creatorId: string) => {
		return components.value.filter((component) => component.creator === creatorId);
	};

	return {
		// State
		components: readonly(components),
		isLoading: readonly(isLoading),
		error: readonly(error),

		// Computed
		componentStats,

		// Methods
		fetchComponents,
		createComponent,
		getComponent,
		updateComponent,
		deleteComponent,
		filterComponents,
		clearError,
		findComponentById,
		getComponentsBySolution,
		getComponentsByCreator
	};
};
