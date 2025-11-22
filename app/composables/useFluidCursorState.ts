import { ref } from "vue";
import useFluidCursor from "~/components/Design/FluidCursor.js";
import { useFluidSettings } from "./useFluidSettings";

export function useFluidCursorState() {
	const isFluidEnabled = ref(true);
	const fluidCursor = ref<{ togglePause: () => void, updateSettings: (settings: any) => void } | null>(null);
	const { fluidSettings, updateSettings } = useFluidSettings();

	function toggleFluid() {
		isFluidEnabled.value = !isFluidEnabled.value;
		if (fluidCursor.value) {
			fluidCursor.value.togglePause();
			// Update the settings to reflect the paused state
			const newSettings = {
				...fluidSettings.value,
				PAUSED: !isFluidEnabled.value
			};
			updateSettings(newSettings);
		}
	}

	function initializeFluidCursor() {
		const cursor = useFluidCursor();
		if (cursor) {
			fluidCursor.value = cursor;
		}
	}

	return {
		isFluidEnabled,
		fluidCursor,
		toggleFluid,
		initializeFluidCursor,
		fluidSettings,
		updateSettings
	};
}
