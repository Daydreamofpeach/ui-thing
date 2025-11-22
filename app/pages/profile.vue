<template>
	<div class="max-w-3xl mx-auto p-6 space-y-6">
		<h1 class="text-2xl font-semibold tracking-tight">Profile</h1>
		<UiCard>
			<div class="flex items-center gap-4">
				<UiAvatar class="size-16">
					<UiAvatarImage :src="avatarUrl" :alt="displayName || 'User'" />
					<UiAvatarFallback>{{ avatarInitials }}</UiAvatarFallback>
				</UiAvatar>
				<div class="min-w-0">
					<div class="font-medium truncate">{{ displayName || 'User' }}</div>
					<div class="text-sm text-muted-foreground truncate">{{ displayEmail || '—' }}</div>
				</div>
			</div>
		</UiCard>
	</div>
</template>

<script setup lang="ts">
definePageMeta({
	middleware: ["auth"]
});

import UiCard from "~/components/Ui/Card/Card.vue";
import { computed } from "vue";
import { useGlobalUserContext } from "~/composables/useGlobalUserContext";

const { currentUserEmail } = useGlobalUserContext();
const displayEmail = computed(() => currentUserEmail.value || "");
const displayName = computed(() => {
	const email = displayEmail.value;
	return email ? email.split("@")[0] : "User";
});
const avatarUrl = computed(() => {
	const name = encodeURIComponent(displayName.value || (displayEmail.value.split("@")[0] || "User"));
	return `https://ui-avatars.com/api/?name=${name}&background=22272a&color=ffffff&size=128`;
});
const avatarInitials = computed(() => {
	const name = displayName.value || "";
	const parts = name.split(" ").filter(Boolean);
	if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
	if (parts.length === 1) return (parts[0][0] || "U").toUpperCase();
	return (displayEmail.value[0] || "U").toUpperCase();
});
</script>


