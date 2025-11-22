<template>
	<Teleport to="body">
		<div
			v-if="isVisible && color"
			class="view-overlay"
			:style="overlayStyle"
			@click="handleClick"
		>
			<!-- View Info Badge -->
			<div class="view-info-badge" @click.stop>
				<div class="badge-content">
					<UIcon name="i-lucide-eye" class="badge-icon" />
					<span class="badge-text">{{ viewName }}</span>
					<button
						v-if="showClose"
						class="close-btn"
						title="Exit view layer"
						@click="emit('close')"
					>
						<UIcon name="i-lucide-x" class="size-4" />
					</button>
				</div>
			</div>
		</div>
	</Teleport>
</template>

<script setup lang="ts">
	import { computed } from "vue";
	import UIcon from "~/components/Ui/Icon.vue";

	const props = withDefaults(defineProps<{
		isVisible: boolean
		color: string
		opacity?: number
		viewName?: string
		showClose?: boolean
		zIndex?: number
	}>(), {
		opacity: 50,
		viewName: "View Layer",
		showClose: true,
		zIndex: 10
	});

	const emit = defineEmits<{
		close: []
		click: []
	}>();

	const overlayStyle = computed(() => {
		// Convert hex to RGB for opacity control
		let r = 0, g = 0, b = 0;
		
		if (props.color.startsWith("#")) {
			const hex = props.color.replace("#", "");
			r = parseInt(hex.substring(0, 2), 16);
			g = parseInt(hex.substring(2, 4), 16);
			b = parseInt(hex.substring(4, 6), 16);
		}

		return {
			background: `rgba(${r}, ${g}, ${b}, ${props.opacity / 100})`,
			zIndex: props.zIndex,
			pointerEvents: "none" // Allow clicks through to canvas
		};
	});

	const handleClick = () => {
		emit("click");
	};
</script>

<style scoped>
.view-overlay {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	transition: all 0.3s ease;
}

.view-info-badge {
	position: absolute;
	top: 20px;
	right: 20px;
	pointer-events: auto;
	animation: slideIn 0.3s ease;
}

@keyframes slideIn {
	from {
		opacity: 0;
		transform: translateX(20px);
	}
	to {
		opacity: 1;
		transform: translateX(0);
	}
}

.badge-content {
	display: flex;
	align-items: center;
	gap: 8px;
	padding: 10px 16px;
	background: linear-gradient(135deg, rgba(17, 24, 39, 0.95), rgba(31, 41, 55, 0.95));
	backdrop-filter: blur(20px);
	border: 1px solid rgba(255, 255, 255, 0.2);
	border-radius: 20px;
	box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.badge-icon {
	width: 18px;
	height: 18px;
	color: #3b82f6;
}

.badge-text {
	font-size: 0.9rem;
	font-weight: 600;
	color: white;
}

.close-btn {
	padding: 4px;
	background: rgba(239, 68, 68, 0.2);
	border: 1px solid rgba(239, 68, 68, 0.3);
	border-radius: 50%;
	color: #ef4444;
	cursor: pointer;
	transition: all 0.2s;
	display: flex;
	align-items: center;
	justify-content: center;
}

.close-btn:hover {
	background: rgba(239, 68, 68, 0.3);
	transform: scale(1.1);
}
</style>

