# Orbit Node Architecture

This document describes the reusable, production-ready orbit node system for the BuildIt canvas.

## Overview

The orbit system allows any node to display connected/related nodes in an orbiting ring around it. The architecture is designed to be:
- **Reusable**: Any node can use the orbit system
- **Composable**: Separation of concerns with clear responsibility boundaries
- **Non-destructive**: Changes to components don't break existing functionality
- **Extensible**: Easy to add new nodes or orbit behaviors

## Architecture Components

### 1. **useOrbitNodeManager Composable**
**File**: `client/app/components/canvas/composables/useOrbitNodeManager.ts`

Core composable that manages all orbit state and logic:

**Exports**:
- `OrbitItem` - Configuration for orbit items (interface)
- `OrbitNodeMeta` - Metadata for orbit nodes (interface)
- `OrbitNodeState` - State tracking for orbit nodes (type)
- `useOrbitNodeManager(centerNodeId, setNodesCallback)` - Main composable function

**Key Methods**:
- `setOrbitItems(items, metadata)` - Set the orbit items
- `clearOrbit()` - Clear all orbit state
- `openNodeFromOrbit(id)` - Open/focus a specific orbit node
- `closeOrbitNode()` - Close the currently active orbit node
- `toggleOrbitNodes()` - Toggle show/hide all orbit nodes
- `restoreOrbitNodes(ids?, removeFromOrbit)` - Restore nodes to original state
- `hideNodesForOrbit(ids)` - Hide nodes while in orbit mode

**State Exposed**:
- `orbitItems` - Array of visible orbit items
- `orbitNodeMeta` - Metadata for each orbit node
- `activeOrbitNodeId` - Currently active/focused orbit node
- `orbitNodesExpanded` - Whether orbit nodes are currently shown
- `previousNodeStates` - Tracking for node state restoration

### 2. **OrbitControlButton Component**
**File**: `client/app/components/canvas/shared/OrbitControlButton.vue`

Reusable UI component for controlling orbit state. Should be placed inside the node content area.

**Props**:
- `activeOrbitNodeId: string | null` - Currently active orbit node ID
- `isExpanded: boolean` - Whether orbit nodes are currently shown
- `hasOrbitItems: boolean` - Whether there are orbit items available

**Events**:
- `@close` - User wants to close active orbit node
- `@toggle` - User wants to toggle show/hide all orbit nodes

**Usage Example**:
```vue
<OrbitControlButton
  :active-orbit-node-id="activeOrbitNodeId"
  :is-expanded="orbitNodesExpanded"
  :has-orbit-items="orbitItems.length > 0"
  @close="handleCloseOrbitNode"
  @toggle="handleToggleOrbitNodes"
/>
```

### 3. **Integration with BuilditNode**

The `BuilditNode.vue` serves as the example implementation:

```typescript
// 1. Import the composable and component
import { useOrbitNodeManager } from "@canvas/composables/useOrbitNodeManager";
import OrbitControlButton from "@canvas/shared/OrbitControlButton.vue";

// 2. Initialize the orbit manager
const orbitManager = useOrbitNodeManager(
  computed(() => props.customNodeProps?.id || '').value,
  setNodes
);

// 3. Use the composable state
const orbitItems = orbitManager.orbitItems;
const activeOrbitNodeId = orbitManager.activeOrbitNodeId;
const orbitNodesExpanded = orbitManager.orbitNodesExpanded;

// 4. Add event handlers
function handleOrbitItemClick(item: any) {
  orbitManager.openNodeFromOrbit(item.id);
}

function handleCloseOrbitNode() {
  orbitManager.closeOrbitNode();
}

function handleToggleOrbitNodes() {
  orbitManager.toggleOrbitNodes();
}

// 5. Add the control button to your node
<OrbitControlButton
  :active-orbit-node-id="activeOrbitNodeId"
  :is-expanded="orbitNodesExpanded"
  :has-orbit-items="orbitItems.length > 0"
  @close="handleCloseOrbitNode"
  @toggle="handleToggleOrbitNodes"
/>
```

## Usage Flow

### Opening an Orbit Node
1. User clicks an orbit badge item
2. `handleOrbitItemClick()` is called
3. `orbitManager.openNodeFromOrbit(id)` is invoked
4. Node is restored and focused with fitView animation
5. `activeOrbitNodeId` is set to the focused node
6. Node status visually changes to show it's active

### Closing an Active Orbit Node
1. User clicks the "Close" button in `OrbitControlButton`
2. `handleCloseOrbitNode()` is called
3. `orbitManager.closeOrbitNode()` sets `activeOrbitNodeId` to null
4. Visual state updates to remove active indicators

### Toggling Orbit Visibility
1. User clicks the "Show/Hide Orbit" button in `OrbitControlButton`
2. `handleToggleOrbitNodes()` is called
3. `orbitManager.toggleOrbitNodes()` either hides or shows orbit nodes
4. `orbitNodesExpanded` state updates accordingly

## Key Design Decisions

### 1. Separation of Concerns
- **Composable**: Handles all state management and node operations
- **Component**: Handles only UI presentation and event emission
- **Node**: Orchestrates and integrates the two

### 2. Non-destructive Updates
- Old orbit overlay template is kept intact (backwards compatible)
- New controls are added inside node content (non-invasive)
- Only initialization logic is updated to use composable

### 3. Reusability
- `useOrbitNodeManager` can be used in ANY node
- `OrbitControlButton` can be placed in ANY node
- No hardcoded references to BuilditNode

### 4. Production-Ready
- Clean type definitions
- Proper error handling
- State validation
- Proper cleanup on unmount

## Extending to Other Nodes

To add orbit functionality to any new node:

1. Import the composable and component
2. Initialize `useOrbitNodeManager` with your node ID
3. Use the exposed state in your template
4. Add event handlers for the three main actions
5. Include `OrbitControlButton` in your node content
6. Call `initializeOrbit()` when your node's data is ready

Example:
```typescript
const orbitManager = useOrbitNodeManager(nodeId, setNodes);

// When data is ready:
const items = createOrbitItems(connectedNodeIds);
orbitManager.setOrbitItems(items, metadata);
```

## Files

- `/client/app/components/canvas/composables/useOrbitNodeManager.ts` - Core logic
- `/client/app/components/canvas/shared/OrbitControlButton.vue` - UI component
- `/client/app/components/canvas/nodes/BuilditNode.vue` - Example implementation
- `/client/app/components/canvas/shared/NodeOrbit.vue` - Orbit visualization (unchanged)
- `/client/app/components/canvas/shared/NodeOrbitOverlay.vue` - Orbit overlay (unchanged)

