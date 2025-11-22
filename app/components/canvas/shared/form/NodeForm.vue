<template>
	<div class="node-form" :class="formClass">
		<slot />
	</div>
</template>

<script setup lang="ts">
	interface Props {
		formClass?: string
	}

	withDefaults(defineProps<Props>(), {
		formClass: ""
	});
</script>

<style scoped>
.node-form {
	padding: 1.5rem;
	margin: 1rem;
	border-radius: 0.5rem;
	background: rgba(var(--color-neutral-rgb), 0.12);
	backdrop-filter: blur(24px) saturate(1.8);
	border: 1px solid rgba(var(--color-primary-rgb), 0.25);
	box-shadow:
		0 4px 12px rgba(0, 0, 0, 0.15),
		0 0 0 1px rgba(var(--color-primary-rgb), 0.1),
		inset 0 1px 0 rgba(255, 255, 255, 0.1);
}
</style>
