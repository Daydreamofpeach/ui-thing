# Node Configuration Panel - Usage Guide

## Quick Start

The Node Configuration Panel provides a dedicated full-screen interface for configuring nodes before adding them to the canvas or editing existing nodes.

## User Flows

### Flow 1: Adding a New Node from Sidebar

```
1. User clicks node in sidebar (e.g., "Browser Node")
   ↓
2. Configuration panel opens in full screen
   ↓
3. User configures node (URL, dimensions, etc.)
   ↓
4. User clicks "Add to Canvas"
   ↓
5. Node appears on canvas with configuration applied
```

**Example:**
```
Sidebar Click: "Browser Node"
   ↓
Configuration Panel Opens:
   - Title: "Configure Browser Node"
   - Subtitle: "Web browser component for viewing pages"
   - Content: Full BrowserNode component (non-moveable)
   - Footer: "Add to Canvas" button
   ↓
User fills in:
   - URL: https://example.com
   - Label: "Example Site"
   ↓
Click "Add to Canvas"
   ↓
Browser node appears on canvas at auto-positioned location
```

### Flow 2: Editing Existing Node from Canvas

```
1. User clicks on existing node on canvas
   ↓
2. Configuration panel opens in edit mode
   ↓
3. User modifies node configuration
   ↓
4. User clicks "Save Changes"
   ↓
5. Canvas node updates with new configuration
```

**Example:**
```
Canvas Click: ProjectScriptRunnerNode
   ↓
Configuration Panel Opens (Edit Mode):
   - Title: "Edit Project Script Runner"
   - Subtitle: "Manage project scripts"
   - Content: Full ProjectScriptRunnerNode (non-moveable)
   - Footer: "Save Changes" + "Delete" buttons
   ↓
User modifies:
   - Adds new script
   - Changes script commands
   - Updates descriptions
   ↓
Click "Save Changes"
   ↓
Canvas node updates immediately
```

### Flow 3: Adding Node from Right Panel (Components)

```
1. User clicks "+" on template/solution/hook/transport
   ↓
2. Component is added to canvas (existing behavior)
   OR
3. Configuration panel opens for additional setup
   ↓
4. User configures component
   ↓
5. Component appears on canvas
```

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Esc` | Close panel |
| `Cmd/Ctrl + S` | Save changes / Add to canvas |
| `Cmd/Ctrl + Enter` | Quick save |

## Panel Modes

### Create Mode
- **Trigger**: Clicking node in sidebar or right panel
- **Title**: "Configure [Node Type]"
- **Primary Button**: "Add to Canvas" (green)
- **Secondary Button**: "Cancel" (gray)
- **Delete Button**: Hidden

### Edit Mode
- **Trigger**: Clicking existing node on canvas
- **Title**: "Edit [Node Type]"
- **Primary Button**: "Save Changes" (green)
- **Secondary Button**: "Cancel" (gray)
- **Delete Button**: Visible (red)

## Visual Examples

### Configuration Panel Layout

```
┌────────────────────────────────────────────────────────────┐
│  ┌──────────────────────────────────────────────────────┐  │
│  │ HEADER                                      [🗑️] [×]  │  │
│  │ 🌐 Configure Browser Node                            │  │
│  │    Web browser component for viewing pages           │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ CONTENT (Scrollable)                                  │  │
│  │                                                       │  │
│  │         ┌─────────────────────────────┐              │  │
│  │         │                             │              │  │
│  │         │   Browser Node Component    │              │  │
│  │         │   (Rendered Full Size)      │              │  │
│  │         │   (Non-Moveable)            │              │  │
│  │         │   (All Features Visible)    │              │  │
│  │         │                             │              │  │
│  │         └─────────────────────────────┘              │  │
│  │                                                       │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ FOOTER                                                │  │
│  │ ℹ️ Node will be added to canvas after configuration   │  │
│  │ Esc to close • Cmd+S to save                         │  │
│  │                           [Cancel] [Add to Canvas 🚀] │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────┘
```

### Create Mode Panel

```
Header:
  [🌐] Configure Browser Node
       Web browser component for viewing pages
                                    [×] Close

Content:
  ┌─────────────────────────────────────┐
  │  Browser Node (Full Configuration)  │
  │  • URL input field                  │
  │  • Device presets                   │
  │  • All controls enabled             │
  └─────────────────────────────────────┘

