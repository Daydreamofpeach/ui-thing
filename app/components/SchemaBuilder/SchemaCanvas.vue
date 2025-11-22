<template>
  <div class="h-full w-full">
         <VueFlow 
       :nodes="nodes" 
       :edges="edges" 
       :node-types="nodeTypes"
       :edge-types="edgeTypes"
       fit-view-on-init 
       :min-zoom="0.5" 
       :max-zoom="2"
                            @node-drag-stop="onNodeDragStop"
         @connect="onConnect"
         @edge-update="onEdgeUpdate"
         @edge-update-end="onEdgeUpdateEnd"
         @edge-context-menu="onEdgeContextMenu"
     >
      <Background variant="dots" :gap="20" :size="3" pattern-color="var(--muted)" />
      
      <!-- Mini Map -->
      <MiniMap
        node-color="var(--muted)"
        node-stroke-color="var(--primary)"
        :node-border-radius="30"
        mask-color="var(--muted)"
        :mask-border-radius="30"
        pannable
        :height="100"
        :offset-scale="5"
        :width="120"
        inverse-pan
        position="bottom-left"
      />
      
      <!-- Control Panel -->
      <Panel position="bottom-right">
        <div class="inline-flex -space-x-px rounded-md shadow-xs rtl:space-x-reverse">
          <UiButton
            v-tippy="'Zoom In'"
            class="rounded-none bg-card text-muted-foreground/80 shadow-none first:rounded-s-lg last:rounded-e-lg hover:text-muted-foreground focus-visible:z-10"
            size="icon"
            variant="outline"
            @click="zoomIn({})"
          >
            <Icon name="lucide:plus" class="size-5" aria-hidden="true" />
          </UiButton>
          <UiButton
            v-tippy="'Zoom Out'"
            class="rounded-none bg-card text-muted-foreground/80 shadow-none first:rounded-s-lg last:rounded-e-lg hover:text-muted-foreground focus-visible:z-10"
            size="icon"
            variant="outline"
            @click="zoomOut({})"
          >
            <Icon name="lucide:minus" class="size-5" aria-hidden="true" />
          </UiButton>
          <UiButton
            v-tippy="'Reset View'"
            class="rounded-none bg-card text-muted-foreground/80 shadow-none first:rounded-s-lg last:rounded-e-lg hover:text-muted-foreground focus-visible:z-10"
            size="icon"
            variant="outline"
            @click="fitView({ padding: 0.2 })"
          >
            <Icon name="lucide:scan" class="size-5" aria-hidden="true" />
          </UiButton>
        </div>
      </Panel>

      <!-- Node and Edge types are registered above -->
    </VueFlow>
  </div>
</template>

<script lang="ts" setup>
import { Background } from "@vue-flow/background";
import { Panel, useVueFlow, VueFlow } from "@vue-flow/core";
import { MiniMap } from "@vue-flow/minimap";
import type { Edge, Node, Connection, EdgeChange, NodeChange } from "@vue-flow/core";
import type { CustomNodeType } from "./types";

import SchemaNode from "~/components/SchemaBuilder/SchemaNode.vue";
import SchemaConnection from "~/components/SchemaBuilder/SchemaConnection.vue";

import "@vue-flow/controls/dist/style.css";
import "@vue-flow/core/dist/style.css";

// Props
interface Props {
  initialNodes?: Node[];
  initialEdges?: Edge[];
}

const props = withDefaults(defineProps<Props>(), {
  initialNodes: () => [],
  initialEdges: () => []
});

// Emits
const emit = defineEmits<{
  'update:nodes': [nodes: Node[]];
  'update:edges': [edges: Edge[]];
  'node:update': [node: Node];
  'node:delete': [nodeId: string];
  'edge:delete': [edgeId: string];
  'connect': [connection: Connection];
}>();

// Reactive data
const nodes = ref<Node[]>(props.initialNodes);
const edges = ref<Edge[]>(props.initialEdges);

// Vue Flow composable
const { fitView, zoomIn, zoomOut } = useVueFlow();

// Register custom node types
const nodeTypes = {
  tableNode: SchemaNode
};

// Register custom edge types for advanced connections
const edgeTypes = {
  step: 'step', // 90-degree turns
  default: 'default', // Straight lines
};

// Debug computed properties
const debugNodes = computed(() => {
  console.log('SchemaCanvas: Debug nodes for VueFlow:', nodes.value);
  return nodes.value;
});

