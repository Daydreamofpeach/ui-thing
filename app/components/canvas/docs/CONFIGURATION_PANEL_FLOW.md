# Node Configuration Panel - Complete Flow Diagram

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER INTERACTIONS                            │
└─────────────────────────────────────────────────────────────────────┘
         │                    │                    │
         │                    │                    │
         ▼                    ▼                    ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Sidebar   │     │ Right Panel │     │   Canvas    │
│  Node List  │     │ Components  │     │   Nodes     │
└─────────────┘     └─────────────┘     └─────────────┘
         │                    │                    │
         │ Click              │ Click "+"          │ Click Node
         │ "Browser"          │ on Template        │ to Edit
         │                    │                    │
         ▼                    ▼                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    openNodeConfiguration()                           │
│                         OR                                           │
│                      openNodeEdit()                                  │
└─────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                  NodeConfigurationPanel.vue                          │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │ HEADER                                                      │    │
│  │ • Node Icon                                                 │    │
│  │ • Title (Configure/Edit [Node Type])                        │    │
│  │ • Subtitle (Description)                                    │    │
│  │ • Actions (Delete, Close)                                   │    │
│  └────────────────────────────────────────────────────────────┘    │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │ CONTENT (Scrollable)                                        │    │
│  │                                                             │    │
│  │    ┌────────────────────────────────────────┐              │    │
│  │    │                                        │              │    │
│  │    │  Dynamic Node Component                │              │    │
│  │    │  (Full Size, Non-Moveable)             │              │    │
│  │    │                                        │              │    │
│  │    │  Props:                                │              │    │
│  │    │  • customNodeProps                     │              │    │
│  │    │  • updateNodeData → updateLocalNodeData│              │    │
│  │    │  • allHandlers                         │              │    │
│  │    │  • organizationId                      │              │    │
│  │    │  • availableHooks                      │              │    │
│  │    │  • availableTransports                 │              │    │
│  │    │  • canvasNodes                         │              │    │
│  │    │  • canvasEdges                         │              │    │
│  │    │  • canvasViewport                      │              │    │
│  │    │                                        │              │    │
│  │    └────────────────────────────────────────┘              │    │
│  │                                                             │    │
│  └────────────────────────────────────────────────────────────┘    │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │ FOOTER                                                      │    │
│  │ • Info text                                                 │    │
│  │ • Keyboard shortcuts hint                                   │    │
│  │ • Action buttons (Cancel, Add/Save)                         │    │
│  └────────────────────────────────────────────────────────────┘    │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
                                │
                                │ User clicks action button
                                │
                ┌───────────────┴───────────────┐
                │                               │
                ▼                               ▼
        "Add to Canvas"                  "Save Changes"
                │                               │
                ▼                               ▼
    handleAddNodeFromConfig          handleUpdateNodeFromConfig
                │                               │
                ▼                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        Canvas Updates                                │
│                                                                      │
│  Create Mode:                      Edit Mode:                        │
│  1. Call node creator              1. Update existing node data      │
│  2. Get newly created node         2. Trigger reactivity             │
│  3. Apply configuration data       3. Save to persistence            │
│  4. Position on canvas             4. Update visual state            │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

## Detailed Flow: Create Mode

```
User Action: Click "Browser Node" in Sidebar
    │
    ▼
dashboard.vue → handleAddNode(nodeType)
    │
    ▼
canvasPanelRef.value.handleAddNode('browserNode')
    │
    ▼
CanvasPanel.handleAddNode('browserNode')
    │
    ▼
openNodeConfiguration('browserNode', 'sidebar')
    │
    ▼
configurationState.value = {
  isOpen: true,
  nodeType: 'browserNode',
  nodeData: {},
  nodeId: null,
  mode: 'create',
  sourcePanel: 'sidebar'
}
    │
    ▼
NodeConfigurationPanel renders BrowserNode component
    │
    ▼
User configures:
  - URL: 'https://example.com'
  - Label: 'Example'
    │
    │ (Each change calls updateLocalNodeData)
    │
    ▼
localNodeData.value = {
  url: 'https://example.com',
  label: 'Example'
}
    │
    ▼
User clicks "Add to Canvas"
    │
    ▼
handleAddNodeFromConfig('browserNode', { url: '...', label: '...' })
    │
    ▼
1. Get node creator from registry
2. Call creator() → adds node to allNodes
3. Get newly created node (last in array)
4. Apply configuration data via updateNodeData
    │
    ▼
Browser node appears on canvas with configuration!
```

