<template>
	<component
		:is="iconComponent"
		:custom-node-props="customNodeProps"
		:update-node-data="updateNodeData"
	/>
</template>

<script setup lang="ts">
import { computed } from "vue";
import DatabaseNode from "./DatabaseNode.vue";
import ApiNode from "./ApiNode.vue";
import ServerNode from "./ServerNode.vue";
import CloudNode from "./CloudNode.vue";

interface Props {
	nodeType: "database" | "api" | "server" | "cloud";
	customNodeProps: any;
	updateNodeData: (nodeId: string, key: string, value: any) => void;
}

const props = defineProps<Props>();

const iconComponent = computed(() => {
	const componentMap = {
		database: DatabaseNode,
		api: ApiNode,
		server: ServerNode,
		cloud: CloudNode
	};
	return componentMap[props.nodeType];
});
</script>

