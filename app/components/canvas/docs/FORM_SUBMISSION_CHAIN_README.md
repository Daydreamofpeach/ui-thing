# Form Submission Chain Implementation

## Overview

This document explains the form → hook → transport submission chain system that enables automated form testing with webhook processing.

## Architecture

### Components

1. **FormSubmissionController.vue** - Controller component that orchestrates the submission chain
2. **useFormSubmissionChain.ts** - Composable with core submission logic
3. **useBrowserNodeManagement.ts** - Manages hook/transport node creation and linking
4. **BrowserNode.vue** - Updated to check multiple hook configuration sources

### Data Flow

```
Template Configured Node
    ↓
Forms Panel Node (generates forms)
    ↓ (user clicks "Preview & Test")
Browser Preview Node (shows form)
    ↓ (auto-created)
Hook Node (configures webhook)
    ↓ (auto-created when hook configured)
Transport Node (configures delivery)
    ↓ (form submission)
Form Data → Hook → Transport → External Service
```

**Key Change:** The entire chain (Browser → Hook → Transport) is now created automatically when you preview a form. No separate button clicks needed!

## How It Works

### 1. Unified Preview & Chain Creation

When a user clicks "Preview & Test" on a form:

- `handleFormSelected()` creates the browser preview node
- After 300ms delay, `handleCreateHookNodeForForm()` is automatically called
- Hook node is positioned **below the browser node** (vertical chain)
- Hook node ID is stored in browser node's `connectedHookId` field
- Edge is created connecting: Browser (bottom) → Hook (top)

### 2. Hook Configuration

When a hook is selected/created in the Hook Node:

- `handleHookAttached()` is triggered with hook data
- Hook configuration is stored in:
  - Hook node's `data` (hookId, hookName, hookType, hookToken)
  - Browser node's `hookConfig` field (for easy access)
- Transport node is **automatically created** and positioned **below the hook node**
- Edge connects: Hook (bottom) → Transport (top)
- Transport node ID is stored in hook node's `connectedTransportId`

### 3. Transport Configuration

When a transport is configured:

- Transport data is stored in transport node's `data`
- FormSubmissionController watches for configuration changes
- Browser node's `submissionChain` is updated with full chain status
- Full vertical chain is complete: Forms Panel → Browser → Hook → Transport

### 4. Form Submission

When form is submitted in browser preview:

1. Form posts message to parent window via `postMessage`
2. BrowserNode's `handleIframeMessage()` receives the message
3. Checks for hook configuration in **three** places (priority order):
   - Node's own `hookConfig` data (highest priority)
   - Connected hook prop
   - Submission chain data
4. If hook found with token, triggers submission via `useHookTrigger`
5. Updates node status and shows toast notifications

## Key Features

### Automatic Linking

The `FormSubmissionController` watches for:
- New edges being created (browser → hook, hook → transport)
- Hook/transport configuration changes
- Auto-links configurations in node data for easy access

### Multiple Configuration Sources

BrowserNode checks three places for hook config:
1. `node.data.hookConfig` - Direct configuration
2. `connectedHookNode.data` - Connected via props
3. `node.data.submissionChain.hookConfig` - Chain status

This ensures forms work even if edges are created manually or programmatically.

### Error Handling

- Clear error messages when hook not configured
- Toast notifications for success/failure
- Status tracking in node data (`lastSubmission`)

## Usage

### For Users

1. Create template and open form generator
2. Generate a form (select template and click "Automate Forms" or "Create Instantly")
3. Click **"Preview & Test"** button (eye icon with "Preview & Test" text)
4. **Entire chain auto-creates**: Browser → Hook → Transport (vertical layout)
5. Configure the hook (select existing or create new with token)
6. Transport auto-appears when hook is configured
7. Fill out form in browser preview and submit
8. Data flows through the complete chain automatically! 🚀

### For Developers

Adding to canvas:
```vue
<FormSubmissionController
  ref="formSubmissionControllerRef"
  :browser-nodes="browserNodes"
  :hook-nodes="hookNodes"
  :transport-nodes="transportNodes"
  :edges="allEdges"
  :get-node-fn="getNodeFn"
  :update-node-data="updateNodeDataBase"
  @form-submitted="handleFormSubmitted"
  @submission-error="handleFormSubmissionError"
  @chain-updated="handleSubmissionChainUpdated"
/>
```

Using the composable:
```typescript
import { useFormSubmissionChain } from '~/composables/useFormSubmissionChain';

const {
  getSubmissionChain,
  linkHookToBrowserNode,
  submitFormData
} = useFormSubmissionChain(
  browserNodes,
  hookNodes,
  transportNodes,
  edges,
  getNodeFn,
  updateNodeData
);

// Check if form has valid submission chain
const chain = getSubmissionChain(browserNodeId);
if (chain.isConfigured) {
  // Ready to submit
}

// Submit form data
await submitFormData(browserNodeId, formData);
```

## Benefits

### For Users
- Visual workflow - see the entire submission chain
- Easy testing - submit forms and see results immediately  
- Flexible - attach different hooks/transports to different forms
- Reusable - save hooks/transports for multiple forms

### For Developers
- Modular - controller component keeps parent files clean
- Reusable - composable can be used anywhere
- Maintainable - clear separation of concerns
- Extensible - easy to add new node types to chain

## Future Enhancements

- [ ] Real API integration for hook/transport submission
- [ ] Webhook response visualization
- [ ] Form validation before submission
- [ ] Retry logic for failed submissions
- [ ] Batch submission for multiple forms
- [ ] Transport plugins for different services (Slack, Discord, etc.)

## Files Modified

1. `client/app/composables/useFormSubmissionChain.ts` - NEW
2. `client/app/components/canvas/FormSubmissionController.vue` - NEW
3. `client/app/composables/useBrowserNodeManagement.ts` - UPDATED
4. `client/app/components/dashboard/CanvasPanel.vue` - UPDATED
5. `client/app/components/canvas/nodes/BrowserNode.vue` - UPDATED

## Testing

To test the unified submission chain:

1. Load a template and open form generator
2. Select a form template (e.g., "Contact Us Form")
3. Click "Create Instantly" to generate the form
4. Click **"Preview & Test"** button on the generated form card
5. **Watch the chain auto-create**: Browser → Hook → Transport (all connected vertically!)
6. Configure the hook (select existing or create new with token)
7. Transport node appears automatically below hook
8. Configure transport (select type and target)
9. Fill out and submit the form in the browser preview
10. Check console for submission logs
11. Verify hook node shows "lastSubmission" with success status

## Troubleshooting

**No forms showing in Forms Panel:**
- **CAUSE**: No forms generated yet
- **FIX**: Select a template and click "Automate Forms" or "Create Instantly"
- Forms will appear in the "Automatically Generated Forms" section
- Then "Preview & Test" button will be available

**"No Hook Configured" error:**
- Check that hook node exists and is connected
- Verify hook has a `hookToken` in its data
- Check browser node's `hookConfig` field
- Ensure edge connects form → hook or hook data is linked

**Form submission not triggering:**
- Check browser console for CORS errors
- Verify iframe can execute JavaScript (sandbox settings)
- Check that form is using HTML `<form>` element
- Verify postMessage listener is attached

**Hook/Transport not auto-creating:**
- Check `useBrowserNodeManagement` composable
- Verify `handleHookAttached` is being called
- Check that hook data includes required fields
- Verify FormSubmissionController is mounted

## Summary

This implementation provides a complete, visual form testing chain with webhook processing. It follows best practices by using composables for logic, controller components for orchestration, and keeping parent files clean and maintainable.

