import type { CreateQuickLinkRequest, QuickLink, QuickLinkFilter, QuickLinkStatistics, UpdateQuickLinkRequest } from "~/types/quicklink";
import { computed, ref } from "vue";
import {
	buttClient
} from "~/utils/buttClient";

// Global state
const quicklinks = ref<QuickLink[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);

export const useQuicklinks = () => {
	// Computed statistics
	const totalQuicklinks = computed(() => quicklinks.value.length);

	const quicklinkStatistics = computed((): QuickLinkStatistics => {
		const byGroup: Record<string, number> = {};
		const byCreator: Record<string, number> = {};
		let withUrls = 0;
		let withLogos = 0;

		quicklinks.value.forEach((quicklink) => {
			// Count by group
			const group = quicklink.groupName || "No Group";
			byGroup[group] = (byGroup[group] || 0) + 1;

			// Count by creator
			const creator = quicklink.creator || "Unknown";
			byCreator[creator] = (byCreator[creator] || 0) + 1;

			// Count with URLs and logos
			if (quicklink.url) withUrls++;
			if (quicklink.logo) withLogos++;
		});

		return {
			total: quicklinks.value.length,
			byGroup,
			byCreator,
			withUrls,
			withLogos
		};
	});

	// Load all quicklinks
	const loadQuicklinks = async (): Promise<QuickLink[]> => {
		loading.value = true;
		error.value = null;

		try {
			console.log("🔄 Loading all quicklinks...");
			const result = await buttClient.findAllQuicklink();
			quicklinks.value = result || [];
			console.log("✅ Quicklinks loaded:", quicklinks.value.length);
			return quicklinks.value;
		} catch (err: any) {
			error.value = err.message || "Failed to load quicklinks";
			console.error("❌ Error loading quicklinks:", err);
			return [];
		} finally {
			loading.value = false;
		}
	};

	// Load user's quicklinks
	const loadMyQuicklinks = async (): Promise<QuickLink[]> => {
		loading.value = true;
		error.value = null;

		try {
			console.log("🔄 Loading my quicklinks...");
			const result = await buttClient.findAllQuicklink();
			quicklinks.value = result || [];
			console.log("✅ My quicklinks loaded:", quicklinks.value.length);
			return quicklinks.value;
		} catch (err: any) {
			error.value = err.message || "Failed to load my quicklinks";
			console.error("❌ Error loading my quicklinks:", err);
			return [];
		} finally {
			loading.value = false;
		}
	};

	// Create quicklink
	const createQuicklink = async (quicklinkData: CreateQuickLinkRequest): Promise<QuickLink | null> => {
		loading.value = true;
		error.value = null;

		try {
			console.log("📝 Creating quicklink:", quicklinkData);

			// Ensure url is a string (not undefined) to satisfy type requirements
			const safeQuicklinkData = {
				...quicklinkData,
				url: quicklinkData.url ?? ""
			};

			const newQuicklink = await buttClient.createQuicklink(safeQuicklinkData);

			if (newQuicklink) {
				quicklinks.value.push(newQuicklink);
				console.log("✅ Quicklink created successfully");
				return newQuicklink;
			}

			return null;
		} catch (err: any) {
			error.value = err.message || "Failed to create quicklink";
			console.error("❌ Error creating quicklink:", err);
			return null;
		} finally {
			loading.value = false;
		}
	};

	// Get single quicklink
	const getQuicklink = async (id: string): Promise<QuickLink | null> => {
		loading.value = true;
		error.value = null;

		try {
			console.log("🔍 Getting quicklink:", id);
			const quicklink = await buttClient.findByIdQuicklink(id);
			console.log("✅ Quicklink retrieved successfully");
			return quicklink;
		} catch (err: any) {
			error.value = err.message || "Failed to get quicklink";
			console.error("❌ Error getting quicklink:", err);
			return null;
		} finally {
			loading.value = false;
		}
	};

	// Update quicklink
	const updateQuicklink = async (id: string, quicklinkData: UpdateQuickLinkRequest): Promise<QuickLink | null> => {
		loading.value = true;
		error.value = null;

		try {
			console.log("✏️ Updating quicklink:", id, quicklinkData);

			// Ensure all required fields are strings (not undefined) to satisfy type requirements
			const safeQuicklinkData = {
				...quicklinkData,
				name: quicklinkData.name ?? "",
				description: quicklinkData.description ?? "",
				groupName: quicklinkData.groupName ?? "",
				url: quicklinkData.url ?? "",
				logo: quicklinkData.logo ?? ""
			};

			const updatedQuicklink = await buttClient.updateQuicklink(id, safeQuicklinkData);

			if (updatedQuicklink) {
				const index = quicklinks.value.findIndex((q) => q.id === id);
				if (index !== -1) {
					quicklinks.value[index] = updatedQuicklink;
				}
				console.log("✅ Quicklink updated successfully");
				return updatedQuicklink;
			}

			return null;
		} catch (err: any) {
			error.value = err.message || "Failed to update quicklink";
			console.error("❌ Error updating quicklink:", err);
			return null;
		} finally {
			loading.value = false;
		}
	};

	// Delete quicklink
	const deleteQuicklink = async (id: string): Promise<boolean> => {
		loading.value = true;
		error.value = null;

		try {
			console.log("🗑️ Deleting quicklink:", id);
			await deleteQuicklink(id);

			// Remove from local state
			quicklinks.value = quicklinks.value.filter((q) => q.id !== id);
			console.log("✅ Quicklink deleted successfully");
			return true;
		} catch (err: any) {
			error.value = err.message || "Failed to delete quicklink";
			console.error("❌ Error deleting quicklink:", err);
			return false;
		} finally {
			loading.value = false;
		}
	};

	// Filter quicklinks
	const filterQuicklinks = (filter: QuickLinkFilter): QuickLink[] => {
		return quicklinks.value.filter((quicklink) => {
			if (filter.creator && quicklink.creator !== filter.creator) return false;
			if (filter.groupName && quicklink.groupName !== filter.groupName) return false;
			if (filter.name && !quicklink.name.toLowerCase().includes(filter.name.toLowerCase())) return false;
			return true;
		});
	};

	// Helper functions
	const formatQuicklinkName = (quicklink: QuickLink): string => {
		return quicklink.name || `Quicklink ${quicklink.id?.slice(0, 8) || "Unknown"}`;
	};

	const getQuicklinkGroups = (): string[] => {
		const groups = new Set<string>();
		quicklinks.value.forEach((quicklink) => {
			if (quicklink.groupName) {
				groups.add(quicklink.groupName);
			}
		});
		return Array.from(groups).sort();
	};

	const getQuicklinkUrl = (quicklink: QuickLink): string => {
		return quicklink.url || "#";
	};

	// Initialize data on first use
	if (quicklinks.value.length === 0) {
		loadQuicklinks();
	}

	return {
		// State
		quicklinks: computed(() => quicklinks.value),
		loading: computed(() => loading.value),
		error: computed(() => error.value),

		// Statistics
		totalQuicklinks,
		quicklinkStatistics,

		// Actions
		loadQuicklinks,
		loadMyQuicklinks,
		createQuicklink,
		getQuicklink,
		updateQuicklink,
		deleteQuicklink,
		filterQuicklinks,

		// Helpers
		formatQuicklinkName,
		getQuicklinkGroups,
		getQuicklinkUrl
	};
};
