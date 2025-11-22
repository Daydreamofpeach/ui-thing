<template>
	<div class="step-navigation">
		<!-- Step Indicators -->
		<div class="step-indicators">
			<div
				v-for="step in totalSteps"
				:key="step"
				class="step-indicator"
				:class="{
					active: step === currentStep,
					completed: step < currentStep,
					pending: step > currentStep
				}"
				@click="handleStepClick(step)"
			>
				<div class="step-dot">
					<UIcon v-if="step < currentStep" name="i-lucide-check" class="size-3" />
					<span v-else class="step-number">{{ step }}</span>
				</div>
				<div v-if="step < totalSteps" class="step-line" />
			</div>
		</div>

		<!-- Custom Actions + Next Button -->
		<div class="step-actions">
			<slot name="actions" />
			<button
				v-if="showNextButton"
				class="nav-button next-button"
				:disabled="!canProgress"
				@click="handleNext"
			>
				<span>{{ nextButtonLabel }}</span>
				<UIcon name="i-lucide-arrow-right" class="size-4" />
			</button>
		</div>
	</div>
</template>

<script setup lang="ts">

	interface Props {
		currentStep: number
		totalSteps: number
		themeColor?: string
		showNextButton?: boolean
		canProgress?: boolean
		nextButtonLabel?: string
	}

	const props = withDefaults(defineProps<Props>(), {
		themeColor: "#10b981",
		showNextButton: true,
		canProgress: true,
		nextButtonLabel: "Continue"
	});

	const emit = defineEmits<{
		next: []
		stepClick: [step: number]
	}>();

	const handleNext = () => {
		if (props.canProgress) {
			emit("next");
		}
	};

	const handleStepClick = (step: number) => {
		if (step <= props.currentStep) {
			emit("stepClick", step);
		}
	};
</script>

<style scoped>
/* Navigation Container */
.step-navigation {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 1.5rem;
	padding: 1rem 1.5rem;
	background: rgba(255, 255, 255, 0.02);
	border-bottom: 1px solid rgba(255, 255, 255, 0.08);
	backdrop-filter: blur(10px);
}

/* Navigation Buttons */
.nav-button {
	display: flex;
	align-items: center;
	gap: 0.5rem;
	padding: 0.625rem 1.25rem;
	border: 1px solid rgba(255, 255, 255, 0.1);
	border-radius: 0.5rem;
	font-size: 0.875rem;
	font-weight: 600;
	cursor: pointer;
	transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
	white-space: nowrap;
	background: rgba(255, 255, 255, 0.03);
	color: rgba(255, 255, 255, 0.8);
	flex-shrink: 0;
}

.nav-button:hover:not(:disabled) {
	background: rgba(255, 255, 255, 0.06);
	border-color: rgba(255, 255, 255, 0.15);
	transform: translateY(-1px);
	color: rgba(255, 255, 255, 0.95);
}

.nav-button:active:not(:disabled) {
	transform: translateY(0);
}

.nav-button:disabled {
	opacity: 0.4;
	cursor: not-allowed;
}

/* Next Button */
.next-button {
	background: rgba(var(--color-primary-rgb), 0.15);
	border-color: rgba(var(--color-primary-rgb), 0.3);
	color: var(--color-primary);
	margin-left: auto;
}

.next-button:hover:not(:disabled) {
	background: rgba(var(--color-primary-rgb), 0.25);
	border-color: rgba(var(--color-primary-rgb), 0.4);
}

.next-button:disabled {
	background: rgba(255, 255, 255, 0.03);
	border-color: rgba(255, 255, 255, 0.08);
	color: rgba(255, 255, 255, 0.3);
}

/* Step Indicators Container */
.step-indicators {
	display: flex;
	align-items: center;
	gap: 0;
	flex: 1;
	justify-content: center;
	padding: 0 1rem;
}

.step-actions {
	display: flex;
	align-items: center;
	gap: 0.75rem;
	margin-left: auto;
}

/* Individual Step Indicator */
.step-indicator {
	display: flex;
	align-items: center;
	position: relative;
	cursor: pointer;
}

/* Step Dot */
.step-dot {
	width: 2.25rem;
	height: 2.25rem;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 0.75rem;
	font-weight: 700;
	transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	position: relative;
	z-index: 2;
	border: 2px solid rgba(255, 255, 255, 0.15);
	background: rgba(255, 255, 255, 0.03);
	color: rgba(255, 255, 255, 0.5);
}

/* Pending Step */
.step-indicator.pending .step-dot {
	border-color: rgba(255, 255, 255, 0.1);
	background: transparent;
	color: rgba(255, 255, 255, 0.3);
}

/* Completed Step */
.step-indicator.completed .step-dot {
	border-color: var(--color-primary);
	background: rgba(var(--color-primary-rgb), 0.25);
	color: var(--color-primary);
	box-shadow: 0 0 12px rgba(var(--color-primary-rgb), 0.3);
}

/* Active Step */
.step-indicator.active .step-dot {
	border-color: var(--color-primary);
	background: rgba(var(--color-primary-rgb), 0.2);
	color: var(--color-primary);
	transform: scale(1.1);
	box-shadow: 0 0 16px rgba(var(--color-primary-rgb), 0.4),
	            0 0 24px rgba(var(--color-primary-rgb), 0.2);
	animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
	0%, 100% {
		opacity: 1;
	}
	50% {
		opacity: 0.85;
	}
}

/* Step Hover Effect */
.step-indicator:hover .step-dot {
	transform: scale(1.05);
}

.step-indicator.active:hover .step-dot {
	transform: scale(1.15);
}

.step-indicator.completed:hover .step-dot {
	box-shadow: 0 0 16px rgba(var(--color-primary-rgb), 0.4);
}

/* Connection Line Between Steps */
.step-line {
	width: 3rem;
	height: 2px;
	background: rgba(255, 255, 255, 0.1);
	position: relative;
	transition: all 0.3s ease;
}

.step-indicator.completed .step-line {
	background: linear-gradient(
		90deg,
		rgba(var(--color-primary-rgb), 0.6) 0%,
		rgba(var(--color-primary-rgb), 0.3) 100%
	);
	box-shadow: 0 0 8px rgba(var(--color-primary-rgb), 0.2);
}

.step-indicator.active .step-line {
	background: rgba(255, 255, 255, 0.15);
}

/* Step Number */
.step-number {
	font-size: 0.75rem;
	font-weight: 700;
}
</style>

