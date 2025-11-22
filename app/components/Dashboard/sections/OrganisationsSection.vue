<template>
	<div class="space-y-4">
		<div class="flex items-center justify-between">
			<h2 class="text-2xl font-semibold tracking-tight">Organisations</h2>
		</div>
		<UiCard class="p-0 overflow-hidden">
			<div class="border-b px-4 py-3 flex items-center justify-between">
				<span class="text-sm text-muted-foreground">Manage your organisations</span>
				<UiButton size="sm" variant="outline" @click="openCreate">
					<Icon name="lucide:plus" class="size-4 mr-2" />
					New organisation
				</UiButton>
			</div>
			<div v-if="isLoading" class="p-6 text-sm text-muted-foreground">Loading organisations…</div>
			<div v-else>
				<div v-if="list.length === 0" class="p-6 text-sm text-muted-foreground">
					No organisations found. Create your first one.
				</div>
				<ul v-else class="divide-y">
					<li v-for="org in list" :key="org.id" class="px-4 py-3 flex items-center justify-between">
						<div class="min-w-0">
							<div class="font-medium truncate">{{ org.name }}</div>
							<div class="text-xs text-muted-foreground truncate">{{ org.description || 'No description' }}</div>
						</div>
						<div class="flex items-center gap-1">
							<UiButton size="icon" variant="ghost" title="Edit" @click="openEdit(org)">
								<Icon name="lucide:pencil" class="size-4" />
							</UiButton>
							<UiButton size="icon" variant="ghost" title="Delete" @click="openDelete(org)">
								<Icon name="lucide:trash-2" class="size-4" />
							</UiButton>
						</div>
					</li>
				</ul>
			</div>
		</UiCard>

		<!-- Modals -->
		<OrganisationCreateModal
			v-model:open="isCreateOpen"
            :submitting="submittingCreate"
			@submit="onCreateSubmit"
		/>
		<OrganisationEditModal
			v-model:open="isEditOpen"
            :submitting="submittingEdit"
			:organisation="selectedOrg || undefined"
			@submit="onEditSubmit"
		/>
		<OrganisationDeleteModal
			v-model:open="isDeleteOpen"
            :submitting="submittingDelete"
			:organisation="selectedOrg || undefined"
			@confirm="onDeleteConfirm"
		/>
	</div>
</template>

<script setup lang="ts">
import { onMounted, computed, ref } from "vue";
import UiCard from "~/components/Ui/Card/Card.vue";
import UiButton from "~/components/Ui/Button.vue";
import { useOrganisations } from "~/composables/useOrganisations";
import type { OrganisationPayload } from "~/services/organisations";
import OrganisationCreateModal from "~/components/dashboard/organisations/OrganisationCreateModal.vue";
import OrganisationEditModal from "~/components/dashboard/organisations/OrganisationEditModal.vue";
import OrganisationDeleteModal from "~/components/dashboard/organisations/OrganisationDeleteModal.vue";

const { organisations, isLoadingOrganisations, refreshOrganisations, apiCreate, apiUpdate, apiDelete } = useOrganisations();
const isLoading = computed(() => isLoadingOrganisations.value);
const list = computed(() => organisations.value || []);

// Modal state
const isCreateOpen = ref(false);
const isEditOpen = ref(false);
const isDeleteOpen = ref(false);
const submittingCreate = ref(false);
const submittingEdit = ref(false);
const submittingDelete = ref(false);
const selectedOrg = ref<any | null>(null);

onMounted(() => {
	refreshOrganisations();
});

function openCreate() {
	isCreateOpen.value = true;
}

async function onCreateSubmit(payload: OrganisationPayload) {
	try {
		submittingCreate.value = true;
		const created = await apiCreate(payload);
		if (created?.name) {
			useToast.success("Organisation created", { description: created.name });
		}
		isCreateOpen.value = false;
		refreshOrganisations();
	} catch (e: any) {
		useToast.error("Create failed", { description: e?.message || String(e) });
	} finally {
		submittingCreate.value = false;
	}
}

function openEdit(org: any) {
	selectedOrg.value = org;
	isEditOpen.value = true;
}

async function onEditSubmit(payload: { id: string | number; name: string; description?: string; email?: string }) {
	try {
		submittingEdit.value = true;
		await apiUpdate(payload.id, { name: payload.name, description: payload.description, email: payload.email });
		useToast.success("Organisation updated", { description: payload.name });
		isEditOpen.value = false;
		selectedOrg.value = null;
		refreshOrganisations();
	} catch (e: any) {
		useToast.error("Update failed", { description: e?.message || String(e) });
	} finally {
		submittingEdit.value = false;
	}
}

function openDelete(org: any) {
	selectedOrg.value = org;
	isDeleteOpen.value = true;
}

async function onDeleteConfirm() {
	if (!selectedOrg.value) return;
	try {
		submittingDelete.value = true;
		await apiDelete(selectedOrg.value.id);
		useToast.success("Organisation deleted");
		isDeleteOpen.value = false;
		selectedOrg.value = null;
		refreshOrganisations();
	} catch (e: any) {
		useToast.error("Delete failed", { description: e?.message || String(e) });
	} finally {
		submittingDelete.value = false;
	}
}
</script>


