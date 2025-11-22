# Multi-Listener Hook Architecture

## Overview
Production-ready hook system where **one hook can trigger multiple transports** (listeners). This matches the BAPI hook structure and creates a powerful, scalable form submission system.

## 🎯 Architecture Design

### Hook → Multiple Listeners Pattern

```
                    ┌─────────────┐
                    │   Browser   │
                    │  (Form UI)  │
                    └──────┬──────┘
                           │ form submit
                           ↓
                    ┌──────────────┐
                    │  Hook Node   │
                    │ form.submitted│
                    └──────┬───────┘
                           │ triggers ALL listeners
              ┌────────────┼────────────┐
              ↓            ↓            ↓
       ┌──────────┐ ┌──────────┐ ┌──────────┐
       │Transport │ │Transport │ │Transport │
       │Listener 1│ │Listener 2│ │Listener 3│
       │  EMAIL   │ │  SLACK   │ │ DISCORD  │
       └──────────┘ └──────────┘ └──────────┘
```

## 🔧 Key Features

### 1. Auto-Configured Trigger
- ✅ **Trigger is pre-populated** as `form.submitted`
- ✅ **NOT user-configurable** - no trigger input field
- ✅ Shows as read-only "Auto-configured" badge
- ✅ Fires when browser form submit button is clicked

### 2. Multiple Listeners
- ✅ **One hook → Many transports**
- ✅ Add unlimited transport listeners
- ✅ Each listener creates a connected TransportNode
- ✅ Transports fan out horizontally below hook

### 3. Smart Auto-Population
- ✅ First listener auto-detects as EMAIL for contact forms
- ✅ Auto-fills support email target
- ✅ Form context passed to all listeners

## 📋 User Interface

### Hook Node - Create Mode

```
┌─────────────────────────────────────┐
│ 🪝 Hook Node                        │
├─────────────────────────────────────┤
│                                     │
│ Hook Name: [Contact Us Hook      ] │
│                                     │
│ Description: [Captures submissions] │
│                                     │
│ ⚡ Trigger Event  [Auto-configured] │
│ ├─✓ form.submitted                 │
│ └─ Fires when form is submitted     │
│                                     │
│ 🔔 Listeners (Transports)    [1]   │
│ ├─ 🚛 Support Email (EMAIL)        │
│ └─ [+ Add Transport Listener]      │
│                                     │
│ [Create Hook]                       │
└─────────────────────────────────────┘
```

### Hook Node - Configured State

```
┌─────────────────────────────────────┐
│ ✅ Contact Us Hook                  │
├─────────────────────────────────────┤
│ Type: BUTT                          │
│ Token: eyJhbGci...                  │
│ Trigger: form.submitted             │
│ Listeners: 2 transport(s)           │
│                                     │
│ 🔔 Active Listeners                 │
│ ├─ 🚛 Support Email (EMAIL)        │
│ └─ 🚛 Slack Notification (SLACK)   │
│                                     │
│ [+ Add More Listeners]              │
│                                     │
│ [Edit] [Delete]                     │
└─────────────────────────────────────┘
```

## 🌐 Webhook URL Flow

### 1. Hook Configuration
```typescript
// When hook is selected/created
const webhookUrlResponse = await buttClient.getWebhookUrl(hookId);
const webhookUrl = webhookUrlResponse.url;
// Example: https://api.dev.builditbuilder.com/v1/hooks/webhook/eyJ...

props.updateNodeData(hookNodeId, "webhookUrl", webhookUrl);
```

### 2. Browser Node Storage
```typescript
// Browser node stores webhook URL in hook config
hookConfig: {
  id: "68d46262b894f04870c66a86",
  name: "Contact Us Hook",
  type: "BUTT",
  token: "eyJhbGci...",
  webhookUrl: "https://api.dev.builditbuilder.com/v1/hooks/webhook/eyJ..."
}
```

### 3. Form Submission
```typescript
// When user clicks Submit button
const webhookUrl = hookConfig.webhookUrl;

await fetch(webhookUrl, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(formData)
});
```

### 4. BAPI Processing
```
1. BAPI receives POST at /v1/hooks/webhook/{token}
2. Hook validates token and checks trigger
3. Hook finds all configured listeners
4. Hook notifies EACH listener with form data
5. Each transport processes the data:
   - EMAIL: Sends email
   - SLACK: Posts to Slack channel
   - DISCORD: Sends Discord message
```

## 📊 Data Structures

### Hook Node Data
```typescript
interface HookNodeData {
  hookId: string;
  hookName: string;
  hookType: string;
  hookToken: string;
  hookTriggers: string[];          // Always ["form.submitted"]
  webhookUrl: string;              // https://api.dev.builditbuilder.com/v1/hooks/webhook/...
  listeners: Listener[];           // Array of transport listeners
  organisationId: string;
  status: "configuring" | "configured";
}
```

### Listener Structure
```typescript
interface Listener {
  id: string;                      // Unique listener ID
  transportId: string;             // Transport ID from BAPI
  name: string;                    // e.g., "Support Email"
  type: string;                    // e.g., "EMAIL"
  target: string;                  // e.g., "support@builditbuilder.com"
  status: "pending" | "configured";
  transportNodeId: string;         // Canvas node ID
}
```

### Transport Node Data (Listener)
```typescript
interface TransportNodeData {
  transportId: string;
  transportName: string;
  transportType: string;
  transportTarget: string;
  attachedToHookId: string;        // Which hook it listens to
  listenerIndex: number;           // Index in hook's listeners array
  status: "configuring" | "configured";
}
```

