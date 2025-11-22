import { ref, watch } from "vue";

export interface FluidSettings {
	SIM_RESOLUTION: number
	DYE_RESOLUTION: number
	DENSITY_DISSIPATION: number
	VELOCITY_DISSIPATION: number
	PRESSURE: number
	PRESSURE_ITERATIONS: number
	CURL: number
	SPLAT_RADIUS: number
	SPLAT_FORCE: number
	SHADING: boolean
	COLOR_UPDATE_SPEED: number
	FLUID_COLOR: string
	RANDOMIZE_COLOR_ON_CLICK: boolean
	// New filter properties
	OPACITY: number
	BRIGHTNESS: number
	GRAYSCALE: number
	SATURATION: number
	CONTRAST: number
	BLUR: number
}

const defaultFluidSettings: FluidSettings = {
	SIM_RESOLUTION: 128,
	DYE_RESOLUTION: 512,
	DENSITY_DISSIPATION: 0.5,
	VELOCITY_DISSIPATION: 0.2,
	PRESSURE: 0.1,
	PRESSURE_ITERATIONS: 20,
	CURL: 39,
	SPLAT_RADIUS: 0.1,
	SPLAT_FORCE: 2200,
	SHADING: true,
	COLOR_UPDATE_SPEED: 1,
	FLUID_COLOR: "#FFA500",
	RANDOMIZE_COLOR_ON_CLICK: true,
	// Default filter values
	OPACITY: 100,
	BRIGHTNESS: 100,
	GRAYSCALE: 0,
	SATURATION: 100,
	CONTRAST: 100,
	BLUR: 0
};

// Load saved settings from localStorage or use defaults
const fluidSettings = ref<FluidSettings>(
	JSON.parse(localStorage.getItem("fluidCursorSettings") || JSON.stringify(defaultFluidSettings))
);

// Watch for changes and save to localStorage
watch(
	fluidSettings,
	(newSettings) => {
		localStorage.setItem("fluidCursorSettings", JSON.stringify(newSettings));
	},
	{ deep: true }
);

export function useFluidSettings() {
	function updateSettings(newSettings: Partial<FluidSettings>) {
		fluidSettings.value = { ...fluidSettings.value, ...newSettings };
	}

	function resetSettings() {
		fluidSettings.value = { ...defaultFluidSettings };
	}

	return {
		fluidSettings,
		updateSettings,
		resetSettings,
		defaultFluidSettings
	};
}