## Detailed Flow: Edit Mode

```
User Action: Click existing node on canvas
    │
    ▼
VueFlow emits @node-click event
    │
    ▼
BaseCanvas.handleNodeClick({ node })
    │
    ▼
emit('nodeClick', node)
    │
    ▼
CanvasPanel receives @node-click
    │
    ▼
handleNodeClickOnCanvas(node)
    │
    ▼
openNodeEdit(node.id, node.type, node.data, 'canvas')
    │
    ▼
configurationState.value = {
  isOpen: true,
  nodeType: 'projectScriptRunnerNode',
  nodeData: { ...deep clone of node.data },
  nodeId: 'node-123',
  mode: 'edit',
  sourcePanel: 'canvas'
}
    │
    ▼
NodeConfigurationPanel renders ProjectScriptRunnerNode
    │
    ▼
User modifies:
  - Adds new script
  - Changes command
    │
    │ (Each change calls updateLocalNodeData)
    │
    ▼
localNodeData.value = {
  ...existing data,
  detectedScripts: [...updated scripts]
}
    │
    ▼
User clicks "Save Changes"
    │
    ▼
handleUpdateNodeFromConfig('node-123', { ...updated data })
    │
    ▼
For each key in updated data:
  updateNodeData('node-123', key, value)
    │
    ▼
Canvas node updates reactively!
```

## State Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│              Configuration Panel State                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  configurationState {                                        │
│    isOpen: boolean          ← Controls panel visibility     │
│    nodeType: string         ← Determines which component    │
│    nodeData: object         ← Configuration values          │
│    nodeId: string?          ← For edit mode only            │
│    mode: "create"|"edit"    ← Controls button labels        │
│    sourcePanel: string      ← Tracks where user came from   │
│  }                                                           │
│                                                              │
│  localNodeData {            ← Working copy of node data     │
│    ...all node properties   ← Modified during configuration │
│  }                                                           │
│                                                              │
│  hasChanges: boolean        ← Tracks if user edited data    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Component Communication

```
┌──────────────────┐
│  NodeSidebarPanel│
│                  │
│  Click "Browser" │
│        │         │
│        ▼         │
│   emit('addNode',│
│    'browserNode')│
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│   dashboard.vue  │
│                  │
│  handleAddNode   │
│        │         │
│        ▼         │
│  canvasRef       │
│   .handleAddNode │
└────────┬─────────┘
         │
         ▼
┌──────────────────────────────────────┐
│      CanvasPanel.vue              │
│                                       │
│  handleAddNode(nodeType) {            │
│    openNodeConfiguration(nodeType)    │
│  }                                    │
└───────────────┬───────────────────────┘
                │
                ▼
┌───────────────────────────────────────────────────┐
│       useNodeConfigurationPanel.ts                 │
│                                                    │
│  openNodeConfiguration(nodeType, source, data) {   │
│    configurationState.value = {                    │
│      isOpen: true,                                 │
│      nodeType,                                     │
│      nodeData: cloned data,                        │
│      mode: 'create'                                │
│    }                                               │
│  }                                                 │
└─────────────────────┬──────────────────────────────┘
                      │
                      ▼
┌────────────────────────────────────────────────────────────┐
│            NodeConfigurationPanel.vue                       │
│                                                             │
│  Watches: configurationState                               │
│  Renders: Dynamic node component                           │
│  Updates: localNodeData                                    │
│  Emits: addNode / updateNode / deleteNode                  │
│                                                             │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      │ User clicks "Add to Canvas"
                      │
                      ▼
┌────────────────────────────────────────────────────────────┐
│       CanvasPanel.handleAddNodeFromConfig              │
│                                                             │
│  1. Get creator for node type                              │
│  2. Call creator() → adds base node                        │
│  3. Get newly created node                                 │
│  4. Apply configuration via updateNodeData                 │
│                                                             │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌────────────────────────────────────────────────────────────┐
│                  Canvas State Update                        │
│                                                             │
│  • allNodes array updated                                  │
│  • VueFlow re-renders                                      │
│  • Node appears at auto-position                           │
│  • Configuration applied                                   │
│                                                             │
└────────────────────────────────────────────────────────────┘
```

