<template>
	<div class="oscar-messages">
		<div v-if="messages.length === 0" class="empty-state">
			<Icon name="lucide:bot" class="size-12 mx-auto mb-4 text-muted-foreground" />
			<p class="text-sm text-muted-foreground text-center">
				Start a conversation with Oscar
			</p>
		</div>
		<div v-else class="messages-list">
			<div
				v-for="message in messages"
				:key="message.id"
				class="message-item"
				:class="message.type"
			>
				<div class="message-content">
					{{ message.content }}
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
	import { ref } from "vue";
	import type { OscarMessage } from "../types/oscar.types";

	interface Props {
		compact?: boolean
		selectedProject?: any
	}

	const props = withDefaults(defineProps<Props>(), {
		compact: false,
		selectedProject: undefined
	});

	const messages = ref<OscarMessage[]>([]);
</script>

<style scoped>
.oscar-messages {
	height: 100%;
	padding: 1rem;
	overflow-y: auto;
}

.empty-state {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	height: 100%;
}

.messages-list {
	display: flex;
	flex-direction: column;
	gap: 1rem;
}

.message-item {
	padding: 0.75rem;
	border-radius: 0.5rem;
}

.message-item.user {
	background: rgba(var(--color-primary-rgb), 0.1);
	align-self: flex-end;
	max-width: 80%;
}

.message-item.assistant {
	background: rgba(var(--color-neutral-rgb), 0.1);
	align-self: flex-start;
	max-width: 80%;
}

.message-content {
	font-size: 0.875rem;
	line-height: 1.5;
}
</style>

