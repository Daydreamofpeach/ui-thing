# Form Chain Template System

## Overview

This system allows users to save configured form automation chains as reusable templates. When a form is fully configured with hooks, transports, and email templates, users can save the entire workflow for reuse.

## Features

### 1. Save Configuration Button
- **Location**: Browser Node (Form Preview)
- **Visibility**: Only appears when both hook AND transport are configured
- **Action**: Saves the entire form automation chain

### 2. Dual Save Functionality

#### Save as New Template
Creates a **standalone template** that can be deployed independently:
- Named: `{Form Title} - Automation Chain`
- Contains all nodes: Browser → Hook → Transports → Templates
- Includes all edges and connections
- Categorized as "forms" with relevant tags
- Includes metadata about creation source and timestamp

#### Update Master Template
Updates the **existing template** (if working in one):
- Adds all form chain nodes to current template
- Preserves existing template nodes
- Updates template metadata
- Maintains all relationships

## Architecture

### Files Created

1. **`useFormChainTemplate.ts`** - Composable
   - `collectChainNodes()`: Traverses graph to find all related nodes
   - `saveAsNewTemplate()`: Creates new standalone template
   - `updateMasterTemplate()`: Updates existing template

2. **BrowserNode.vue** - UI Updates
   - Added "Save Configuration as Template" button
   - Added `save-form-chain-config` event emission
   - Added button styling (purple gradient)

3. **CanvasPanel.vue** - Integration
   - Added event handler `handleSaveFormChainConfig`
   - Integrated `useFormChainTemplate` composable
   - Shows success/error toasts

## Node Collection Logic

The system collects nodes by traversing edges:

```
Forms Panel (optional parent)
  ↓
Browser Node (starting point)
  ↓
Hook Node
  ↓
Transport Node(s)
  ↓
Transport Template Node(s)
```

All edges between these nodes are preserved.

## Usage Flow

1. **User configures form automation:**
   - Previews form in Browser Node
   - Attaches Hook Node
   - Adds Transport Listeners
   - Configures Email Templates

2. **User clicks "Save Configuration"** button

3. **System performs:**
   - Collects all connected nodes
   - Creates new standalone template
   - Updates master template (if applicable)
   - Shows success notification

4. **Result:**
   - ✅ New reusable template created
   - ✅ Master template updated (if in template)
   - ✅ User notified of success

## Template Data Structure

```typescript
{
  name: "Contact Us Form - Automation Chain",
  description: "Complete form automation chain for Contact Us Form including hook, transports, and email templates",
  category: "forms",
  tags: ["form", "automation", "hook", "transport", "email"],
  nodes: [
    { id, type, position, data }, // Forms Panel
    { id, type, position, data }, // Browser Node
    { id, type, position, data }, // Hook Node
    { id, type, position, data }, // Transport Node
    { id, type, position, data }, // Template Node
    // ... more nodes
  ],
  edges: [
    { id, source, target, type, animated, style },
    // ... all connecting edges
  ],
  organisationId: "...",
  meta: {
    formTitle: "Contact Us Form",
    chainType: "form-automation",
    createdFrom: "form-chain-configurator",
    timestamp: "2025-10-16T03:00:00.000Z"
  }
}
```

## API Calls

### Create New Template
```typescript
await buttClient.createTemplate(templateData);
```

### Update Master Template
```typescript
await buttClient.updateTemplate(currentTemplateId, {
  $push: {
    nodes: { $each: nodesToAdd },
    edges: { $each: edgesToAdd }
  },
  $set: {
    updatedAt: new Date().toISOString(),
    "meta.lastFormChainUpdate": new Date().toISOString()
  }
});
```

## Benefits

1. **Reusability**: Save once, deploy multiple times
2. **Consistency**: Ensures same configuration across projects
3. **Efficiency**: No need to manually rebuild chains
4. **Documentation**: Templates serve as documentation of workflows
5. **Versioning**: Can create multiple versions of same form automation

## Future Enhancements

- [ ] Template preview before saving
- [ ] Template versioning
- [ ] Template categories/folders
- [ ] Template sharing between organizations
- [ ] Template marketplace
- [ ] Template analytics (usage tracking)
- [ ] One-click deployment of templates
- [ ] Template testing/validation

## Error Handling

The system handles:
- Missing nodes gracefully
- Incomplete chains (requires browser + hook minimum)
- API failures with user-friendly messages
- Network errors with retry suggestions

## Console Logging

Comprehensive logging at each step:
- `💾 SAVING AS NEW TEMPLATE`
- `📦 COLLECTING CHAIN NODES`
- `✅ NEW TEMPLATE SAVED SUCCESSFULLY!`
- `🔄 UPDATING MASTER TEMPLATE`
- `❌ FAILED TO SAVE` (with details)

## Testing

To test the feature:

1. Create a form with automation
2. Configure hook and transport
3. Look for "Save Configuration as Template" button
4. Click and verify success toast
5. Check console for detailed logs
6. Verify template was created in templates list

## Known Limitations

- Requires both hook and transport to be configured
- Only saves nodes directly in the chain (not disconnected nodes)
- Master template update requires being in a template context
- Edge styles/animations must be serializable

## Dependencies

- `@vue-flow/core`: Node/edge types
- `buttClient`: API integration
- `useToast`: User notifications
- `useFormAutomation`: Hook/transport detection

