<template>
	<div class="node-info-grid">
		<slot />
	</div>
</template>

<script setup lang="ts">
	// Container component for displaying node information in a grid layout
</script>

<style scoped>
.node-info-grid {
	display: flex;
	flex-direction: column;
	gap: 0.5rem;
}
</style>

