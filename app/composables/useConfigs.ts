import type { Config, ConfigStatistics } from "~/types/config";
import { computed, ref } from "vue";
import { buttClient } from "~/utils/buttClient";

export const useConfigs = () => {
	// Reactive state
	const configs = ref<Config[]>([]);
	const selectedConfig = ref<Config | null>(null);
	const loading = ref(false);
	const error = ref<string | null>(null);

	// Computed statistics
	const totalConfigs = computed(() => configs.value.length);
	const activeConfigs = computed(() => configs.value.filter((c) => c.isActive).length);
	const inactiveConfigs = computed(() => configs.value.filter((c) => !c.isActive).length);

	const configStatistics = computed((): ConfigStatistics => {
		const configsByType = configs.value.reduce((acc: Record<string, number>, config) => {
			const type = config.type || "unknown";
			acc[type] = (acc[type] || 0) + 1;
			return acc;
		}, {});

		return {
			totalConfigs: totalConfigs.value,
			activeConfigs: activeConfigs.value,
			inactiveConfigs: inactiveConfigs.value,
			configsByType
		};
	});

	// Config Actions
	const loadConfigs = async (): Promise<void> => {
		loading.value = true;
		error.value = null;

		try {
			console.log("🔄 Loading configs...");
			const result = await buttClient.findAllConfig();
			configs.value = result || [];
			console.log("✅ Configs loaded:", configs.value.length);
		} catch (err: any) {
			error.value = err.message || "Failed to load configs";
			console.error("❌ Error loading configs:", err);
		} finally {
			loading.value = false;
		}
	};

	const getConfigById = async (id: string): Promise<Config | null> => {
		loading.value = true;
		error.value = null;

		try {
			console.log("🔍 Loading config:", id);
			const result = await buttClient.get(id);
			
			// Convert BApi response to Config type
			const config: Config = {
				id: result.id || "",
				name: result.name || "",
				description: result.description || "",
				content: result.content || {},
				type: result.type || "CONFIG",
				isActive: true, // Default to active since BApi doesn't have this field
				createdAt: result.createdAt || new Date().toISOString(),
				updatedAt: result.updatedAt || new Date().toISOString(),
				userId: "", // Not provided by BApi
				organisationId: "" // Not provided by BApi
			};
			
			selectedConfig.value = config;
			console.log("✅ Config loaded:", config.name);
			return config;
		} catch (err: any) {
			error.value = err.message || "Failed to load config";
			console.error("❌ Error loading config:", err);
			return null;
		} finally {
			loading.value = false;
		}
	};

	// Helper functions
	const filterConfigsByType = (type: string) => {
		return configs.value.filter((config) => config.type === type);
	};

	const filterActiveConfigs = () => {
		return configs.value.filter((config) => config.isActive);
	};

	const filterInactiveConfigs = () => {
		return configs.value.filter((config) => !config.isActive);
	};

	const searchConfigs = (query: string) => {
		const searchTerm = query.toLowerCase();
		return configs.value.filter((config) =>
			config.name.toLowerCase().includes(searchTerm)
			|| config.description.toLowerCase().includes(searchTerm)
			|| config.type.toLowerCase().includes(searchTerm)
		);
	};

	return {
		// State
		configs: computed(() => configs.value),
		selectedConfig: computed(() => selectedConfig.value),
		loading: computed(() => loading.value),
		error: computed(() => error.value),

		// Statistics
		totalConfigs,
		activeConfigs,
		inactiveConfigs,
		configStatistics,

		// Actions
		loadConfigs,
		getConfig: getConfigById,

		// Helpers
		filterConfigsByType,
		filterActiveConfigs,
		filterInactiveConfigs,
		searchConfigs
	};
};
