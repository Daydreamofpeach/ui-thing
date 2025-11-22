<template>
	<div class="form-section" :class="sectionClass">
		<label v-if="label || $slots.label" class="form-label">
			<slot name="label-icon">
				<UIcon v-if="icon" :name="icon" class="w-3 h-3" />
			</slot>
			<slot name="label">
				<span>{{ label }}</span>
			</slot>
			<slot name="label-badge" />
		</label>
		<slot />
	</div>
</template>

<script setup lang="ts">
	import UIcon from "~/components/Ui/Icon.vue";

	interface Props {
		label?: string
		icon?: string
		sectionClass?: string
	}

	withDefaults(defineProps<Props>(), {
		label: undefined,
		icon: undefined,
		sectionClass: ""
	});
</script>

<style scoped>
.form-section {
	margin-bottom: 1.5rem;
}

.form-section:last-child {
	margin-bottom: 0;
}

.form-label {
	display: flex;
	align-items: center;
	gap: 0.5rem;
	font-size: 0.875rem;
	font-weight: 600;
	color: rgba(255, 255, 255, 0.9);
	margin-bottom: 0.75rem;
}
</style>
