import type { OscarEnvironmentStatus, OscarMessage, OscarProjectConfig, OscarProjectScripts, OscarState } from "../types/oscar.types";
import { computed, nextTick, ref } from "vue";

function _createOscarState() {
	// Core state
	const isProcessing = ref(false);
	const userInput = ref("");
	const messages = ref<OscarMessage[]>([]);

	// Active organisation filter (quick workaround)
	const activeOrganisationId = ref<string | null>(null);

	// Project configuration
	const currentConfig = ref<OscarProjectConfig>({
		workDir: "",
		projectName: "",
		packageManager: "npm",
		framework: "",
		hasMonorepo: false
	});

	// Environment status
	const environmentStatus = ref<OscarEnvironmentStatus>({
		node: { installed: false, version: "" },
		npm: { installed: false, version: "" },
		git: null,
		builditCli: { installed: false, version: "" },
		packageManager: "npm",
		ready: false
	});

	// Project scripts
	const detectedProjectScripts = ref<OscarProjectScripts | null>(null);
	const scriptsLoading = ref(false);

	// Chat container ref for auto-scrolling
	const chatContainer = ref<HTMLElement>();

	// Computed state
	const state = computed<OscarState>(() => ({
		isProcessing: isProcessing.value,
		userInput: userInput.value,
		messages: messages.value,
		currentConfig: currentConfig.value,
		environmentStatus: environmentStatus.value,
		detectedProjectScripts: detectedProjectScripts.value,
		scriptsLoading: scriptsLoading.value
	}));

	const hasProject = computed(() => !!currentConfig.value.workDir);
	const isReady = computed(() => environmentStatus.value.ready);

	// Helper functions
	const addMessage = (type: "user" | "assistant", content: string, options: Partial<OscarMessage> = {}) => {
		const message: OscarMessage = {
			id: Date.now().toString(),
			type,
			role: type, // Set role to match type
			content,
			timestamp: Date.now(),
			organisationId: activeOrganisationId.value || undefined,
			...options
		};
		messages.value.push(message);

		// Auto-scroll to bottom
		nextTick(() => {
			if (chatContainer.value) {
				chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
			}
		});
	};

	const clearMessages = () => {
		messages.value = [];
	};

	const updateConfig = (updates: Partial<OscarProjectConfig>) => {
		currentConfig.value = { ...currentConfig.value, ...updates };
	};

	const updateEnvironmentStatus = (updates: Partial<OscarEnvironmentStatus>) => {
		environmentStatus.value = { ...environmentStatus.value, ...updates };
	};

	const setProjectScripts = (scripts: OscarProjectScripts | null) => {
		detectedProjectScripts.value = scripts;
	};

	const setScriptsLoading = (loading: boolean) => {
		scriptsLoading.value = loading;
	};

	const setProcessing = (processing: boolean) => {
		isProcessing.value = processing;
	};

	// Quick org switch workaround: set active org and clear chat
	const setActiveOrganisation = (orgId: string | null) => {
		activeOrganisationId.value = orgId;
		clearMessages();
	};

	return {
		// State
		state,
		isProcessing,
		userInput,
		messages,
		currentConfig,
		environmentStatus,
		detectedProjectScripts,
		scriptsLoading,
		chatContainer,
		activeOrganisationId,

		// Computed
		hasProject,
		isReady,

		// Actions
		addMessage,
		clearMessages,
		updateConfig,
		updateEnvironmentStatus,
		setProjectScripts,
		setScriptsLoading,
		setProcessing,
		setActiveOrganisation
	};
}

let __oscarStore: ReturnType<typeof _createOscarState> | null = null;

export function useOscarState() {
	if (!__oscarStore) {
		__oscarStore = _createOscarState();
	}
	return __oscarStore;
}

