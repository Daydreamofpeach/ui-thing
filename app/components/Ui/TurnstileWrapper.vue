<template>
	<div class="turnstile-wrapper">
		<ClientOnly>
			<template #default>
				<NuxtTurnstile
					v-if="mounted && canRender && !hasError && siteKey"
					v-model="internalToken"
					:site-key="siteKey"
					:options="computedOptions"
					@error="handleError"
				/>
				<div v-else-if="hasError" class="turnstile-error-fallback">
					<svg class="turnstile-error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
					</svg>
					<p class="text-xs text-gray-500">
						Security verification unavailable
					</p>
				</div>
				<div v-else-if="!siteKey" class="turnstile-error-fallback">
					<svg class="turnstile-error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
					</svg>
					<p class="text-xs text-gray-500">
						Security verification not configured
					</p>
				</div>
			</template>
			<template #fallback>
				<div class="turnstile-loading">
					<div class="turnstile-spinner" />
					<p class="text-xs text-gray-500">
						Loading verification...
					</p>
				</div>
			</template>
		</ClientOnly>

		<!-- Loading indicator BELOW the widget -->
		<div v-if="isLoading && !hasError && mounted && siteKey" class="turnstile-loading-indicator">
			<div class="turnstile-spinner-small" />
			<p class="turnstile-loading-text">
				Loading security verification...
			</p>
		</div>
	</div>
</template>

<script setup lang="ts">
	import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
	import { useTurnstileSingleton } from "~/composables/useTurnstileSingleton";

	const props = defineProps<{
		modelValue?: string | null
		options?: Record<string, any>
	}>();

	const emit = defineEmits<{
		"update:modelValue": [value: string | null]
		loading: [value: boolean]
		success: [value: boolean]
		error: [value: boolean]
	}>();

	// Generate unique instance ID
	const instanceId = `turnstile-${Math.random().toString(36).substr(2, 9)}`;
	const { registerInstance, unregisterInstance } = useTurnstileSingleton();

	const internalToken = ref<string | null>(props.modelValue || null);
	const hasError = ref(false);
	const mounted = ref(false);
	const siteKey = ref<string | null>(null);
	const isLoading = ref(true);
	const canRender = ref(false);

	// Computed options with safer defaults
	const computedOptions = computed(() => ({
		theme: "light",
		size: "normal",
		appearance: "always",
		execution: "render",
		"retry-interval": 8000,
		"refresh-expired": "auto",
		"response-field-name": "cf-turnstile-response",
		...props.options
	}));

	// Mount lifecycle - register singleton instance
	onMounted(() => {
		// Try to register this instance
		const registered = registerInstance(instanceId);

		if (!registered) {
			console.warn(`[TurnstileWrapper] Instance ${instanceId} not allowed - another Turnstile is active`);
			hasError.value = true;
			isLoading.value = false;
			emit("loading", false);
			emit("error", true);
			return;
		}

		// Set mounted flag immediately; defer rendering until we resolve the site key
		mounted.value = true;
		isLoading.value = true;
		emit("loading", true);

		// Get site key from runtime config
		try {
			// @ts-ignore - useRuntimeConfig is auto-imported by Nuxt
			const config = useRuntimeConfig();
			const possibleKey = config?.public?.turnstile?.siteKey ?? config?.public?.NUXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";
			siteKey.value = typeof possibleKey === "string" ? possibleKey.trim() : "";
			canRender.value = !!siteKey.value;

			if (!siteKey.value) {
				console.warn("[TurnstileWrapper] No site key configured");
				hasError.value = true;
				isLoading.value = false;
				emit("loading", false);
				emit("error", true);
			} else {
				console.debug("[TurnstileWrapper] Using site key from runtime config");
			}
		} catch (error) {
			console.error("[TurnstileWrapper] Error accessing runtime config:", error);
			hasError.value = true;
			isLoading.value = false;
			emit("loading", false);
			emit("error", true);
		}
	});

	// Cleanup on unmount
	onBeforeUnmount(() => {
		unregisterInstance(instanceId);
		mounted.value = false;
		canRender.value = false;
		internalToken.value = null;
	});

	// Watch for internal token changes and emit them
	watch(internalToken, (newValue) => {
		try {
			emit("update:modelValue", newValue);

			// If we received a token, verification is successful
			if (newValue) {
				isLoading.value = false;
				emit("loading", false);
				emit("success", true);
				console.debug("[TurnstileWrapper] Verification successful");
			} else {
				// Token was cleared, back to loading state
				isLoading.value = true;
				emit("loading", true);
				emit("success", false);
			}
		} catch (error) {
			// Silently handle any emission errors
			console.debug("[TurnstileWrapper] Error emitting token update:", error);
		}
	});

	// Watch for external changes
	watch(() => props.modelValue, (newValue) => {
		if (newValue !== internalToken.value) {
			internalToken.value = newValue || null;
		}
	});

	// Handle Turnstile errors with better logging
	const handleError = (error: any) => {
		// Suppress console spam from Cloudflare SDK
		if (error?.message?.includes("plugins")) {
			// These are internal Cloudflare errors we can't control
			return;
		}

		console.debug("[TurnstileWrapper] Turnstile error:", error);
		hasError.value = true;
		isLoading.value = false;
		emit("loading", false);
		emit("error", true);
		emit("success", false);
	};
</script>

<style scoped>
.turnstile-wrapper {
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	gap: 0.5rem;
	min-height: 65px;
}

.turnstile-loading-indicator {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 0.5rem;
	padding: 0.5rem 0;
	animation: fadeIn 0.3s ease-in;
}

.turnstile-loading-text {
	font-size: 0.75rem;
	color: rgba(255, 255, 255, 0.7);
	font-weight: 500;
	margin: 0;
}

.turnstile-spinner {
	width: 24px;
	height: 24px;
	border: 3px solid rgba(255, 255, 255, 0.1);
	border-top-color: rgba(255, 255, 255, 0.8);
	border-radius: 50%;
	animation: spin 0.8s linear infinite;
}

.turnstile-spinner-small {
	width: 16px;
	height: 16px;
	border: 2px solid rgba(255, 255, 255, 0.1);
	border-top-color: rgba(255, 255, 255, 0.8);
	border-radius: 50%;
	animation: spin 0.8s linear infinite;
}

.turnstile-error-fallback,
.turnstile-loading {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	gap: 0.5rem;
	padding: 1rem;
	background: rgba(255, 255, 255, 0.05);
	border: 1px dashed rgba(255, 255, 255, 0.2);
	border-radius: 0.5rem;
	min-height: 65px;
}

.turnstile-error-icon {
	width: 1.5rem;
	height: 1.5rem;
	color: rgba(255, 165, 0, 0.8);
}

.turnstile-loading {
	animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes spin {
	to {
		transform: rotate(360deg);
	}
}

@keyframes pulse {
	0%, 100% {
		opacity: 1;
	}
	50% {
		opacity: 0.5;
	}
}

@keyframes fadeIn {
	from {
		opacity: 0;
	}
	to {
		opacity: 1;
	}
}
</style>