## Data Flow: Configuration → Canvas

```
┌─────────────────────────────────────────────────────────────┐
│                  Configuration Panel                         │
│                                                              │
│  localNodeData = {                                          │
│    url: 'https://example.com',                              │
│    label: 'Example Browser',                                │
│    width: 800,                                              │
│    height: 600                                              │
│  }                                                          │
│                                                              │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ emit('addNode', 'browserNode', localNodeData)
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              handleAddNodeFromConfig                         │
│                                                              │
│  1. creator = getNodeCreators()['browserNode']              │
│  2. creator() → creates node with defaults                  │
│                                                              │
│     allNodes.value = [..., {                                │
│       id: 'browser-xyz',                                    │
│       type: 'browserNode',                                  │
│       position: { x: 100, y: 100 },                         │
│       data: {                          ← Default data       │
│         label: 'Browser Node',                              │
│         url: ''                                             │
│       }                                                     │
│     }]                                                      │
│                                                              │
│  3. newNode = allNodes.value[last]                          │
│                                                              │
│  4. Apply configuration:                                    │
│     updateNodeData('browser-xyz', 'url', 'https://...')     │
│     updateNodeData('browser-xyz', 'label', 'Example...')    │
│     updateNodeData('browser-xyz', 'width', 800)             │
│     updateNodeData('browser-xyz', 'height', 600)            │
│                                                              │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                   Final Canvas State                         │
│                                                              │
│  allNodes.value = [..., {                                   │
│    id: 'browser-xyz',                                       │
│    type: 'browserNode',                                     │
│    position: { x: 100, y: 100 },                            │
│    data: {                           ← Configured data      │
│      label: 'Example Browser',                              │
│      url: 'https://example.com',                            │
│      width: 800,                                            │
│      height: 600                                            │
│    }                                                        │
│  }]                                                         │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Event Flow Chart

```
START
  │
  ├─[Sidebar Click]──────────────┐
  │                               │
  ├─[Right Panel Click]───────────┤
  │                               │
  └─[Canvas Node Click]───────────┤
                                  │
                                  ▼
                    ┌─────────────────────────┐
                    │ Configuration Panel     │
                    │ State Updated           │
                    └─────────────────────────┘
                                  │
                                  ▼
                    ┌─────────────────────────┐
                    │ Panel Renders with      │
                    │ Node Component          │
                    └─────────────────────────┘
                                  │
                    ┌─────────────┴─────────────┐
                    │                           │
                    ▼                           ▼
          [User Configures Node]    [User Cancels/Closes]
                    │                           │
                    ▼                           ▼
          "Add to Canvas"              closeNodeConfiguration()
          or "Save Changes"                     │
                    │                           ▼
                    ▼                        END
        ┌───────────┴──────────┐
        │                      │
        ▼                      ▼
  [Create Mode]         [Edit Mode]
        │                      │
        ▼                      ▼
handleAddNodeFromConfig  handleUpdateNodeFromConfig
        │                      │
        └──────────┬───────────┘
                   │
                   ▼
         ┌─────────────────┐
         │ Canvas Updated  │
         └─────────────────┘
                   │
                   ▼
                  END
```

## State Transitions

```
Panel State Machine:

