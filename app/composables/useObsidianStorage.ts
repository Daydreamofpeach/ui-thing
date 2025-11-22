import type { ObsidianConfig } from "../types/obsidian";

interface StoredConnection {
	config: ObsidianConfig;
	lastConnected: string;
	isActive: boolean;
	connectionName?: string;
}

export const useObsidianStorage = () => {
	const isLoading = ref(false);
	const error = ref<string | null>(null);

	// Save connection configuration
	const saveConnection = async (
		config: ObsidianConfig,
		connectionName?: string
	): Promise<boolean> => {
		try {
			isLoading.value = true;
			error.value = null;

			const connection: StoredConnection = {
				config,
				lastConnected: new Date().toISOString(),
				isActive: true,
				connectionName: connectionName || "Default Connection"
			};

			// Store the connection with a unique key
			const connectionKey = `connection_${Date.now()}`;
			console.log("Saving connection with key:", connectionKey);

			// Use localStorage as fallback
			localStorage.setItem(connectionKey, JSON.stringify(connection));
			localStorage.setItem("active_connection", connectionKey);

			console.log("Connection saved successfully:", connectionKey);
			return true;
		} catch (err) {
			console.error("Failed to save connection:", err);
			error.value = err instanceof Error ? err.message : "Failed to save connection";
			return false;
		} finally {
			isLoading.value = false;
		}
	};

	// Load the active connection
	const loadActiveConnection = async (): Promise<ObsidianConfig | null> => {
		try {
			isLoading.value = true;
			error.value = null;

			// Get the active connection key
			const activeKey = localStorage.getItem("active_connection");
			if (!activeKey) {
				console.log("No active connection found");
				return null;
			}

			// Get the connection data
			const connectionData = localStorage.getItem(activeKey);
			if (!connectionData) {
				console.log("Active connection data not found");
				return null;
			}

			const connection: StoredConnection = JSON.parse(connectionData);
			
			// Update last connected time
			connection.lastConnected = new Date().toISOString();
			localStorage.setItem(activeKey, JSON.stringify(connection));

			console.log("Active connection loaded:", connection.config.baseUrl);
			return connection.config;
		} catch (err) {
			console.error("Failed to load active connection:", err);
			error.value = err instanceof Error ? err.message : "Failed to load connection";
			return null;
		} finally {
			isLoading.value = false;
		}
	};

	// Check if there's a stored connection
	const hasStoredConnection = async (): Promise<boolean> => {
		try {
			const activeKey = localStorage.getItem("active_connection");
			if (!activeKey) {
				return false;
			}

			const connectionData = localStorage.getItem(activeKey);
			return !!connectionData;
		} catch (err) {
			console.error("Failed to check stored connection:", err);
			return false;
		}
	};

	// Get connection info (for display purposes)
	const getConnectionInfo = async (): Promise<{ name: string; baseUrl: string; lastConnected: string } | null> => {
		try {
			const config = await loadActiveConnection();
			if (!config) {
				return null;
			}

			const activeKey = localStorage.getItem("active_connection");
			if (!activeKey) {
				return null;
			}
			const connectionData = localStorage.getItem(activeKey);
			if (!connectionData) {
				return null;
			}
			const connection: StoredConnection = JSON.parse(connectionData);

			return {
				name: connection.connectionName || "Default Connection",
				baseUrl: config.baseUrl,
				lastConnected: connection.lastConnected
			};
		} catch (err) {
			console.error("Failed to get connection info:", err);
			return null;
		}
	};

	return {
		// State
		isLoading: readonly(isLoading),
		error: readonly(error),

		// Methods
		saveConnection,
		loadActiveConnection,
		hasStoredConnection,
		getConnectionInfo
	};
}; 