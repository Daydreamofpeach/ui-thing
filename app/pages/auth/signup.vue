<template>
	<div class="min-h-screen bg-background">
		<div class="mx-auto flex w-full max-w-[480px] flex-col gap-6 px-4 py-12 md:py-24">
			<UiCard>
				<UiCardHeader class="flex flex-col items-center space-y-2 text-center">
					<h1 class="text-2xl font-semibold tracking-tight">Create your account</h1>
					<p class="text-sm text-muted-foreground">Join Buildit to get started.</p>
				</UiCardHeader>
				<UiCardContent class="grid gap-6">
					<UiAlert v-if="errorDetails" variant="destructive">
						<UiAlertTitle>{{ errorDetails.title }}</UiAlertTitle>
						<UiAlertDescription>{{ errorDetails.message }}</UiAlertDescription>
					</UiAlert>

					<form class="grid gap-4" @submit.prevent="onSubmit">
						<div class="grid gap-2">
							<UiLabel for="name">Full name</UiLabel>
							<UiInput id="name" v-model="form.name" type="text" autocomplete="name" placeholder="Jane Doe" required />
						</div>
						<div class="grid gap-2">
							<UiLabel for="email">Email address</UiLabel>
							<UiInput id="email" v-model="form.email" type="email" inputmode="email" autocomplete="email" placeholder="you@example.com" required />
						</div>
						<div class="grid gap-2">
							<UiLabel for="password">Password</UiLabel>
							<UiInput id="password" v-model="form.password" type="password" autocomplete="new-password" placeholder="••••••••" required />
						</div>

						<UiButton type="submit" class="w-full" :disabled="isSubmitting">
							<span v-if="isSubmitting">Creating account…</span>
							<span v-else>Create account</span>
						</UiButton>
					</form>
				</UiCardContent>
				<UiCardFooter class="flex flex-col gap-2 text-center text-sm text-muted-foreground">
					<span>
						Already have an account?
						<NuxtLink to="/auth/login" class="text-primary font-medium hover:underline">
							Sign in
						</NuxtLink>
					</span>
				</UiCardFooter>
			</UiCard>
		</div>
	</div>
</template>

<script setup lang="ts">
	import { reactive, ref } from "vue";
	import { useToast, navigateTo } from "#imports";
	import { signupUser, type SignupResult } from "~/services/auth/signup";
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

	definePageMeta({
		layout: "landing",
		name: "auth-signup"
	});

	useHead({
		title: "Create account | Buildit"
	});

	// useToast is the toast function (auto-imported from vue-sonner)

	const form = reactive({
		name: "",
		email: "",
		password: ""
	});

	const errorDetails = ref<{ title: string; message: string } | null>(null);
	const isSubmitting = ref(false);

	const onSubmit = async () => {
		if (isSubmitting.value) return;
		isSubmitting.value = true;
		errorDetails.value = null;
		try {
			const result: SignupResult = await signupUser({
				name: form.name.trim(),
				email: form.email.trim(),
				password: form.password
			});

			if (result.success) {
				useToast.success("Account created", {
					description: "You're all set. Please sign in."
				});
				await navigateTo("/auth/login");
				return;
			}

			if (result.error) {
				errorDetails.value = {
					title: result.error.title,
					message: result.error.message
				};
				useToast.error(result.error.title, {
					description: result.error.message
				});
			}
		} catch (err) {
			errorDetails.value = {
				title: "Signup failed",
				message: "We couldn't create your account. Please try again."
			};
		} finally {
			isSubmitting.value = false;
		}
	};
</script>


