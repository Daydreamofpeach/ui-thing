<template>
	<div class="form-actions" :class="actionsClass">
		<slot />
	</div>
</template>

<script setup lang="ts">
	interface Props {
		actionsClass?: string
	}

	withDefaults(defineProps<Props>(), {
		actionsClass: ""
	});
</script>

<style scoped>
.form-actions {
	margin-top: 1.5rem;
	padding-top: 1rem;
	border-top: 1px solid rgba(var(--color-primary-rgb), 0.2);
	display: flex;
	flex-direction: column;
	gap: 0.75rem;
}
</style>
