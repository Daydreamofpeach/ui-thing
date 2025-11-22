<template>
	<USlideover v-model:open="isOpen" title="Fluid Cursor Settings" :ui="{ footer: 'justify-end' }">
		<template #body>
			<div class="p-4 space-y-6">
				<!-- Presets Section -->
				<div>
					<div class="flex items-center justify-between mb-4">
						<h3 class="text-lg font-medium">
							Saved Presets
						</h3>
						<UButton
							color="primary"
							variant="ghost"
							icon="i-heroicons-plus"
							@click="showSavePresetModal = true"
						>
							Save Current
						</UButton>
					</div>
					<div class="grid grid-cols-2 gap-2">
						<UCard
							v-for="(preset, index) in presets"
							:key="index"
							class="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
							@click="applyPreset(preset)"
						>
							<div class="flex items-center justify-between">
								<div>
									<h4 class="font-medium">
										{{ preset.name }}
									</h4>
									<p class="text-sm text-gray-500">
										{{ formatPresetDate(preset.timestamp) }}
									</p>
								</div>
								<UButton
									color="error"
									variant="ghost"
									icon="i-heroicons-trash"
									@click.stop="showDeleteConfirmModal(index)"
								/>
							</div>
						</UCard>
					</div>
				</div>

				<UDivider />

				<!-- Settings Section -->
				<div>
					<h3 class="text-lg font-medium mb-4">
						Settings
					</h3>
					<form class="space-y-4" @submit.prevent="applySettings">
						<div>
							<label class="block text-gray-700 dark:text-gray-200 mb-2">Fluid Color</label>
							<div class="flex gap-2 items-center">
								<input
									v-model="localSettings.FLUID_COLOR"
									type="color"
									class="w-12 h-12 rounded cursor-pointer"
									:disabled="localSettings.RANDOMIZE_COLOR_ON_CLICK"
									:class="{ 'opacity-50 cursor-not-allowed': localSettings.RANDOMIZE_COLOR_ON_CLICK }"
								>
								<input
									v-model="localSettings.FLUID_COLOR"
									type="text"
									class="flex-1 px-4 py-2 rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:border-orange-500 outline-none"
									:disabled="localSettings.RANDOMIZE_COLOR_ON_CLICK"
									:class="{ 'opacity-50 cursor-not-allowed': localSettings.RANDOMIZE_COLOR_ON_CLICK }"
									placeholder="#FF0000"
								>
							</div>
						</div>

						<div>
							<label class="block text-gray-700 dark:text-gray-200 mb-2">Simulation Resolution</label>
							<input
								v-model="localSettings.SIM_RESOLUTION"
								type="number"
								class="w-full px-4 py-2 rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:border-orange-500 outline-none"
							>
						</div>

						<div>
							<label class="block text-gray-700 dark:text-gray-200 mb-2">Dye Resolution</label>
							<input
								v-model="localSettings.DYE_RESOLUTION"
								type="number"
								class="w-full px-4 py-2 rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:border-orange-500 outline-none"
							>
						</div>

						<div>
							<label class="block text-gray-700 dark:text-gray-200 mb-2">Density Dissipation</label>
							<input
								v-model="localSettings.DENSITY_DISSIPATION"
								type="number"
								step="0.1"
								class="w-full px-4 py-2 rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:border-orange-500 outline-none"
							>
						</div>

						<div>
							<label class="block text-gray-700 dark:text-gray-200 mb-2">Velocity Dissipation</label>
							<input
								v-model="localSettings.VELOCITY_DISSIPATION"
								type="number"
								step="0.1"
								class="w-full px-4 py-2 rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:border-orange-500 outline-none"
							>
						</div>

						<div>
							<label class="block text-gray-700 dark:text-gray-200 mb-2">Pressure</label>
							<input
								v-model="localSettings.PRESSURE"
								type="number"
								step="0.1"
								class="w-full px-4 py-2 rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:border-orange-500 outline-none"
							>
						</div>

						<div>
							<label class="block text-gray-700 dark:text-gray-200 mb-2">Pressure Iterations</label>
							<input
								v-model="localSettings.PRESSURE_ITERATIONS"
								type="number"
								class="w-full px-4 py-2 rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:border-orange-500 outline-none"
							>
						</div>

						<div>
							<label class="block text-gray-700 dark:text-gray-200 mb-2">Curl</label>
							<input
								v-model="localSettings.CURL"
								type="number"
								step="0.1"
								class="w-full px-4 py-2 rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:border-orange-500 outline-none"
							>
						</div>

						<div>
							<label class="block text-gray-700 dark:text-gray-200 mb-2">Splat Radius</label>
							<input
								v-model="localSettings.SPLAT_RADIUS"
								type="number"
								step="0.1"
								class="w-full px-4 py-2 rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:border-orange-500 outline-none"
							>
						</div>

						<div>
							<label class="block text-gray-700 dark:text-gray-200 mb-2">Splat Force</label>
							<input
								v-model="localSettings.SPLAT_FORCE"
								type="number"
								class="w-full px-4 py-2 rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:border-orange-500 outline-none"
							>
						</div>

						<div>
							<label class="block text-gray-700 dark:text-gray-200 mb-2">Shading</label>
							<UToggle v-model="localSettings.SHADING" />
						</div>

						<div>
							<label class="block text-gray-700 dark:text-gray-200 mb-2">Color Update Speed</label>
							<input
								v-model="localSettings.COLOR_UPDATE_SPEED"
								type="number"
								step="0.1"
								class="w-full px-4 py-2 rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:border-orange-500 outline-none"
							>
						</div>

						<div class="flex items-center justify-between">
							<label class="block text-gray-700 dark:text-gray-200">Randomize Color on Click</label>
							<USwitch v-model="localSettings.RANDOMIZE_COLOR_ON_CLICK" />
						</div>

						<UDivider class="my-4" />

						<div>
							<UButton
								variant="ghost"
								class="mb-4"
								@click="toggleFluid"
							>
								{{ isFluidEnabled ? 'Disable Fluid' : 'Enable Fluid' }}
							</UButton>
						</div>

						<UDivider />

						<div>
							<h4 class="text-md font-medium mb-4">
								Filter Controls
							</h4>

							<div>
								<label class="block text-gray-700 dark:text-gray-200 mb-2">Opacity (%)</label>
								<input
									v-model="localSettings.OPACITY"
									type="range"
									min="0"
									max="100"
									class="w-full"
								>
								<span class="text-sm text-gray-500">{{ localSettings.OPACITY }}%</span>
							</div>

							<div class="mt-4">
								<label class="block text-gray-700 dark:text-gray-200 mb-2">Brightness (%)</label>
								<input
									v-model="localSettings.BRIGHTNESS"
									type="range"
									min="0"
									max="200"
									class="w-full"
								>
								<span class="text-sm text-gray-500">{{ localSettings.BRIGHTNESS }}%</span>
							</div>

							<div class="mt-4">
								<label class="block text-gray-700 dark:text-gray-200 mb-2">Grayscale (%)</label>
								<input
									v-model="localSettings.GRAYSCALE"
									type="range"
									min="0"
									max="100"
									class="w-full"
								>
								<span class="text-sm text-gray-500">{{ localSettings.GRAYSCALE }}%</span>
							</div>

							<div class="mt-4">
								<label class="block text-gray-700 dark:text-gray-200 mb-2">Saturation (%)</label>
								<input
									v-model="localSettings.SATURATION"
									type="range"
									min="0"
									max="200"
									class="w-full"
								>
								<span class="text-sm text-gray-500">{{ localSettings.SATURATION }}%</span>
							</div>

							<div class="mt-4">
								<label class="block text-gray-700 dark:text-gray-200 mb-2">Contrast (%)</label>
								<input
									v-model="localSettings.CONTRAST"
									type="range"
									min="0"
									max="200"
									class="w-full"
								>
								<span class="text-sm text-gray-500">{{ localSettings.CONTRAST }}%</span>
							</div>

							<div class="mt-4">
								<label class="block text-gray-700 dark:text-gray-200 mb-2">Blur (px)</label>
								<input
									v-model="localSettings.BLUR"
									type="range"
									min="0"
									max="20"
									step="0.1"
									class="w-full"
								>
								<span class="text-sm text-gray-500">{{ localSettings.BLUR }}px</span>
							</div>
						</div>
					</form>
				</div>

				<UDivider />

				<div>
					<h3 class="text-lg font-medium mb-4">
						Store Data
					</h3>
					<JsonataViewer
						title="Fluid Cursor Settings Store"
						:data="storeData"
						default-tab="json"
						class="w-full"
					/>
				</div>
			</div>
		</template>

		<template #footer>
			<UButton label="Reset" color="neutral" variant="outline" @click="resetSettings" />
			<UButton label="Apply" color="primary" @click="applySettings" />
			<UButton label="Close" color="neutral" variant="outline" @click="close" />
		</template>
	</USlideover>

	<!-- Save Preset Modal -->
	<UModal v-model="showSavePresetModal" title="Save Preset">
		<template #body>
			<UFormField label="Preset Name" name="presetName">
				<UInput v-model="newPresetName" placeholder="Enter preset name" />
			</UFormField>
		</template>
		<template #footer>
			<div class="flex justify-end gap-2">
				<UButton
					color="neutral"
					variant="outline"
					@click="showSavePresetModal = false"
				>
					Cancel
				</UButton>
				<UButton
					color="primary"
					@click="savePreset"
				>
					Save
				</UButton>
			</div>
		</template>
	</UModal>

	<!-- Delete Confirmation Modal -->
	<UModal v-model="showDeleteModal" title="Delete Preset">
		<template #body>
			<p>Are you sure you want to delete this preset?</p>
		</template>
		<template #footer>
			<div class="flex justify-end gap-2">
				<UButton
					color="neutral"
					variant="outline"
					@click="showDeleteModal = false"
				>
					Cancel
				</UButton>
				<UButton
					color="error"
					@click="confirmDelete"
				>
					Delete
				</UButton>
			</div>
		</template>
	</UModal>
