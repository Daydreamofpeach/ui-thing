<template>
	<div class="node-layout-config">
		<div class="config-header">
			<UIcon name="i-lucide-layout" class="size-4 text-primary" />
			<h5 class="config-title">Node Layout</h5>
		</div>

		<div class="layout-options">
			<button
				v-for="layout in layouts"
				:key="layout.id"
				class="layout-option"
				:class="{ active: modelValue.layout === layout.id }"
				@click="selectLayout(layout.id)"
			>
				<div class="layout-icon">
					<UIcon :name="layout.icon" class="size-4" />
				</div>
				<span class="layout-name">{{ layout.name }}</span>
				<div class="layout-preview">
					<svg viewBox="0 0 60 40" class="preview-svg">
						<component :is="layout.preview" />
					</svg>
				</div>
			</button>
		</div>

		<div class="spacing-config">
			<label class="config-label">
				<UIcon name="i-lucide-move-horizontal" class="size-3" />
				Node Spacing
			</label>
			<div class="slider-wrapper">
				<input 
					type="range" 
					min="600" 
					max="2000" 
					step="100"
					:value="modelValue.spacing"
					@input="updateSpacing"
					class="config-slider"
				/>
				<span class="slider-value">{{ modelValue.spacing }}px</span>
			</div>
		</div>

		<div class="spacing-config">
			<label class="config-label">
				<UIcon name="i-lucide-move-vertical" class="size-3" />
				Vertical Spacing
			</label>
			<div class="slider-wrapper">
				<input 
					type="range" 
					min="400" 
					max="1500" 
					step="100"
					:value="modelValue.verticalSpacing || modelValue.spacing"
					@input="updateVerticalSpacing"
					class="config-slider"
				/>
				<span class="slider-value">{{ modelValue.verticalSpacing || modelValue.spacing }}px</span>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
	import { h } from "vue";

	interface LayoutConfig {
		layout: string;
		spacing: number;
		verticalSpacing?: number;
	}

	interface Props {
		modelValue: LayoutConfig;
	}

	const props = defineProps<Props>();
	const emit = defineEmits<{
		"update:modelValue": [value: LayoutConfig];
	}>();

	const layouts = [
		{
			id: "current",
			name: "Current",
			icon: "i-lucide-mouse-pointer",
			preview: () => h("g", [
				h("circle", { cx: "18", cy: "15", r: "3", fill: "#10b981" }),
				h("circle", { cx: "35", cy: "12", r: "3", fill: "#10b981" }),
				h("circle", { cx: "42", cy: "28", r: "3", fill: "#10b981" }),
				h("text", { x: "30", y: "20", "font-size": "8", fill: "#10b981", "text-anchor": "middle" }, "Keep")
			])
		},
		{
			id: "horizontal",
			name: "Horizontal",
			icon: "i-lucide-arrow-right",
			preview: () => h("g", [
				h("circle", { cx: "10", cy: "20", r: "4", fill: "#8b5cf6" }),
				h("circle", { cx: "30", cy: "20", r: "4", fill: "#8b5cf6" }),
				h("circle", { cx: "50", cy: "20", r: "4", fill: "#8b5cf6" }),
				h("line", { x1: "14", y1: "20", x2: "26", y2: "20", stroke: "#8b5cf6", "stroke-width": "2" }),
				h("line", { x1: "34", y1: "20", x2: "46", y2: "20", stroke: "#8b5cf6", "stroke-width": "2" })
			])
		},
		{
			id: "vertical",
			name: "Vertical",
			icon: "i-lucide-arrow-down",
			preview: () => h("g", [
				h("circle", { cx: "30", cy: "8", r: "4", fill: "#8b5cf6" }),
				h("circle", { cx: "30", cy: "20", r: "4", fill: "#8b5cf6" }),
				h("circle", { cx: "30", cy: "32", r: "4", fill: "#8b5cf6" }),
				h("line", { x1: "30", y1: "12", x2: "30", y2: "16", stroke: "#8b5cf6", "stroke-width": "2" }),
				h("line", { x1: "30", y1: "24", x2: "30", y2: "28", stroke: "#8b5cf6", "stroke-width": "2" })
			])
		},
		{
			id: "grid",
			name: "Grid 2x2",
			icon: "i-lucide-grid-2x2",
			preview: () => h("g", [
				h("circle", { cx: "18", cy: "14", r: "3", fill: "#8b5cf6" }),
				h("circle", { cx: "42", cy: "14", r: "3", fill: "#8b5cf6" }),
				h("circle", { cx: "18", cy: "26", r: "3", fill: "#8b5cf6" }),
				h("circle", { cx: "42", cy: "26", r: "3", fill: "#8b5cf6" })
			])
		},
		{
			id: "grid3",
			name: "Grid 3x3",
			icon: "i-lucide-grid-3x3",
			preview: () => h("g", [
				h("circle", { cx: "15", cy: "12", r: "3", fill: "#8b5cf6" }),
				h("circle", { cx: "30", cy: "12", r: "3", fill: "#8b5cf6" }),
				h("circle", { cx: "45", cy: "12", r: "3", fill: "#8b5cf6" }),
				h("circle", { cx: "15", cy: "28", r: "3", fill: "#8b5cf6" }),
				h("circle", { cx: "30", cy: "28", r: "3", fill: "#8b5cf6" }),
				h("circle", { cx: "45", cy: "28", r: "3", fill: "#8b5cf6" })
			])
		},
		{
			id: "circle",
			name: "Circle",
			icon: "i-lucide-circle",
			preview: () => h("g", [
				h("circle", { cx: "30", cy: "8", r: "3", fill: "#8b5cf6" }),
				h("circle", { cx: "46", cy: "20", r: "3", fill: "#8b5cf6" }),
				h("circle", { cx: "30", cy: "32", r: "3", fill: "#8b5cf6" }),
				h("circle", { cx: "14", cy: "20", r: "3", fill: "#8b5cf6" }),
				h("circle", { cx: "30", cy: "20", r: "2", fill: "#8b5cf6", opacity: "0.3" })
			])
		},
		{
			id: "tree",
			name: "Tree",
			icon: "i-lucide-git-branch",
			preview: () => h("g", [
				h("circle", { cx: "30", cy: "8", r: "3", fill: "#8b5cf6" }),
				h("circle", { cx: "20", cy: "24", r: "3", fill: "#8b5cf6" }),
				h("circle", { cx: "40", cy: "24", r: "3", fill: "#8b5cf6" }),
				h("line", { x1: "30", y1: "11", x2: "20", y2: "21", stroke: "#8b5cf6", "stroke-width": "2" }),
				h("line", { x1: "30", y1: "11", x2: "40", y2: "21", stroke: "#8b5cf6", "stroke-width": "2" })
			])
		},
		{
			id: "diagonal",
			name: "Diagonal",
			icon: "i-lucide-trending-up",
			preview: () => h("g", [
				h("circle", { cx: "10", cy: "30", r: "4", fill: "#8b5cf6" }),
				h("circle", { cx: "30", cy: "20", r: "4", fill: "#8b5cf6" }),
				h("circle", { cx: "50", cy: "10", r: "4", fill: "#8b5cf6" }),
				h("line", { x1: "14", y1: "27", x2: "26", y2: "23", stroke: "#8b5cf6", "stroke-width": "2" }),
				h("line", { x1: "34", y1: "17", x2: "46", y2: "13", stroke: "#8b5cf6", "stroke-width": "2" })
			])
		},
		{
			id: "cascade",
			name: "Cascade",
			icon: "i-lucide-trending-down",
			preview: () => h("g", [
				h("circle", { cx: "15", cy: "8", r: "3", fill: "#8b5cf6" }),
				h("circle", { cx: "25", cy: "16", r: "3", fill: "#8b5cf6" }),
				h("circle", { cx: "35", cy: "24", r: "3", fill: "#8b5cf6" }),
				h("circle", { cx: "45", cy: "32", r: "3", fill: "#8b5cf6" })
			])
		},
		{
			id: "grid4",
			name: "Grid 4x4",
			icon: "i-lucide-grid-3x3",
			preview: () => h("g", [
				h("circle", { cx: "12", cy: "10", r: "2.5", fill: "#8b5cf6" }),
				h("circle", { cx: "24", cy: "10", r: "2.5", fill: "#8b5cf6" }),
				h("circle", { cx: "36", cy: "10", r: "2.5", fill: "#8b5cf6" }),
				h("circle", { cx: "48", cy: "10", r: "2.5", fill: "#8b5cf6" }),
				h("circle", { cx: "12", cy: "20", r: "2.5", fill: "#8b5cf6" }),
				h("circle", { cx: "24", cy: "20", r: "2.5", fill: "#8b5cf6" }),
				h("circle", { cx: "36", cy: "20", r: "2.5", fill: "#8b5cf6" }),
				h("circle", { cx: "48", cy: "20", r: "2.5", fill: "#8b5cf6" }),
				h("circle", { cx: "12", cy: "30", r: "2.5", fill: "#8b5cf6" }),
				h("circle", { cx: "24", cy: "30", r: "2.5", fill: "#8b5cf6" }),
				h("circle", { cx: "36", cy: "30", r: "2.5", fill: "#8b5cf6" }),
				h("circle", { cx: "48", cy: "30", r: "2.5", fill: "#8b5cf6" })
			])
		},
		{
			id: "triple-column",
			name: "Triple Column",
			icon: "i-lucide-columns-3",
			preview: () => h("g", [
				h("circle", { cx: "15", cy: "10", r: "2.5", fill: "#8b5cf6" }),
				h("circle", { cx: "30", cy: "10", r: "2.5", fill: "#8b5cf6" }),
				h("circle", { cx: "45", cy: "10", r: "2.5", fill: "#8b5cf6" }),
				h("circle", { cx: "15", cy: "20", r: "2.5", fill: "#8b5cf6" }),
				h("circle", { cx: "30", cy: "20", r: "2.5", fill: "#8b5cf6" }),
				h("circle", { cx: "45", cy: "20", r: "2.5", fill: "#8b5cf6" }),
				h("circle", { cx: "15", cy: "30", r: "2.5", fill: "#8b5cf6" }),
				h("circle", { cx: "30", cy: "30", r: "2.5", fill: "#8b5cf6" }),
				h("circle", { cx: "45", cy: "30", r: "2.5", fill: "#8b5cf6" })
			])
		},
		{
			id: "stairs-up",
			name: "Stairs Up",
			icon: "i-lucide-arrow-up-right",
			preview: () => h("g", [
				h("circle", { cx: "10", cy: "32", r: "3", fill: "#8b5cf6" }),
				h("circle", { cx: "22", cy: "26", r: "3", fill: "#8b5cf6" }),
				h("circle", { cx: "34", cy: "20", r: "3", fill: "#8b5cf6" }),
				h("circle", { cx: "46", cy: "14", r: "3", fill: "#8b5cf6" }),
				h("line", { x1: "10", y1: "32", x2: "22", y2: "32", stroke: "#8b5cf6", "stroke-width": "1.5", opacity: "0.3" }),
				h("line", { x1: "22", y1: "32", x2: "22", y2: "26", stroke: "#8b5cf6", "stroke-width": "1.5", opacity: "0.3" }),
				h("line", { x1: "22", y1: "26", x2: "34", y2: "26", stroke: "#8b5cf6", "stroke-width": "1.5", opacity: "0.3" }),
				h("line", { x1: "34", y1: "26", x2: "34", y2: "20", stroke: "#8b5cf6", "stroke-width": "1.5", opacity: "0.3" })
			])
		},
		{
			id: "stairs-down",
			name: "Stairs Down",
			icon: "i-lucide-arrow-down-right",
			preview: () => h("g", [
				h("circle", { cx: "10", cy: "14", r: "3", fill: "#8b5cf6" }),
				h("circle", { cx: "22", cy: "20", r: "3", fill: "#8b5cf6" }),
				h("circle", { cx: "34", cy: "26", r: "3", fill: "#8b5cf6" }),
				h("circle", { cx: "46", cy: "32", r: "3", fill: "#8b5cf6" }),
				h("line", { x1: "10", y1: "14", x2: "22", y2: "14", stroke: "#8b5cf6", "stroke-width": "1.5", opacity: "0.3" }),
				h("line", { x1: "22", y1: "14", x2: "22", y2: "20", stroke: "#8b5cf6", "stroke-width": "1.5", opacity: "0.3" }),
				h("line", { x1: "22", y1: "20", x2: "34", y2: "20", stroke: "#8b5cf6", "stroke-width": "1.5", opacity: "0.3" }),
				h("line", { x1: "34", y1: "20", x2: "34", y2: "26", stroke: "#8b5cf6", "stroke-width": "1.5", opacity: "0.3" })
			])
		},
		{
			id: "wave",
			name: "Wave",
			icon: "i-lucide-waves",
			preview: () => h("g", [
				h("circle", { cx: "10", cy: "20", r: "3", fill: "#8b5cf6" }),
				h("circle", { cx: "22", cy: "12", r: "3", fill: "#8b5cf6" }),
				h("circle", { cx: "34", cy: "20", r: "3", fill: "#8b5cf6" }),
				h("circle", { cx: "46", cy: "12", r: "3", fill: "#8b5cf6" }),
				h("path", { 
					d: "M 10 20 Q 16 12, 22 12 T 34 20 T 46 12", 
					stroke: "#8b5cf6", 
					"stroke-width": "2", 
					fill: "none",
					opacity: "0.3"
				})
			])
		},
		{
			id: "zigzag",
			name: "Zigzag",
			icon: "i-lucide-activity",
			preview: () => h("g", [
				h("circle", { cx: "10", cy: "28", r: "3", fill: "#8b5cf6" }),
				h("circle", { cx: "22", cy: "12", r: "3", fill: "#8b5cf6" }),
				h("circle", { cx: "34", cy: "28", r: "3", fill: "#8b5cf6" }),
				h("circle", { cx: "46", cy: "12", r: "3", fill: "#8b5cf6" }),
				h("line", { x1: "13", y1: "26", x2: "19", y2: "14", stroke: "#8b5cf6", "stroke-width": "2" }),
				h("line", { x1: "25", y1: "14", x2: "31", y2: "26", stroke: "#8b5cf6", "stroke-width": "2" }),
				h("line", { x1: "37", y1: "26", x2: "43", y2: "14", stroke: "#8b5cf6", "stroke-width": "2" })
			])
		},
		{
			id: "pyramid",
			name: "Pyramid",
			icon: "i-lucide-triangle",
			preview: () => h("g", [
				h("circle", { cx: "30", cy: "8", r: "3", fill: "#8b5cf6" }),
				h("circle", { cx: "22", cy: "20", r: "3", fill: "#8b5cf6" }),
				h("circle", { cx: "38", cy: "20", r: "3", fill: "#8b5cf6" }),
				h("circle", { cx: "14", cy: "32", r: "3", fill: "#8b5cf6" }),
				h("circle", { cx: "30", cy: "32", r: "3", fill: "#8b5cf6" }),
				h("circle", { cx: "46", cy: "32", r: "3", fill: "#8b5cf6" })
			])
		},
		{
			id: "double-column",
			name: "Double Column",
			icon: "i-lucide-columns-2",
			preview: () => h("g", [
				h("circle", { cx: "20", cy: "10", r: "3", fill: "#8b5cf6" }),
				h("circle", { cx: "40", cy: "10", r: "3", fill: "#8b5cf6" }),
				h("circle", { cx: "20", cy: "20", r: "3", fill: "#8b5cf6" }),
				h("circle", { cx: "40", cy: "20", r: "3", fill: "#8b5cf6" }),
				h("circle", { cx: "20", cy: "30", r: "3", fill: "#8b5cf6" }),
				h("circle", { cx: "40", cy: "30", r: "3", fill: "#8b5cf6" })
			])
		},
		{
			id: "arc",
			name: "Arc",
			icon: "i-lucide-route",
			preview: () => h("g", [
				h("circle", { cx: "10", cy: "30", r: "3", fill: "#8b5cf6" }),
				h("circle", { cx: "18", cy: "18", r: "3", fill: "#8b5cf6" }),
				h("circle", { cx: "30", cy: "12", r: "3", fill: "#8b5cf6" }),
				h("circle", { cx: "42", cy: "18", r: "3", fill: "#8b5cf6" }),
				h("circle", { cx: "50", cy: "30", r: "3", fill: "#8b5cf6" }),
				h("path", { 
					d: "M 10 30 Q 20 10, 30 12 T 50 30", 
					stroke: "#8b5cf6", 
					"stroke-width": "2", 
					fill: "none",
					opacity: "0.3"
				})
			])
		},
		{
			id: "binary-tree",
			name: "Binary Tree",
			icon: "i-lucide-git-fork",
			preview: () => h("g", [
				h("circle", { cx: "30", cy: "8", r: "3", fill: "#8b5cf6" }),
				h("circle", { cx: "20", cy: "18", r: "3", fill: "#8b5cf6" }),
				h("circle", { cx: "40", cy: "18", r: "3", fill: "#8b5cf6" }),
				h("circle", { cx: "14", cy: "28", r: "2.5", fill: "#8b5cf6" }),
				h("circle", { cx: "26", cy: "28", r: "2.5", fill: "#8b5cf6" }),
				h("circle", { cx: "34", cy: "28", r: "2.5", fill: "#8b5cf6" }),
				h("circle", { cx: "46", cy: "28", r: "2.5", fill: "#8b5cf6" }),
				h("line", { x1: "30", y1: "11", x2: "20", y2: "15", stroke: "#8b5cf6", "stroke-width": "1.5", opacity: "0.4" }),
				h("line", { x1: "30", y1: "11", x2: "40", y2: "15", stroke: "#8b5cf6", "stroke-width": "1.5", opacity: "0.4" })
			])
		},
		{
			id: "layered",
			name: "Layered",
			icon: "i-lucide-layers",
			preview: () => h("g", [
				h("circle", { cx: "30", cy: "8", r: "3", fill: "#8b5cf6" }),
				h("circle", { cx: "20", cy: "16", r: "3", fill: "#8b5cf6" }),
				h("circle", { cx: "40", cy: "16", r: "3", fill: "#8b5cf6" }),
				h("circle", { cx: "15", cy: "24", r: "3", fill: "#8b5cf6" }),
				h("circle", { cx: "30", cy: "24", r: "3", fill: "#8b5cf6" }),
				h("circle", { cx: "45", cy: "24", r: "3", fill: "#8b5cf6" }),
				h("circle", { cx: "22", cy: "32", r: "2.5", fill: "#8b5cf6" }),
				h("circle", { cx: "38", cy: "32", r: "2.5", fill: "#8b5cf6" })
			])
		},
		{
			id: "flow",
			name: "Flow",
			icon: "i-lucide-workflow",
			preview: () => h("g", [
				h("circle", { cx: "12", cy: "20", r: "3", fill: "#8b5cf6" }),
				h("circle", { cx: "26", cy: "12", r: "3", fill: "#8b5cf6" }),
				h("circle", { cx: "26", cy: "28", r: "3", fill: "#8b5cf6" }),
				h("circle", { cx: "40", cy: "16", r: "3", fill: "#8b5cf6" }),
				h("circle", { cx: "48", cy: "24", r: "3", fill: "#8b5cf6" }),
				h("line", { x1: "15", y1: "19", x2: "23", y2: "14", stroke: "#8b5cf6", "stroke-width": "2" }),
				h("line", { x1: "15", y1: "21", x2: "23", y2: "26", stroke: "#8b5cf6", "stroke-width": "2" }),
				h("line", { x1: "29", y1: "13", x2: "37", y2: "17", stroke: "#8b5cf6", "stroke-width": "2" }),
				h("line", { x1: "43", y1: "18", x2: "45", y2: "22", stroke: "#8b5cf6", "stroke-width": "2" })
			])
		}
	];

	const selectLayout = (layoutId: string) => {
		emit("update:modelValue", { ...props.modelValue, layout: layoutId });
	};

	const updateSpacing = (event: Event) => {
		const target = event.target as HTMLInputElement;
		emit("update:modelValue", { ...props.modelValue, spacing: Number.parseInt(target.value) });
	};

	const updateVerticalSpacing = (event: Event) => {
		const target = event.target as HTMLInputElement;
		emit("update:modelValue", { 
			...props.modelValue, 
			verticalSpacing: Number.parseInt(target.value) 
		});
	};
