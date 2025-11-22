<template>
	<UiDialog :open="isOpen" @update:open="isOpen = $event">
		<UiDialogContent class="sm:max-w-md">
			<UiDialogHeader>
				<UiDialogTitle>Apply Color to Theme</UiDialogTitle>
				<UiDialogDescription>
					Select which theme property to apply the selected color to
				</UiDialogDescription>
			</UiDialogHeader>

			<div class="space-y-4 py-4">
				<!-- Color Preview -->
				<div class="flex items-center gap-4 p-4 bg-muted/30 rounded-lg border border-border">
					<div
						class="w-16 h-16 rounded-lg border-2 border-border flex-shrink-0"
						:style="{ backgroundColor: selectedColor }"
					/>
					<div class="flex-1 min-w-0">
						<code class="text-xs font-mono text-foreground block truncate">
							{{ selectedColor }}
						</code>
						<p class="text-xs text-muted-foreground mt-1">
							{{ oklchColor }}
						</p>
					</div>
				</div>

				<!-- Color Property Selection -->
				<div class="space-y-2">
					<UiLabel>Apply to</UiLabel>
					<UiSelect v-model="selectedProperty">
						<UiSelectTrigger>
							<UiSelectValue placeholder="Select a color property" />
						</UiSelectTrigger>
						<UiSelectContent>
							<UiSelectGroup>
								<UiSelectLabel>Base Colors</UiSelectLabel>
								<UiSelectItem value="background">Background</UiSelectItem>
								<UiSelectItem value="foreground">Foreground</UiSelectItem>
								<UiSelectItem value="card">Card</UiSelectItem>
								<UiSelectItem value="card-foreground">Card Foreground</UiSelectItem>
							</UiSelectGroup>
							<UiSelectGroup>
								<UiSelectLabel>Primary Colors</UiSelectLabel>
								<UiSelectItem value="primary">Primary</UiSelectItem>
								<UiSelectItem value="primary-foreground">Primary Foreground</UiSelectItem>
							</UiSelectGroup>
							<UiSelectGroup>
								<UiSelectLabel>Secondary Colors</UiSelectLabel>
								<UiSelectItem value="secondary">Secondary</UiSelectItem>
								<UiSelectItem value="secondary-foreground">Secondary Foreground</UiSelectItem>
								<UiSelectItem value="accent">Accent</UiSelectItem>
								<UiSelectItem value="accent-foreground">Accent Foreground</UiSelectItem>
							</UiSelectGroup>
							<UiSelectGroup>
								<UiSelectLabel>Chart Colors</UiSelectLabel>
								<UiSelectItem value="chart-1">Chart 1</UiSelectItem>
								<UiSelectItem value="chart-2">Chart 2</UiSelectItem>
								<UiSelectItem value="chart-3">Chart 3</UiSelectItem>
								<UiSelectItem value="chart-4">Chart 4</UiSelectItem>
								<UiSelectItem value="chart-5">Chart 5</UiSelectItem>
							</UiSelectGroup>
						</UiSelectContent>
					</UiSelect>
				</div>

				<!-- Mode Selection -->
				<div class="space-y-2">
					<UiLabel>Color Mode</UiLabel>
					<div class="flex gap-2">
						<UiButton
							variant="outline"
							:class="{ 'border-primary': applyToLight }"
							class="flex-1"
							@click="applyToLight = true; applyToDark = false"
						>
							Light Mode
						</UiButton>
						<UiButton
							variant="outline"
							:class="{ 'border-primary': applyToDark }"
							class="flex-1"
							@click="applyToLight = false; applyToDark = true"
						>
							Dark Mode
						</UiButton>
						<UiButton
							variant="outline"
							:class="{ 'border-primary': applyToBoth }"
							class="flex-1"
							@click="applyToLight = true; applyToDark = true"
						>
							Both
						</UiButton>
					</div>
				</div>
			</div>

			<UiDialogFooter>
				<UiButton variant="outline" @click="close">
					Cancel
				</UiButton>
				<UiButton
					:disabled="!selectedProperty"
					@click="applyColor"
				>
					Apply Color
				</UiButton>
			</UiDialogFooter>
		</UiDialogContent>
	</UiDialog>
</template>

<script setup lang="ts">
	import { computed, ref, watch } from "vue";
	import { hexToOklch } from "~/composables/useThemeColors";
	import Icon from "~/components/Ui/Icon.vue";
	import UiButton from "~/components/Ui/Button.vue";
	import UiLabel from "~/components/Ui/Label.vue";
	import UiDialog from "~/components/Ui/Dialog/Dialog.vue";
	import UiDialogContent from "~/components/Ui/Dialog/Content.vue";
	import UiDialogHeader from "~/components/Ui/Dialog/Header.vue";
	import UiDialogTitle from "~/components/Ui/Dialog/Title.vue";
	import UiDialogDescription from "~/components/Ui/Dialog/Description.vue";
	import UiDialogFooter from "~/components/Ui/Dialog/Footer.vue";
	import UiSelect from "~/components/Ui/Select/Select.vue";
	import UiSelectTrigger from "~/components/Ui/Select/Trigger.vue";
	import UiSelectValue from "~/components/Ui/Select/Value.vue";
	import UiSelectContent from "~/components/Ui/Select/Content.vue";
	import UiSelectGroup from "~/components/Ui/Select/Group.vue";
	import UiSelectLabel from "~/components/Ui/Select/Label.vue";
	import UiSelectItem from "~/components/Ui/Select/Item.vue";

	interface Props {
		open: boolean;
		color: string;
	}

	const props = defineProps<Props>();

	const emit = defineEmits<{
		close: [];
		apply: [property: string, color: string, modes: { light: boolean; dark: boolean }];
	}>();

	const isOpen = computed({
		get: () => props.open,
		set: (value) => {
			if (!value) {
				close();
			}
		}
	});

	const selectedColor = computed(() => props.color);
	const oklchColor = computed(() => hexToOklch(props.color));
	const selectedProperty = ref<string>("");
	const applyToLight = ref(true);
	const applyToDark = ref(false);

	const applyToBoth = computed(() => applyToLight.value && applyToDark.value);

	const applyColor = () => {
		if (!selectedProperty.value) return;

		emit("apply", selectedProperty.value, oklchColor.value, {
			light: applyToLight.value,
			dark: applyToDark.value
		});

		close();
	};

	const close = () => {
		selectedProperty.value = "";
		applyToLight.value = true;
		applyToDark.value = false;
		emit("close");
	};

	// Reset when dialog opens
	watch(() => props.open, (isOpen) => {
		if (isOpen) {
			selectedProperty.value = "primary"; // Default to primary
			applyToLight.value = true;
			applyToDark.value = false;
		}
	});
</script>

