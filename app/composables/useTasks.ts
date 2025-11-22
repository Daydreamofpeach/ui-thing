import type { CreateTaskRequest, Task, UpdateTaskRequest } from "~/types/task";
import { computed, readonly, ref } from "vue";
import { getButtClient, getCurrentOrganisationId } from "~/utils/buttClient";
import { useProjectSelection } from "./useProjectSelection";
import { useRuntimeConfig } from "#imports";

export function useTasks() {
	const tasks = ref<Task[]>([]);
	const loading = ref(false);
	const error = ref<string | null>(null);

	// Computed properties
	const taskStats = computed(() => {
		const total = tasks.value.length;
		const completed = tasks.value.filter((t) => t.jiraStatus === "Done").length;
		const inProgress = tasks.value.filter((t) => t.jiraStatus === "In Progress").length;
		const pending = total - completed - inProgress;

		return { total, completed, pending, inProgress };
	});

	// Methods
	const loadTasks = async () => {
		loading.value = true;
		error.value = null;
		try {
			const client = getButtClient();
			const orgId = getCurrentOrganisationId();

			// Access selected project id via composable
			const { selectedProjectId } = useProjectSelection();
			const projectId = selectedProjectId.value || null;

			let collected: any[] = [];

			// EXACT CLIENT FLOW:
			// - If project selected: use getTasksByProjectId(projectId)
			if (projectId) {
				try {
					collected = await (client as any).getTasksByProjectId(projectId);
				} catch (e) {
					console.warn("getTasksByProjectId failed:", e);
					collected = [];
				}
			} else {
				// - Else: list projects (optionally filter by org) and aggregate getTasksByProjectId for each
				let projects: any[] = [];
				try {
					const allProjects = await client.findAllProject();
					projects = Array.isArray(allProjects) ? allProjects : [];
				} catch (e) {
					console.warn("findAllProject failed:", e);
					projects = [];
				}

				if (orgId) {
					projects = projects.filter((p: any) => String(p.organisationId) === String(orgId));
				}

				const perProjectTasks = await Promise.all(
					projects.map((p: any) =>
						(client as any).getTasksByProjectId(p.id).catch(() => [])
					)
				);
				collected = perProjectTasks.flat();
			}

			tasks.value = collected || [];
		} catch (err: any) {
			error.value = err.message || "Failed to load tasks";
			console.error("Failed to load tasks:", err);
		} finally {
			loading.value = false;
		}
	};

	const createTask = async (payload: CreateTaskRequest): Promise<Task | null> => {
		try {
			const client = getButtClient();
			// Transform CreateTaskRequest to match BApi payload structure
			const apiPayload = {
				name: (payload as any).name || "",
				description: (payload as any).description,
				jiraStatus: (payload as any).jiraStatus,
				sourceId: (payload as any).sourceId,
				owners: (payload as any).owners || [],
				subscribers: (payload as any).subscribers || [],
				creator: (payload as any).creator,
				history: (payload as any).history || [],
				deletedAt: (payload as any).deletedAt,
				createdAt: (payload as any).createdAt,
				projectId: (payload as any).projectId || "",
				organisationId: (payload as any).organisationId || ""
			};
			
			const apiResponse = await client.createTask(apiPayload);
			
			// Convert API response to Task type
			const newTask: Task = {
				id: apiResponse.id || "",
				name: apiResponse.name || "",
				description: apiResponse.description || "",
				jiraStatus: apiResponse.jiraStatus || "",
				sourceId: apiResponse.sourceId || "",
				butt: apiResponse.butt || "",
				creator: apiResponse.creator || "",
				owners: apiResponse.owners || [],
				subscribers: apiResponse.subscribers || [],
				history: [],
				deletedAt: apiResponse.deletedAt ? new Date(apiResponse.deletedAt) : undefined,
				createdAt: new Date(apiResponse.createdAt || new Date().toISOString()),
				updatedAt: new Date(apiResponse.updatedAt || new Date().toISOString())
			};
			
			if (newTask) {
				tasks.value.unshift(newTask);
			}
			return newTask;
		} catch (err: any) {
			error.value = err.message || "Failed to create task";
			console.error("Failed to create task:", err);
			return null;
		}
	};

	const updateTask = async (id: string, payload: UpdateTaskRequest): Promise<Task | null> => {
		try {
			const client = getButtClient();
			// Transform UpdateTaskRequest to match BApi payload structure
			const apiPayload = {
				name: (payload as any).name,
				description: (payload as any).description,
				jiraStatus: (payload as any).jiraStatus,
				sourceId: (payload as any).sourceId,
				butt: (payload as any).butt,
				creator: (payload as any).creator,
				owners: (payload as any).owners || [],
				subscribers: (payload as any).subscribers || [],
				history: (payload as any).history || [],
				deletedAt: (payload as any).deletedAt,
				createdAt: (payload as any).createdAt
			};
			
			const updatedTask = await client.updateTask(id, apiPayload);
			if (updatedTask) {
				const index = tasks.value.findIndex((t) => t.id === id);
				if (index !== -1) {
					tasks.value[index] = updatedTask;
				}
			}
			return updatedTask;
		} catch (err: any) {
			error.value = err.message || "Failed to update task";
			console.error("Failed to update task:", err);
			return null;
		}
	};

	const deleteTask = async (id: string): Promise<boolean> => {
		try {
			const client = getButtClient();
			await client.deleteTask(id);
			tasks.value = tasks.value.filter((t) => t.id !== id);
			return true;
		} catch (err: any) {
			error.value = err.message || "Failed to delete task";
			console.error("Failed to delete task:", err);
			return false;
		}
	};

	const getTask = async (id: string): Promise<Task | null> => {
		try {
			const client = getButtClient();
			return await client.findByIdTask(id);
		} catch (err: any) {
			error.value = err.message || "Failed to get task";
			console.error("Failed to get task:", err);
			return null;
		}
	};

	const filterTasks = (searchTerm: string = "", status: string = "") => {
		return computed(() => {
			let filtered = [...tasks.value];

			if (searchTerm) {
				const search = searchTerm.toLowerCase();
				filtered = filtered.filter((task) =>
					task.name.toLowerCase().includes(search)
					|| task.description?.toLowerCase().includes(search)
					|| task.butt?.toLowerCase().includes(search)
				);
			}

			if (status) {
				filtered = filtered.filter((task) => task.jiraStatus === status);
			}

			return filtered.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
		});
	};

	return {
		// State
		tasks: readonly(tasks),
		loading: readonly(loading),
		error: readonly(error),

		// Computed
		taskStats,

		// Methods
		loadTasks,
		createTask,
		updateTask,
		deleteTask,
		getTask,
		filterTasks
	};
}
