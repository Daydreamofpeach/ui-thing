<template>
	<div :class="currentTab === 'Canvas' ? 'relative h-full' : 'space-y-4'">
		<component :is="currentComponent" ref="sectionRef" />
	</div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import DashboardSection from "~/components/dashboard/sections/DashboardSection.vue";
import TasksSection from "~/components/dashboard/sections/TasksSection.vue";
import OrganisationsSection from "~/components/dashboard/sections/OrganisationsSection.vue";
import MembersSection from "~/components/dashboard/sections/MembersSection.vue";
import IntegrationsSection from "~/components/dashboard/sections/IntegrationsSection.vue";

const props = defineProps<{
	currentTab: string
}>();

const sectionRef = ref<any | null>(null);

const currentComponent = computed(() => {
	switch (props.currentTab) {
		case "Tasks":
			return TasksSection;
		case "Members":
			return MembersSection;
		case "Canvas":
			// Canvas is always visible in the top panel, so don't render it here
			// Just show a message or empty state
			return DashboardSection;
		case "Organisations":
			return OrganisationsSection;
		case "Integrations":
			return IntegrationsSection;
		case "Dashboard":
		default:
		 return DashboardSection;
	}
});

// Expose methods and refs for parent to call
// Note: Canvas is always in the top panel, so these methods are not needed here
defineExpose({
	sectionRef
});
</script>


