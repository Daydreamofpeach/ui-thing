<template>
	<div class="color-palette-display space-y-3">
		<div class="flex items-center justify-between">
			<h4 class="text-sm font-semibold text-foreground flex items-center gap-2">
				<Icon name="lucide:palette" class="w-4 h-4" />
				Extracted Colors
			</h4>
			<UiBadge variant="secondary" size="sm">
				{{ colors.length }} colors
			</UiBadge>
		</div>

		<div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
			<UiCard
				v-for="(color, index) in colors"
				:key="index"
				class="color-card cursor-pointer hover:shadow-lg transition-all"
				@click="selectColor(color)"
			>
				<UiCardContent class="p-0">
					<!-- Color Swatch -->
					<div
						class="w-full h-24 rounded-t-lg border-b border-border"
						:style="{ backgroundColor: color }"
					/>

					<!-- Color Info -->
					<div class="p-3 space-y-2">
						<div class="flex items-center justify-between">
							<span class="text-xs font-medium text-foreground">Color {{ index + 1 }}</span>
							<UiButton
								variant="ghost"
								size="icon-xs"
								@click.stop="copyColor(color)"
							>
								<Icon name="lucide:copy" class="w-3 h-3" />
							</UiButton>
						</div>
						<code class="text-xs font-mono text-muted-foreground block truncate">
							{{ color }}
						</code>
						<div class="flex items-center gap-2">
							<UiBadge
								variant="outline"
								size="sm"
								class="text-xs font-mono"
							>
								RGB: {{ hexToRgb(color) }}
							</UiBadge>
						</div>
					</div>
				</UiCardContent>
			</UiCard>
		</div>

		<!-- Actions -->
		<div class="flex gap-2">
			<UiButton
				variant="outline"
				size="sm"
				class="flex-1"
				@click="applyAllColors"
			>
				<Icon name="lucide:palette" class="w-4 h-4 mr-2" />
				Apply All to Theme
			</UiButton>
			<UiButton
				variant="outline"
				size="sm"
				@click="copyAllColors"
			>
				<Icon name="lucide:copy" class="w-4 h-4 mr-2" />
				Copy All
			</UiButton>
		</div>
	</div>
</template>

<script setup lang="ts">
	import { ref } from "vue";
	import Icon from "~/components/Ui/Icon.vue";
	import UiButton from "~/components/Ui/Button.vue";
	import UiCard from "~/components/Ui/Card/Card.vue";
	import UiCardContent from "~/components/Ui/Card/Content.vue";
	import UiBadge from "~/components/Ui/Badge.vue";
	import { useToast } from "~/components/Ui/composables/useToast";

	interface Props {
		colors: string[];
	}

	const props = defineProps<Props>();

	const emit = defineEmits<{
		colorSelect: [color: string];
		applyColor: [color: string];
	}>();

	const toast = useToast();

	// Convert hex to RGB
	const hexToRgb = (hex: string): string => {
		const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
		if (!result) return "0, 0, 0";

		const r = parseInt(result[1], 16);
		const g = parseInt(result[2], 16);
		const b = parseInt(result[3], 16);

		return `${r}, ${g}, ${b}`;
	};

	// Select color
	const selectColor = (color: string) => {
		emit("colorSelect", color);
		emit("applyColor", color);
	};

	// Copy color to clipboard
	const copyColor = async (color: string) => {
		try {
			await navigator.clipboard.writeText(color);
			toast.success("Color Copied", {
				description: `${color} copied to clipboard`,
			});
		} catch (error) {
			console.error("Failed to copy color:", error);
			toast.error("Error", {
				description: "Failed to copy color",
			});
		}
	};

	// Copy all colors
	const copyAllColors = async () => {
		try {
			const colorsText = props.colors.join("\n");
			await navigator.clipboard.writeText(colorsText);
			toast.success("Colors Copied", {
				description: "All colors copied to clipboard",
			});
		} catch (error) {
			console.error("Failed to copy colors:", error);
			toast.error("Error", {
				description: "Failed to copy colors",
			});
		}
	};

	// Apply all colors to theme (emit event for parent to handle)
	const applyAllColors = () => {
		props.colors.forEach(color => {
			emit("colorSelect", color);
		});
		toast.success("Colors Applied", {
			description: "All colors have been applied to the theme",
		});
	};
</script>

<style scoped>
.color-card {
	transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.color-card:hover {
	transform: translateY(-2px);
}
</style>

