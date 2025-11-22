<template>
	<div class="space-y-4">
		<DashboardGreeting />
		<p class="text-muted-foreground">Use the Overview panel above to select an organisation and view projects.</p>

		<!-- Organization Members (live org state) -->
		<div class="space-y-3">
			<div class="flex items-center justify-between">
				<h3 class="text-lg font-semibold tracking-tight">Organisation members</h3>
				<div class="flex items-center gap-2">
					<UiButton size="sm" variant="outline" :disabled="isLoadingMembers" @click="fetchMembers()">
						<Icon name="lucide:refresh-cw" class="size-4 mr-2" />
						Reload
					</UiButton>
					<UiButton size="icon" variant="ghost" title="Invite member" :disabled="!selectedOrgId" @click="inviteOpen = true">
						<Icon name="lucide:user-plus" class="size-4" />
					</UiButton>
				</div>
			</div>

			<UiCard class="p-0 overflow-hidden">
				<div class="border-b px-4 py-3 flex items-center justify-between">
					<span class="text-sm text-muted-foreground">
						{{ selectedOrgId ? 'Members for organisation ' + selectedOrgId : 'Select an organisation to view members' }}
					</span>
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
				</div>
			</UiCard>
		</div>

		<OrgMemberInvitationModal
			v-model:open="inviteOpen"
			:organisation-id="selectedOrgId || ''"
			:organisation-name="undefined"
			@invitationSent="onInvitationSent"
		/>
	</div>

</template>

<script setup lang="ts">
import DashboardGreeting from "~/components/dashboard/DashboardGreeting.vue";
import { ref, watch } from "vue";
import UiButton from "~/components/Ui/Button.vue";
import UiCard from "~/components/Ui/Card/Card.vue";
import UiBadge from "~/components/Ui/Badge.vue";
import { useSelectedOrganisationId } from "~/composables/useSelectedOrganisationId";
import { useOrganizationMembers } from "~/composables/useOrganizationMembers";
import OrgMemberInvitationModal from "~/components/users/OrgMemberInvitationModal.vue";

const selectedOrgId = useSelectedOrganisationId();
const inviteOpen = ref(false);

const {
	members,
	isLoadingMembers,
	fetchMembers,
	getMemberInitial,
	getMemberRole,
	getMemberRoleColor,
} = useOrganizationMembers(selectedOrgId);

function onInvitationSent() {
	void fetchMembers();
}

watch(selectedOrgId, () => {
	void fetchMembers();
});
</script>


