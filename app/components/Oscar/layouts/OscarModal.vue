<template>
	<div class="oscar-modal">
		<!-- Placeholder for Oscar Modal -->
		<div class="p-4 text-center text-muted-foreground">
			<Icon name="lucide:bot" class="size-8 mx-auto mb-2" />
			<p>Oscar Modal - Coming Soon</p>
		</div>
	</div>
</template>

<script setup lang="ts">
	import { watch } from "vue";

	interface Props {
		modelValue?: boolean
	}

	const props = defineProps<Props>();

	const emit = defineEmits<{
		"update:modelValue": [value: boolean]
	}>();

	watch(() => props.modelValue, (newValue) => {
		if (!newValue) {
			emit("update:modelValue", false);
		}
	});
</script>

<style scoped>
.oscar-modal {
	height: 100%;
	display: flex;
	align-items: center;
	justify-content: center;
}
</style>