Footer:
  ℹ️ Node will be added to canvas after configuration
  Esc to close • Cmd+S to save
                     [Cancel] [Add to Canvas]
```

### Edit Mode Panel

```
Header:
  [📜] Edit Project Script Runner
       Manage and execute project scripts
                          [🗑️] Delete [×] Close

Content:
  ┌─────────────────────────────────────┐
  │  ProjectScriptRunnerNode            │
  │  • All detected scripts             │
  │  • Script editor buttons            │
  │  • Full configuration access        │
  └─────────────────────────────────────┘

Footer:
  ℹ️ Changes will be applied to the canvas node
  Esc to close • Cmd+S to save
                     [Cancel] [Save Changes]
```

## Node Rendering Differences

### In Configuration Panel (Non-Moveable)
- Static positioning
- Connection handles hidden
- Node resizers hidden
- Full space for content
- All configuration UI visible
- Maximum node size allowed
- Centered in panel
- No zoom/pan interactions

### On Canvas (Moveable)
- Draggable positioning
- Connection handles visible
- Node resizers visible
- Constrained by canvas
- Configuration UI may be collapsed
- Size limited by canvas view
- Position determined by user/auto
- Full zoom/pan interactions

## Advanced Features

### 1. Configuration Validation
Before adding/updating, the panel can validate:
- Required fields
- Data format
- Dependencies
- Constraints

### 2. Quick Close
Panel closes immediately without confirmation when:
- Pressing Escape key
- Clicking backdrop (outside panel)
- Clicking close button (×)
- Clicking cancel button

This allows for fast workflow and easy escape.

### 3. Context Preservation
Panel remembers:
- Source panel (sidebar, right panel, canvas)
- Previous configuration
- Related nodes/edges

### 4. Full Props Passing
Node receives all necessary props:
```vue
<component
  :custom-node-props="nodePropsForRenderer"
  :update-node-data="updateLocalNodeData"
  :all-handlers="allHandlers"
  :organization-id="organizationId"
  :available-hooks="availableHooks"
  :available-transports="availableTransports"
  :canvas-nodes="canvasNodes"
  :canvas-edges="canvasEdges"
  :canvas-viewport="canvasViewport"
/>
```

## Technical Details

### Z-Index Layering
```css
Configuration Panel: z-index: 9999
Canvas: z-index: 1
Sidebar: z-index: 100
Right Panel: z-index: 100
```

### Animation Timeline
```
Panel Open:
  0ms: Start fade in + slide up
  200ms: Backdrop fully visible
  300ms: Panel fully visible

Panel Close:
  0ms: Start fade out
  200ms: Panel removed from DOM
```

### State Management

```typescript
// Panel State
const configurationState = ref({
  isOpen: false,
  nodeType: 'browserNode',
  nodeData: { url: 'https://example.com' },
  nodeId: null,
  mode: 'create',
  sourcePanel: 'sidebar'
});

// Local Editing
const localNodeData = ref({ ...nodeData });

// Changes Tracking
const hasChanges = ref(false);
```

## Common Use Cases

### 1. Browser Node Configuration
```
Configure:
  - URL
  - Dimensions (width/height)
  - Device preset
  - Hook attachment
  - Transport configuration
  
Then: Add to Canvas
```

### 2. Project Script Runner Setup
```
Configure:
  - Project path
  - Detected scripts
  - Script metadata
  - OS-specific commands
  
Then: Add to Canvas
```

### 3. B Folder Setup Configuration
```
Configure:
  - Project path
  - Environment detection
  - Script mappings
  - B folder options
  
Then: Add to Canvas
```

### 4. Hook Node Setup
```
Configure:
  - Hook name
  - Hook type
  - Triggers
  - Listeners
  
Then: Add to Canvas
```

## Best Practices

### For Users
1. **Configure before adding** - Take time to set up node properly
2. **Use keyboard shortcuts** - Faster workflow
3. **Click canvas nodes** - Quick access to edit existing nodes
4. **Review before saving** - Check all settings

### For Developers
1. **Support all props** - Nodes should work with standard props
2. **Handle local updates** - Use updateNodeData callback
3. **No canvas dependencies** - Don't rely on VueFlow features
4. **Responsive design** - Work at different sizes
5. **Clear labels** - Help users understand each option

## Error Handling

### Unknown Node Type
```
Panel displays:
  ⚠️ Unknown Node Type
  Cannot render node type: [nodeType]
