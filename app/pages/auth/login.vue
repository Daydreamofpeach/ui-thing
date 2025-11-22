<template>
	<div class="min-h-screen bg-background">
		<div class="mx-auto flex w-full max-w-[480px] flex-col gap-6 px-4 py-12 md:py-24">
			<UiCard>
				<UiCardHeader class="flex flex-col items-center space-y-4">
					<img
						src="/WhiteSVGLogo.svg"
						alt="Buildit Logo"
						class="h-16 w-16"
					/>
					<h1 class="text-2xl font-semibold tracking-tight">Sign in to Buildit</h1>
				</UiCardHeader>

				<UiCardContent class="grid gap-6">
					<UiAlert v-if="errorDetails" variant="destructive">
						<UiAlertTitle>{{ errorDetails.title }}</UiAlertTitle>
						<UiAlertDescription>{{ errorDetails.message }}</UiAlertDescription>
					</UiAlert>

					<form class="grid gap-4" @submit.prevent="handleSubmit">
						<div class="grid gap-2">
							<UiLabel for="email">Email address</UiLabel>
							<UiInput
								id="email"
								v-model="form.email"
								type="email"
								inputmode="email"
								autocomplete="email"
								placeholder="you@example.com"
								required
							/>
						</div>

						<div class="grid gap-2">
							<div class="flex items-center justify-between">
								<UiLabel for="password">Password</UiLabel>
								<NuxtLink to="/auth/reset-password" class="text-sm text-primary hover:underline">
									Forgot password?
								</NuxtLink>
							</div>
							<UiInput
								id="password"
								v-model="form.password"
								type="password"
								autocomplete="current-password"
								placeholder="••••••••"
								required
							/>
						</div>

						<div class="flex justify-center">
							<TurnstileWrapper
								v-model="state.turnstileToken"
								:options="turnstileOptions"
								@loading="handleTurnstileLoading"
								@success="handleTurnstileSuccess"
								@error="handleTurnstileError"
							/>
						</div>

						<UiButton type="submit" class="w-full" :disabled="submitDisabled">
							<span v-if="isSubmitting">Signing in…</span>
							<span v-else>Sign in</span>
						</UiButton>
					</form>

				<div class="grid gap-4">
					<UiSeparator />
					<UiButton type="button" variant="outline" class="w-full gap-2" :disabled="isSubmitting" @click="handleGithub">
						<Icon name="mdi:github" class="size-4" />
						Continue with GitHub
					</UiButton>
				</div>
				</UiCardContent>

				<UiCardFooter class="flex flex-col gap-2 text-center text-sm text-muted-foreground">
					<span>
						Need an account?
						<NuxtLink to="/auth/signup" class="text-primary font-medium hover:underline">
							Create one now
						</NuxtLink>
					</span>
					<span class="text-xs">
						By signing in you agree to our
						<NuxtLink to="/legal/terms" class="text-primary hover:underline">Terms</NuxtLink>
						and
						<NuxtLink to="/legal/privacy" class="text-primary hover:underline">Privacy Policy</NuxtLink>.
					</span>
				</UiCardFooter>
			</UiCard>
		</div>
	</div>
</template>

