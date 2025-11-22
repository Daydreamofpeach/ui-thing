# Node Configuration Panel System

## Overview

The Node Configuration Panel is a dedicated full-screen overlay that allows users to configure nodes before adding them to the canvas or edit existing nodes from the canvas. This provides a clean, focused configuration experience without the constraints of the canvas environment.

## Architecture

### Core Components

1. **`NodeConfigurationPanel.vue`** - The main panel component that renders nodes in configuration mode
2. **`useNodeConfigurationPanel.ts`** - Composable that manages panel state and lifecycle
3. **Integration in `CanvasPanel.vue`** - Wires up the panel to the canvas system

### Data Flow

```
┌─────────────────┐
│  Node Sidebar   │──(addNode)──┐
│     Panel       │             │
└─────────────────┘             │
                                ▼
┌─────────────────┐      ┌──────────────────────┐
│   Right Panel   │──────▶│ Configuration Panel  │
│  (Components)   │      │   (Full Screen)      │
└─────────────────┘      └──────────────────────┘
                                │
                                ▼
┌─────────────────┐      ┌──────────────────────┐
│  Canvas Nodes   │◀─────│   Add to Canvas      │
│  (Click Edit)   │      │   (With Config)      │
└─────────────────┘      └──────────────────────┘
```

## Usage

### Opening Configuration Panel for New Node

From NodeSidebarPanel or anywhere in the app:

```typescript
// Open configuration panel for creating a new node
openNodeConfiguration('browserNode', 'sidebar', {
  label: 'My Browser',
  url: 'https://example.com'
});
```

### Editing Existing Node

When clicking on a node on the canvas:

```typescript
// Open configuration panel for editing existing node
openNodeEdit(node.id, node.type, node.data, 'canvas');
```

### Configuration Panel State

```typescript
interface NodeConfigurationState {
  isOpen: boolean;              // Panel visibility
  nodeType: string | null;      // Type of node being configured
  nodeData: any | null;         // Current node data
  nodeId: string | null;        // For edit mode (existing nodes)
  mode: "create" | "edit";      // Create new or edit existing
  sourcePanel: "sidebar" | "rightPanel" | "canvas" | null;
}
```

## Features

### 1. Full-Screen Configuration
- Nodes render in a large, centered panel
- Full access to all node configuration options
- No canvas constraints (zooming, panning, etc.)

### 2. Non-Moveable Display
- Nodes are rendered statically in the center
- Connection handles are hidden
- Node resizers are hidden
- Focus is entirely on configuration

### 3. Dual Mode Operation

#### Create Mode
- Triggered from sidebar or right panel
- Configure new node before adding to canvas
- Primary button: "Add to Canvas"

#### Edit Mode
- Triggered by clicking canvas nodes
- Modify existing node configuration
- Primary button: "Save Changes"
- Additional button: "Delete" (for removing nodes)

