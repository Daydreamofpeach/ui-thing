<template>
	<div class="min-h-screen bg-background">
		<div class="mx-auto flex w-full max-w-[480px] flex-col gap-6 px-4 py-12 md:py-20">
			<Card>
				<CardHeader class="flex flex-col items-center space-y-4 text-center">
					<img
						src="/WhiteSVGLogo.svg"
						alt="Buildit Logo"
						class="h-16 w-16"
					/>
					<div class="space-y-1">
						<CardTitle class="text-2xl font-semibold tracking-tight">Reset your password</CardTitle>
						<CardDescription>Securely regain access to your Buildit account.</CardDescription>
					</div>
				</CardHeader>

				<CardContent class="space-y-6">
					<div class="flex items-center justify-center gap-3 text-sm font-medium text-muted-foreground">
						<span :class="['flex h-8 w-8 items-center justify-center rounded-full border text-sm', step === 1 ? 'border-primary text-primary' : 'border-border']">
							1
						</span>
						<Separator class="h-px flex-1 bg-border" />
						<span :class="['flex h-8 w-8 items-center justify-center rounded-full border text-sm', step === 2 ? 'border-primary text-primary' : 'border-border']">
							2
						</span>
					</div>

				<Alert
					v-if="successMessage"
					class="border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-100"
				>
					<AlertTitle>{{ successMessage.title }}</AlertTitle>
					<AlertDescription>{{ successMessage.message }}</AlertDescription>
				</Alert>

				<Alert
					v-else-if="errorMessage"
					variant="destructive"
					class="border-destructive/40 bg-destructive/10"
				>
					<AlertTitle>Something went wrong</AlertTitle>
					<AlertDescription>{{ errorMessage }}</AlertDescription>
				</Alert>

					<form
						v-if="step === 1"
						class="space-y-5"
						@submit.prevent="handleRequestReset"
					>
					<div class="space-y-2">
						<Label for="reset-email">Email address</Label>
						<Input
							id="reset-email"
							v-model="form.email"
							type="email"
							inputmode="email"
							autocomplete="email"
							placeholder="you@example.com"
							required
							:disabled="isSubmitting"
						/>
					</div>

					<p class="text-sm text-muted-foreground">
						We'll send a secure reset link and verification code to your inbox. The link expires in 60 minutes.
					</p>

					<div class="flex justify-center">
						<TurnstileWrapper
							v-model="state.turnstileToken"
							:options="turnstileOptions"
							@loading="handleTurnstileLoading"
							@success="handleTurnstileSuccess"
							@error="handleTurnstileError"
						/>
					</div>

					<Button
						type="submit"
						class="w-full"
						:disabled="requestDisabled"
					>
						<span v-if="isSubmitting">Sending reset link…</span>
						<span v-else>Send reset link</span>
					</Button>
				</form>

					<form
						v-else
						class="space-y-5"
						@submit.prevent="handleResetPassword"
					>
					<div class="grid gap-4 md:grid-cols-2">
						<div class="space-y-2 md:col-span-2">
							<Label for="reset-code">Reset code or link</Label>
							<Input
								id="reset-code"
								v-model="form.resetCode"
								type="text"
								placeholder="Paste the code or the full reset link"
								required
								:disabled="isSubmitting"
							/>
						</div>

						<div class="space-y-2">
							<Label for="new-password">New password</Label>
							<Input
								id="new-password"
								v-model="form.password"
								type="password"
								autocomplete="new-password"
								placeholder="Create a new password"
								required
								:disabled="isSubmitting"
							/>
						</div>

						<div class="space-y-2">
							<Label for="confirm-password">Confirm password</Label>
							<Input
								id="confirm-password"
								v-model="form.confirmPassword"
								type="password"
								autocomplete="new-password"
								placeholder="Re-enter new password"
								required
								:disabled="isSubmitting"
							/>
						</div>
					</div>

					<p class="text-sm text-muted-foreground">
						Use at least 8 characters with a mix of upper &amp; lowercase letters, numbers, and symbols.
					</p>

					<div class="flex justify-center">
						<TurnstileWrapper
							v-model="state.resetTurnstileToken"
							:options="turnstileOptions"
							@loading="handleResetTurnstileLoading"
							@success="handleResetTurnstileSuccess"
							@error="handleResetTurnstileError"
						/>
					</div>

					<div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
						<Button
							type="button"
							variant="outline"
							class="sm:w-auto"
							:disabled="isSubmitting"
							@click="step = 1"
						>
							Start over
						</Button>

						<Button
							type="submit"
							class="sm:flex-1"
							:disabled="resetDisabled"
						>
							<span v-if="isSubmitting">Updating password…</span>
							<span v-else>Update password</span>
						</Button>
					</div>
				</form>
				</CardContent>

				<CardFooter class="flex flex-col gap-2 text-center text-sm text-muted-foreground">
					<span>
						Remembered your password?
						<NuxtLink to="/auth/login" class="text-primary hover:underline">
							Return to sign in
						</NuxtLink>
					</span>
					<span class="text-xs text-muted-foreground/70">
						If you didn’t receive the email, check your spam folder or contact
						<a href="mailto:support@buildit.ai" class="text-primary hover:underline">
							support@buildit.ai
						</a>.
					</span>
				</CardFooter>
			</Card>
		</div>
	</div>
