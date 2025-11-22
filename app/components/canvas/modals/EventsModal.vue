<template>
	<div v-if="isOpen" class="events-modal-overlay" @click="handleOverlayClick">
		<div class="events-modal" @click.stop>
			<!-- Modal Header -->
			<div class="modal-header">
				<div class="modal-title">
					<Icon name="lucide:zap" class="title-icon" />
					<h2>Select Event</h2>
				</div>
				<button class="close-button" @click="closeModal">
					<Icon name="lucide:x" class="w-5 h-5" />
				</button>
			</div>

			<!-- Modal Content -->
			<div class="modal-content">
				<Events
					:selectable="true"
					:selected="selectedEvent"
					@select="handleEventSelect"
				/>
			</div>

			<!-- Modal Footer -->
			<div class="modal-footer">
				<button class="cancel-button" @click="closeModal">
					Cancel
				</button>
				<button 
					class="confirm-button"
					:disabled="!selectedEvent"
					@click="confirmSelection"
				>
					<Icon name="lucide:check" class="w-4 h-4" />
					Select Event
				</button>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, watch, onUnmounted } from 'vue';
import Events from '@canvas/selectors/Events.vue';

// Props
const props = defineProps<{
	open: boolean;
	currentEvent?: string | null;
}>();

// Emits
const emit = defineEmits<{
	'update:open': [value: boolean];
	select: [eventName: string];
	close: [];
}>();

// State
const isOpen = ref(props.open);
const selectedEvent = ref<string | null>(props.currentEvent || null);

// Methods
function handleOverlayClick() {
	closeModal();
}

function closeModal() {
	isOpen.value = false;
	emit('update:open', false);
	emit('close');
}

function handleEventSelect(eventName: string) {
	selectedEvent.value = eventName;
}

function confirmSelection() {
	if (selectedEvent.value) {
		emit('select', selectedEvent.value);
		closeModal();
	}
}

// Watch for prop changes
watch(() => props.open, (newOpen) => {
	isOpen.value = newOpen;
});

watch(() => props.currentEvent, (newEvent) => {
	selectedEvent.value = newEvent;
});

// Handle escape key
function handleKeyDown(event: KeyboardEvent) {
	if (event.key === 'Escape' && isOpen.value) {
		closeModal();
	}
}

// Add/remove event listeners
watch(isOpen, (newIsOpen) => {
	if (newIsOpen) {
		document.addEventListener('keydown', handleKeyDown);
		document.body.style.overflow = 'hidden';
	} else {
		document.removeEventListener('keydown', handleKeyDown);
		document.body.style.overflow = '';
	}
});

// Cleanup on unmount
onUnmounted(() => {
	document.removeEventListener('keydown', handleKeyDown);
	document.body.style.overflow = '';
});
</script>

<style scoped>
.events-modal-overlay {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: rgba(0, 0, 0, 0.8);
	backdrop-filter: blur(8px);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 1000;
	padding: 1rem;
}

.events-modal {
	width: 100%;
	max-width: 600px;
	max-height: 80vh;
	background: rgba(var(--color-neutral-rgb), 0.95);
	border: 1px solid rgba(var(--color-neutral-rgb), 0.2);
	border-radius: 1rem;
	backdrop-filter: blur(20px);
	box-shadow: 
		0 20px 25px -5px rgba(0, 0, 0, 0.4),
		0 10px 10px -5px rgba(0, 0, 0, 0.2);
	display: flex;
	flex-direction: column;
	overflow: hidden;
}

/* Modal Header */
.modal-header {
	padding: 1.5rem;
	border-bottom: 1px solid rgba(var(--color-neutral-rgb), 0.15);
	display: flex;
	align-items: center;
	justify-content: space-between;
	background: rgba(var(--color-neutral-rgb), 0.05);
}

.modal-title {
	display: flex;
	align-items: center;
	gap: 0.75rem;
}

.title-icon {
	width: 1.25rem;
	height: 1.25rem;
	color: var(--color-primary);
}

.modal-title h2 {
	margin: 0;
	font-size: 1.125rem;
	font-weight: 600;
	color: rgba(255, 255, 255, 0.9);
}

.close-button {
	padding: 0.5rem;
	background: rgba(var(--color-neutral-rgb), 0.1);
	border: 1px solid rgba(var(--color-neutral-rgb), 0.2);
	border-radius: 0.5rem;
	color: rgba(255, 255, 255, 0.7);
	cursor: pointer;
	transition: all 0.2s ease;
	display: flex;
	align-items: center;
	justify-content: center;
}

.close-button:hover {
	background: rgba(239, 68, 68, 0.15);
	border-color: rgba(239, 68, 68, 0.3);
	color: rgb(248, 113, 113);
}

/* Modal Content */
.modal-content {
	flex: 1;
	padding: 1.5rem;
	overflow: auto;
	display: flex;
	flex-direction: column;
	min-height: 0;
}

/* Modal Footer */
.modal-footer {
	padding: 1.5rem;
	border-top: 1px solid rgba(var(--color-neutral-rgb), 0.15);
	background: rgba(var(--color-neutral-rgb), 0.05);
	display: flex;
	gap: 0.75rem;
	justify-content: flex-end;
}

.cancel-button {
	padding: 0.75rem 1.5rem;
	background: rgba(var(--color-neutral-rgb), 0.1);
	border: 1px solid rgba(var(--color-neutral-rgb), 0.2);
	border-radius: 0.5rem;
	color: rgba(255, 255, 255, 0.8);
	font-size: 0.875rem;
	font-weight: 500;
	cursor: pointer;
	transition: all 0.2s ease;
}

.cancel-button:hover {
	background: rgba(var(--color-neutral-rgb), 0.15);
	border-color: rgba(var(--color-neutral-rgb), 0.3);
	color: rgba(255, 255, 255, 0.9);
}

.confirm-button {
	padding: 0.75rem 1.5rem;
	background: rgba(var(--color-primary-rgb), 0.15);
	border: 1px solid rgba(var(--color-primary-rgb), 0.3);
	border-radius: 0.5rem;
	color: var(--color-primary);
	font-size: 0.875rem;
	font-weight: 500;
	cursor: pointer;
	transition: all 0.2s ease;
	display: flex;
	align-items: center;
	gap: 0.5rem;
}

.confirm-button:hover:not(:disabled) {
	background: rgba(var(--color-primary-rgb), 0.25);
	border-color: rgba(var(--color-primary-rgb), 0.5);
	transform: translateY(-1px);
}

.confirm-button:disabled {
	opacity: 0.5;
	cursor: not-allowed;
	transform: none;
}

.confirm-button:disabled:hover {
	background: rgba(var(--color-primary-rgb), 0.15);
	border-color: rgba(var(--color-primary-rgb), 0.3);
	transform: none;
}
</style>