[CLOSED] ─────────────────────────────────┐
   ▲                                       │
   │                                       │ openNodeConfiguration()
   │                                       │ or openNodeEdit()
   │                                       │
   │                                       ▼
   │                              [OPEN - CONFIGURING]
   │                                       │
   │                                       │ User edits fields
   │                                       │ updateLocalNodeData()
   │                                       │
   │                                       ▼
   │                              [OPEN - HAS CHANGES]
   │                                       │
   │                        ┌──────────────┼──────────────┐
   │                        │              │              │
   │                        ▼              ▼              ▼
   │                   Cancel          Add/Save       Delete
   │                        │              │              │
   │                        ▼              ▼              ▼
   └────────────────[Close Panel]  [Apply Changes]  [Remove Node]
                            │              │              │
                            └──────────────┴──────────────┘
                                           │
                                           ▼
                                    closeNodeConfiguration()
                                           │
                                           ▼
                                      [CLOSED]
```

## Component Hierarchy

```
CanvasPanel.vue
│
├── NodeConfigurationPanel.vue ◄─── Configuration overlay
│   │
│   ├── Panel Header
│   │   ├── Node Icon (from metadata)
│   │   ├── Title & Subtitle
│   │   └── Action Buttons (Delete, Close)
│   │
│   ├── Panel Content
│   │   └── <component :is="nodeComponent"> ◄─── Dynamic node renderer
│   │       │
│   │       └── Actual Node Component (e.g., BrowserNode.vue)
│   │           ├── All configuration UI
│   │           ├── All handlers passed through
│   │           └── Updates localNodeData
│   │
│   └── Panel Footer
│       ├── Info text
│       ├── Keyboard shortcuts
│       └── Action buttons
│
├── BaseCanvas.vue
│   └── @node-click → handleNodeClickOnCanvas → openNodeEdit()
│
├── NodeSidebarPanel.vue
│   └── emit('addNode') → handleAddNode → openNodeConfiguration()
│
└── NodeCanvasRightPanel.vue
    └── emit('addComponentNode') → (can integrate with panel)
```

## Props Propagation

```
CanvasPanel
    │
    │ Props received from dashboard.vue:
    │ • projectId
    │ • organizationId
    │ • availableHooks
    │ • availableTransports
    │
    ▼
NodeConfigurationPanel
    │
    │ Props passed to node component:
    │ • customNodeProps (virtual node)
    │ • updateNodeData → updateLocalNodeData
    │ • allHandlers (all canvas handlers)
    │ • organizationId
    │ • availableHooks
    │ • availableTransports
    │ • canvasNodes (for context)
    │ • canvasEdges (for context)
    │ • canvasViewport (for context)
    │
    ▼
Node Component (e.g., BrowserNode.vue)
    │
    └── Renders fully with all features
```

## CSS Class Hierarchy

```
.node-configuration-panel (z-index: 9999)
│
├── .panel-backdrop (blur overlay)
│
└── .panel-container (main panel)
    │
    ├── .panel-header
    │   ├── .header-left
    │   │   ├── Node Icon
    │   │   └── .header-info
    │   │       ├── .panel-title
    │   │       └── .panel-subtitle
    │   │
    │   └── .header-actions
    │       ├── .delete-btn
    │       └── .close-btn
    │
    ├── .panel-content (scrollable)
    │   └── .node-configuration-wrapper
    │       └── Node Component
    │           ├── :deep(.connection-handle) { display: none }
    │           ├── :deep(.vue-flow__resize-control) { display: none }
    │           └── cursor: default (not draggable)
    │
    └── .panel-footer
        ├── .footer-left
        │   ├── .footer-info
        │   └── .keyboard-shortcuts
        │       └── .shortcut-hint kbd
        │
        └── .footer-actions
            ├── .cancel-btn
            └── .primary-btn
```

## Animation Sequence

```
Panel Open:
  0ms     : fadeIn animation starts on .node-configuration-panel
  0ms     : backdropFade animation starts on .panel-backdrop
  0ms     : slideUp animation starts on .panel-container
  200ms   : Backdrop fully visible
  300ms   : Panel fully visible and interactive

