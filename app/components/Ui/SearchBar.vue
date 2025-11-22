<template>
	<div class="search-bar">
		<div class="search-input-wrapper">
			<Icon name="i-lucide-search" class="search-icon" />
			<input
				:value="modelValue"
				type="text"
				:placeholder="placeholder"
				class="search-input"
				@input="handleInput"
				@focus="handleFocus"
				@keydown.escape="handleClear"
			>
			<button v-if="modelValue" class="clear-button" title="Clear search" @click="handleClear">
				<Icon name="i-lucide-x" class="size-4" />
			</button>
		</div>
	</div>
</template>

<script setup lang="ts">
import Icon from "~/components/Ui/Icon.vue";
	interface Props {
		modelValue: string
		placeholder?: string
	}

	withDefaults(defineProps<Props>(), {
		placeholder: "Search..."
	});

	const emit = defineEmits<{
		"update:modelValue": [value: string]
		focus: []
	}>();

	const handleInput = (event: Event) => {
		const target = event.target as HTMLInputElement;
		emit("update:modelValue", target.value);
	};

	const handleFocus = () => { emit("focus"); };
	const handleClear = () => { emit("update:modelValue", ""); };
</script>

<style scoped>
	.search-bar { width: 100%; }
	.search-input-wrapper { position: relative; display: flex; align-items: center; width: 100%; }
	.search-icon { position: absolute; left: 1rem; width: 1.25rem; height: 1.25rem; color: rgba(255, 255, 255, 0.4); pointer-events: none; z-index: 1; }
	.search-input { width: 100%; padding: 0.875rem 3rem 0.875rem 3rem; background: rgba(0, 0, 0, 0.6); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.15); border-radius: 0.75rem; color: rgba(255, 255, 255, 0.95); font-size: 0.9375rem; font-weight: 500; transition: all 0.3s ease; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2); }
	.search-input::placeholder { color: rgba(255, 255, 255, 0.4); }
	.search-input:focus { outline: none; border-color: var(--color-primary); background: rgba(0, 0, 0, 0.7); box-shadow: 0 0 0 3px rgba(var(--color-primary-rgb), 0.15), 0 4px 16px rgba(0, 0, 0, 0.3); }
	.clear-button { position: absolute; right: 0.75rem; display: flex; align-items: center; justify-content: center; width: 2rem; height: 2rem; background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.15); border-radius: 0.5rem; color: rgba(255, 255, 255, 0.6); cursor: pointer; transition: all 0.2s ease; }
	.clear-button:hover { background: rgba(255, 255, 255, 0.15); border-color: rgba(255, 255, 255, 0.25); color: rgba(255, 255, 255, 0.9); }
</style>