</template>

<script setup lang="ts">
	import { computed, reactive, ref } from "vue";
	import { useToast, navigateTo } from "#imports";
	import TurnstileWrapper from "~/components/Ui/TurnstileWrapper.vue";
	import { buttClient } from "~/utils/buttClient";
	import authMessages from "~/data/auth-messages.json";

	definePageMeta({
		layout: "landing",
		name: "auth-reset-password"
	});

	useHead({
		title: "Reset password | Buildit"
	});

	const toast = useToast();

	const step = ref<1 | 2>(1);

	const form = reactive({
		email: "",
		resetCode: "",
		password: "",
		confirmPassword: ""
	});

	const state = reactive({
		turnstileToken: null as string | null,
		turnstileLoading: true,
		turnstileReady: false,
		resetTurnstileToken: null as string | null,
		resetTurnstileLoading: true,
		resetTurnstileReady: false,
		isSubmitting: false
	});

	const errorMessage = ref<string | null>(null);
	const successMessage = ref<{ title: string; message: string } | null>(null);

	const turnstileOptions = {
		theme: "light",
		size: "normal",
		appearance: "always",
		execution: "render",
		"retry-interval": 8000,
		"refresh-expired": "auto",
		"response-field-name": "cf-turnstile-response"
	} as const;

	const isSubmitting = computed(() => state.isSubmitting);

	const requestDisabled = computed(() => {
		return isSubmitting.value
			|| !form.email.trim()
			|| state.turnstileLoading
			|| !state.turnstileReady;
	});

	const resetDisabled = computed(() => {
		return isSubmitting.value
			|| !form.resetCode.trim()
			|| !form.password
			|| form.password.length < 8
			|| form.password !== form.confirmPassword
			|| state.resetTurnstileLoading
			|| !state.resetTurnstileReady;
	});

	const resolveResetError = (code: string): { title: string; message: string } => {
		const errors = authMessages.password_reset?.errors ?? {};
		const general = authMessages.general?.errors ?? {};
		const fallback = {
			title: "Reset failed",
			message: "We couldn't process your request. Please try again in a few minutes."
		};

		const key = code.toLowerCase();
		return errors[key as keyof typeof errors]
			|| general[key as keyof typeof general]
			|| fallback;
	};

	const extractCode = (input: string) => {
		if (input.includes("buildit://")) {
			try {
				const url = new URL(input);
				const code = url.searchParams.get("code");
				if (code) {
					return code;
				}
			} catch {
				// ignore parsing issues and return raw input
			}
		}
		return input;
	};

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

	const handleResetTurnstileLoading = (value: boolean) => {
		state.resetTurnstileLoading = value;
	};

	const handleResetTurnstileSuccess = (value: boolean) => {
		state.resetTurnstileReady = value;
	};

	const handleResetTurnstileError = (value: boolean) => {
		if (value) {
			state.resetTurnstileLoading = false;
			state.resetTurnstileReady = false;
		}
	};

	const handleRequestReset = async () => {
		if (requestDisabled.value) {
			return;
		}

		state.isSubmitting = true;
		errorMessage.value = null;
		successMessage.value = null;

		try {
			await buttClient.sendReset("client", {
				identifier: form.email.trim(),
				turnstileToken: state.turnstileToken ?? undefined
			});

			const success = authMessages.password_reset?.success;
			successMessage.value = {
				title: success?.title ?? "Reset link sent",
				message: success?.message ?? "Check your email for the reset instructions."
			};

			toast.add({
				title: successMessage.value.title,
				description: successMessage.value.message,
				color: "success"
			});

			step.value = 2;
		} catch (err) {
			console.error("Reset request failed:", err);
			const message = err instanceof Error ? err.message : "unknown error";
			const details = resolveResetError(message);
			errorMessage.value = details.message;
			toast.add({
				title: details.title,
				description: details.message,
				color: "error"
			});
		} finally {
			state.isSubmitting = false;
		}
	};

	const handleResetPassword = async () => {
		if (resetDisabled.value) {
			return;
		}

		if (form.password !== form.confirmPassword) {
			errorMessage.value = "Passwords do not match. Please re-enter your new password.";
			return;
		}

		state.isSubmitting = true;
		errorMessage.value = null;
		successMessage.value = null;

		try {
			await buttClient.reset("client", {
				code: extractCode(form.resetCode.trim()),
				password: form.password,
				turnstileToken: state.resetTurnstileToken ?? undefined
			});

			const success = authMessages.password_reset?.success;
			successMessage.value = {
				title: "Password updated",
				message: success?.action ?? "Your password has been reset. You can sign in with your new credentials."
			};

			toast.add({
				title: successMessage.value.title,
				description: successMessage.value.message,
				color: "success"
			});

			setTimeout(() => {
				void navigateTo({
					path: "/auth/login",
					query: { email: form.email }
				});
			}, 2000);
		} catch (err) {
			console.error("Password reset failed:", err);
			const message = err instanceof Error ? err.message : "unknown error";
			const details = resolveResetError(message);
			errorMessage.value = details.message;
			toast.add({
				title: details.title,
				description: details.message,
				color: "error"
			});
		} finally {
			state.isSubmitting = false;
		}
	};
</script>