Panel Close:
  0ms     : fadeOut animation starts
  200ms   : Panel removed from DOM
  State   : configurationState.isOpen = false
```

## Integration Points

### 1. Sidebar Integration
```typescript
// NodeSidebarPanel.vue emits:
@click="$emit('addNode', node.id)"

// dashboard.vue handles:
function handleAddNode(nodeType: string) {
  canvasPanelRef.value.handleAddNode(nodeType);
}

// CanvasPanel.vue handles:
const handleAddNode = (nodeType: string) => {
  openNodeConfiguration(nodeType, 'sidebar');
};
```

### 2. Canvas Integration
```typescript
// BaseCanvas.vue emits:
@node-click="handleNodeClick"
emit('nodeClick', node);

// CanvasPanel.vue handles:
@node-click="handleNodeClickOnCanvas"

const handleNodeClickOnCanvas = (node: any) => {
  openNodeEdit(node.id, node.type, node.data, 'canvas');
};
```

### 3. Right Panel Integration
```typescript
// NodeCanvasRightPanel.vue emits:
@add="addTemplateToCanvas"
emit('addComponentNode', 'template', template);

// dashboard.vue handles:
// (Currently adds directly, can integrate with panel)
```

## Error Handling Flow

```
Configuration Panel Error Handling:

Unknown Node Type
    │
    ├── getNodeComponent() returns null
    │
    └── Display: "Unknown Node Type" placeholder

Missing Required Data
    │
    ├── Validate on "Add to Canvas" click
    │
    └── Display: Error message in footer

Component Render Error
    │
    ├── Vue error boundary catches
    │
    └── Display: Error state with retry option

Delete Confirmation
    │
    ├── User clicks delete in edit mode
    │
    ├── confirm() dialog appears
    │
    └── If confirmed: emit('deleteNode', nodeId)
```

## Performance Considerations

### Optimization 1: Lazy Component Loading
Only load node component when panel opens, not on mount.

### Optimization 2: Data Cloning
Deep clone node data to prevent reactivity issues between panel and canvas.

### Optimization 3: Event Debouncing
updateLocalNodeData changes are immediate but panel doesn't emit until action button.

### Optimization 4: Cleanup
Remove event listeners on unmount to prevent memory leaks.

## Testing Scenarios

### Test 1: Basic Create Flow
1. Click "Rectangle" in sidebar
2. Panel opens with rectangle node
3. Type "My Shape" in text field
4. Click "Add to Canvas"
5. ✓ Rectangle appears with "My Shape" text

### Test 2: Edit Existing Node
1. Click existing browser node on canvas
2. Panel opens in edit mode
3. Change URL from 'old.com' to 'new.com'
4. Click "Save Changes"
5. ✓ Browser node URL updates on canvas

### Test 3: Cancel Without Changes
1. Click "Circle" in sidebar
2. Panel opens
3. Click "Cancel" or press Esc
4. ✓ Panel closes, no node added

### Test 4: Cancel With Changes (Edit Mode)
1. Click existing node on canvas
2. Panel opens in edit mode
3. Make changes
4. Click "Cancel" or press Esc
5. ✓ Panel closes immediately
6. ✓ Changes discarded (not saved)

### Test 5: Delete Node
1. Click existing node on canvas
2. Panel opens in edit mode
3. Click "Delete" button
4. ✓ Confirmation dialog appears
5. Click "OK" in dialog
6. ✓ Node removed from canvas
7. ✓ Panel closes

### Test 6: Keyboard Shortcuts
1. Open panel
2. Press Esc
3. ✓ Panel closes
4. Open panel again
5. Configure node
6. Press Cmd/Ctrl + S
7. ✓ Node added/updated
8. ✓ Panel closes

## Future Enhancements

See [NODE_CONFIGURATION_PANEL.md](./NODE_CONFIGURATION_PANEL.md) for planned features.

