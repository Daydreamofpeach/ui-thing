<template>
	<VueFlow
		:nodes="nodes"
		:edges="edges"
		:node-types="nodeTypes"
		fit-view-on-init
		:min-zoom="0.3"
		:max-zoom="2"
		class="node-renderer"
	>
		<Background pattern="dots" :gap="20" :size="1" />
		<MiniMap
			:node-stroke-color="(n) => (n.selected ? '#ff0072' : '#0041d0')"
			:node-color="(n) => (n.selected ? '#ff0072' : '#fff')"
			:node-border-radius="2"
			class="minimap"
		/>

		<!-- Node Templates -->
		<template v-for="(component, nodeType) in nodeTypes" :key="nodeType" #[`node-${nodeType}`]="nodeProps">
			<component
				:is="component"
				:id="nodeProps.id"
				:type="nodeProps.type"
				:position="nodeProps.position"
				:data="nodeProps.data"
				:node="nodeProps"
				:show-connection-dropdown="true"
				:node-connections="getConnections(nodeProps.id)"
				:available-nodes="nodes"
				@configure="handleNodeConfigure"
				@delete="handleNodeDelete"
				@connection-start="handleConnectionStart"
				@connection-end="handleConnectionEnd"
				@connection-hover="handleConnectionHover"
				@connection-leave="handleConnectionLeave"
				@create-connection="handleCreateConnection"
				@delete-connection="handleDeleteConnection"
				@update-connection-type="handleUpdateConnectionType"
			/>
		</template>
	</VueFlow>
</template>

<script lang="ts" setup>
	import type { ConnectionHandle } from "../composables/useNodeConnections";
	import { Background } from "@vue-flow/background";
	import { MiniMap } from "@vue-flow/minimap";

	interface Props {
		nodes: any[]
		edges: any[]
		nodeTypes: Record<string, any>
		getConnections: (nodeId: string) => any[]
		connectionHandlers: {
			start: (handle: ConnectionHandle) => void
			end: (handle: ConnectionHandle) => void
			hover: (handle: ConnectionHandle | null) => void
			leave: () => void
			create: (connectionData: any) => void
			delete: (connectionId: string) => void
			updateType: (connectionId: string, type: string) => void
		}
	}

	const props = defineProps<Props>();

	const emit = defineEmits<{
		nodeConfigure: [nodeId: string]
		nodeDelete: [nodeId: string]
	}>();

	// Event handlers
	const handleNodeConfigure = (nodeId: string) => {
		emit("nodeConfigure", nodeId);
	};

	const handleNodeDelete = (nodeId: string) => {
		emit("nodeDelete", nodeId);
	};

	const handleConnectionStart = (event: MouseEvent, handle: ConnectionHandle) => {
		props.connectionHandlers.start(handle);
	};

	const handleConnectionEnd = (event: MouseEvent, handle: ConnectionHandle) => {
		props.connectionHandlers.end(handle);
	};

	const handleConnectionHover = (event: MouseEvent, handle: ConnectionHandle) => {
		props.connectionHandlers.hover(handle);
	};

	const handleConnectionLeave = (event: MouseEvent, handle: ConnectionHandle) => {
		props.connectionHandlers.leave();
	};

	const handleCreateConnection = (connectionData: any) => {
		props.connectionHandlers.create(connectionData);
	};

	const handleDeleteConnection = (connectionId: string) => {
		props.connectionHandlers.delete(connectionId);
	};

	const handleUpdateConnectionType = (connectionId: string, type: string) => {
		props.connectionHandlers.updateType(connectionId, type);
	};
</script>

<style scoped>
	.node-renderer {
		width: 100%;
		height: 100%;
	}

	.minimap {
		background: rgba(255, 255, 255, 0.1);
		border: 1px solid rgba(255, 255, 255, 0.2);
		border-radius: 8px;
	}
</style>
