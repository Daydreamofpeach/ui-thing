<template>
	<div class="tab-group w-full" :data-variant="variant">
		<!-- Card Grid Variant - Tabs as Cards -->
		<div v-if="variant === 'cards'" class="tab-card-grid">
			<button
				v-for="tab in tabs"
				:key="tab.value"
				class="tab-card"
				:class="{ active: modelValue === tab.value }"
				:aria-selected="modelValue === tab.value"
				role="tab"
				@click="selectTab(tab.value)"
			>
				<div class="tab-card-icon-wrapper">
					<UIcon v-if="tab.icon" :name="tab.icon" class="tab-card-icon" />
				</div>
				<div class="tab-card-content">
					<span class="tab-card-label">{{ tab.label }}</span>
					<span v-if="tab.badge !== undefined" class="tab-card-badge">{{ tab.badge }}</span>
				</div>
			</button>
		</div>

		<!-- Compact Row Variant - Minimal Horizontal Tabs -->
		<div v-else-if="variant === 'compact-row'" class="tab-compact-row">
			<button
				v-for="tab in tabs"
				:key="tab.value"
				class="tab-compact-button"
				:class="{ active: modelValue === tab.value }"
				:aria-selected="modelValue === tab.value"
				role="tab"
				@click="selectTab(tab.value)"
			>
				<UIcon v-if="tab.icon" :name="tab.icon" class="tab-compact-icon" />
				<span class="tab-compact-label">{{ tab.label }}</span>
				<span v-if="tab.badge !== undefined" class="tab-compact-badge">{{ tab.badge }}</span>
			</button>
		</div>

		<!-- Traditional Tab Navigation -->
		<div v-else class="tab-navigation w-full">
			<button
				v-for="tab in tabs"
				:key="tab.value"
				class="tab-button"
				:class="{ active: modelValue === tab.value }"
				:aria-selected="modelValue === tab.value"
				role="tab"
				@click="selectTab(tab.value)"
			>
				<UIcon v-if="tab.icon" :name="tab.icon" class="tab-icon" />
				<span class="tab-label">{{ tab.label }}</span>
				<span v-if="tab.badge !== undefined" class="tab-badge">{{ tab.badge }}</span>
			</button>
		</div>

		<!-- Tab Content -->
		<div class="tab-content w-full" role="tabpanel">
			<slot :active-tab="modelValue" />
		</div>
	</div>
</template>

<script setup lang="ts">
	import { computed } from "vue";

	export interface Tab {
		label: string
		value: string
		icon?: string
		badge?: string | number
		disabled?: boolean
	}

	interface Props {
		tabs: Tab[]
		modelValue: string
		variant?: "default" | "pills" | "underline" | "cards" | "compact-row"
		size?: "sm" | "md" | "lg"
	}

	const props = withDefaults(defineProps<Props>(), {
		variant: "underline",
		size: "md"
	});

	const emit = defineEmits<{
		"update:modelValue": [value: string]
	}>();

	const selectTab = (value: string) => {
		emit("update:modelValue", value);
	};
</script>

