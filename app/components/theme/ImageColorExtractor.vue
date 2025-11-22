<template>
	<div class="image-color-extractor space-y-4">
		<!-- Header -->
		<div class="flex items-center justify-between">
			<div>
				<h3 class="text-sm font-semibold text-foreground flex items-center gap-2">
					<Icon name="lucide:image" class="w-4 h-4" />
					Extract Colors from Image
				</h3>
				<p class="text-xs text-muted-foreground mt-1">
					Upload an image or provide a URL to extract a color palette
				</p>
			</div>
		</div>

		<!-- Image Input Options -->
		<UiCard>
			<UiCardContent class="p-4 space-y-4">
				<!-- URL Input -->
				<div class="space-y-2">
					<UiLabel for="image-url">Image URL</UiLabel>
					<div class="flex gap-2">
						<div class="relative flex-1">
							<Icon name="lucide:link" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
							<UiInput
								id="image-url"
								v-model="imageUrl"
								placeholder="https://example.com/image.jpg"
								class="pl-9"
							/>
						</div>
						<UiButton
							:disabled="!imageUrl || isLoading"
							:loading="isLoading"
							@click="loadImageFromUrl"
						>
							<Icon name="lucide:download" class="w-4 h-4 mr-2" />
							Load
						</UiButton>
					</div>
				</div>

				<!-- Divider -->
				<div class="relative">
					<div class="absolute inset-0 flex items-center">
						<span class="w-full border-t border-border" />
					</div>
					<div class="relative flex justify-center text-xs uppercase">
						<span class="bg-card px-2 text-muted-foreground">Or</span>
					</div>
				</div>

				<!-- File Upload -->
				<div class="space-y-2">
					<UiLabel>Upload Image</UiLabel>
					<UiButton
						variant="outline"
						class="w-full"
						:disabled="isLoading"
						@click="triggerFileInput"
					>
						<Icon name="lucide:upload" class="w-4 h-4 mr-2" />
						Choose File
					</UiButton>
					<input
						ref="fileInputRef"
						type="file"
						accept="image/*"
						class="hidden"
						@change="handleFileSelect"
					>
					<p v-if="selectedFile" class="text-xs text-muted-foreground">
						Selected: {{ selectedFile.name }}
					</p>
				</div>
			</UiCardContent>
		</UiCard>

		<!-- Image Preview -->
		<UiCard v-if="imagePreview">
			<UiCardContent class="p-4 space-y-4">
				<div class="flex items-center justify-between">
					<h4 class="text-sm font-semibold text-foreground">Image Preview</h4>
					<UiButton
						variant="ghost"
						size="icon-sm"
						@click="clearImage"
					>
						<Icon name="lucide:x" class="w-4 h-4" />
					</UiButton>
				</div>
				<div class="relative w-full rounded-lg border border-border overflow-hidden bg-muted/30">
					<img
						:src="imagePreview"
						alt="Image preview"
						class="w-full h-auto max-h-64 object-contain"
						@load="handleImageLoad"
					>
					<div
						v-if="isExtracting"
						class="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm"
					>
						<div class="text-center">
							<Icon name="lucide:loader-2" class="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
							<p class="text-sm text-foreground">Extracting colors...</p>
						</div>
					</div>
				</div>
			</UiCardContent>
		</UiCard>

		<!-- Extracted Colors -->
		<ColorPaletteDisplay
			v-if="extractedColors.length > 0"
			:colors="extractedColors"
			@color-select="handleColorSelect"
			@apply-color="handleApplyColor"
		/>

		<!-- Color Application Dialog -->
		<ColorApplicationDialog
			:open="showColorDialog"
			:color="colorToApply"
			@close="showColorDialog = false"
			@apply="handleColorApplied"
		/>
	</div>
</template>

