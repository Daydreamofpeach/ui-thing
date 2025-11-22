<template>
	<div class="node-info-item">
		<UIcon v-if="icon" :name="icon" class="info-icon" :class="iconClass" />
		<span class="info-label">{{ label }}:</span>
		<span class="info-value" :class="valueClass">
			<slot>{{ value }}</slot>
		</span>
	</div>
</template>

<script setup lang="ts">
	interface Props {
		icon?: string
		iconClass?: string
		label: string
		value?: string
		valueClass?: string
	}

	withDefaults(defineProps<Props>(), {
		icon: undefined,
		iconClass: '',
		value: undefined,
		valueClass: ''
	});
</script>

<style scoped>
.node-info-item {
	display: flex;
	align-items: center;
	gap: 0.5rem;
	font-size: 0.75rem;
}

.info-icon {
	width: 0.75rem;
	height: 0.75rem;
	flex-shrink: 0;
}

.info-label {
	color: rgba(255, 255, 255, 0.6);
	font-weight: 500;
}

.info-value {
	color: rgba(255, 255, 255, 0.9);
	font-weight: 600;
	text-transform: capitalize;
}
</style>

