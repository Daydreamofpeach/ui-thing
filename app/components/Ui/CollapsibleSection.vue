<template>
	<div class="collapsible-section">
		<button
			@click="toggle"
			class="section-header"
			:class="{ 'is-open': isOpen }"
		>
			<div class="flex items-center gap-2">
				<UIcon :name="icon" class="w-4 h-4 text-purple-400" />
				<span class="text-sm font-medium text-white">{{ title }}</span>
			</div>
			<UIcon 
				:name="isOpen ? 'i-lucide-chevron-down' : 'i-lucide-chevron-right'" 
				class="w-4 h-4 text-gray-400 transition-transform duration-200"
			/>
		</button>
		<div 
			v-show="isOpen" 
			class="section-content"
			:class="{ 'is-open': isOpen }"
		>
			<slot />
		</div>
	</div>
</template>

<script setup lang="ts">
	import { ref } from 'vue';

	interface Props {
		title: string;
		icon: string;
		defaultOpen?: boolean;
	}

	const props = withDefaults(defineProps<Props>(), {
		defaultOpen: false
	});

	const isOpen = ref(props.defaultOpen);

	const toggle = () => {
		isOpen.value = !isOpen.value;
	};

	// Expose methods for parent components
	defineExpose({
		toggle,
		isOpen
	});
</script>

<style scoped>
.collapsible-section {
	border: 1px solid rgba(55, 65, 81, 0.5);
	border-radius: 0.5rem;
	overflow: hidden;
}

.section-header {
	width: 100%;
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 0.75rem;
	background: rgba(31, 41, 55, 0.3);
	transition: background-color 0.2s;
	cursor: pointer;
}

.section-header:hover {
	background: rgba(31, 41, 55, 0.5);
}

.section-header.is-open {
	background: rgba(31, 41, 55, 0.5);
}

.section-content {
	padding: 0.75rem;
	background: rgba(31, 41, 55, 0.2);
	transition: all 0.3s ease-in-out;
}

.section-content.is-open {
	border-top: 1px solid rgba(55, 65, 81, 0.3);
}
</style>

