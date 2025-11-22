<template>
	<div class="space-y-4">
		<div class="flex items-center justify-between gap-2">
			<h2 class="text-2xl font-semibold tracking-tight">Members</h2>
			<div class="flex items-center gap-2">
				<UiButton size="sm" variant="outline" :disabled="isLoadingMembers" @click="fetchMembers()">
					<Icon name="lucide:refresh-cw" class="size-4 mr-2" />
					Reload
				</UiButton>
				<UiButton size="icon" variant="ghost" title="Invite member" :disabled="!selectedOrgId" @click="openInvite">
					<Icon name="lucide:user-plus" class="size-4" />
				</UiButton>
			</div>
		</div>

		<UiCard class="p-0 overflow-hidden">
			<div class="border-b px-4 py-3 flex items-center justify-between">
				<span class="text-sm text-muted-foreground">Organisation members</span>
				<span v-if="selectedOrgId" class="text-xs text-muted-foreground">Org ID: {{ selectedOrgId }}</span>
			</div>
			<div v-if="isLoadingMembers" class="p-6 text-sm text-muted-foreground">Loading members…</div>
			<div v-else>
				<div v-if="members.length === 0" class="p-6 text-sm text-muted-foreground">
					No members found for this organisation.
				</div>
				<ul v-else class="divide-y">
					<li v-for="m in members" :key="m.id || m.email" class="px-4 py-3 flex items-center justify-between">
						<div class="min-w-0 flex items-center gap-3">
							<div class="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-foreground/80 text-xs font-semibold">
								{{ getMemberInitial(m.name || m.email || '') }}
							</div>
							<div class="min-w-0">
								<div class="font-medium truncate">{{ m.name || m.email || 'Unknown' }}</div>
								<div class="text-xs text-muted-foreground truncate">{{ m.email }}</div>
							</div>
							<UiBadge :variant="'soft'" :color="getMemberRoleColor(m)" class="ml-2">
								{{ getMemberRole(m) }}
							</UiBadge>
						</div>
					</li>
				</ul>
				<div v-if="hasMoreMembers" class="px-4 py-3 border-t">
					<UiButton size="sm" variant="ghost" @click="toggleMemberList">
						{{ showAllMembers ? 'Show less' : 'Show all' }}
					</UiButton>
				</div>
			</div>
		</UiCard>

		<UiCard class="p-0 overflow-hidden">
			<div class="border-b px-4 py-3 flex items-center justify-between">
				<span class="text-sm text-muted-foreground">Pending invitations</span>
				<span v-if="isLoadingInvites" class="text-xs text-muted-foreground">Loading…</span>
			</div>
			<div v-if="!hasPendingInvites && !isLoadingInvites" class="p-6 text-sm text-muted-foreground">
				No pending invitations.
			</div>
			<ul v-else class="divide-y">
				<li v-for="inv in pendingInvitations" :key="inv.id" class="px-4 py-3 flex items-center justify-between">
					<div class="min-w-0">
						<div class="font-medium truncate">{{ inv.email }}</div>
						<div class="text-xs text-muted-foreground truncate">Status: {{ inv.status }}</div>
					</div>
				</li>
			</ul>
		</UiCard>

		<OrgMemberInvitationModal
			v-model:open="inviteOpen"
			:organisation-id="selectedOrgId || ''"
			:organisation-name="undefined"
			@invitationSent="onInvitationSent"
		/>
	</div>
	</template>

<script setup lang="ts">
import { ref, watch, computed } from "vue";
import UiButton from "~/components/Ui/Button.vue";
import UiCard from "~/components/Ui/Card/Card.vue";
import UiBadge from "~/components/Ui/Badge.vue";
import { useSelectedOrganisationId } from "~/composables/useSelectedOrganisationId";
import { useOrganizationMembers } from "~/composables/useOrganizationMembers";
import OrgMemberInvitationModal from "~/components/users/OrgMemberInvitationModal.vue";
import { useOrganizationInvitations } from "~/composables/useOrganizationInvitations";

const selectedOrgId = useSelectedOrganisationId();

const {
	members,
	isLoadingMembers,
	hasMoreMembers,
	showAllMembers,
	fetchMembers,
	toggleMemberList,
	getMemberInitial,
	getMemberRole,
	getMemberRoleColor,
} = useOrganizationMembers(selectedOrgId);

const {
	pendingInvitations,
	isLoading: isLoadingInvites,
	error: invitesError,
	fetchInvitations,
} = useOrganizationInvitations(selectedOrgId);

const hasPendingInvites = computed(() => (pendingInvitations.value?.length || 0) > 0);

const inviteOpen = ref(false);

function openInvite() {
	if (!selectedOrgId?.value) return;
	inviteOpen.value = true;
}

function onInvitationSent() {
	void fetchMembers();
	void fetchInvitations();
}

watch(selectedOrgId, () => {
	void fetchMembers();
	void fetchInvitations();
});
</script>