</script>

<style scoped>
	.node-layout-config {
		display: flex;
		flex-direction: column;
		gap: 16px;
		padding: 12px;
		background: rgba(0, 0, 0, 0.2);
		border-radius: 8px;
		border: 1px solid rgba(255, 255, 255, 0.08);
	}

	.config-header {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.config-title {
		font-size: 13px;
		font-weight: 700;
		color: white;
		margin: 0;
	}

	.layout-options {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
		gap: 8px;
	}

	.layout-option {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 6px;
		padding: 12px 8px;
		background: rgba(0, 0, 0, 0.2);
		border: 2px solid rgba(255, 255, 255, 0.08);
		border-radius: 8px;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.layout-option:hover {
		background: rgba(var(--color-primary-rgb), 0.1);
		border-color: rgba(var(--color-primary-rgb), 0.3);
	}

	.layout-option.active {
		background: rgba(var(--color-primary-rgb), 0.15);
		border-color: rgba(var(--color-primary-rgb), 0.5);
		box-shadow: 0 0 0 2px rgba(var(--color-primary-rgb), 0.2);
	}

	.layout-icon {
		color: rgba(var(--color-primary-rgb), 0.9);
	}

	.layout-name {
		font-size: 11px;
		font-weight: 600;
		color: rgba(255, 255, 255, 0.9);
	}

	.layout-preview {
		width: 60px;
		height: 40px;
		margin-top: 4px;
	}

	.preview-svg {
		width: 100%;
		height: 100%;
	}

	.spacing-config {
		display: flex;
		flex-direction: column;
		gap: 6px;
		padding-top: 12px;
		border-top: 1px solid rgba(255, 255, 255, 0.08);
	}

	.config-label {
		display: flex;
		align-items: center;
		gap: 6px;
		font-size: 11px;
		font-weight: 600;
		color: rgba(255, 255, 255, 0.7);
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.slider-wrapper {
		display: flex;
		align-items: center;
		gap: 10px;
	}

	.config-slider {
		flex: 1;
		height: 4px;
		border-radius: 2px;
		background: rgba(255, 255, 255, 0.1);
		cursor: pointer;
	}

	.slider-value {
		font-size: 11px;
		font-weight: 600;
		color: rgba(255, 255, 255, 0.8);
		min-width: 50px;
		text-align: right;
	}
</style>

