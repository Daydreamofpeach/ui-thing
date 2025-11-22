import type {
	DownloadClient,
	DownloadStatistics,
	StandardFile
} from "~/types/download";
import { computed, ref } from "vue";
import { buttClient } from "~/utils/buttClient";

export const useDownloads = () => {
	// Reactive state
	const clients = ref<DownloadClient[]>([]);
	const files = ref<StandardFile[]>([]);
	const loading = ref(false);
	const error = ref<string | null>(null);

	// Computed statistics
	const totalClients = computed(() => clients.value.length);
	const totalFiles = computed(() => files.value.length);

	const downloadStatistics = computed((): DownloadStatistics => {
		const latestClient = clients.value
			.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

		const totalSize = [
			...clients.value.map((c) => c.size || 0),
			...files.value.map((f) => f.size || 0)
		].reduce((sum, size) => sum + size, 0);

		return {
			totalClients: totalClients.value,
			totalFiles: totalFiles.value,
			latestVersion: latestClient?.version || null,
			totalDownloadSize: totalSize
		};
	});

	// Client Actions
	const loadClients = async (): Promise<void> => {
		loading.value = true;
		error.value = null;

		try {
			console.log("🔄 Loading BuildIt clients...");
			const result = await buttClient.listClients();
			clients.value = result || [];
			console.log("✅ Clients loaded:", clients.value.length);
		} catch (err: any) {
			error.value = err.message || "Failed to load clients";
			console.error("❌ Error loading clients:", err);
		} finally {
			loading.value = false;
		}
	};

	const uploadClient = async (file: File, version: string): Promise<any> => {
		loading.value = true;
		error.value = null;

		try {
			console.log("📤 Uploading client:", { filename: file.name, version });
			const result = await buttClient.upload();
			await loadClients(); // Refresh list
			console.log("✅ Client uploaded successfully");
			return result;
		} catch (err: any) {
			error.value = err.message || "Failed to upload client";
			console.error("❌ Error uploading client:", err);
			return null;
		} finally {
			loading.value = false;
		}
	};

	const downloadLatestClient = async (): Promise<void> => {
		loading.value = true;
		error.value = null;

		try {
			console.log("📥 Downloading latest client...");
			await buttClient.downloadLatest();
			console.log("✅ Latest client download initiated");
		} catch (err: any) {
			error.value = err.message || "Failed to download latest client";
			console.error("❌ Error downloading latest client:", err);
		} finally {
			loading.value = false;
		}
	};

	const downloadClientByVersion = async (version: string): Promise<void> => {
		loading.value = true;
		error.value = null;

		try {
			console.log("📥 Downloading client version:", version);
			await buttClient.downloadClient(version);
			console.log("✅ Client download initiated for version:", version);
		} catch (err: any) {
			error.value = err.message || "Failed to download client";
			console.error("❌ Error downloading client:", err);
		} finally {
			loading.value = false;
		}
	};

	// File Actions
	const uploadFileAction = async (file: File, organisationId: string): Promise<any> => {
		loading.value = true;
		error.value = null;

		try {
			console.log("📤 Uploading file:", { filename: file.name, organisationId });
			const result = await buttClient.uploadOrganisationFile(organisationId);
			console.log("✅ File uploaded successfully");
			return result;
		} catch (err: any) {
			error.value = err.message || "Failed to upload file";
			console.error("❌ Error uploading file:", err);
			return null;
		} finally {
			loading.value = false;
		}
	};

	const downloadFileAction = async (fileId: string): Promise<void> => {
		loading.value = true;
		error.value = null;

		try {
			console.log("📥 Downloading file:", fileId);
			await buttClient.downloadFile(fileId);
			console.log("✅ File download initiated");
		} catch (err: any) {
			error.value = err.message || "Failed to download file";
			console.error("❌ Error downloading file:", err);
		} finally {
			loading.value = false;
		}
	};

	// Helper functions
	const formatFileSize = (bytes: number): string => {
		if (bytes === 0) return "0 Bytes";
		const k = 1024;
		const sizes = ["Bytes", "KB", "MB", "GB"];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return `${Number.parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
	};

	const getClientsByVersion = () => {
		return clients.value.reduce((acc: Record<string, DownloadClient[]>, client) => {
			if (!acc[client.version]) {
				acc[client.version] = [];
			}
			acc[client.version]!.push(client);
			return acc;
		}, {});
	};

	return {
		// State
		clients: computed(() => clients.value),
		files: computed(() => files.value),
		loading: computed(() => loading.value),
		error: computed(() => error.value),

		// Statistics
		totalClients,
		totalFiles,
		downloadStatistics,

		// Client Actions
		loadClients,
		uploadClient,
		downloadLatestClient,
		downloadClientByVersion,

		// File Actions
		uploadFile: uploadFileAction,
		downloadFile: downloadFileAction,

		// Helpers
		formatFileSize,
		getClientsByVersion
	};
};