```

### Missing Component
```
Panel falls back to:
  - Generic configuration form
  - Text input for basic properties
  - Warning message
```

### Configuration Error
```
Panel shows:
  - Error message in footer
  - Prevents adding/updating
  - Highlights invalid fields
```

## Integration Examples

### Example 1: Simple Shape Node

```typescript
// Sidebar click: "Rectangle"
openNodeConfiguration('rectangle', 'sidebar');

// User types text: "My Rectangle"
updateLocalNodeData('temp-config-node', 'text', 'My Rectangle');

// Click "Add to Canvas"
handleAddNodeFromConfig('rectangle', { text: 'My Rectangle' });

// Result: Rectangle appears on canvas with text
```

### Example 2: Complex Project Node

```typescript
// Sidebar click: "Project Script Runner"
openNodeConfiguration('projectScriptRunnerNode', 'sidebar');

// User browses for folder
updateLocalNodeData('temp-config-node', 'projectPath', 'C:/projects/myapp');

// Scripts auto-detected
updateLocalNodeData('temp-config-node', 'detectedScripts', [...scripts]);

// Click "Add to Canvas"
handleAddNodeFromConfig('projectScriptRunnerNode', {
  projectPath: 'C:/projects/myapp',
  detectedScripts: [...scripts]
});

// Result: Fully configured script runner on canvas
```

### Example 3: Editing Browser Node

```typescript
// Canvas click on existing browser node
handleNodeClickOnCanvas({
  id: 'browser-123',
  type: 'browserNode',
  data: {
    url: 'https://old-url.com',
    label: 'Old Label'
  }
});

// Panel opens in edit mode
openNodeEdit('browser-123', 'browserNode', { url: '...', label: '...' });

// User changes URL
updateLocalNodeData('browser-123', 'url', 'https://new-url.com');

// Click "Save Changes"
handleUpdateNodeFromConfig('browser-123', {
  url: 'https://new-url.com',
  label: 'Old Label'
});

// Result: Canvas node updates with new URL
```

## Comparison: Before vs After

### Before (Direct Addition)
```
Sidebar Click → Node Added to Canvas → Configure on Canvas
                (With default values)    (Limited space)
```

### After (Configuration Panel)
```
Sidebar Click → Configuration Panel → Configure Fully → Add to Canvas
                (Full screen)         (All options)     (Fully configured)
```

## Benefits

1. **Better UX** - Focused configuration experience
2. **More Space** - Full screen for complex nodes
3. **Less Clutter** - Canvas stays clean during setup
4. **Easy Editing** - Click any node to reconfigure
5. **Consistent** - Same interface for all node types
6. **Keyboard Friendly** - Fast workflows with shortcuts
7. **Change Preview** - See configuration before applying
8. **Error Prevention** - Validate before adding to canvas

## Keyboard Shortcuts Reference

| Action | Windows/Linux | Mac |
|--------|--------------|-----|
| Close panel | `Esc` | `Esc` |
| Save/Add | `Ctrl + S` | `Cmd + S` |
| Quick save | `Ctrl + Enter` | `Cmd + Enter` |

## Tips & Tricks

### Tip 1: Quick Configuration
Press `Cmd/Ctrl + S` immediately after opening panel to add node with defaults.

### Tip 2: Backdrop Click
Clicking outside the panel closes it immediately (no confirmation needed).

### Tip 3: Rapid Editing
Double-click canvas nodes for even faster access to configuration panel.

### Tip 4: Configuration Templates
Save common configurations by noting the data structure, then reuse.

### Tip 5: Keyboard Navigation
Tab through form fields, Enter to submit, Esc to cancel - full keyboard support.

## Troubleshooting

### Q: Panel doesn't open when clicking sidebar node
**A:** Check that handleAddNode is calling openNodeConfiguration correctly.

### Q: Node doesn't render in panel
**A:** Verify node type is registered in useNodeComponentRegistry.

### Q: Changes not applying to canvas
**A:** Ensure updateNodeData is being called correctly in the handlers.

### Q: Panel shows "Unknown Node Type"
**A:** The node type might not be registered or there's a typo in the node type string.

### Q: Can't close panel with Esc
**A:** Check browser console for JavaScript errors that might be preventing event handlers.

## Future Enhancements

See [NODE_CONFIGURATION_PANEL.md](./NODE_CONFIGURATION_PANEL.md) for planned features.

