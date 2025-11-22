<template>
	<div>
		<!-- Table -->
		<HomeTasksDataTable :data="localTasks" />
	</div>
	</template>

<script lang="ts" setup>
	import type { HomeTask } from "~/utils/utils";
	const props = withDefaults(defineProps<{
		data?: HomeTask[]
	}>(), {});

	// Use provided BAPI data; otherwise empty (no mock fallback in dashboard)
	const localTasks = computed<HomeTask[]>(() => (Array.isArray(props.data) ? props.data : []));
</script>