<style scoped>
	.tab-group {
		display: flex;
		flex-direction: column;
		width: 100%;
	}

	/* Tab Navigation Container */
	.tab-navigation {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		border-bottom: 1px solid rgba(255, 255, 255, 0.1);
		background: transparent;
		position: relative;
		width: 100%;
	}

	/* Tab Button Base - Flex to fill space */
	.tab-button {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		padding: 1rem 2rem;
		font-size: 0.875rem;
		font-weight: 500;
		color: rgba(255, 255, 255, 0.6);
		background: transparent;
		border: none;
		border-bottom: 2px solid transparent;
		cursor: pointer;
		transition: all 0.2s ease;
		position: relative;
		white-space: nowrap;
		flex: 1;
		min-width: 0;
	}

	/* Tab Icon */
	.tab-icon {
		width: 1rem;
		height: 1rem;
		flex-shrink: 0;
	}

	/* Tab Label */
	.tab-label {
		flex-shrink: 0;
	}

	/* Tab Badge */
	.tab-badge {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-width: 1.25rem;
		height: 1.25rem;
		padding: 0 0.375rem;
		font-size: 0.6875rem;
		font-weight: 600;
		color: rgba(255, 255, 255, 0.8);
		background: rgba(255, 255, 255, 0.1);
		border-radius: 0.5rem;
		transition: all 0.2s ease;
	}

	/* Hover State - Subtle, no scale or transform */
	.tab-button:hover {
		color: rgba(255, 255, 255, 0.9);
		background: rgba(255, 255, 255, 0.05);
	}

	.tab-button:hover .tab-badge {
		background: rgba(255, 255, 255, 0.15);
		color: rgba(255, 255, 255, 0.95);
	}

	/* Active State */
	.tab-button.active {
		color: var(--color-primary);
		border-bottom-color: var(--color-primary);
	}

	.tab-button.active .tab-badge {
		color: var(--color-primary);
		background: rgba(var(--color-primary-rgb), 0.2);
		border: 1px solid rgba(var(--color-primary-rgb), 0.3);
	}

	/* Focus State */
	.tab-button:focus {
		outline: none;
		background: rgba(255, 255, 255, 0.08);
	}

	.tab-button:focus-visible {
		outline: 2px solid var(--color-primary);
		outline-offset: 2px;
	}

	/* Disabled State */
	.tab-button:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	/* Tab Content */
	.tab-content {
		flex: 1;
		min-height: 0;
	}

	/* Size Variants */
	.tab-group[data-size="sm"] .tab-button {
		padding: 0.625rem 1.25rem;
		font-size: 0.8125rem;
	}

	.tab-group[data-size="md"] .tab-button {
		padding: 1rem 2rem;
		font-size: 0.875rem;
	}

	.tab-group[data-size="lg"] .tab-button {
		padding: 1.25rem 2.5rem;
		font-size: 1rem;
	}

	/* ============================================================================ */
	/* CARD GRID VARIANT */
	/* ============================================================================ */

	.tab-card-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 1rem;
		width: 100%;
		margin-bottom: 1.5rem;
	}

	.tab-card {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 1rem;
		padding: 1.5rem;
		background: rgba(255, 255, 255, 0.03);
		border: 1.5px solid rgba(255, 255, 255, 0.1);
		border-radius: 0.75rem;
		cursor: pointer;
		transition: all 0.2s ease;
		min-height: 120px;
	}

	.tab-card:hover {
		background: rgba(255, 255, 255, 0.06);
		border-color: rgba(var(--color-primary-rgb), 0.3);
	}

	.tab-card.active {
		background: rgba(var(--color-primary-rgb), 0.15);
		border-color: var(--color-primary);
		border-width: 2px;
	}

	.tab-card-icon-wrapper {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 3rem;
		height: 3rem;
		background: rgba(var(--color-primary-rgb), 0.1);
		border: 1px solid rgba(var(--color-primary-rgb), 0.2);
		border-radius: 0.75rem;
		transition: all 0.2s ease;
	}

	.tab-card.active .tab-card-icon-wrapper {
		background: rgba(var(--color-primary-rgb), 0.25);
		border-color: var(--color-primary);
		transform: scale(1.05);
	}

	.tab-card-icon {
		width: 1.5rem;
		height: 1.5rem;
		color: rgba(255, 255, 255, 0.7);
	}

	.tab-card.active .tab-card-icon {
		color: var(--color-primary);
	}

	.tab-card-content {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
	}

	.tab-card-label {
		font-size: 0.875rem;
		font-weight: 600;
		color: rgba(255, 255, 255, 0.7);
		text-align: center;
	}

	.tab-card.active .tab-card-label {
		color: var(--color-primary);
	}

	.tab-card-badge {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-width: 1.5rem;
		height: 1.5rem;
		padding: 0 0.5rem;
		font-size: 0.75rem;
		font-weight: 700;
		color: rgba(255, 255, 255, 0.8);
		background: rgba(255, 255, 255, 0.1);
		border-radius: 0.5rem;
		transition: all 0.2s ease;
	}

	.tab-card.active .tab-card-badge {
		color: var(--color-primary);
		background: rgba(var(--color-primary-rgb), 0.25);
		border: 1px solid rgba(var(--color-primary-rgb), 0.4);
	}

	/* Focus State for Cards */
	.tab-card:focus {
		outline: none;
		background: rgba(255, 255, 255, 0.08);
	}

	.tab-card:focus-visible {
		outline: 2px solid var(--color-primary);
		outline-offset: 2px;
	}

	/* ============================================================================ */
	/* COMPACT ROW VARIANT */
	/* ============================================================================ */

	.tab-compact-row {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		width: 100%;
		margin-bottom: 1rem;
		padding: 0.5rem;
		background: rgba(255, 255, 255, 0.03);
		border-radius: 0.5rem;
		overflow-x: auto;
		scrollbar-width: thin;
	}

	.tab-compact-row::-webkit-scrollbar {
		height: 4px;
	}

	.tab-compact-row::-webkit-scrollbar-track {
		background: rgba(0, 0, 0, 0.2);
		border-radius: 2px;
	}

	.tab-compact-row::-webkit-scrollbar-thumb {
		background: rgba(255, 255, 255, 0.2);
		border-radius: 2px;
	}

	.tab-compact-row::-webkit-scrollbar-thumb:hover {
		background: rgba(255, 255, 255, 0.3);
	}

	.tab-compact-button {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		padding: 0.625rem 1rem;
		font-size: 0.8125rem;
		font-weight: 500;
		color: rgba(255, 255, 255, 0.6);
		background: rgba(255, 255, 255, 0.03);
		border: 1px solid rgba(255, 255, 255, 0.08);
		border-radius: 0.375rem;
		cursor: pointer;
		transition: all 0.2s ease;
		white-space: nowrap;
		flex: 1;
		min-width: 0;
	}

	.tab-compact-button:hover {
		color: rgba(255, 255, 255, 0.9);
		background: rgba(255, 255, 255, 0.06);
		border-color: rgba(255, 255, 255, 0.12);
	}

	.tab-compact-button.active {
		color: var(--color-primary);
		background: rgba(var(--color-primary-rgb), 0.15);
		border-color: rgba(var(--color-primary-rgb), 0.4);
		font-weight: 600;
	}

	.tab-compact-icon {
		width: 0.875rem;
		height: 0.875rem;
		flex-shrink: 0;
	}

	.tab-compact-label {
		flex-shrink: 0;
	}

	.tab-compact-badge {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-width: 1.125rem;
		height: 1.125rem;
		padding: 0 0.375rem;
		font-size: 0.625rem;
		font-weight: 700;
		color: rgba(255, 255, 255, 0.7);
		background: rgba(255, 255, 255, 0.1);
		border-radius: 0.375rem;
		transition: all 0.2s ease;
	}

	.tab-compact-button.active .tab-compact-badge {
		color: var(--color-primary);
		background: rgba(var(--color-primary-rgb), 0.25);
		border: 1px solid rgba(var(--color-primary-rgb), 0.3);
	}

	.tab-compact-button:focus {
		outline: none;
		background: rgba(255, 255, 255, 0.08);
	}

	.tab-compact-button:focus-visible {
		outline: 2px solid var(--color-primary);
		outline-offset: 2px;
	}

	/* Pills variant */
	.tab-group[data-variant="pills"] .tab-navigation {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(0, 1fr));
		gap: 0.375rem;
		padding: 0.5rem;
		background: rgba(0, 0, 0, 0.2);
		border-bottom: none;
		border-radius: 0.5rem;
	}

	.tab-group[data-variant="pills"] .tab-button {
		padding: 0.5rem 0.625rem;
		font-size: 0.6875rem;
		border-bottom: none;
		border-radius: 0.375rem;
		background: transparent;
	}

	.tab-group[data-variant="pills"] .tab-button:hover {
		background: rgba(255, 255, 255, 0.1);
	}

	.tab-group[data-variant="pills"] .tab-button.active {
		background: rgba(var(--color-primary-rgb), 0.2);
		border-bottom: none;
		color: var(--color-primary);
	}
</style>

