<template>
	<div class="oscar-input-container">
		<div class="flex items-center gap-2">
			<input
				v-model="inputValue"
				type="text"
				placeholder="Ask Oscar anything..."
				class="oscar-input"
				@keyup.enter="handleSubmit"
			/>
			<button
				class="oscar-send-button"
				:disabled="!inputValue.trim()"
				@click="handleSubmit"
			>
				<Icon name="lucide:send" class="size-4" />
			</button>
		</div>
	</div>
</template>

<script setup lang="ts">
	import { ref } from "vue";

	interface Props {
		compact?: boolean
		showDebug?: boolean
	}

	const props = withDefaults(defineProps<Props>(), {
		compact: false,
		showDebug: false
	});

	const inputValue = ref("");

	function handleSubmit() {
		if (!inputValue.value.trim()) return;
		// TODO: Implement Oscar message sending
		console.log("Oscar input:", inputValue.value);
		inputValue.value = "";
	}
</script>

<style scoped>
.oscar-input-container {
	width: 100%;
}

.oscar-input {
	width: 100%;
	padding: 0.5rem 0.75rem;
	background: rgba(var(--color-neutral-rgb), 0.1);
	border: 1px solid rgba(var(--color-neutral-rgb), 0.2);
	border-radius: 0.5rem;
	color: var(--color-text);
	font-size: 0.875rem;
}

.oscar-input:focus {
	outline: none;
	border-color: var(--color-primary);
}

.oscar-send-button {
	padding: 0.5rem;
	background: var(--color-primary);
	color: white;
	border: none;
	border-radius: 0.5rem;
	cursor: pointer;
	transition: opacity 0.2s;
}

.oscar-send-button:disabled {
	opacity: 0.5;
	cursor: not-allowed;
}
</style>