</template>

<script setup lang="ts">

	import { useFluidCursorState } from "~/composables/useFluidCursorState";

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
		FLUID_COLOR: string
		RANDOMIZE_COLOR_ON_CLICK: boolean
		OPACITY: number
		BRIGHTNESS: number
		GRAYSCALE: number
		SATURATION: number
		CONTRAST: number
		BLUR: number
	}

	interface Preset {
		name: string
		timestamp: string
		settings: FluidSettings
	}

	const props = defineProps<{
		settings: FluidSettings
	}>();

	const emit = defineEmits<{
		"update:settings": [settings: FluidSettings]
		close: []
	}>();

	const isOpen = ref(true);
	const localSettings = ref<FluidSettings>({ ...props.settings });
	const store = ref<any>(null);
	const presets = ref<Preset[]>([]);
	const storeData = ref({
		store: "fluidCursor",
		timestamp: new Date().toISOString(),
		data: {
			settings: localSettings.value,
			presets: [] as Preset[]
		}
	});

	const showSavePresetModal = ref(false);
	const showDeleteModal = ref(false);
	const newPresetName = ref("");
	const presetToDelete = ref<number | null>(null);

	const { isFluidEnabled, fluidCursor } = useFluidCursorState();

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
		COLOR_UPDATE_SPEED: 0,
		FLUID_COLOR: "#FFA500",
		RANDOMIZE_COLOR_ON_CLICK: false,
		OPACITY: 100,
		BRIGHTNESS: 100,
		GRAYSCALE: 0,
		SATURATION: 100,
		CONTRAST: 100,
		BLUR: 0
	};

	async function initStore() {
		try {
			// Use localStorage instead of Tauri store
			store.value = {
				entries: () => {
					const data = localStorage.getItem('fluidCursor');
					if (!data) return [];
					const parsed = JSON.parse(data);
					return Object.entries(parsed);
				},
				set: (key: string, value: string) => {
					const data = localStorage.getItem('fluidCursor') || '{}';
					const parsed = JSON.parse(data);
					parsed[key] = value;
					localStorage.setItem('fluidCursor', JSON.stringify(parsed));
				}
			};
			await loadStoreData();
		} catch (error) {
			console.error("Error initializing store:", error);
		}
	}

	async function loadStoreData() {
		try {
			const entries = store.value.entries();
			const data = entries.reduce((acc: any, [key, value]: [string, any]) => {
				try {
					const parsedValue = JSON.parse(value);
					if (key === "settings") {
						acc[key] = {
							...parsedValue,
							OPACITY: Number(parsedValue.OPACITY) || 100,
							BRIGHTNESS: Number(parsedValue.BRIGHTNESS) || 100,
							GRAYSCALE: Number(parsedValue.GRAYSCALE) || 0,
							SATURATION: Number(parsedValue.SATURATION) || 100,
							CONTRAST: Number(parsedValue.CONTRAST) || 100,
							BLUR: Number(parsedValue.BLUR) || 0
						};
					} else if (key === "presets") {
						acc[key] = parsedValue;
						presets.value = parsedValue;
					} else {
						acc[key] = parsedValue;
					}
				} catch {
					acc[key] = value;
				}
				return acc;
			}, {});
			storeData.value = {
				store: "fluidCursor",
				timestamp: new Date().toISOString(),
				data
			};
		} catch (error) {
			console.error("Error loading store data:", error);
		}
	}

	async function saveToStore() {
		try {
			const settingsToSave = {
				...localSettings.value,
				OPACITY: Number(localSettings.value.OPACITY),
				BRIGHTNESS: Number(localSettings.value.BRIGHTNESS),
				GRAYSCALE: Number(localSettings.value.GRAYSCALE),
				SATURATION: Number(localSettings.value.SATURATION),
				CONTRAST: Number(localSettings.value.CONTRAST),
				BLUR: Number(localSettings.value.BLUR)
			};

			store.value.set("settings", JSON.stringify(settingsToSave));
			store.value.set("presets", JSON.stringify(presets.value));
			storeData.value = {
				store: "fluidCursor",
				timestamp: new Date().toISOString(),
				data: {
					settings: settingsToSave,
					presets: presets.value
				}
			};
		} catch (error) {
			console.error("Error saving to store:", error);
		}
	}

	async function savePreset() {
		if (!newPresetName.value) return;

		const newPreset: Preset = {
			name: newPresetName.value,
			timestamp: new Date().toISOString(),
			settings: { ...localSettings.value }
		};

		presets.value.push(newPreset);
		await saveToStore();

		newPresetName.value = "";
		showSavePresetModal.value = false;
	}

	function showDeleteConfirmModal(index: number) {
		presetToDelete.value = index;
		showDeleteModal.value = true;
	}

	async function confirmDelete() {
		if (presetToDelete.value !== null) {
			presets.value.splice(presetToDelete.value, 1);
			await saveToStore();
			presetToDelete.value = null;
		}
		showDeleteModal.value = false;
	}

	async function applyPreset(preset: Preset) {
		localSettings.value = { ...preset.settings };
		emit("update:settings", { ...preset.settings });
	}

	function formatPresetDate(timestamp: string) {
		return new Date(timestamp).toLocaleDateString();
	}

	function resetSettings() {
		localSettings.value = { ...defaultSettings };
	}

	async function applySettings() {
		emit("update:settings", { ...localSettings.value });
		await saveToStore();
		close();
	}

	function close() {
		isOpen.value = false;
		emit("close");
	}

	// Update local settings when props change
	watch(() => props.settings, (newSettings) => {
		localSettings.value = { ...newSettings };
	}, { deep: true });

	// Initialize store on component mount
	onMounted(() => {
		initStore();
	});

	function toggleFluid() {
		isFluidEnabled.value = !isFluidEnabled.value;
		if (fluidCursor.value) {
			fluidCursor.value.togglePause();
		}
	}
</script>
