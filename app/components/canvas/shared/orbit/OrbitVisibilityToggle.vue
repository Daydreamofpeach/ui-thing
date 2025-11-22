<template>
	<div class="orbit-visibility-toggle">
		<!-- Show All Button -->
		<button
			v-if="!isExpanded"
			type="button"
			class="visibility-btn visibility-btn--show"
			:aria-label="showLabel"
			:title="showLabel"
			@click.stop="handleShow"
		>
			<UIcon name="i-lucide-maximize-2" class="w-4 h-4" />
			<span class="btn-label">{{ showLabel }}</span>
		</button>

		<!-- Hide All Button -->
		<button
			v-if="isExpanded"
			type="button"
			class="visibility-btn visibility-btn--hide"
			:aria-label="hideLabel"
			:title="hideLabel"
			@click.stop="handleHide"
		>
			<UIcon name="i-lucide-minimize-2" class="w-4 h-4" />
			<span class="btn-label">{{ hideLabel }}</span>
		</button>

		<!-- Node Count Badge -->
		<span v-if="nodeCount > 0" class="node-count-badge">
			{{ nodeCount }}
		</span>
	</div>
</template>

<script setup lang="ts">
interface Props {
	isExpanded: boolean
	nodeCount?: number
	showLabel?: string
	hideLabel?: string
}

const props = withDefaults(defineProps<Props>(), {
	nodeCount: 0,
	showLabel: "Show All",
	hideLabel: "Hide All"
});

const emit = defineEmits<{
	show: []
	hide: []
}>();

const handleShow = () => {
	emit("show");
};

const handleHide = () => {
	emit("hide");
};
</script>

<style scoped>
.orbit-visibility-toggle {
	display: flex;
	align-items: center;
	gap: 8px;
}

.visibility-btn {
	display: inline-flex;
	align-items: center;
	gap: 6px;
	padding: 6px 12px;
	border-radius: 6px;
	border: 1px solid rgba(148, 163, 184, 0.3);
	background: linear-gradient(135deg, rgba(59, 130, 246, 0.08), rgba(99, 102, 241, 0.06));
	color: rgba(255, 255, 255, 0.8);
	font-size: 12px;
	font-weight: 500;
	cursor: pointer;
	transition: all 0.2s ease;
	white-space: nowrap;
}

.visibility-btn:hover {
	background: linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(99, 102, 241, 0.12));
	border-color: rgba(59, 130, 246, 0.5);
	color: rgba(255, 255, 255, 0.95);
	box-shadow: 0 0 12px rgba(59, 130, 246, 0.2);
}

.visibility-btn:active {
	transform: scale(0.98);
}

.visibility-btn--show {
	background: linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(16, 185, 129, 0.08));
	border-color: rgba(34, 197, 94, 0.3);
	color: rgba(134, 239, 172, 0.9);
}

.visibility-btn--show:hover {
	background: linear-gradient(135deg, rgba(34, 197, 94, 0.18), rgba(16, 185, 129, 0.14));
	border-color: rgba(34, 197, 94, 0.6);
	box-shadow: 0 0 12px rgba(34, 197, 94, 0.2);
}

.visibility-btn--hide {
	background: linear-gradient(135deg, rgba(251, 191, 36, 0.1), rgba(245, 158, 11, 0.08));
	border-color: rgba(251, 191, 36, 0.3);
	color: rgba(253, 224, 71, 0.9);
}

.visibility-btn--hide:hover {
	background: linear-gradient(135deg, rgba(251, 191, 36, 0.18), rgba(245, 158, 11, 0.14));
	border-color: rgba(251, 191, 36, 0.6);
	box-shadow: 0 0 12px rgba(251, 191, 36, 0.2);
}

.btn-label {
	font-size: 11px;
	letter-spacing: 0.3px;
	text-transform: uppercase;
}

.node-count-badge {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	min-width: 20px;
	height: 20px;
	padding: 0 6px;
	border-radius: 10px;
	background: rgba(59, 130, 246, 0.2);
	border: 1px solid rgba(59, 130, 246, 0.4);
	font-size: 10px;
	font-weight: 600;
	color: rgba(147, 197, 253, 0.9);
}
</style>

