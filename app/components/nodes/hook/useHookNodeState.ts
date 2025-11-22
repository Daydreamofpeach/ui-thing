import type { Ref } from "vue";
import { computed, ref } from "vue";

export interface HookNodeData {
	id: string
	type: string
	name: string
	description?: string
	hookType: string
	eventName: string
}

export function useHookNodeState(nodeData: Ref<HookNodeData | undefined>) {
	// Internal state
	const status = ref<"idle" | "running" | "success" | "error" | "warning">("idle");

	// Theme configuration for hook nodes
	const theme = {
		backgroundColor: "black",
		borderColor: "rgba(234, 179, 8, 0.3)",
		headerColor: "transparent",
		themeColor: "#eab308",
		iconImage: "/hookIcon.png",
		iconClass: "",
		titleClass: "",
		statusColor: "#eab308"
	};

	// Computed values
	const displayName = computed(() => nodeData.value?.name || "Hook Node");
	const displayHookType = computed(() => nodeData.value?.hookType || "before");
	const displayEventName = computed(() => nodeData.value?.eventName || "No event");

	// State management methods
	const setStatus = (newStatus: typeof status.value) => {
		status.value = newStatus;
	};

	const resetStatus = () => {
		status.value = "idle";
	};

	return {
		// State
		status,
		theme,

		// Computed
		displayName,
		displayHookType,
		displayEventName,

		// Methods
		setStatus,
		resetStatus
	};
}

