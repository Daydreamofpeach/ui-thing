import type {
	BuilditLog,
	CreateBuilditLogRequest,
	CreateCustomerLogRequest,
	CreateLoggerClientRequest,
	CustomerLog,
	LogFilter,
	LoggerClient,
	LogStatistics
} from "~/types/logger";
import { buttClient } from "@utils/buttClient";
import { computed, ref } from "vue";

// Global state
const customerLogs = ref<CustomerLog[]>([]);
const builditLogs = ref<BuilditLog[]>([]);
const loggerClients = ref<LoggerClient[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);

export const useLogger = () => {
	// Computed statistics
	const totalCustomerLogs = computed(() => customerLogs.value.length);
	const totalBuilditLogs = computed(() => builditLogs.value.length);
	const totalLoggerClients = computed(() => loggerClients.value.length);

	const logStatistics = computed((): LogStatistics => {
		const byLevel: Record<string, number> = {};
		const byHook: Record<string, number> = {};
		const byDate: Record<string, number> = {};

		// Process customer logs
		customerLogs.value.forEach((log) => {
			// Count by level
			byLevel[log.level] = (byLevel[log.level] || 0) + 1;
			// Count by hook
			byHook[log.hook] = (byHook[log.hook] || 0) + 1;
			// Count by date
			const date = new Date(log.timestamp).toDateString();
			byDate[date] = (byDate[date] || 0) + 1;
		});

		// Process buildit logs
		builditLogs.value.forEach((log) => {
			// Count by level
			byLevel[log.level] = (byLevel[log.level] || 0) + 1;
			// Count by date
			const date = new Date(log.timestamp).toDateString();
			byDate[date] = (byDate[date] || 0) + 1;
		});

		return {
			totalCustomerLogs: customerLogs.value.length,
			totalBuilditLogs: builditLogs.value.length,
			totalLoggerClients: loggerClients.value.length,
			byLevel,
			byHook,
			byDate
		};
	});

	// Customer Logs Actions
	const loadCustomerLogs = async (): Promise<void> => {
		loading.value = true;
		error.value = null;

		try {
			console.log("🔄 Loading customer logs...");
			const result = await buttClient.findAllCustomerLogs();
			customerLogs.value = result || [];
			console.log("✅ Customer logs loaded:", customerLogs.value.length);
		} catch (err: any) {
			error.value = err.message || "Failed to load customer logs";
			console.error("❌ Error loading customer logs:", err);
		} finally {
			loading.value = false;
		}
	};

	const createCustomerLog = async (logData: CreateCustomerLogRequest, loggerToken?: string): Promise<CustomerLog | null> => {
		loading.value = true;
		error.value = null;

		try {
			console.log("📝 Creating customer log:", logData);
			console.log("🔑 Logger token provided:", !!loggerToken);

			// If no logger token provided, try to get one from the first available logger client
			let tokenToUse = loggerToken;
			let clientToUse = null;
			if (!tokenToUse && loggerClients.value.length > 0) {
				const firstClient = loggerClients.value[0];
				if (firstClient?.token) {
					tokenToUse = firstClient.token;
					clientToUse = firstClient.id;
					console.log("🔄 Using token from first available logger client:", firstClient.name);
					console.log("🆔 Using client ID:", firstClient.id);
				}
			}

			if (!tokenToUse) {
				console.warn("⚠️ No logger token available. You may need to create a logger client first.");
			}

			// Add the required client field to the log data
			const enhancedLogData = {
				...logData,
				client: clientToUse || "unknown"
			};
			console.log("📦 Enhanced log data with client field:", enhancedLogData);

			const newLog = await buttClient.createCustomerLog(tokenToUse || "", enhancedLogData);

			if (newLog) {
				customerLogs.value.push(newLog);
				console.log("✅ Customer log created successfully");
				return newLog;
			}

			return null;
		} catch (err: any) {
			error.value = err.message || "Failed to create customer log";
			console.error("❌ Error creating customer log:", err);
			return null;
		} finally {
			loading.value = false;
		}
	};

	const getCustomerLog = async (id: string): Promise<CustomerLog | null> => {
		loading.value = true;
		error.value = null;

		try {
			console.log("🔍 Getting customer log:", id);
			const log = await buttClient.getCustomerLog(id);
			console.log("✅ Customer log retrieved successfully");
			return log;
		} catch (err: any) {
			error.value = err.message || "Failed to get customer log";
			console.error("❌ Error getting customer log:", err);
			return null;
		} finally {
			loading.value = false;
		}
	};

	const deleteCustomerLog = async (id: string): Promise<boolean> => {
		loading.value = true;
		error.value = null;

		try {
			console.log("🗑️ Deleting customer log:", id);
			await buttClient.softDeleteCustomerLog(id);

			// Remove from local state
			customerLogs.value = customerLogs.value.filter((log) => log.id !== id);
			console.log("✅ Customer log deleted successfully");
			return true;
		} catch (err: any) {
			error.value = err.message || "Failed to delete customer log";
			console.error("❌ Error deleting customer log:", err);
			return false;
		} finally {
			loading.value = false;
		}
	};

	// Buildit Logs Actions
	const loadBuilditLogs = async (): Promise<void> => {
		loading.value = true;
		error.value = null;

		try {
			console.log("🔄 Loading buildit logs...");
			const result = await buttClient.findAllLogs();
			builditLogs.value = result || [];
			console.log("✅ Buildit logs loaded:", builditLogs.value.length);
		} catch (err: any) {
			error.value = err.message || "Failed to load buildit logs";
			console.error("❌ Error loading buildit logs:", err);
		} finally {
			loading.value = false;
		}
	};

	const createBuilditLog = async (logData: CreateBuilditLogRequest): Promise<BuilditLog | null> => {
		loading.value = true;
		error.value = null;

		try {
			console.log("📝 Creating buildit log:", logData);
			const newLog = await buttClient.createLog(logData);

			if (newLog) {
				builditLogs.value.push(newLog);
				console.log("✅ Buildit log created successfully");
				return newLog;
			}

			return null;
		} catch (err: any) {
			error.value = err.message || "Failed to create buildit log";
			console.error("❌ Error creating buildit log:", err);
			return null;
		} finally {
			loading.value = false;
		}
	};

	const getBuilditLog = async (id: string): Promise<BuilditLog | null> => {
		loading.value = true;
		error.value = null;

		try {
			console.log("🔍 Getting buildit log:", id);
			const log = await buttClient.getLog(id);
			console.log("✅ Buildit log retrieved successfully");
			return log;
		} catch (err: any) {
			error.value = err.message || "Failed to get buildit log";
			console.error("❌ Error getting buildit log:", err);
			return null;
		} finally {
			loading.value = false;
		}
	};

	const deleteBuilditLog = async (id: string): Promise<boolean> => {
		loading.value = true;
		error.value = null;

		try {
			console.log("🗑️ Deleting buildit log:", id);
			await buttClient.softDeleteLog(id);

			// Remove from local state
			builditLogs.value = builditLogs.value.filter((log) => log.id !== id);
			console.log("✅ Buildit log deleted successfully");
			return true;
		} catch (err: any) {
			error.value = err.message || "Failed to delete buildit log";
			console.error("❌ Error deleting buildit log:", err);
			return false;
		} finally {
			loading.value = false;
		}
	};

	// Logger Clients Actions
	const loadLoggerClients = async (): Promise<void> => {
		loading.value = true;
		error.value = null;

		try {
			console.log("🔄 Loading logger clients...");
			const result = await buttClient.getAllLoggerClients();
			loggerClients.value = result || [];
			console.log("✅ Logger clients loaded:", loggerClients.value.length);
		} catch (err: any) {
			error.value = err.message || "Failed to load logger clients";
			console.error("❌ Error loading logger clients:", err);
		} finally {
			loading.value = false;
		}
	};

	const createLoggerClient = async (clientData: CreateLoggerClientRequest): Promise<LoggerClient | null> => {
		loading.value = true;
		error.value = null;

		try {
			console.log("📝 Creating logger client:", clientData);
			const newClient = await buttClient.addLoggerClient(clientData);

			if (newClient) {
				loggerClients.value.push(newClient);
				console.log("✅ Logger client created successfully");
				return newClient;
			}

			return null;
		} catch (err: any) {
			error.value = err.message || "Failed to create logger client";
			console.error("❌ Error creating logger client:", err);
			return null;
		} finally {
			loading.value = false;
		}
	};

	const getLoggerClient = async (id: string): Promise<LoggerClient | null> => {
		loading.value = true;
		error.value = null;

		try {
			console.log("🔍 Getting logger client:", id);
			const client = await buttClient.getLoggerClient(id);
			console.log("✅ Logger client retrieved successfully");
			return client;
		} catch (err: any) {
			error.value = err.message || "Failed to get logger client";
			console.error("❌ Error getting logger client:", err);
			return null;
		} finally {
			loading.value = false;
		}
	};

	const deleteLoggerClient = async (id: string): Promise<boolean> => {
		loading.value = true;
		error.value = null;

		try {
			console.log("🗑️ Deleting logger client:", id);
			await buttClient.removeLoggerClient(id);

			// Remove from local state
			loggerClients.value = loggerClients.value.filter((client) => client.id !== id);
			console.log("✅ Logger client deleted successfully");
			return true;
		} catch (err: any) {
			error.value = err.message || "Failed to delete logger client";
			console.error("❌ Error deleting logger client:", err);
			return false;
		} finally {
			loading.value = false;
		}
	};

	// Filter functions
	const filterCustomerLogs = (filter: LogFilter): CustomerLog[] => {
		return customerLogs.value.filter((log) => {
			if (filter.level && log.level !== filter.level) return false;
			if (filter.hook && log.hook !== filter.hook) return false;
			if (filter.startDate && new Date(log.timestamp) < new Date(filter.startDate)) return false;
			if (filter.endDate && new Date(log.timestamp) > new Date(filter.endDate)) return false;
			return true;
		});
	};

	const filterBuilditLogs = (filter: LogFilter): BuilditLog[] => {
		return builditLogs.value.filter((log) => {
			if (filter.level && log.level !== filter.level) return false;
			if (filter.startDate && new Date(log.timestamp) < new Date(filter.startDate)) return false;
			if (filter.endDate && new Date(log.timestamp) > new Date(filter.endDate)) return false;
			return true;
		});
	};

	// Helper functions
	const formatLogLevel = (level: string): string => {
		return level.toUpperCase();
	};

	const formatLogTimestamp = (timestamp: string): string => {
		return new Date(timestamp).toLocaleString();
	};

	const getLogLevelColor = (level: string): string => {
		switch (level.toLowerCase()) {
			case "debug": return "gray";
			case "info": return "blue";
			case "warn": return "yellow";
			case "error": return "red";
			case "fatal": return "red";
			default: return "gray";
		}
	};

	// Initialize data on first use
	const initializeData = async () => {
		if (customerLogs.value.length === 0 && builditLogs.value.length === 0 && loggerClients.value.length === 0) {
			await Promise.all([
				loadCustomerLogs(),
				loadBuilditLogs(),
				loadLoggerClients()
			]);
		}
	};

	return {
		// State
		customerLogs: computed(() => customerLogs.value),
		builditLogs: computed(() => builditLogs.value),
		loggerClients: computed(() => loggerClients.value),
		loading: computed(() => loading.value),
		error: computed(() => error.value),

		// Statistics
		totalCustomerLogs,
		totalBuilditLogs,
		totalLoggerClients,
		logStatistics,

		// Customer Logs Actions
		loadCustomerLogs,
		createCustomerLog,
		getCustomerLog,
		deleteCustomerLog,

		// Buildit Logs Actions
		loadBuilditLogs,
		createBuilditLog,
		getBuilditLog,
		deleteBuilditLog,

		// Logger Clients Actions
		loadLoggerClients,
		createLoggerClient,
		getLoggerClient,
		deleteLoggerClient,

		// Filters
		filterCustomerLogs,
		filterBuilditLogs,

		// Helpers
		formatLogLevel,
		formatLogTimestamp,
		getLogLevelColor,
		initializeData
	};
};