### 4. Smart Data Management
- Local data editing (doesn't affect canvas until saved)
- Updates only applied when "Add to Canvas" or "Save Changes" is clicked
- Cancel button discards changes

## Integration Points

### CanvasPanel.vue

The main canvas component integrates the configuration panel:

```vue
<NodeConfigurationPanel
  :is-open="isConfigurationOpen"
  :node-type="currentConfiguration.nodeType"
  :node-data="currentConfiguration.nodeData"
  :node-id="currentConfiguration.nodeId"
  :mode="currentConfiguration.mode"
  :organization-id="organizationId"
  :available-hooks="availableHooks"
  :available-transports="availableTransports"
  :all-handlers="allHandlers"
  :canvas-nodes="allNodes"
  :canvas-edges="allEdges"
  :canvas-viewport="currentViewport"
  @close="closeNodeConfiguration"
  @add-node="handleAddNodeFromConfig"
  @update-node="handleUpdateNodeFromConfig"
  @delete-node="handleDeleteNodeFromConfig"
/>
```

### Event Handlers

#### handleAddNode (Updated)
```typescript
const handleAddNode = (nodeType: string) => {
  // Instead of directly adding, opens configuration panel
  openNodeConfiguration(nodeType, "sidebar");
};
```

#### handleNodeClickOnCanvas (New)
```typescript
const handleNodeClickOnCanvas = (node: any) => {
  // Opens configuration panel in edit mode
  openNodeEdit(node.id, node.type, node.data, "canvas");
};
```

#### handleAddNodeFromConfig (New)
```typescript
const handleAddNodeFromConfig = (nodeType: string, nodeData: any) => {
  // Creates node using existing creator
  const creator = getNodeCreators()[nodeType];
  creator();
  
  // Gets newly created node and applies configuration
  const newNode = allNodes.value[allNodes.value.length - 1];
  Object.keys(nodeData).forEach((key) => {
    updateNodeData(newNode.id, key, nodeData[key]);
  });
};
```

## Supported Node Types

The configuration panel supports ALL node types registered in the system:

### Shape Nodes
- Rectangle, Circle, Diamond, Triangle, Hexagon
- Arrow (Up, Down, Left, Right)

### Programming Icons
- Database, API, Server, Cloud

### Workflow Nodes
- Event, Command, View, GitAction
- Hook, Transport, Template

### Integration Nodes
- GitHub, Solution

### Project Nodes
- Intent Selection
- Project Explorer
- Project Script Runner
- B Folder Setup
- Save Template

### Environment Nodes
- Environment Setup
- Rust/Node/PHP/Python/Java/.NET Check
- Buildit CLI

### Special Nodes
- Browser Node
- Webview Node
- Code Editor Node
- Forms Panel Node
- Viewport Node

## Styling and UX

### Panel Appearance
- Full-screen overlay with backdrop blur
- Dark gradient background matching canvas theme
- Smooth animations (fade in, slide up)
- Primary-colored border and accents

### Node Display
- Centered in panel
- Maximum space for configuration
- All interactive elements fully accessible
- Scrollable content area for large nodes

### Footer Actions
- Info text explaining current mode
- Cancel button (closes without changes)
- Primary action button (Add to Canvas / Save Changes)
- Delete button (edit mode only)

## Technical Implementation

### Component Structure

```
NodeConfigurationPanel.vue
├── Panel Backdrop (blur overlay)
├── Panel Container
│   ├── Header
│   │   ├── Node Icon
│   │   ├── Title & Subtitle
│   │   └── Actions (Delete, Close)
│   ├── Content Area
│   │   └── Dynamic Node Renderer
│   │       └── Actual Node Component
│   └── Footer
│       ├── Info Text
│       └── Action Buttons
```

### Key Technical Details

1. **No VueFlow Dependency**: Nodes render directly without VueFlow wrapper
2. **Connection Handles Hidden**: CSS hides all `.connection-handle` elements
3. **Static Positioning**: Nodes use `position: static` in config panel
4. **Deep Slots**: All node props and handlers passed through

## Future Enhancements

### Planned Features
- [ ] Configuration templates/presets
- [ ] Quick configuration from right-click menu
- [ ] Multi-node configuration (bulk edit)
- [ ] Configuration history/undo
- [ ] Keyboard shortcuts (Cmd+S to save, Esc to close)
- [ ] Configuration validation before adding to canvas
- [ ] Preview mode (see how node will look on canvas)

### Potential Improvements
- [ ] Split-screen mode (config panel + canvas view)
- [ ] Drag-to-reorder for list-based configurations
- [ ] Advanced search/filter within node configuration
- [ ] Configuration export/import
- [ ] Auto-save draft configurations

## Troubleshooting

### Panel Not Opening
- Check that `isConfigurationOpen` is true
- Verify `nodeType` is a valid registered type
- Ensure component is imported correctly

### Node Not Rendering
- Verify node type is registered in `useNodeComponentRegistry`
- Check that node component accepts standard props
- Review browser console for component errors

### Configuration Not Applying
- Ensure `updateLocalNodeData` is being called
- Verify data is being passed correctly in events
- Check that node creator is registered for the type

## API Reference

### useNodeConfigurationPanel()

```typescript
interface NodeConfigurationPanel {
  // State
  configurationState: Ref<NodeConfigurationState>;
  isConfigurationOpen: Computed<boolean>;
  currentConfiguration: Computed<NodeConfigurationState>;
  isEditMode: Computed<boolean>;
  panelTitle: Computed<string>;
  
  // Methods
  openNodeConfiguration(nodeType: string, sourcePanel: string, initialData?: any): void;
  openNodeEdit(nodeId: string, nodeType: string, nodeData: any, sourcePanel: string): void;
  closeNodeConfiguration(): void;
  updateConfigurationData(key: string, value: any): void;
}
```

### Events

#### @close
Emitted when panel should close (backdrop click, cancel button, close button)

#### @add-node
Emitted when "Add to Canvas" is clicked in create mode
```typescript
(nodeType: string, nodeData: any) => void
```

#### @update-node
Emitted when "Save Changes" is clicked in edit mode
```typescript
(nodeId: string, nodeData: any) => void
```

#### @delete-node
Emitted when "Delete" button is clicked in edit mode
```typescript
(nodeId: string) => void
```

## Examples

### Example 1: Configure Browser Node

```typescript
// User clicks "Browser Node" in sidebar
openNodeConfiguration('browserNode', 'sidebar', {
  label: 'Form Preview',
  url: '',
  width: 800,
  height: 600
});

// User fills in configuration in panel
// User clicks "Add to Canvas"
// → handleAddNodeFromConfig creates and configures the node
```

### Example 2: Edit Existing Node

```typescript
// User clicks on a ProjectScriptRunnerNode on canvas
handleNodeClickOnCanvas({
  id: 'node-123',
  type: 'projectScriptRunnerNode',
  data: {
    projectPath: 'C:/projects/myapp',
    detectedScripts: [...]
  }
});

// → Opens configuration panel in edit mode
// User modifies configuration
// User clicks "Save Changes"
// → handleUpdateNodeFromConfig applies changes
```

## Migration Guide

### Before (Direct Addition)
```typescript
const handleAddNode = (nodeType: string) => {
  const creator = getNodeCreators()[nodeType];
  creator(); // Immediately adds to canvas
};
```

### After (Configuration Panel)
```typescript
const handleAddNode = (nodeType: string) => {
  // Opens configuration panel first
  openNodeConfiguration(nodeType, "sidebar");
  // Node added only after configuration is complete
};
```

## Best Practices

1. **Always validate** node data before emitting add/update events
2. **Preserve existing data** when opening in edit mode (deep clone)
3. **Provide clear feedback** about what will happen (footer info text)
4. **Handle edge cases** (unknown node types, missing data)
5. **Maintain state** until explicitly saved or cancelled
6. **Clean up** on close (reset local state)

## Related Documentation

- [Canvas Architecture](./CANVAS_ARCHITECTURE.md)
- [How to Add a Node](../HOW_TO_ADD_A_NODE.md)
- [Node Component Registry](./NODE_COMPONENT_REGISTRY.md)

