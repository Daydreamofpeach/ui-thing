<template>
	<div class="collapsible-section-container">
		<!-- Section Header - Icon Only with Tooltip -->
		<UTooltip :text="title" :popper="{ placement: 'right' }">
			<button class="section-header" :class="{ active: !isCollapsed }" @click="toggleCollapse">
				<UIcon :name="icon" class="section-icon" />
				<UIcon
					:name="isCollapsed ? 'i-lucide-chevron-right' : 'i-lucide-chevron-down'"
					class="chevron-icon"
				/>
			</button>
		</UTooltip>

		<!-- Expanded Content -->
		<div v-show="!isCollapsed" class="section-content">
			<slot />
		</div>
	</div>
</template>

<script setup lang="ts">
	import { ref } from "vue";

	// Props
	interface Props {
		title: string
		icon: string
		defaultCollapsed?: boolean
	}

	const props = withDefaults(defineProps<Props>(), {
		defaultCollapsed: false
	});

	// Reactive state
	const isCollapsed = ref(props.defaultCollapsed);

	// Methods
	const toggleCollapse = () => {
		isCollapsed.value = !isCollapsed.value;
	};

	// Expose methods for parent components
	defineExpose({
		toggleCollapse,
		isCollapsed
	});
</script>

<style scoped>
.collapsible-section-container {
	margin-bottom: 0.375rem;
}

.section-header {
	width: 100%;
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 0.375rem;
	padding: 0.5rem 0.625rem;
	background: rgba(var(--color-neutral-rgb), 0.1);
	backdrop-filter: blur(18px) saturate(1.3);
	border: 1px solid rgba(255, 255, 255, 0.1);
	border-radius: 0.5rem;
	cursor: pointer;
	transition: all 0.3s ease;
	position: relative;
	overflow: hidden;
}

.section-header::before {
	content: '';
	position: absolute;
	top: 0;
	left: -100%;
	width: 100%;
	height: 100%;
	background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
	transition: left 0.5s ease;
}

.section-header:hover::before {
	left: 100%;
}

.section-header:hover {
	background: rgba(var(--color-primary-rgb), 0.12);
	border: 1px solid rgba(255, 255, 255, 0.15);
	border-right: 2px solid rgba(var(--color-primary-rgb), 0.6);
	box-shadow: 0 4px 12px rgba(var(--color-primary-rgb), 0.3);
}

.section-header.active {
	background: rgba(var(--color-primary-rgb), 0.08);
	border-right: 2px solid rgba(var(--color-primary-rgb), 0.5);
}

.section-icon {
	width: 16px;
	height: 16px;
	color: var(--color-primary);
	flex-shrink: 0;
	transition: all 0.2s ease;
}

.section-header:hover .section-icon {
	transform: scale(1.1);
}

.chevron-icon {
	width: 12px;
	height: 12px;
	color: rgba(255, 255, 255, 0.5);
	flex-shrink: 0;
	transition: transform 0.2s ease;
}

.section-content {
	padding: 0.5rem 0 0 0;
	animation: slideDown 0.2s ease;
}

@keyframes slideDown {
	from {
		opacity: 0;
		max-height: 0;
	}
	to {
		opacity: 1;
		max-height: 1000px;
	}
}
</style>

