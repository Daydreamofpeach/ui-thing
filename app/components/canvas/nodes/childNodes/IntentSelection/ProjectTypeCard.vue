<template>
	<UiCard
		:class="cardClasses"
		@click="handleClick"
	>
		<UiCardContent class="p-6">
			<div class="flex items-center gap-4 mb-4">
				<div :class="iconWrapperClasses">
					<Icon :name="icon" class="w-6 h-6" :class="iconColorClass" />
				</div>
				<div class="flex-1">
					<h4 class="text-lg font-semibold text-foreground">
						{{ title }}
					</h4>
					<p class="text-sm text-muted-foreground">
						{{ description }}
					</p>
				</div>
			</div>

			<div class="space-y-2 mb-4">
				<div class="flex items-center justify-between text-sm">
					<span class="text-muted-foreground">Type</span>
					<UiBadge :variant="badgeVariant" size="sm">
						{{ typeLabel }}
					</UiBadge>
				</div>

				<div class="flex items-center justify-between text-sm">
					<span class="text-muted-foreground">Estimated Time</span>
					<span class="text-muted-foreground/60 text-xs">
						{{ estimatedTime }}
					</span>
				</div>
			</div>

			<div class="mt-4 pt-4 border-t border-border/50">
				<UiButton
					:variant="buttonVariant"
					size="sm"
					class="w-full"
					:class="buttonColorClasses"
				>
					{{ buttonLabel }}
				</UiButton>
			</div>
		</UiCardContent>
	</UiCard>
</template>

<script setup lang="ts">
	import { computed } from "vue";
	import UiCard from "~/components/Ui/Card/Card.vue";
	import UiCardContent from "~/components/Ui/Card/Content.vue";
	import UiButton from "~/components/Ui/Button.vue";
	import UiBadge from "~/components/Ui/Badge.vue";
	import Icon from "~/components/Ui/Icon.vue";
	import { tv } from "tailwind-variants";

	interface Props {
		type: "existing" | "new" | "git";
		title: string;
		description: string;
		icon: string;
		typeLabel: string;
		estimatedTime: string;
		buttonLabel: string;
		isSelected?: boolean;
	}

	const props = withDefaults(defineProps<Props>(), {
		isSelected: false,
	});

	const emit = defineEmits<{
		click: [];
	}>();

	const handleClick = () => {
		emit("click");
	};

	// Card styles with theme
	const cardStyles = tv({
		base: [
			"project-type-card",
			"cursor-pointer",
			"transition-all",
			"duration-300",
			"border",
			"border-border/30",
			"hover:border-primary/40",
			"hover:-translate-y-0.5",
			"hover:shadow-lg",
			"relative",
			"overflow-hidden",
		],
		variants: {
			selected: {
				true: "bg-primary/10 border-primary shadow-lg",
			},
		},
	});

	const cardClasses = computed(() => 
		cardStyles({
			selected: props.isSelected,
		})
	);

	// Icon wrapper styles
	const iconWrapperStyles = tv({
		base: [
			"w-12",
			"h-12",
			"rounded-lg",
			"border",
			"flex",
			"items-center",
			"justify-center",
			"group-hover:scale-110",
			"transition-transform",
		],
		variants: {
			type: {
				existing: "bg-primary/20 border-primary/30",
				new: "bg-success/20 border-success/30",
				git: "bg-accent/20 border-accent/30",
			},
		},
	});

	const iconWrapperClasses = computed(() => 
		iconWrapperStyles({
			type: props.type,
		})
	);

	// Icon color classes
	const iconColorClass = computed(() => {
		switch (props.type) {
			case "existing":
				return "text-primary";
			case "new":
				return "text-success";
			case "git":
				return "text-accent-foreground";
			default:
				return "text-primary";
		}
	});

	// Badge variant
	const badgeVariant = computed<"default" | "secondary" | "outline">(() => {
		switch (props.type) {
			case "existing":
				return "outline";
			case "new":
				return "outline";
			case "git":
				return "outline";
			default:
				return "outline";
		}
	});

	// Button variant
	const buttonVariant = computed<"default" | "outline" | "ghost" | "secondary">(() => "outline");

	// Button color classes
	const buttonColorClasses = computed(() => {
		switch (props.type) {
			case "existing":
				return "bg-primary/20 hover:bg-primary/30 text-primary border-primary/30";
			case "new":
				return "bg-success/20 hover:bg-success/30 text-success border-success/30";
			case "git":
				return "bg-accent/20 hover:bg-accent/30 text-accent-foreground border-accent/30";
			default:
				return "";
		}
	});
</script>

<style scoped>
	/* Shine animation on hover */
	.project-type-card::before {
		content: "";
		position: absolute;
		top: 0;
		left: -100%;
		width: 100%;
		height: 100%;
		background: linear-gradient(90deg, transparent, hsl(var(--foreground) / 0.05), transparent);
		transition: left 0.5s ease;
		pointer-events: none;
	}

	.project-type-card:hover::before {
		left: 100%;
	}
</style>

