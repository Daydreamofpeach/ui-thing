import { computed, ref } from "vue";
import type { CdnResponse, CdnStatistics } from "~/types/cdn";
import { buttClient } from "~/utils/buttClient";

export const useCdn = () => {
	// Reactive state
	const cdnData = ref<CdnResponse | null>(null);
	const loading = ref(false);
	const error = ref<string | null>(null);

	// Computed statistics
	const cdnStatistics = computed((): CdnStatistics => ({
		totalRequests: cdnData.value ? 1 : 0,
		lastUpdated: cdnData.value ? new Date().toISOString() : null
	}));

	// CDN Actions
	const loadCdnUrl = async (): Promise<void> => {
		loading.value = true;
		error.value = null;

		try {
			console.log("🔄 Loading CDN URL...");
			const result = await buttClient.getCdn();
			cdnData.value = result ? { cdn: result } : null;
			console.log("✅ CDN URL loaded:", result);
		} catch (err: any) {
			error.value = err.message || "Failed to load CDN URL";
			console.error("❌ Error loading CDN URL:", err);
		} finally {
			loading.value = false;
		}
	};

	// Helper functions
	const getCdnUrl = (): string | null => {
		return cdnData.value?.cdn || null;
	};

	const isValidCdnUrl = (): boolean => {
		const url = buttClient.getCdn();
		if (!url) return false;
		try {
			new URL(url);
			return true;
		} catch {
			return false;
		}
	};

	return {
		// State
		cdnData: computed(() => cdnData.value),
		loading: computed(() => loading.value),
		error: computed(() => error.value),

		// Statistics
		cdnStatistics,

		// Actions
		loadCdnUrl,

		// Helpers
		getCdnUrl,
		isValidCdnUrl
	};
};