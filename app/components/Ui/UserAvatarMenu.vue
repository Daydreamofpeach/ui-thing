<template>
	<div>
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
				<UiDropdownMenuItem title="Profile" @click="navigateTo('/profile')" />
				<UiDropdownMenuSeparator />
				<UiDropdownMenuItem title="Log out" variant="destructive" />
			</UiDropdownMenuContent>
		</UiDropdownMenu>
	</div>
</template>

<script setup lang="ts">
import { useGlobalUserContext } from "~/composables/useGlobalUserContext";
import { getButtClient } from "~/utils/buttClient";
import { onMounted } from "vue";

const { currentUserEmail, currentUserId } = useGlobalUserContext();
const displayEmail = computed(() => currentUserEmail.value || "");
const displayName = computed(() => {
	const email = displayEmail.value;
	return email ? email.split("@")[0] : "User";
});
const avatarInitials = computed(() => {
	const name = displayName.value || "";
	const parts = name.split(" ").filter(Boolean);
	if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
	if (parts.length === 1) return (parts[0][0] || "U").toUpperCase();
	return (displayEmail.value[0] || "U").toUpperCase();
});

const avatarUrl = ref<string>("");
const imageError = ref(false);

function buildFallbackAvatar() {
	const name = encodeURIComponent(displayName.value || "User");
	return `https://ui-avatars.com/api/?name=${name}&background=22272a&color=ffffff&size=64`;
}

async function loadAvatar() {
	imageError.value = false;
	// Try getting icon from API using userId
	try {
		const id = currentUserId.value;
		if (id) {
			const client = getButtClient();
			const res = await (client as any).getUserIcon(id);
			if (res?.icon) {
				avatarUrl.value = res.icon as string;
				return;
			}
		}
	} catch {
		// ignore and fallback
	}
	avatarUrl.value = buildFallbackAvatar();
}

// Only run avatar fetch on client to avoid SSR lifecycle warnings
if (typeof window !== "undefined") {
	onMounted(() => {
		loadAvatar();
	});
	watch([currentUserId, displayName, displayEmail], () => {
		loadAvatar();
	});
} else {
	avatarUrl.value = buildFallbackAvatar();
}
</script>


