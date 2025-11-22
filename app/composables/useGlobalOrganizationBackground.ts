import { ref } from "vue";

// Global state for organization background
const globalBackgroundRef = ref<{ updateBackground: (data: any) => void } | null>(null);

// Set the global background component reference
export function setGlobalBackgroundRef(ref: { updateBackground: (data: any) => void } | null) {
	globalBackgroundRef.value = ref;
}

// Update the global background
export function updateGlobalBackground(pageBackgroundData: any) {
	if (globalBackgroundRef.value) {
		globalBackgroundRef.value.updateBackground(pageBackgroundData);
	}
}

// Get the current global background reference
export function getGlobalBackgroundRef() {
	return globalBackgroundRef.value;
}