const debugEdges = computed(() => {
  console.log('SchemaCanvas: Debug edges for VueFlow:', edges.value);
  return edges.value;
});

// Watch for prop changes and update local state
watch(() => props.initialNodes, (newNodes) => {
  console.log('SchemaCanvas: Received initial nodes:', newNodes);
  nodes.value = newNodes;
}, { deep: true, immediate: true });

watch(() => props.initialEdges, (newEdges) => {
  console.log('SchemaCanvas: Received initial edges:', newEdges);
  edges.value = newEdges;
}, { deep: true, immediate: true });

// Watch for changes and emit updates
watch(nodes, (newNodes) => {
  console.log('SchemaCanvas: Nodes updated:', newNodes);
  emit('update:nodes', newNodes);
}, { deep: true });

watch(edges, (newEdges) => {
  console.log('SchemaCanvas: Edges updated:', newEdges);
  emit('update:edges', newEdges);
}, { deep: true });

// Event handlers
const onNodeDragStop = (event: any) => {
  emit('node:update', event.node);
};

const onNodeUpdate = (node: Node) => {
  emit('node:update', node);
};

const onNodeDelete = (nodeId: string) => {
  nodes.value = nodes.value.filter(n => n.id !== nodeId);
  edges.value = edges.value.filter(e => e.source !== nodeId && e.target !== nodeId);
  emit('node:delete', nodeId);
};

const onConnect = (connection: Connection) => {
  console.log('SchemaCanvas: Connection attempt:', connection);
  
  if (connection.source && connection.target && connection.sourceHandle && connection.targetHandle) {
    // Create the edge manually and add it to the edges array
    const edgeId = `${connection.source}-${connection.target}-${connection.sourceHandle}-${connection.targetHandle}`;
    
    const newEdge: Edge = {
      id: edgeId,
      source: connection.source,
      target: connection.target,
      sourceHandle: connection.sourceHandle,
      targetHandle: connection.targetHandle,
      type: 'smoothstep',
    };
    
    // Add the edge to the array
    edges.value.push(newEdge);
    console.log('SchemaCanvas: New edge added:', newEdge);
    
    // Force reactivity by creating a new array
    edges.value = [...edges.value];
  }
  
  emit('connect', connection);
};

const onEdgeUpdate = (event: any) => {
  edges.value = edges.value.map(edge => 
    edge.id === event.oldEdge.id 
      ? { ...edge, source: event.newConnection.source!, target: event.newConnection.target! }
      : edge
  );
};

const onEdgeUpdateEnd = (event: any) => {
  // Edge update completed
};

const onEdgeDelete = (edgeId: string) => {
  edges.value = edges.value.filter(e => e.id !== edgeId);
  emit('edge:delete', edgeId);
};

const onEdgeContextMenu = (event: any) => {
  event.preventDefault();
  const edgeId = event.edge.id;
  
  if (confirm('Delete this connection?')) {
    onEdgeDelete(edgeId);
  }
};





// Expose methods for parent components
defineExpose({
  addNode: (node: Node) => {
    nodes.value.push(node);
  },
  addEdge: (edge: Edge) => {
    edges.value.push(edge);
  },
  getNodes: () => nodes.value,
  getEdges: () => edges.value,
  fitView: () => fitView({ padding: 0.2 }),
  
  // Advanced connection methods
  addWaypoint: (edgeId: string, waypoint: { x: number; y: number }) => {
    const edge = edges.value.find(e => e.id === edgeId);
    if (edge) {
      // Add waypoints property to edge for custom routing
      (edge as any).waypoints = (edge as any).waypoints || [];
      (edge as any).waypoints.push(waypoint);
      edges.value = [...edges.value]; // Force reactivity
    }
  },
  
  branchConnection: (sourceEdgeId: string, targetNodeId: string, targetHandle: string) => {
    const sourceEdge = edges.value.find(e => e.id === sourceEdgeId);
    if (sourceEdge) {
      const newEdge: Edge = {
        id: `${sourceEdgeId}-branch-${targetNodeId}`,
        source: sourceEdge.source,
        target: targetNodeId,
        sourceHandle: sourceEdge.sourceHandle,
        targetHandle: targetHandle,
        type: 'step',
        style: {
          stroke: 'var(--primary)',
          strokeWidth: 2,
          strokeDasharray: '5,5', // Dashed line for branches
        },
      };
      edges.value.push(newEdge);
      edges.value = [...edges.value]; // Force reactivity
    }
  }
});
</script>
