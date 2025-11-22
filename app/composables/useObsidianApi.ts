import type {
	ObsidianCommandsResponse,
	ObsidianConfig,
	ObsidianSearchResponse,
	PeriodicNotePeriod,
	SearchRequest,
	SimpleSearchRequest,
	VaultListItem,
	VaultListResponse
} from "../types/obsidian";
import { useObsidianStorage } from "./useObsidianStorage";

export class ObsidianApiError extends Error {
	constructor(message: string, public status?: number, public response?: any) {
		super(message);
		this.name = "ObsidianApiError";
	}
}

export const useObsidianApi = () => {
	// Import the storage composable
	const { loadActiveConnection, saveConnection, hasStoredConnection } = useObsidianStorage();
	const makeRequest = async <T>(
		config: ObsidianConfig,
		endpoint: string,
		options: RequestInit = {},
		contentType: string = "application/json"
	): Promise<T> => {
		// Ensure base URL doesn't have trailing slash and endpoint starts with slash
		const baseUrl = config.baseUrl.endsWith("/") ? config.baseUrl.slice(0, -1) : config.baseUrl;
		const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
		const url = `${baseUrl}${cleanEndpoint}`;

		console.log("makeRequest called with URL:", url);
		console.log("makeRequest endpoint:", endpoint);
		console.log("makeRequest config:", config);
		console.log("Base URL:", baseUrl);
		console.log("Clean endpoint:", cleanEndpoint);

		const headers: HeadersInit = {
			Authorization: `Bearer ${config.apiKey}`,
			...options.headers
		};

		// Only add Content-Type if it's not empty
		if (contentType) {
			(headers as Record<string, string>)["Content-Type"] = contentType;
		}

		console.log("Headers being sent:", headers);

		try {
			let response: Response;

			// Check if we're in Tauri environment
			if (typeof window !== "undefined" && (window as any).__TAURI__) {
				try {
					// Use Tauri's HTTP plugin for better security and certificate handling
					const { fetch: tauriFetch } = await import("@tauri-apps/plugin-http");
					response = await tauriFetch(url, {
						...options,
						headers,
						// Allow invalid certificates for local development
						connectTimeout: config.timeout || 10000,
					});
				} catch (tauriError: any) {
					console.log("Tauri fetch error:", tauriError);
					// Fallback to regular fetch if Tauri fetch fails
					response = await fetch(url, {
						...options,
						headers
					});
				}
			} else {
				// Fallback to browser fetch with certificate handling
				try {
					const fetchOptions = {
						...options,
						headers
					};
					console.log("Fetch options:", fetchOptions);
					response = await fetch(url, fetchOptions);
				} catch (fetchError: any) {
					console.log("Fetch error:", fetchError.message);

					// If it's a certificate error, provide a helpful message
					if (fetchError.message?.includes("certificate")
						|| fetchError.message?.includes("SSL")
						|| fetchError.message?.includes("CERT_AUTHORITY_INVALID")
						|| fetchError.message?.includes("ERR_CERT_AUTHORITY_INVALID")
						|| fetchError.message?.includes("net::ERR_CERT")) {
						throw new ObsidianApiError(
							`CERTIFICATE_ERROR:${config.baseUrl}`,
							0,
							fetchError
						);
					}

					// If it's a connection refused error, provide helpful guidance
					if (fetchError.message?.includes("ECONNREFUSED")
						|| fetchError.message?.includes("ERR_CONNECTION_REFUSED")) {
						throw new ObsidianApiError(
							`Connection refused. Please ensure:\n1. Obsidian is running\n2. Local REST API plugin is enabled\n3. The server URL is correct (${config.baseUrl})`,
							0,
							fetchError
						);
					}

					// If it's an invalid HTTP response, it might be because we're using HTTP instead of HTTPS
					if (fetchError.message?.includes("ERR_INVALID_HTTP_RESPONSE")) {
						throw new ObsidianApiError(
							`Invalid HTTP response. Please ensure you're using the correct protocol (HTTP or HTTPS) and that the Obsidian Local REST API plugin is running.`,
							0,
							fetchError
						);
					}

					// Network errors
					if (fetchError.message?.includes("Failed to fetch") || 
						fetchError.message?.includes("NetworkError")) {
						throw new ObsidianApiError(
							`Network error. Please check:\n1. Obsidian is running\n2. Local REST API plugin is enabled and started\n3. Your firewall isn't blocking the connection\n4. The URL ${config.baseUrl} is accessible`,
							0,
							fetchError
						);
					}

					throw fetchError;
				}
			}

			if (!response.ok) {
				const errorText = await response.text().catch(() => "Unknown error");
				throw new ObsidianApiError(
					`HTTP ${response.status}: ${errorText}`,
					response.status,
					errorText
				);
			}

			// Handle empty responses
			const contentType = response.headers.get("content-type");
			console.log("Response content-type:", contentType);
			console.log("Response status:", response.status);
			console.log("Response ok:", response.ok);

			if (contentType && contentType.includes("application/json")) {
				const jsonResult = await response.json();
				console.log("JSON response:", jsonResult);
				return jsonResult;
			} else {
				const textResult = await response.text();
				console.log("Text response:", textResult);
				return textResult as unknown as T;
			}
		} catch (error) {
			if (error instanceof ObsidianApiError) {
				throw error;
			}

			// Handle network errors
			throw new ObsidianApiError(
				`Network error: ${error instanceof Error ? error.message : "Unknown error"}`,
				0,
				error
			);
		}
	};

	// Connection test
	const testConnection = async (config: ObsidianConfig): Promise<boolean> => {
		try {
			console.log("Testing connection to:", config.baseUrl);
			// Try to get vault root to test connection - use simple GET request
			const result = await makeRequest<any>(config, "/vault/", { 
				method: "GET",
				// Add timeout to the request
				signal: AbortSignal.timeout(config.timeout || 5000)
			}, "");
			console.log("Connection test successful:", result);
			return true;
		} catch (error) {
			console.error("Connection test failed:", error);
			// Re-throw the error with more context
			throw new ObsidianApiError(
				error instanceof ObsidianApiError ? error.message : `Connection test failed: ${error instanceof Error ? error.message : "Unknown error"}`
			);
		}
	};

	// Active File Operations
	const getActiveFile = async (config: ObsidianConfig): Promise<string> => {
		return await makeRequest<string>(config, "/active/");
	};

	const updateActiveFile = async (config: ObsidianConfig, content: string): Promise<void> => {
		await makeRequest(config, "/active/", {
			method: "PUT",
			body: content
		}, "text/markdown");
	};

	const appendToActiveFile = async (config: ObsidianConfig, content: string): Promise<void> => {
		await makeRequest(config, "/active/", {
			method: "POST",
			body: content
		}, "text/markdown");
	};

	const patchActiveFile = async (config: ObsidianConfig, content: string): Promise<void> => {
		await makeRequest(config, "/active/", {
			method: "PATCH",
			body: content
		}, "text/markdown");
	};

	const deleteActiveFile = async (config: ObsidianConfig): Promise<void> => {
		await makeRequest(config, "/active/", {
			method: "DELETE"
		});
	};

	// Vault File Operations
	const getVaultFile = async (config: ObsidianConfig, filename: string): Promise<string> => {
		return await makeRequest<string>(config, `/vault/${encodeURIComponent(filename)}`);
	};

	const createVaultFile = async (config: ObsidianConfig, filename: string, content: string): Promise<void> => {
		await makeRequest(config, `/vault/${encodeURIComponent(filename)}`, {
			method: "PUT",
			body: content
		}, "text/markdown");
	};

	const updateVaultFile = async (config: ObsidianConfig, filename: string, content: string): Promise<void> => {
		await makeRequest(config, `/vault/${encodeURIComponent(filename)}`, {
			method: "PUT",
			body: content
		}, "text/markdown");
	};

	const appendToVaultFile = async (config: ObsidianConfig, filename: string, content: string): Promise<void> => {
		await makeRequest(config, `/vault/${encodeURIComponent(filename)}`, {
			method: "POST",
			body: content
		}, "text/markdown");
	};

	const patchVaultFile = async (config: ObsidianConfig, filename: string, content: string): Promise<void> => {
		await makeRequest(config, `/vault/${encodeURIComponent(filename)}`, {
			method: "PATCH",
			body: content
		}, "text/markdown");
	};

	const deleteVaultFile = async (config: ObsidianConfig, filename: string): Promise<void> => {
		await makeRequest(config, `/vault/${encodeURIComponent(filename)}`, {
			method: "DELETE"
		});
	};

	const listVaultDirectory = async (config: ObsidianConfig, path: string = ""): Promise<VaultListItem[]> => {
		const endpoint = path ? `/vault/${encodeURIComponent(path)}/` : "/vault/";
		console.log("listVaultDirectory called with endpoint:", endpoint);
		console.log("Config:", config);

		try {
			const result = await makeRequest<VaultListItem[]>(config, endpoint);
			console.log("listVaultDirectory result:", result);
			return result;
		} catch (error) {
			console.error("listVaultDirectory error:", error);
			throw error;
		}
	};

	// Search Operations
	const searchVault = async (config: ObsidianConfig, searchRequest: SearchRequest): Promise<ObsidianSearchResponse> => {
		return await makeRequest<ObsidianSearchResponse>(config, "/search/", {
			method: "POST",
			body: JSON.stringify(searchRequest)
		});
	};

	const simpleSearch = async (config: ObsidianConfig, searchRequest: SimpleSearchRequest): Promise<ObsidianSearchResponse> => {
		return await makeRequest<ObsidianSearchResponse>(config, "/search/simple/", {
			method: "POST",
			body: JSON.stringify(searchRequest)
		});
	};

	// Commands
	const getCommands = async (config: ObsidianConfig): Promise<ObsidianCommandsResponse> => {
		return await makeRequest<ObsidianCommandsResponse>(config, "/commands/");
	};

	const executeCommand = async (config: ObsidianConfig, commandId: string): Promise<void> => {
		await makeRequest(config, `/commands/${encodeURIComponent(commandId)}/`, {
			method: "POST"
		});
	};

	// Open file
	const openFile = async (config: ObsidianConfig, filename: string): Promise<void> => {
		await makeRequest(config, `/open/${encodeURIComponent(filename)}`, {
			method: "POST"
		});
	};

	// Periodic Notes
	const getPeriodicNote = async (
		config: ObsidianConfig,
		period: PeriodicNotePeriod,
		year?: number,
		month?: number,
		day?: number
	): Promise<string> => {
		let endpoint = `/periodic/${period}/`;
		if (year && month && day) {
			endpoint = `/periodic/${period}/${year}/${month}/${day}/`;
		}
		return await makeRequest<string>(config, endpoint);
	};

	const updatePeriodicNote = async (
		config: ObsidianConfig,
		period: PeriodicNotePeriod,
		content: string,
		year?: number,
		month?: number,
		day?: number
	): Promise<void> => {
		let endpoint = `/periodic/${period}/`;
		if (year && month && day) {
			endpoint = `/periodic/${period}/${year}/${month}/${day}/`;
		}
		await makeRequest(config, endpoint, {
			method: "PUT",
			body: JSON.stringify({ content })
		});
	};

	const appendToPeriodicNote = async (
		config: ObsidianConfig,
		period: PeriodicNotePeriod,
		content: string,
		year?: number,
		month?: number,
		day?: number
	): Promise<void> => {
		let endpoint = `/periodic/${period}/`;
		if (year && month && day) {
			endpoint = `/periodic/${period}/${year}/${month}/${day}/`;
		}
		await makeRequest(config, endpoint, {
			method: "POST",
			body: JSON.stringify({ content })
		});
	};

	const patchPeriodicNote = async (
		config: ObsidianConfig,
		period: PeriodicNotePeriod,
		content: string,
		year?: number,
		month?: number,
		day?: number
	): Promise<void> => {
		let endpoint = `/periodic/${period}/`;
		if (year && month && day) {
			endpoint = `/periodic/${period}/${year}/${month}/${day}/`;
		}
		await makeRequest(config, endpoint, {
			method: "PATCH",
			body: JSON.stringify({ content })
		});
	};

	const deletePeriodicNote = async (
		config: ObsidianConfig,
		period: PeriodicNotePeriod,
		year?: number,
		month?: number,
		day?: number
	): Promise<void> => {
		let endpoint = `/periodic/${period}/`;
		if (year && month && day) {
			endpoint = `/periodic/${period}/${year}/${month}/${day}/`;
		}
		await makeRequest(config, endpoint, {
			method: "DELETE"
		});
	};

	// Storage integration methods
	const connectWithStorage = async (config: ObsidianConfig, connectionName?: string): Promise<boolean> => {
		try {
			// Test the connection first
			const isConnected = await testConnection(config);
			if (isConnected) {
				// Save the connection to storage
				const saved = await saveConnection(config, connectionName);
				return saved;
			}
			return false;
		} catch (error) {
			console.error("Failed to connect with storage:", error);
			return false;
		}
	};

	const loadStoredConnection = async (): Promise<ObsidianConfig | null> => {
		return await loadActiveConnection();
	};

	const hasStoredConnectionData = async (): Promise<boolean> => {
		return await hasStoredConnection();
	};

	return {
		testConnection,
		// Active File
		getActiveFile,
		updateActiveFile,
		appendToActiveFile,
		patchActiveFile,
		deleteActiveFile,
		// Vault Files
		getVaultFile,
		createVaultFile,
		updateVaultFile,
		appendToVaultFile,
		patchVaultFile,
		deleteVaultFile,
		listVaultDirectory,
		// Search
		searchVault,
		simpleSearch,
		// Commands
		getCommands,
		executeCommand,
		// Open
		openFile,
		// Periodic Notes
		getPeriodicNote,
		updatePeriodicNote,
		appendToPeriodicNote,
		patchPeriodicNote,
		deletePeriodicNote,
		// Storage Integration
		connectWithStorage,
		loadStoredConnection,
		hasStoredConnectionData
	};
};
