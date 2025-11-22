<template>
	<component
		:is="shapeComponent"
		:custom-node-props="customNodeProps"
		:update-node-data="updateNodeData"
	/>
</template>

<script setup lang="ts">
import { computed } from "vue";
import RectangleNode from "./RectangleNode.vue";
import CircleNode from "./CircleNode.vue";
import DiamondNode from "./DiamondNode.vue";
import TriangleNode from "./TriangleNode.vue";
import HexagonNode from "./HexagonNode.vue";

interface Props {
	nodeType: "rectangle" | "circle" | "diamond" | "triangle" | "hexagon";
	customNodeProps: any;
	updateNodeData: (nodeId: string, key: string, value: any) => void;
}

const props = defineProps<Props>();

const shapeComponent = computed(() => {
	const componentMap = {
		rectangle: RectangleNode,
		circle: CircleNode,
		diamond: DiamondNode,
		triangle: TriangleNode,
		hexagon: HexagonNode
	};
	return componentMap[props.nodeType];
});
</script>

