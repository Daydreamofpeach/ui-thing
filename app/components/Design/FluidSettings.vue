<template>
	<UModal :model-value="true" @update:model-value="close">
		<UCard>
			<template #header>
				<div class="flex items-center justify-between">
					<h3 class="text-lg font-semibold">
						Fluid Cursor Settings
					</h3>
					<UButton
						color="neutral"
						variant="ghost"
						icon="i-heroicons-x-mark"
						@click="close"
					/>
				</div>
			</template>

			<div class="space-y-4">
				<UFormGroup label="Simulation Resolution">
					<UInput v-model="localSettings.SIM_RESOLUTION" type="number" />
				</UFormGroup>

				<UFormGroup label="Dye Resolution">
					<UInput v-model="localSettings.DYE_RESOLUTION" type="number" />
				</UFormGroup>

				<UFormGroup label="Density Dissipation">
					<UInput v-model="localSettings.DENSITY_DISSIPATION" type="number" step="0.1" />
				</UFormGroup>

				<UFormGroup label="Velocity Dissipation">
					<UInput v-model="localSettings.VELOCITY_DISSIPATION" type="number" step="0.1" />
				</UFormGroup>

				<UFormGroup label="Pressure">
					<UInput v-model="localSettings.PRESSURE" type="number" step="0.1" />
				</UFormGroup>

				<UFormGroup label="Pressure Iterations">
					<UInput v-model="localSettings.PRESSURE_ITERATIONS" type="number" />
				</UFormGroup>

				<UFormGroup label="Curl">
					<UInput v-model="localSettings.CURL" type="number" step="0.1" />
				</UFormGroup>

				<UFormGroup label="Splat Radius">
					<UInput v-model="localSettings.SPLAT_RADIUS" type="number" step="0.1" />
				</UFormGroup>

				<UFormGroup label="Splat Force">
					<UInput v-model="localSettings.SPLAT_FORCE" type="number" />
				</UFormGroup>

				<UFormGroup label="Shading">
					<UToggle v-model="localSettings.SHADING" />
				</UFormGroup>

				<UFormGroup label="Color Update Speed">
					<UInput v-model="localSettings.COLOR_UPDATE_SPEED" type="number" step="0.1" />
				</UFormGroup>
			</div>

			<template #footer>
				<div class="flex justify-end gap-2">
					<UButton
						color="neutral"
						variant="ghost"
						@click="resetSettings"
					>
						Reset
					</UButton>
					<UButton
						color="primary"
						@click="applySettings"
					>
						Apply
					</UButton>
				</div>
			</template>
		</UCard>
	</UModal>
</template>

<script setup lang="ts">
	interface FluidSettings {
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
	}

	const props = defineProps<{
		settings: FluidSettings
	}>();

	const emit = defineEmits<{
		"update:settings": [settings: FluidSettings]
		close: []
	}>();

	const localSettings = ref<FluidSettings>({ ...props.settings });

	const defaultSettings: FluidSettings = {
		SIM_RESOLUTION: 128,
		DYE_RESOLUTION: 512,
		DENSITY_DISSIPATION: 0.5,
		VELOCITY_DISSIPATION: 0.2,
		PRESSURE: 6.9,
		PRESSURE_ITERATIONS: 20,
		CURL: 9,
		SPLAT_RADIUS: 0.8,
		SPLAT_FORCE: 2200,
		SHADING: true,
		COLOR_UPDATE_SPEED: 0
	};

	function resetSettings() {
		localSettings.value = { ...defaultSettings };
	}

	function applySettings() {
		emit("update:settings", { ...localSettings.value });
		close();
	}

	function close() {
		emit("close");
	}

	// Update local settings when props change
	watch(() => props.settings, (newSettings) => {
		localSettings.value = { ...newSettings };
	}, { deep: true });
</script>
