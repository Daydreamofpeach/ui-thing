<template>
	<div class="node-icon-header" :class="headerClasses">
		<!-- Icon Wrapper -->
		<div
			v-if="icon || iconImage"
			:class="iconWrapperClasses"
			:style="iconWrapperStyle"
		>
			<img
				v-if="iconImage"
				:src="iconImage"
				:alt="title || 'Node'"
				class="icon-image"
			>
			<Icon
				v-else-if="icon"
				:name="icon"
				:class="iconClasses"
			/>
		</div>

		<!-- Title Section -->
		<div
			v-if="title"
			:class="titleWrapperClasses"
			:style="titleWrapperStyle"
		>
			<h3 :class="titleClasses" :style="titleStyle">
				{{ title }}
			</h3>
			<UiBadge
				v-if="statusLabel"
				:variant="statusVariant"
				size="sm"
				:class="statusBadgeClasses"
			>
				{{ statusLabel }}
			</UiBadge>
		</div>
	</div>
</template>

<script setup lang="ts">
	import { computed } from "vue";
	import { tv } from "tailwind-variants";
	import Icon from "~/components/Ui/Icon.vue";
	import UiBadge from "~/components/Ui/Badge.vue";

	interface Props {
		icon?: string
		iconImage?: string
		iconClass?: string
		title?: string
		titleClass?: string
		statusLabel?: string
		statusColor?: string
		themeColor?: string
		collapsed?: boolean
		size?: "sm" | "md" | "lg"
	}

	const props = withDefaults(defineProps<Props>(), {
		icon: undefined,
		iconImage: undefined,
		iconClass: "",
		title: undefined,
		titleClass: "",
		statusLabel: undefined,
		statusColor: undefined,
		themeColor: undefined,
		collapsed: false,
		size: "md"
	});

	// Icon wrapper styles - positioned to sit halfway over the border
	const iconWrapperStyles = tv({
		base: [
			"node-icon-header-icon",
			"absolute",
			"left-1/2",
			"-translate-x-1/2",
			"rounded-full",
			"flex",
			"items-center",
			"justify-center",
			"bg-card",
			"border-[3px]",
			"border-primary",
			"shadow-lg",
			"z-10",
			"overflow-hidden",
			"backdrop-blur-sm",
			"transition-all",
			"duration-200"
		],
		variants: {
			size: {
				// Positioned so icon sits halfway over the border (half outside, half inside)
				// For 52px icon: -26px (half of 52px) positions center at border
				sm: "w-[52px] h-[52px] -top-[26px]",
				// For 64px icon: -32px (half of 64px) positions center at border
				md: "w-[64px] h-[64px] -top-[32px]",
				// For 80px icon: -40px (half of 80px) positions center at border
				lg: "w-[80px] h-[80px] -top-[40px]"
			},
			collapsed: {
				true: "w-[52px] h-[52px] -top-[26px]"
			}
		}
	});

	const iconWrapperClasses = computed(() => 
		iconWrapperStyles({
			size: props.collapsed ? "sm" : props.size,
			collapsed: props.collapsed
		})
	);

	const iconWrapperStyle = computed(() => {
		const style: any = {};
		if (props.themeColor) {
			style.borderColor = props.themeColor;
		}
		return style;
	});

	// Icon classes
	const iconClasses = computed(() => {
		const base = "text-primary transition-colors";
		const sizeClasses = {
			sm: "w-6 h-6",
			md: "w-8 h-8",
			lg: "w-10 h-10"
		};
		return `${base} ${sizeClasses[props.collapsed ? "sm" : props.size]} ${props.iconClass}`;
	});

	// Title wrapper styles - positioned below the icon (which is halfway over border)
	const titleWrapperStyles = tv({
		base: [
			"node-icon-header-title-wrapper",
			"flex",
			"items-center",
			"justify-center",
			"gap-2",
			"pt-4",
			"px-4"
		],
		variants: {
			size: {
				// Adjust padding based on icon size (icon is halfway over, so add half icon height)
				sm: "pt-6", // 26px (half of 52px) + 10px spacing
				md: "pt-8", // 32px (half of 64px) + 16px spacing
				lg: "pt-10" // 40px (half of 80px) + 20px spacing
			},
			collapsed: {
				true: "pt-6"
			}
		}
	});

	const titleWrapperClasses = computed(() => 
		titleWrapperStyles({
			size: props.collapsed ? "sm" : props.size,
			collapsed: props.collapsed
		})
	);

	const titleWrapperStyle = computed(() => {
		const style: any = {};
		if (props.themeColor) {
			style.color = props.themeColor;
		}
		return style;
	});

	// Title styles
	const titleStyles = tv({
		base: [
			"node-icon-header-title",
			"font-bold",
			"text-center",
			"uppercase",
			"tracking-wide",
			"transition-all",
			"duration-200",
			"text-foreground"
		],
		variants: {
			size: {
				sm: "text-sm",
				md: "text-lg",
				lg: "text-xl"
			},
			collapsed: {
				true: "text-sm"
			}
		}
	});

	const titleClasses = computed(() => 
		titleStyles({
			size: props.collapsed ? "sm" : props.size,
			collapsed: props.collapsed
		}) + (props.titleClass ? ` ${props.titleClass}` : "")
	);

	const titleStyle = computed(() => {
		const style: any = {};
		if (props.themeColor) {
			style.color = props.themeColor;
		}
		return style;
	});

	// Status badge variant
	const statusVariant = computed(() => {
		if (props.statusColor) {
			// Map color to variant
			if (props.statusColor.includes("success") || props.statusColor.includes("green")) {
				return "default";
			}
			if (props.statusColor.includes("warning") || props.statusColor.includes("yellow")) {
				return "outline";
			}
			if (props.statusColor.includes("error") || props.statusColor.includes("red")) {
				return "destructive";
			}
		}
		return "secondary";
	});

	const statusBadgeClasses = computed(() => {
		return "ml-2";
	});

	// Header container classes
	const headerClasses = computed(() => {
		return "relative w-full";
	});
</script>

<style scoped>
.node-icon-header {
	position: relative;
	width: 100%;
}

.icon-image {
	width: 100%;
	height: 100%;
	object-fit: contain;
	padding: 8px;
}
</style>

