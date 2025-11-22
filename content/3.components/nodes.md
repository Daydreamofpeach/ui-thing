---
title: Nodes
description: A base template component for creating canvas nodes with connection handles, resizing, and collapsible content.
---

## Source code

Click :SourceCodeLink{component="BaseNodeTemplate"} to see the source code for this component on GitHub. Feel free to copy it and adjust it for your own use.

## Installation

```bash
npx ui-thing@latest add base-node-template
```

## Usage

### Default

The BaseNodeTemplate provides a foundation for creating nodes in a canvas-based interface. It includes connection handles, resizing capabilities, and collapsible content areas.

::ShowCase

:DocsNodes

#code

<!-- automd:file src="../../app/components/content/Docs/Nodes/DocsNodes.vue" code lang="vue" -->

```vue [DocsNodes.vue]
<template>
  <div class="mx-auto max-w-2xl">
    <BaseNodeTemplate
      title="Example Node"
      icon="lucide:box"
      theme-color="#e34d03"
      :min-width="400"
      :min-height="300"
      :default-collapsed="false"
    >
      <template #default>
        <div class="p-4 space-y-2">
          <p class="text-sm text-muted-foreground">
            This is the node content area. You can add any content here.
          </p>
          <div class="flex gap-2">
            <UiButton size="sm">Action 1</UiButton>
            <UiButton size="sm" variant="outline">Action 2</UiButton>
          </div>
        </div>
      </template>
    </BaseNodeTemplate>
  </div>
</template>

<script lang="ts" setup>
import BaseNodeTemplate from "~/components/canvas/nodes/templates/BaseNodeTemplate.vue";
</script>
```

<!-- /automd -->

::

