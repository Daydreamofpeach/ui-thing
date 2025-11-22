<template>
  <div class="flex h-[600px] bg-background border rounded-lg overflow-hidden">
    <!-- Left Sidebar - Tools and Node Editor -->
    <div class="w-80 border-r border-border bg-card flex flex-col">
             <!-- Header -->
       <div class="p-4 border-b border-border">
         <h1 class="text-xl font-bold text-foreground">Schema Builder</h1>
         <p class="text-sm text-muted-foreground mt-1">Design your database schema</p>
                    <div class="mt-2 p-2 bg-blue-50 dark:bg-blue-950/20 rounded-md text-xs text-blue-700 dark:text-blue-300">
             <p class="font-medium mb-1">💡 Connection Tips:</p>
             <ul class="space-y-1 text-xs">
               <li>• <strong>Click</strong> handles to create connections</li>
               <li>• <strong>Drag</strong> nodes to reposition them</li>
               <li>• <strong>90° turns</strong> for professional look</li>
               <li>• <strong>Right-click</strong> edges to delete connections</li>
             </ul>
           </div>
       </div>

      <!-- Tools -->
      <div class="p-4 border-b border-border">
        <h2 class="text-sm font-semibold text-foreground mb-3">Tools</h2>
        <div class="space-y-2">
          <UiButton
            class="w-full justify-start"
            variant="outline"
            @click="showNodeEditor = true"
          >
            <Icon name="lucide:plus" class="h-4 w-4 mr-2" />
            Add New Table
          </UiButton>
          
          <UiButton
            class="w-full justify-start"
            variant="outline"
            @click="exportSchema"
          >
            <Icon name="lucide:download" class="h-4 w-4 mr-2" />
            Export Schema
          </UiButton>
          
          <UiButton
            class="w-full justify-start"
            variant="outline"
            @click="importSchema"
          >
            <Icon name="lucide:upload" class="h-4 w-4 mr-2" />
            Import Schema
          </UiButton>
          
          <UiButton
            class="w-full justify-start"
            variant="outline"
            @click="clearSchema"
          >
            <Icon name="lucide:trash-2" class="h-4 w-4 mr-2" />
            Clear All
          </UiButton>
        </div>
      </div>

      <!-- Node Editor -->
      <div v-if="showNodeEditor" class="flex-1 p-4 overflow-y-auto">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-sm font-semibold text-foreground">
            {{ editingNode ? 'Edit Table' : 'Create New Table' }}
          </h2>
          <UiButton
            size="icon"
            variant="ghost"
            @click="closeNodeEditor"
          >
            <Icon name="lucide:x" class="h-4 w-4" />
          </UiButton>
        </div>
        
        <NodeEditor
          :node="editingNode"
          @save="onNodeSave"
          @cancel="closeNodeEditor"
        />
      </div>

      <!-- Schema Info -->
      <div v-else class="flex-1 p-4 overflow-y-auto">
        <h2 class="text-sm font-semibold text-foreground mb-3">Schema Info</h2>
        <div class="space-y-3 text-sm">
          <div class="flex justify-between">
            <span class="text-muted-foreground">Tables:</span>
            <span class="font-medium">{{ nodes.length }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-muted-foreground">Relationships:</span>
            <span class="font-medium">{{ edges.length }}</span>
          </div>
        </div>
        
        <!-- Tables List -->
        <div class="mt-4">
          <h3 class="text-sm font-semibold text-foreground mb-2">Tables</h3>
          <div class="space-y-2">
            <div
              v-for="node in nodes"
              :key="node.id"
              class="p-2 bg-muted/30 rounded-md cursor-pointer hover:bg-muted/50"
              @click="editExistingNode(node)"
            >
              <div class="flex items-center justify-between">
                <span class="font-medium text-foreground">{{ node.data?.label || 'Unnamed Table' }}</span>
                <span class="text-xs text-muted-foreground">{{ node.data?.fields?.length || 0 }} fields</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Canvas Area -->
    <div class="flex-1 flex flex-col">
      <!-- Top Bar -->
      <div class="h-12 border-b border-border bg-card flex items-center justify-between px-4">
        <div class="flex items-center gap-2">
          <span class="text-sm text-muted-foreground">Canvas:</span>
          <span class="font-medium">{{ currentCanvasName }}</span>
        </div>
        
        <div class="flex items-center gap-2">
          <UiButton
            size="sm"
            variant="outline"
            @click="fitView"
          >
            <Icon name="lucide:scan" class="h-4 w-4 mr-1" />
            Fit View
          </UiButton>
          
          <UiButton
            size="sm"
            variant="outline"
            @click="centerView"
          >
            <Icon name="lucide:move" class="h-4 w-4 mr-1" />
            Center
          </UiButton>
        </div>
      </div>

      <!-- Schema Canvas -->
      <div class="flex-1">
        <SchemaCanvas
          ref="schemaCanvasRef"
          :initial-nodes="nodes"
          :initial-edges="edges"
          @update:nodes="onNodesUpdate"
          @update:edges="onEdgesUpdate"
                     @node:update="onNodeUpdate"
           @node:delete="onNodeDelete"
                       @edge:delete="onEdgeDelete"
                        @connect="onConnect"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { Node, Edge, Connection } from "@vue-flow/core";
import type { CustomNodeType } from "./types";
import SchemaCanvas from "./SchemaCanvas.vue";
import NodeEditor from "./NodeEditor.vue";

// Reactive data
const nodes = ref<CustomNodeType[]>([]);
const edges = ref<Edge[]>([]);
const showNodeEditor = ref(false);
const editingNode = ref<CustomNodeType | null>(null);
const currentCanvasName = ref("Untitled Schema");
const schemaCanvasRef = ref();

// Methods
const onNodesUpdate = (newNodes: CustomNodeType[]) => {
  nodes.value = newNodes;
};

const onEdgesUpdate = (newEdges: Edge[]) => {
  edges.value = newEdges;
};

const onNodeUpdate = (node: CustomNodeType) => {
  const index = nodes.value.findIndex(n => n.id === node.id);
  if (index !== -1) {
    nodes.value[index] = node;
  }
};

const onNodeDelete = (nodeId: string) => {
  nodes.value = nodes.value.filter(n => n.id !== nodeId);
  edges.value = edges.value.filter(e => e.source !== nodeId && e.target !== nodeId);
};

const onEdgeDelete = (edgeId: string) => {
  edges.value = edges.value.filter(e => e.id !== edgeId);
};



const onConnect = (connection: Connection) => {
  // Connection is handled by the canvas component
};



const onNodeSave = (node: CustomNodeType) => {
  if (editingNode.value) {
    // Update existing node
    const index = nodes.value.findIndex(n => n.id === node.id);
    if (index !== -1) {
      nodes.value[index] = node;
    }
  } else {
    // Add new node
    nodes.value.push(node);
  }
  
  closeNodeEditor();
};

const editExistingNode = (node: CustomNodeType) => {
  editingNode.value = node;
  showNodeEditor.value = true;
};

const closeNodeEditor = () => {
  showNodeEditor.value = false;
  editingNode.value = null;
};

const fitView = () => {
  schemaCanvasRef.value?.fitView();
};

const centerView = () => {
  schemaCanvasRef.value?.fitView({ padding: 0.2 });
};

const exportSchema = () => {
  const schema = {
    name: currentCanvasName.value,
    nodes: nodes.value,
    edges: edges.value,
    exportedAt: new Date().toISOString()
  };
  
  const blob = new Blob([JSON.stringify(schema, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${currentCanvasName.value.replace(/\s+/g, '-')}-schema.json`;
  a.click();
  URL.revokeObjectURL(url);
};

const importSchema = () => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.onchange = (e) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const schema = JSON.parse(e.target?.result as string);
          if (schema.nodes && schema.edges) {
            nodes.value = schema.nodes as CustomNodeType[];
            edges.value = schema.edges;
            if (schema.name) {
              currentCanvasName.value = schema.name;
            }
          }
        } catch (error) {
          alert('Invalid schema file');
        }
      };
      reader.readAsText(file);
    }
  };
  input.click();
};

const clearSchema = () => {
  if (confirm('Are you sure you want to clear the entire schema? This cannot be undone.')) {
    nodes.value = [];
    edges.value = [];
    currentCanvasName.value = "Untitled Schema";
  }
};

// Load sample data on mount
onMounted(() => {
  // Load sample data to demonstrate the builder
  const sampleNodes: CustomNodeType[] = [
    {
      id: 'users',
      type: 'tableNode',
      position: { x: 200, y: 100 },
      data: {
        label: 'users',
        fields: [
          { name: 'id', type: 'int', isPrimary: true },
          { name: 'full_name', type: 'varchar' },
          { name: 'email', type: 'varchar' },
          { name: 'phone', type: 'varchar' },
          { name: 'address', type: 'text' },
          { name: 'created_at', type: 'timestamp' }
        ]
      }
    },
    {
      id: 'orders',
      type: 'tableNode',
      position: { x: 500, y: 100 },
      data: {
        label: 'orders',
        fields: [
          { name: 'id', type: 'int', isPrimary: true },
          { name: 'user_id', type: 'int', isForeign: true },
          { name: 'order_number', type: 'varchar' },
          { name: 'total_amount', type: 'decimal' },
          { name: 'status', type: 'varchar' },
          { name: 'shipping_address', type: 'text' },
          { name: 'created_at', type: 'timestamp' }
        ]
      }
    },
    {
      id: 'products',
      type: 'tableNode',
      position: { x: 800, y: 100 },
      data: {
        label: 'products',
        fields: [
          { name: 'id', type: 'int', isPrimary: true },
          { name: 'name', type: 'varchar' },
          { name: 'description', type: 'text' },
          { name: 'price', type: 'decimal' },
          { name: 'category_id', type: 'int', isForeign: true },
          { name: 'inventory_count', type: 'int' },
          { name: 'created_at', type: 'timestamp' }
        ]
      }
    },
    {
      id: 'categories',
      type: 'tableNode',
      position: { x: 800, y: 300 },
      data: {
        label: 'categories',
        fields: [
          { name: 'id', type: 'int', isPrimary: true },
          { name: 'name', type: 'varchar' },
          { name: 'description', type: 'text' },
          { name: 'parent_category_id', type: 'int', isForeign: true },
          { name: 'is_active', type: 'boolean' },
          { name: 'created_at', type: 'timestamp' }
        ]
      }
    }
  ];

          const sampleEdges: Edge[] = [
      {
        id: 'users-orders',
        source: 'users',
        target: 'orders',
        sourceHandle: 'id-source',
        targetHandle: 'user_id-target',
        type: 'smoothstep',
      },
      {
        id: 'products-categories',
        source: 'products',
        target: 'categories',
        sourceHandle: 'category_id-source',
        targetHandle: 'id-target',
        type: 'smoothstep',
      },
      {
        id: 'categories-self-reference',
        source: 'categories',
        target: 'categories',
        sourceHandle: 'id-source',
        targetHandle: 'parent_category_id-target',
        type: 'smoothstep',
      }
    ];

  nodes.value = sampleNodes;
  edges.value = sampleEdges;
  currentCanvasName.value = "Sample E-commerce Schema";
  
  // Debug logging
  console.log('SchemaBuilder: Sample data loaded:', { nodes: nodes.value, edges: edges.value });
});
</script>