<script setup lang="ts">
	import { computed, inject, reactive, ref, watch } from "vue";
	import { useRoute, useToast, navigateTo } from "#imports";
	import TurnstileWrapper from "~/components/Ui/TurnstileWrapper.vue";
	import { useUnifiedAuth } from "~/composables/useUnifiedAuth";
	import authMessages from "~/data/auth-messages.json";
	import type { useLoginLoader } from "~/composables/useLoginLoader";
	import UiCard from "~/components/Ui/Card/Card.vue";
	import UiCardHeader from "~/components/Ui/Card/Header.vue";
	import UiCardContent from "~/components/Ui/Card/Content.vue";
	import UiCardFooter from "~/components/Ui/Card/Footer.vue";
	import UiAlert from "~/components/Ui/Alert/Alert.vue";
	import UiAlertTitle from "~/components/Ui/Alert/Title.vue";
	import UiAlertDescription from "~/components/Ui/Alert/Description.vue";
	import UiInput from "~/components/Ui/Input.vue";
	import UiLabel from "~/components/Ui/Label.vue";
	import UiButton from "~/components/Ui/Button.vue";
	import UiSeparator from "~/components/Ui/Separator.vue";

	definePageMeta({
		layout: "landing",
		name: "auth-login"
	});

	useHead({
		title: "Sign in | Buildit"
	});

	const route = useRoute();
	// useToast is the toast function (auto-imported from vue-sonner)

	const { login, loginWithGithub, isLoading, error, clearError } = useUnifiedAuth();
	const loginLoader = inject("loginLoader") as ReturnType<typeof useLoginLoader> | undefined;

	const form = reactive({
		email: "",
		password: ""
	});

	const state = reactive({
		turnstileToken: null as string | null,
		turnstileLoading: true,
		turnstileReady: false,
		isSubmitting: false
	});

	const errorDetails = ref<{ title: string; message: string } | null>(null);

	const turnstileOptions = {
		theme: "light",
		size: "normal",
		appearance: "always",
		execution: "render",
		"retry-interval": 8000,
		"refresh-expired": "auto",
		"response-field-name": "cf-turnstile-response"
	} as const;

	const resolveErrorMessage = (code: string | null): { title: string; message: string } | null => {
		if (!code) {
			return null;
		}

		const key = code.toLowerCase();
		const loginErrors = authMessages.login?.errors ?? {};
		const generalErrors = authMessages.general?.errors ?? {};
		const fallback = loginErrors["unknown error"] ?? {
			title: "Authentication failed",
			message: "We couldn't sign you in. Please verify your details and try again."
		};

		return loginErrors[key as keyof typeof loginErrors]
			|| generalErrors[key as keyof typeof generalErrors]
			|| fallback;
	};

	watch(error, (code) => {
		errorDetails.value = resolveErrorMessage(code);
	});

	const isSubmitting = computed(() => state.isSubmitting || isLoading.value);

	const submitDisabled = computed(() => {
		return isSubmitting.value
			|| !form.email.trim()
			|| !form.password
			|| state.turnstileLoading
			|| !state.turnstileReady;
	});

	const redirectTo = computed(() => {
		const raw = route.query.redirect;
		if (typeof raw === "string" && raw.startsWith("/")) {
			return raw;
		}
		return "/dashboard";
	});

	const handleTurnstileLoading = (value: boolean) => {
		state.turnstileLoading = value;
	};

	const handleTurnstileSuccess = (value: boolean) => {
		state.turnstileReady = value;
	};

	const handleTurnstileError = (value: boolean) => {
		if (value) {
			state.turnstileLoading = false;
			state.turnstileReady = false;
		}
	};

	const runDashboardTransition = async () => {
		if (!loginLoader) {
			await navigateTo(redirectTo.value);
			return;
		}

		loginLoader.startLoading("Loading dashboard...", 5000, true);
		loginLoader.updateProgress(5);

		setTimeout(() => loginLoader.updateProgress(15), 150);
		setTimeout(() => loginLoader.updateProgress(35), 350);
		setTimeout(() => loginLoader.updateProgress(55), 650);

		try {
			await navigateTo(redirectTo.value);
		} finally {
			setTimeout(() => {
				loginLoader.updateProgress(85);

				setTimeout(() => {
					loginLoader.updateProgress(100);
					setTimeout(() => {
						loginLoader.completeLoading();
					}, 250);
				}, 450);
			}, 600);
		}
	};

	const handleSubmit = async () => {
		if (submitDisabled.value) {
			return;
		}

		state.isSubmitting = true;
		errorDetails.value = null;

		try {
			const result = await login({
				email: form.email.trim(),
				password: form.password,
				turnstileToken: state.turnstileToken ?? undefined
			});

			if (result && "access_token" in result) {
				const success = authMessages.login?.success;
				useToast.success(success?.title ?? "Signed in", {
					description: success?.message ?? "You're now signed in."
				});

				clearError();
				await runDashboardTransition();
			}
		} catch (err) {
			const message = resolveErrorMessage(error.value ?? "unknown error");
			if (message) {
				errorDetails.value = message;
				useToast.error(message.title, {
					description: message.message
				});
			}
			console.error("Login failed:", err);
		} finally {
			state.isSubmitting = false;
		}
	};

	const handleGithub = async () => {
		state.isSubmitting = true;
		errorDetails.value = null;

		try {
			await loginWithGithub();
			await runDashboardTransition();
		} catch (err: unknown) {
			const description = err instanceof Error ? err.message : "GitHub login is not available yet.";
			errorDetails.value = {
				title: "GitHub login unavailable",
				message: description
			};
			useToast.warning("GitHub login unavailable", {
				description
			});
		} finally {
			state.isSubmitting = false;
		}
	};
</script>