<script setup lang="ts">
	import { ref } from "vue";
	import Icon from "~/components/Ui/Icon.vue";
	import UiButton from "~/components/Ui/Button.vue";
	import UiInput from "~/components/Ui/Input.vue";
	import UiLabel from "~/components/Ui/Label.vue";
	import UiCard from "~/components/Ui/Card/Card.vue";
	import UiCardContent from "~/components/Ui/Card/Content.vue";
	import ColorPaletteDisplay from "./ColorPaletteDisplay.vue";
	import ColorApplicationDialog from "./ColorApplicationDialog.vue";

	const emit = defineEmits<{
		colorsExtracted: [colors: string[]];
		colorSelected: [color: string];
		applyColor: [data: { property: string; color: string; modes: { light: boolean; dark: boolean } }];
	}>();

	const imageUrl = ref("");
	const selectedFile = ref<File | null>(null);
	const imagePreview = ref<string | null>(null);
	const extractedColors = ref<string[]>([]);
	const isLoading = ref(false);
	const isExtracting = ref(false);
	const fileInputRef = ref<HTMLInputElement | null>(null);
	const showColorDialog = ref(false);
	const colorToApply = ref<string>("");

	// Load image from URL
	const loadImageFromUrl = async () => {
		if (!imageUrl.value) return;

		isLoading.value = true;
		try {
			// Validate URL
			new URL(imageUrl.value);

			// Create image to test if it loads
			const img = new Image();
			img.crossOrigin = "anonymous";

			await new Promise((resolve, reject) => {
				img.onload = resolve;
				img.onerror = reject;
				img.src = imageUrl.value;
			});

			imagePreview.value = imageUrl.value;
			extractColorsFromImage(img);
		} catch (error) {
			console.error("Failed to load image from URL:", error);
			// You could add a toast notification here
		} finally {
			isLoading.value = false;
		}
	};

	// Trigger file input
	const triggerFileInput = () => {
		fileInputRef.value?.click();
	};

	// Handle file selection
	const handleFileSelect = (event: Event) => {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];

		if (!file) return;

		// Validate file type
		if (!file.type.startsWith("image/")) {
			console.error("Selected file is not an image");
			return;
		}

		selectedFile.value = file;

		// Create preview
		const reader = new FileReader();
		reader.onload = (e) => {
			imagePreview.value = e.target?.result as string;
		};
		reader.readAsDataURL(file);
	};

	// Handle image load
	const handleImageLoad = (event: Event) => {
		const img = event.target as HTMLImageElement;
		extractColorsFromImage(img);
	};

	// Extract colors from image
	const extractColorsFromImage = async (img: HTMLImageElement) => {
		isExtracting.value = true;

		try {
			// Create canvas to analyze image
			const canvas = document.createElement("canvas");
			const ctx = canvas.getContext("2d", { willReadFrequently: true });

			if (!ctx) {
				throw new Error("Could not get canvas context");
			}

			// Set canvas size (resize for performance)
			const maxSize = 200;
			const scale = Math.min(maxSize / img.width, maxSize / img.height, 1);
			canvas.width = img.width * scale;
			canvas.height = img.height * scale;

			// Draw image to canvas
			ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

			// Get image data
			const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
			const pixels = imageData.data;

			// Extract colors using color quantization
			const colors = extractDominantColors(pixels, canvas.width * canvas.height);

			extractedColors.value = colors;
			emit("colorsExtracted", colors);
		} catch (error) {
			console.error("Failed to extract colors:", error);
		} finally {
			isExtracting.value = false;
		}
	};

	// Extract dominant colors from pixel data using improved algorithm
	const extractDominantColors = (pixels: Uint8ClampedArray, pixelCount: number, colorCount: number = 8): string[] => {
		// Use a more sophisticated color extraction algorithm
		const colorMap = new Map<string, { count: number; r: number; g: number; b: number }>();

		// Sample pixels (every nth pixel for performance)
		const sampleRate = Math.max(1, Math.floor(pixelCount / 15000));

		for (let i = 0; i < pixels.length; i += 4 * sampleRate) {
			const r = pixels[i];
			const g = pixels[i + 1];
			const b = pixels[i + 2];
			const a = pixels[i + 3];

			// Skip transparent or very transparent pixels
			if (a < 200) continue;

			// Quantize colors more aggressively to group similar colors
			const quantizedR = Math.floor(r / 20) * 20;
			const quantizedG = Math.floor(g / 20) * 20;
			const quantizedB = Math.floor(b / 20) * 20;

			const colorKey = `${quantizedR},${quantizedG},${quantizedB}`;
			
			if (!colorMap.has(colorKey)) {
				colorMap.set(colorKey, { count: 0, r: 0, g: 0, b: 0 });
			}
			
			const entry = colorMap.get(colorKey)!;
			entry.count++;
			entry.r += r;
			entry.g += g;
			entry.b += b;
		}

		// Calculate average colors and sort by frequency
		const sortedColors = Array.from(colorMap.entries())
			.map(([colorKey, data]) => {
				const avgR = Math.round(data.r / data.count);
				const avgG = Math.round(data.g / data.count);
				const avgB = Math.round(data.b / data.count);
				return {
					hex: rgbToHex(avgR, avgG, avgB),
					count: data.count,
					// Calculate luminance for sorting (to prefer more vibrant colors)
					luminance: 0.299 * avgR + 0.587 * avgG + 0.114 * avgB
				};
			})
			// Filter out very dark or very light colors (likely backgrounds/text)
			.filter(color => color.luminance > 30 && color.luminance < 240)
			.sort((a, b) => {
				// Sort by frequency first, then by luminance (prefer vibrant colors)
				if (Math.abs(a.count - b.count) > 10) {
					return b.count - a.count;
				}
				// Prefer colors that are not too dark or too light
				const aScore = a.luminance > 50 && a.luminance < 200 ? 1 : 0;
				const bScore = b.luminance > 50 && b.luminance < 200 ? 1 : 0;
				if (aScore !== bScore) return bScore - aScore;
				return b.count - a.count;
			})
			.slice(0, colorCount)
			.map(color => color.hex);

		return sortedColors;
	};

	// Convert RGB to hex
	const rgbToHex = (r: number, g: number, b: number): string => {
		return `#${[r, g, b].map(x => {
			const hex = x.toString(16);
			return hex.length === 1 ? `0${hex}` : hex;
		}).join("")}`;
	};

	// Handle color selection
	const handleColorSelect = (color: string) => {
		emit("colorSelected", color);
	};

	// Handle apply color (opens dialog)
	const handleApplyColor = (color: string) => {
		colorToApply.value = color;
		showColorDialog.value = true;
	};

	// Handle color applied from dialog
	const handleColorApplied = (property: string, oklchColor: string, modes: { light: boolean; dark: boolean }) => {
		emit("applyColor", { property, color: oklchColor, modes });
	};

	// Clear image and colors
	const clearImage = () => {
		imagePreview.value = null;
		imageUrl.value = "";
		selectedFile.value = null;
		extractedColors.value = [];
		if (fileInputRef.value) {
			fileInputRef.value.value = "";
		}
	};
</script>

<style scoped>
.image-color-extractor {
	/* Component styles */
}
</style>