## 🔄 Event Flow

### Creating Listeners

```typescript
// User clicks "Add Transport Listener" in HookNode
addListener()
  ↓
// Create placeholder listener
listeners.push({
  id: "listener_xxx",
  name: "Transport Listener 1",
  type: "EMAIL",
  status: "pending"
})
  ↓
// Emit event to create transport node
emit("createTransportListener", hookNodeId, listenerIndex)
  ↓
// useBrowserNodeManagement creates TransportNode
handleCreateTransportListener(hookNodeId, listenerIndex)
  ↓
// TransportNode appears on canvas, connected to hook
// User configures transport...
  ↓
// Transport emits listenerConfigured
emit("listenerConfigured", transportData, hookNodeId, listenerIndex)
  ↓
// Hook's listeners array is updated with full config
hookNode.data.listeners[index] = {
  ...listener,
  transportId: transportData.id,
  name: transportData.name,
  type: transportData.type,
  target: transportData.target,
  status: "configured"
}
```

### Form Submission with Multiple Listeners

```typescript
// User submits form
submitForm(formData)
  ↓
// POST to webhook URL
fetch(webhookUrl, {
  method: "POST",
  body: JSON.stringify(formData)
})
  ↓
// BAPI hookPost() receives data
// Hook finds all listeners
hook.listeners.forEach(listener => {
  if (listener.type === "EMAIL") {
    sendEmail(listener.target, formData);
  }
  if (listener.type === "SLACK") {
    postToSlack(listener.target, formData);
  }
  // ... etc
})
  ↓
// All configured transports fire!
✅ Email sent to support@builditbuilder.com
✅ Slack message posted to #support
✅ Discord webhook triggered
```

## 💡 Benefits of Multi-Listener Architecture

### 1. **Flexibility**
- One form can trigger multiple actions
- Add/remove listeners without recreating hook
- Different notification channels for different teams

### 2. **Scalability**
- Easily add new transport types
- No limit on number of listeners
- Each listener is independent

### 3. **Production-Ready**
- Matches BAPI hook.listeners structure
- Proper webhook URL triggering
- All transports processed server-side

### 4. **Visual Clarity**
- Canvas shows complete data flow
- Each transport is a visible node
- Easy to understand notification paths

## 🎨 Visual Layout

### Horizontal Fan-Out Pattern

```
                Browser Node (1700, 100)
                      │
                      ↓
                Hook Node (1700, 850)
                      │
        ┌─────────────┼─────────────┐
        ↓             ↓             ↓
  Transport 1   Transport 2   Transport 3
  (1050, 1550)  (1700, 1550)  (2350, 1550)
   EMAIL         SLACK         DISCORD
```

**Position Calculation:**
```typescript
const horizontalOffset = (listenerIndex - Math.floor(listeners.length / 2)) * 650;
const position = {
  x: hookPosition.x + horizontalOffset,
  y: hookPosition.y + 700
};
```

## 🧪 Testing Guide

### Test 1: Single Listener
1. Click "Preview & Test" on Contact Us form
2. Select "Support Hook"
3. Hook shows "form.submitted" trigger (read-only)
4. Click "Add Transport Listener"
5. Transport node appears below hook
6. Configure transport as EMAIL
7. Submit form
8. Verify webhook URL is called
9. Verify email sent

### Test 2: Multiple Listeners
1. In configured hook, click "Add More Listeners"
2. Second transport node appears (offset horizontally)
3. Configure as SLACK
4. Click "Add More Listeners" again
5. Third transport node appears
6. Configure as DISCORD
7. Submit form
8. Verify all 3 transports triggered

### Test 3: Listener Management
1. Create hook with 2 listeners
2. Remove middle listener
3. Verify transport node removed
4. Verify remaining listeners still work
5. Add new listener
6. Verify it appears at correct position

## 📝 Implementation Files

### Modified Files

1. **`HookNode.vue`**
   - Removed trigger input fields
   - Added read-only trigger display
   - Added listeners management UI
   - Auto-configure trigger as "form.submitted"
   - `addListener()` function
   - `removeListener()` function
   - Emit `createTransportListener` event

2. **`TransportNode.vue`**
   - Emit `listenerConfigured` event
   - Include `listenerIndex` in node data
   - Link back to parent hook

3. **`useBrowserNodeManagement.ts`**
   - `handleCreateTransportListener()` function
   - Horizontal fan-out positioning
   - Pass listener context to transport nodes

4. **`CanvasPanel.vue`**
   - Wire up `createTransportListener` event
   - `handleListenerConfigured()` function
   - Update hook's listeners array

5. **`useHookTrigger.ts`**
   - Accept `webhookUrl` parameter
   - POST to webhook URL (primary method)
   - Fallback to direct email

6. **`BrowserNode.vue`**
   - Pass `webhookUrl` to processFormSubmission
   - Extract from hookConfig

## 🎉 Result

The system now implements a **production-ready multi-listener hook architecture** that:

- ✅ Auto-configures triggers (no manual setup)
- ✅ Supports multiple transports per hook
- ✅ Posts to proper webhook URLs
- ✅ Matches BAPI hook.listeners structure
- ✅ Provides visual node-based configuration
- ✅ Smart horizontal layout for readability

This is **exactly how hooks work in production systems** - one trigger can notify multiple destinations!

