<template>
	<UiTabs v-model="current" orientation="vertical" class="w-full h-full flex-row">
		<UiTabsList :pill="false" class="flex-col gap-1 rounded-none bg-transparent px-1 py-0 text-foreground">
			<UiTabsTrigger
				v-for="t in tabs"
				:key="t.value"
				:pill="false"
				:value="t.value"
				class="relative w-full justify-start after:absolute after:inset-y-0 after:start-0 after:-ms-1 after:w-0.5 hover:bg-accent hover:text-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:after:bg-primary data-[state=active]:hover:bg-accent"
			>
				<Icon :name="t.icon" class="-ms-0.5 me-1.5 size-4 opacity-60" />
				{{ t.label }}
			</UiTabsTrigger>
		</UiTabsList>

		<!-- Optional local content area; main panel renders actual content -->
		<div class="grow rounded-md border text-start hidden" />
	</UiTabs>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import UiTabs from "~/components/Ui/Tabs/Tabs.vue";
import UiTabsList from "~/components/Ui/Tabs/List.vue";
import UiTabsTrigger from "~/components/Ui/Tabs/Trigger.vue";
import { useOscarData } from "~/composables/useOscarData";

const props = defineProps<{
	modelValue?: string
}>();
const emit = defineEmits<{
	(e: "update:modelValue", v: string): void
}>();

const { selectedOrganisationId } = useOscarData();

const baseTabs = [
	{ value: "Dashboard", label: "Dashboard", icon: "lucide:home" },
	{ value: "Tasks", label: "Tasks", icon: "lucide:list-checks" },
	{ value: "Members", label: "Members", icon: "lucide:users" },
	{ value: "Canvas", label: "Canvas", icon: "lucide:workflow" },
	{ value: "Organisations", label: "Organisations", icon: "lucide:building-2" },
];

const integrationsTab = [
	{ value: "Integrations", label: "Integrations", icon: "lucide:plug" },
];

// Show integrations tab only when organisation is selected
const tabs = computed(() => {
	if (selectedOrganisationId.value) {
		return [...baseTabs, ...integrationsTab];
	}
	return baseTabs;
});

const current = computed<string>({
	get: () => props.modelValue ?? "Dashboard",
	set: (v) => emit("update:modelValue", v),
});
</script>

 