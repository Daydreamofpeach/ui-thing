# Orbit Component Subcomponents

This directory contains modular subcomponents for the orbit system, improving code organization and reusability.

## Components

### OrbitNodeActions.vue
Handles opening and closing individual orbit nodes.

**Props:**
- `nodeId` (string) - The ID of the node
- `isOpen` (boolean) - Whether the node is currently open
- `itemLabel` (string, optional) - Label for accessibility

**Events:**
- `open` - Emitted when opening a node
- `close` - Emitted when closing a node

**Usage:**
```vue
<OrbitNodeActions
	:node-id="nodeId"
	:is-open="isNodeOpen"
	item-label="Project Node"
	@open="handleOpenNode"
	@close="handleCloseNode"
/>
```

### OrbitVisibilityToggle.vue
Handles showing/hiding all orbit nodes at once.

**Props:**
- `isExpanded` (boolean) - Whether nodes are currently visible
- `nodeCount` (number, optional) - Number of nodes in orbit
- `showLabel` (string, optional) - Label for show button
- `hideLabel` (string, optional) - Label for hide button

**Events:**
- `show` - Emitted when showing all nodes
- `hide` - Emitted when hiding all nodes

**Usage:**
```vue
<OrbitVisibilityToggle
	:is-expanded="orbitNodesExpanded"
	:node-count="orbitItems.length"
	show-label="Show All"
	hide-label="Hide All"
	@show="handleShowAll"
	@hide="handleHideAll"
/>
```

### OrbitNodeItem.vue
Renders an individual orbit node item with badge, icon, and status indicators.

**Props:**
- `item` (OrbitItem) - The orbit item data
- `isActive` (boolean, optional) - Whether this item is currently active
- `isOpen` (boolean, optional) - Whether the node is open
- `itemStyle` (object, optional) - Custom styles for the item
- `badgeStyle` (object, optional) - Custom styles for the badge
- `haloStyle` (object, optional) - Custom styles for the halo effect
- `iconStyle` (object, optional) - Custom styles for the icon

**Events:**
- `select` - Emitted when the item is clicked

**Slots:**
- `icon` - Custom icon rendering

**Usage:**
```vue
<OrbitNodeItem
	:item="orbitItem"
	:is-active="activeId === orbitItem.id"
	:is-open="openNodes.includes(orbitItem.id)"
	:item-style="getItemStyle(item)"
	:badge-style="getBadgeStyle(item)"
	@select="handleItemSelect"
/>
```

## Benefits

1. **Separation of Concerns**: Each component has a single, clear responsibility
2. **Reusability**: Components can be used independently or together
3. **Maintainability**: Easier to update and test individual features
4. **Flexibility**: Easy to customize behavior per use case
5. **Type Safety**: Clear interfaces and prop definitions

## Integration

These components are integrated into:
- `OrbitControlButton.vue` - Uses `OrbitNodeActions` and `OrbitVisibilityToggle`
- `NodeOrbit.vue` - Can use `OrbitNodeItem` for rendering items (future enhancement)

