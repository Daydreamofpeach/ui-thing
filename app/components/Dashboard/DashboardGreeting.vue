<template>
	<div class="mb-6 flex items-start justify-between gap-4 lg:items-center">
		<div class="flex flex-col">
			<h1 class="text-lg font-bold tracking-tight lg:text-2xl">Welcome back{{ displayName ? `, ${displayName}` : "" }}!</h1>
			<p class="text-sm text-muted-foreground lg:text-base">
				Below is a summary for your workspace.
			</p>
		</div>
		<UiDropdownMenu>
			<UiDropdownMenuTrigger as-child>
				<UiButton variant="ghost" class="relative size-9 rounded-full ring-1 ring-muted/50">
					<UiAvatar class=" ">
						<UiAvatarImage :src="avatarUrl" :alt="displayName || 'User'" />
						<UiAvatarFallback>{{ avatarInitials }}</UiAvatarFallback>
					</UiAvatar>
				</UiButton>
			</UiDropdownMenuTrigger>
			<UiDropdownMenuContent class="w-52" align="end">
				<UiDropdownMenuLabel class="flex font-normal">
					<div class="flex flex-col space-y-1">
						<p class="text-sm leading-none font-medium">{{ displayName || 'User' }}</p>
						<p class="text-xs leading-none text-muted-foreground">{{ displayEmail || '—' }}</p>
					</div>
				</UiDropdownMenuLabel>
				<UiDropdownMenuSeparator />
				<UiDropdownMenuItem title="Profile" shortcut="⇧⌘P" @click="navigateTo('/profile')" />
				<UiDropdownMenuSeparator />
				<UiDropdownMenuItem title="Log out" shortcut="⇧⌘Q" variant="destructive" />
			</UiDropdownMenuContent>
		</UiDropdownMenu>
	</div>
	</template>

<script setup lang="ts">
import { useGlobalUserContext } from "~/composables/useGlobalUserContext";

const { currentUserEmail } = useGlobalUserContext();
const displayEmail = computed(() => currentUserEmail.value || "");
const displayName = computed(() => {
	const email = displayEmail.value;
	return email ? email.split("@")[0] : "User";
});
const avatarUrl = computed(() => {
	const name = encodeURIComponent(displayName.value || (displayEmail.value.split("@")[0] || "User"));
	return `https://ui-avatars.com/api/?name=${name}&background=22272a&color=ffffff&size=64`;
});
const avatarInitials = computed(() => {
	const name = displayName.value || "";
	const parts = name.split(" ").filter(Boolean);
	if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
	if (parts.length === 1) return (parts[0][0] || "U").toUpperCase();
	return (displayEmail.value[0] || "U").toUpperCase();
});
</script>


