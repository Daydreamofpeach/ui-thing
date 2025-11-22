<template>
	<div class="space-y-6">
		<!-- Organisations -->
		<UiCard class="p-0 overflow-hidden">
			<div class="border-b px-4 py-3 flex items-center justify-between">
				<span class="text-sm text-muted-foreground">Select an organisation</span>
				<div class="flex items-center gap-2">
					<UiButton size="sm" variant="outline" @click="openCreate">
						<Icon name="lucide:plus" class="size-4 mr-2" />
						New
					</UiButton>
					<UiButton size="sm" variant="ghost" :disabled="isLoadingOrganisations" @click="refreshOrganisations">
						<Icon name="lucide:refresh-cw" class="size-4 mr-2" />
						Reload
					</UiButton>
				</div>
			</div>
			<div v-if="isLoadingOrganisations" class="p-6 text-sm text-muted-foreground">Loading organisations…</div>
			<div v-else>
				<div v-if="organisationsList.length === 0" class="p-6 text-sm text-muted-foreground">
					No organisations found. Create your first one.
				</div>
				<ul v-else class="divide-y">
					<li
						v-for="org in organisationsList"
						:key="org.id"
						:class="['px-4 py-3 flex items-center justify-between', selectedOrganisationId === String(org.id) ? 'bg-muted/40' : '']"
					>
						<div class="min-w-0">
							<div class="font-medium truncate">{{ org.name }}</div>
							<div class="text-xs text-muted-foreground truncate">{{ org.description || 'No description' }}</div>
						</div>
						<div class="flex items-center gap-1">
							<UiButton size="sm" variant="secondary" @click="selectOrganisation(String(org.id))">
								<Icon v-if="selectedOrganisationId === String(org.id)" name="lucide:check" class="size-4 mr-2" />
								{{ selectedOrganisationId === String(org.id) ? 'Selected' : 'Select' }}
							</UiButton>
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

		<!-- Projects -->
		<UiCard class="p-0 overflow-hidden">
			<div class="border-b px-4 py-3 flex items-center justify-between">
				<span class="text-sm text-muted-foreground">Projects in selected organisation</span>
				<UiButton size="sm" variant="ghost" :disabled="isLoadingProjects || !hasOrganisation" @click="reloadProjects">
					<Icon name="lucide:refresh-cw" class="size-4 mr-2" />
					Reload
				</UiButton>
			</div>

			<div v-if="!hasOrganisation" class="p-6 text-sm text-muted-foreground">
				Select an organisation to load projects.
			</div>
			<div v-else-if="isLoadingProjects" class="p-6 text-sm text-muted-foreground">Loading projects…</div>
			<div v-else>
				<div v-if="projectsList.length === 0" class="p-6 text-sm text-muted-foreground">
					No projects found in this organisation.
				</div>
				<ul v-else class="divide-y">
					<li
						v-for="p in projectsList"
						:key="p.id"
						class="px-4 py-3 flex items-center justify-between"
					>
						<div class="min-w-0">
							<div class="font-medium truncate">{{ p.name }}</div>
							<div class="text-xs text-muted-foreground truncate">{{ p.description || 'No description' }}</div>
						</div>
						<UiButton size="sm" variant="secondary" @click="onSelectProject(p)">
							<Icon v-if="selectedProjectId === String(p.id)" name="lucide:check" class="size-4 mr-2" />
							{{ selectedProjectId === String(p.id) ? 'Selected' : 'Select' }}
						</UiButton>
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
import { computed, ref } from "vue";
import UiCard from "~/components/Ui/Card/Card.vue";
import UiButton from "~/components/Ui/Button.vue";
import { useUnifiedOrgProjectSelector } from "~/composables/useUnifiedOrgProjectSelector";
import OrganisationCreateModal from "~/components/dashboard/organisations/OrganisationCreateModal.vue";
import OrganisationEditModal from "~/components/dashboard/organisations/OrganisationEditModal.vue";
import OrganisationDeleteModal from "~/components/dashboard/organisations/OrganisationDeleteModal.vue";

const {
	// org
	organisations,
	isLoadingOrganisations,
	refreshOrganisations,
	selectOrganisation,
	selectedOrganisationId,
	apiCreate,
	apiUpdate,
	apiDelete,
	// projects
	projects,
	isLoadingProjects,
	loadProjectsForOrganization,
	setSelectedProject,
	selectedProjectId,
	hasOrganisation
} = useUnifiedOrgProjectSelector();

const organisationsList = computed(() => organisations.value || []);
const projectsList = computed(() => projects.value || []);

// Modals & selection
const isCreateOpen = ref(false);
const isEditOpen = ref(false);
const isDeleteOpen = ref(false);
const submittingCreate = ref(false);
const submittingEdit = ref(false);
const submittingDelete = ref(false);
const selectedOrg = ref<any | null>(null);

function openCreate() {
	isCreateOpen.value = true;
}

async function onCreateSubmit(payload: { name: string; description?: string; email?: string }) {
	try {
		submittingCreate.value = true;
		const created = await apiCreate(payload as any);
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
		// If we deleted the selected org, clear selection
		if (String(selectedOrganisationId?.value || "") === String(selectedOrg.value.id)) {
			selectOrganisation("");
		}
		selectedOrg.value = null;
		refreshOrganisations();
	} catch (e: any) {
		useToast.error("Delete failed", { description: e?.message || String(e) });
	} finally {
		submittingDelete.value = false;
	}
}

function reloadProjects() {
	if (selectedOrganisationId?.value) {
		loadProjectsForOrganization(String(selectedOrganisationId.value));
	}
}

function onSelectProject(p: any) {
	setSelectedProject(p);
	// Removed toast - selection is visual feedback enough
	// Optionally switch to Tasks tab after project selection
	const tab = useState<string>("dashboardTab");
	tab.value = "Tasks";
}
</script>


