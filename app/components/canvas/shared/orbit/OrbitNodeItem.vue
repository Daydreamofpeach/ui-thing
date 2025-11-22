<template>
	<button
		type="button"
		class="orbit-node-item"
		:class="{
			'orbit-node-item--active': isActive,
			'orbit-node-item--disabled': item.disabled,
			'orbit-node-item--open': isOpen
		}"
		:style="itemStyle"
		:title="item.tooltip || item.label"
		:aria-label="item.tooltip || item.label"
		@click="handleClick"
	>
		<!-- Halo Effect -->
		<span class="orbit-node-item__halo" :style="haloStyle" />

		<!-- Badge -->
		<div
			class="orbit-node-item__badge"
			:class="{ 'orbit-node-item__badge--active': isActive }"
			:style="badgeStyle"
		>
			<div class="orbit-node-item__badge-content">
				<slot name="icon" :item="item">
					<UIcon
						v-if="item.icon"
						:name="item.icon"
						class="orbit-node-item__badge-icon"
						:class="{ 'orbit-node-item__badge-icon--active': isActive }"
						:style="iconStyle"
					/>
					<span v-else class="orbit-node-item__badge-initial">
						{{ (item.initial || item.label || "?").trim().charAt(0).toUpperCase() }}
					</span>
				</slot>
			</div>
		</div>

		<!-- Status Indicator -->
		<div v-if="isOpen" class="orbit-node-item__status">
			<UIcon name="i-lucide-check-circle-2" class="w-3 h-3" />
		</div>
	</button>
</template>

<script setup lang="ts">
import { computed } from "vue";

interface OrbitItem {
	id: string
	icon?: string
	label: string
	color?: string
	disabled?: boolean
	tooltip?: string
	badgeGradient?: [string, string]
	haloColor?: string
	iconColor?: string
	initial?: string
	payload?: Record<string, any>
}

interface Props {
	item: OrbitItem
	isActive?: boolean
	isOpen?: boolean
	itemStyle?: Record<string, any>
	badgeStyle?: Record<string, any>
	haloStyle?: Record<string, any>
	iconStyle?: Record<string, any>
}

const props = withDefaults(defineProps<Props>(), {
	isActive: false,
	isOpen: false,
	itemStyle: () => ({}),
	badgeStyle: () => ({}),
	haloStyle: () => ({}),
	iconStyle: () => ({})
});

const emit = defineEmits<{
	select: [item: OrbitItem]
}>();

const handleClick = () => {
	if (!props.item.disabled) {
		emit("select", props.item);
	}
};
</script>

<style scoped>
.orbit-node-item {
	position: relative;
	display: flex;
	align-items: center;
	justify-content: center;
	width: 44px;
	height: 44px;
	border: none;
	background: transparent;
	cursor: pointer;
	transition: all 0.2s ease;
	padding: 0;
}

.orbit-node-item:hover {
	transform: scale(1.1);
}

.orbit-node-item--disabled {
	opacity: 0.4;
	cursor: not-allowed;
}

.orbit-node-item--active {
	transform: scale(1.15);
}

.orbit-node-item--open .orbit-node-item__badge {
	box-shadow: 0 0 20px rgba(34, 197, 94, 0.4);
}

.orbit-node-item__halo {
	position: absolute;
	inset: -8px;
	border-radius: 50%;
	opacity: 0;
	transition: opacity 0.3s ease;
	pointer-events: none;
}

.orbit-node-item:hover .orbit-node-item__halo,
.orbit-node-item--active .orbit-node-item__halo {
	opacity: 1;
}

.orbit-node-item__badge {
	position: relative;
	display: flex;
	align-items: center;
	justify-content: center;
	width: 44px;
	height: 44px;
	border-radius: 8px;
	border: 2px solid rgba(255, 255, 255, 0.2);
	background: rgba(0, 0, 0, 0.4);
	transition: all 0.2s ease;
	z-index: 1;
}

.orbit-node-item__badge--active {
	border-color: rgba(59, 130, 246, 0.8);
	box-shadow: 0 0 16px rgba(59, 130, 246, 0.4);
}

.orbit-node-item__badge-content {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 100%;
	height: 100%;
}

.orbit-node-item__badge-icon {
	width: 20px;
	height: 20px;
	color: rgba(255, 255, 255, 0.7);
	transition: all 0.2s ease;
}

.orbit-node-item__badge-icon--active {
	color: rgba(147, 197, 253, 0.95);
}

.orbit-node-item__badge-initial {
	font-size: 16px;
	font-weight: 600;
	color: rgba(255, 255, 255, 0.8);
	text-transform: uppercase;
}

.orbit-node-item__status {
	position: absolute;
	top: -4px;
	right: -4px;
	display: flex;
	align-items: center;
	justify-content: center;
	width: 16px;
	height: 16px;
	border-radius: 50%;
	background: rgba(34, 197, 94, 0.9);
	border: 2px solid rgba(0, 0, 0, 0.8);
	color: white;
	z-index: 2;
	box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}
</style>

