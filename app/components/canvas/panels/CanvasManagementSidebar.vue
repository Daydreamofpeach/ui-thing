<template>
	<div class="canvas-management-sidebar flex flex-col h-full">
		<!-- Main navigation tabs -->
		<div class="flex-1 flex flex-col justify-evenly">
			<!-- Icon-only version for collapsed sidebar -->
			<div v-if="isCollapsed" class="flex flex-col h-full justify-evenly">
				<UiTooltip v-for="t in mainTabs" :key="t.title">
					<UiTooltipTrigger as-child>
						<span class="h-full">
							<button
								:class="[
									'relative w-full justify-center p-2 rounded-md transition-colors',
									'hover:bg-accent hover:text-foreground',
									activeTab === t.title ? 'bg-accent text-foreground' : 'text-muted-foreground'
								]"
								:title="t.content"
								@click="handleTabClick(t)"
							>
								<Icon :name="t.icon" class="size-4" />
							</button>
						</span>
					</UiTooltipTrigger>
					<UiTooltipContent side="right" class="px-2 py-1 text-xs">{{ t.title }}</UiTooltipContent>
				</UiTooltip>
			</div>

			<!-- Full version for expanded sidebar -->
			<div v-else class="flex flex-col h-full justify-evenly">
				<button
					v-for="t in mainTabs"
					:key="t.title"
					:class="[
						'relative w-full justify-start p-2 rounded-md transition-colors flex items-center gap-2',
						'hover:bg-accent hover:text-foreground',
						activeTab === t.title ? 'bg-accent text-foreground' : 'text-muted-foreground'
					]"
					:title="t.content"
					@click="handleTabClick(t)"
				>
					<Icon :name="t.icon" class="size-4" />
					<span class="text-sm">{{ t.title }}</span>
				</button>
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
	import { computed, ref, type ComputedRef, type Ref } from "vue";

	const props = defineProps<{
		activeTab?: string
		canvasPanelRef?: any
	}>()

	const emit = defineEmits<{
		'update:activeTab': [value: string]
		'add-node': [nodeType: string]
	}>()

	// Get sidebar state from context - default to expanded for canvas sidebar
	let isCollapsed: ComputedRef<boolean> | Ref<boolean>;
	try {
		const sidebar = useSidebar();
		isCollapsed = computed(() => sidebar.state.value === 'collapsed');
	} catch (e) {
		// If useSidebar is not available, default to expanded
		isCollapsed = ref(false);
	}

	// Main navigation tabs for canvas management
	const mainTabs = [
		{
			title: "Project",
			icon: "lucide:panels-top-left",
			content: "Add a project node to the canvas",
			nodeType: "projectNode"
		},
		{
			title: "Integration",
			icon: "lucide:plug",
			content: "Add an integration connection node to the canvas",
			nodeType: "integrationConnectionNode"
		},
		{
			title: "Task",
			icon: "lucide:check-square",
			content: "Add a task node to the canvas",
			nodeType: "taskNode"
		},
		{
			title: "User",
			icon: "lucide:users",
			content: "Add a user node to the canvas",
			nodeType: "userNode"
		},
		{
			title: "Solution",
			icon: "lucide:puzzle",
			content: "Add a solution node to the canvas",
			nodeType: "solutionNode"
		},
	]

	const activeTab = computed({
		get: () => props.activeTab || 'Project',
		set: (value) => emit('update:activeTab', value)
	})

	function handleTabClick(tab: typeof mainTabs[0]) {
		// Emit event to add node to canvas
		emit('add-node', tab.nodeType)
		// Also update active tab
		activeTab.value = tab.title
	}
</script>

<style scoped>
	.canvas-management-sidebar {
		padding: 0.5rem;
	}
</style>

