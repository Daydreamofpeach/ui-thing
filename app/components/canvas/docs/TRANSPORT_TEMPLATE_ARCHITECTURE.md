# Transport Template Architecture - BAPI Compliant Email System

## Critical Understanding: Transport Types in BAPI

### Available Transport Types (from BAPI)
```
TEMPLATE           - Email templates (Postmark, SendGrid, etc.)
WEBHOOK            - HTTP webhook endpoints  
INTEGRATIONCONNECTION - Third-party integrations
```

**NOT** `EMAIL` - Email is handled via `TEMPLATE` type transports!

## The Problem We Were Having

### What We Were Doing Wrong ❌
```typescript
// WRONG: Trying to transform TEMPLATE → EMAIL
if (type === "TEMPLATE") {
  actualType = "EMAIL";  // ❌ Invalid type for BAPI
  actualTarget = meta.email;  // ❌ Losing template ID
}

// This caused:
// 1. Invalid type passed to buttClient.subscribe()
// 2. Template configuration lost
// 3. No emails sent because transport wasn't properly subscribed
```

### What We Should Do ✅
```typescript
// CORRECT: Keep TEMPLATE type and template ID
const transportConfig = {
  id: transport.id,
  type: "TEMPLATE",  // ✅ Valid BAPI type
  target: "68e070d9459420e696d7c9cf",  // ✅ Template ID
  name: "Customer Email Transport"
}

// Subscribe with TEMPLATE type
await buttClient.subscribe({
  id: hookId,
  subscriber: transportId,
  type: "TEMPLATE"  // ✅ BAPI knows how to handle this
});
```

## New Architecture: Transport Template Nodes

### Component Flow

```
Form Preview (BrowserNode)
    ↓
Webhook Hook (HookNode) 
    ↓
Transport Listener (TransportNode) → Transport Template (TransportTemplateNode)
    type: TEMPLATE                      Shows template code & config
    target: <template-id>
```

### When Template Transport is Selected/Created

1. **TransportNode** emits `createTemplateNode` event
2. **useBrowserNodeManagement** handles the event
3. **TransportTemplateNode** is created, showing:
   - Template name & ID
   - Template code preview
   - Template meta configuration  
   - Email provider (Postmark, SendGrid, etc.)

### TransportTemplateNode Component

**Location**: `client/app/components/canvas/nodes/TransportTemplateNode.vue`

**Features**:
- Visual display of template code
- Shows template configuration (meta field)
- Copy template code button
- Connected to TransportNode via edge
- Purple theme to distinguish from other nodes

**Data Structure**:
```typescript
{
  templateId: string,        // Template ID from BAPI
  templateName: string,       // Human-readable name
  templateType: string,       // Email provider type
  templateCode: string,       // Template code/markup
  templateMeta: object,       // Full template configuration
  transportNodeId: string,    // Parent transport node
  status: "active" | "configured"
}
```

## Code Changes

### 1. TransportNode.vue

**Removed**: Email extraction logic that transformed TEMPLATE → EMAIL

**Added**:
- `createTemplateNode` event emission
- Keep `type: TEMPLATE` intact
- Keep `target: <template-id>` intact
- Emit template node creation when TEMPLATE transport selected

```typescript
// NEW: Emit template node creation for TEMPLATE transports
if (actualType === "TEMPLATE") {
  const templateNodeData = {
    templateId: actualTarget,
    templateName: selectedTransport.name,
    templateType: selectedTransport.meta?.provider || "Email",
    templateCode: selectedTransport.meta?.code || "// Template code",
    templateMeta: selectedTransport.meta,
    transportNodeId: props.customNodeProps.id,
    status: "active"
  };
  
  emit("createTemplateNode", templateNodeData, props.customNodeProps.id);
}
```

### 2. useBrowserNodeManagement.ts

**Added**:
- `handleCreateTransportTemplateNode()` function
- Creates TransportTemplateNode positioned to right of TransportNode
- Creates connecting edge (purple, labeled "Template Code")
- Locks template node position

### 3. CanvasPanel.vue

**Added**:
- Import `TransportTemplateNode` component
- Template for `node-transportTemplateNode`
- Wire up `createTemplateNode` event from TransportNode
- Handle template node close

**Updated**:
- `handleListenerConfigured()` - Keep TEMPLATE type, don't transform
- Enhanced logging for TEMPLATE transport subscriptions
- Clear explanation of expected behavior

## Expected Behavior

### When Attaching Template Transport to Hook

1. User selects existing template transport (e.g., "Customer Email")
2. TransportNode shows:
   ```
   Type: TEMPLATE
   Target: 68e070d9459420e696d7c9cf
   ```
3. **NEW**: TransportTemplateNode appears to the right showing template code
4. `listenerConfigured` event emits with correct TEMPLATE type
5. `buttClient.subscribe()` called with:
   ```typescript
   {
     id: <hook-id>,
     subscriber: <transport-id>,
     type: "TEMPLATE"  // ✅ Correct
   }
   ```
6. Subscription succeeds
7. Hook now has registered listener

### When Form is Submitted

1. Form POSTs data to webhook URL
2. BAPI hook endpoint receives form data
3. Hook checks subscribed listeners
4. Hook triggers TEMPLATE transport
5. **Backend** executes email template (Postmark/SendGrid/etc.)
6. Email sent to configured recipient

## Debugging

### Required Logs on Template Selection

```
📄 TEMPLATE TRANSPORT - Creating template code node
  Template ID: 68e070d9459420e696d7c9cf
  Template Name: Customer Email Transport
  Template Meta: {...}
✅ Emitted createTemplateNode event
```

### Required Logs on Subscription

```
📡 SUBSCRIBING TRANSPORT TO HOOK VIA BAPI
  Transport Type: TEMPLATE (TEMPLATE for email templates)
  Transport Target: 68e070d9459420e696d7c9cf (template ID if TEMPLATE)
✅ TRANSPORT SUBSCRIBED TO HOOK SUCCESSFULLY!
  Subscription Result: {...}
```

### Missing Logs = Problem

If you DON'T see:
- `createTemplateNode` emission → Template node won't appear
- `SUBSCRIBING TRANSPORT TO HOOK` → Transport not registered
- `SUBSCRIBED SUCCESSFULLY` → Backend won't trigger transport

## Next Steps

After these changes:
1. **Reload the page** to see new debugging
2. **Select existing template transport** - TransportTemplateNode should appear
3. **Check console** for subscription logs
4. **Submit form** - Should see full chain execution
5. **Check email** - Should receive email from template

## Key Insight

**TEMPLATE transports are NOT transformed to EMAIL**. The TEMPLATE type tells BAPI:
- This transport uses a pre-configured email template
- The `target` field contains the template ID
- The template itself knows how to send emails
- Backend handles email sending when hook triggers the template

This is why the subscription must use `type: "TEMPLATE"`, not `type: "EMAIL"`.

