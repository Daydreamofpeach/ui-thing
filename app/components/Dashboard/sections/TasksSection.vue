<template>
	<div class="space-y-4">
		<div class="flex items-center justify-between gap-2">
			<h2 class="text-2xl font-semibold tracking-tight">My Tasks</h2>
			<div class="flex items-center gap-2">
				<UiButton size="sm" variant="outline" :disabled="loading" @click="loadTasks">
					<Icon name="lucide:refresh-cw" class="size-4 mr-2" />
					Reload
				</UiButton>
				<TaskCreateButton @created="loadTasks" />
			</div>
		</div>

		<!-- Rich HomeTasks block using BAPI data -->
		<HomeTasks :data="homeTasks" />
	</div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import UiButton from "~/components/Ui/Button.vue";
import HomeTasks from "~/components/content/Home/HomeTasks/HomeTasks.vue";
import type { HomeTask } from "~/utils/utils";
import TaskCreateButton from "~/components/tasks/TaskCreateButton.vue";
import { useTasks } from "~/composables/useTasks";
import { useSelectedOrganisationId } from "~/composables/useSelectedOrganisationId";
import { useProjectSelection } from "~/composables/useProjectSelection";

const { tasks, loadTasks, loading, error } = useTasks();
const selectedOrgId = useSelectedOrganisationId();
const { selectedProjectId } = useProjectSelection();

onMounted(() => {
	loadTasks();
});

watch(selectedOrgId, () => {
	loadTasks();
});

watch(selectedProjectId, () => {
	loadTasks();
});

// Map BAPI tasks to HomeTask shape
const homeTasks = computed<HomeTask[]>(() => {
	const list = (tasks.value || []) as any[];
	return list.map((t) => ({
		id: String(t.id || ""),
		title: t.name || t.title || "Untitled task",
		status: mapStatus(t.jiraStatus),
		label: mapLabel(t),
		priority: mapPriority(t),
	}));
});

function mapStatus(jira?: string): any {
	const s = String(jira || "").toLowerCase();
	if (s.includes("progress")) return "in progress";
	if (s.includes("done") || s.includes("complete")) return "done";
	if (s.includes("backlog")) return "backlog";
	if (s.includes("cancel")) return "canceled";
	return "todo";
}
function mapLabel(t: any): any {
	const b = String(t?.butt || "").toLowerCase();
	if (b.includes("bug")) return "bug";
	if (b.includes("doc")) return "documentation";
	return "feature";
}
function mapPriority(t: any): any {
	const p = String(t?.priority || "").toLowerCase();
	if (p.includes("high")) return "high";
	if (p.includes("low")) return "low";
	return "medium";
}

</script>

