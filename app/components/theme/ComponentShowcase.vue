<template>
  <div class="space-y-8">
    <div>
      <h3 class="text-lg font-semibold mb-4">Component Showcase</h3>
      <p class="text-sm text-muted-foreground mb-6">
        A comprehensive view of how your theme colors are used across various UI components.
      </p>
    </div>

    <!-- Grid Layout with Multiple Component Examples -->
    <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <!-- Card with Content -->
      <div class="p-6 rounded-lg border bg-card space-y-4">
        <div class="flex items-center justify-between">
          <h4 class="text-lg font-semibold">Card Component</h4>
          <UiBadge variant="secondary">New</UiBadge>
        </div>
        <p class="text-sm text-muted-foreground">
          This is a card component with various content types and interactive elements.
        </p>
        <div class="flex gap-2">
          <UiButton size="sm">Action</UiButton>
          <UiButton size="sm" variant="outline">Cancel</UiButton>
        </div>
      </div>

      <!-- Form Elements -->
      <div class="p-6 rounded-lg border bg-card space-y-4">
        <h4 class="text-lg font-semibold">Form Elements</h4>
        <div class="space-y-3">
          <div>
            <UiLabel>Input Field</UiLabel>
            <UiInput placeholder="Enter text here" />
          </div>
          <div>
            <UiLabel>Select Dropdown</UiLabel>
            <UiSelect>
              <UiSelectTrigger>
                <UiSelectValue placeholder="Select an option" />
              </UiSelectTrigger>
              <UiSelectContent>
                <UiSelectItem value="option1">Option 1</UiSelectItem>
                <UiSelectItem value="option2">Option 2</UiSelectItem>
              </UiSelectContent>
            </UiSelect>
          </div>
          <UiCheckbox id="checkbox1" />
          <UiLabel for="checkbox1" class="ml-2">Checkbox option</UiLabel>
        </div>
      </div>

      <!-- Button Variants -->
      <div class="p-6 rounded-lg border bg-card space-y-4">
        <h4 class="text-lg font-semibold">Button Variants</h4>
        <div class="flex flex-col gap-2">
          <UiButton variant="default">Default</UiButton>
          <UiButton variant="secondary">Secondary</UiButton>
          <UiButton variant="outline">Outline</UiButton>
          <UiButton variant="ghost">Ghost</UiButton>
          <UiButton variant="destructive">Destructive</UiButton>
        </div>
      </div>

      <!-- Alert/Notification -->
      <div class="p-6 rounded-lg border bg-card space-y-4">
        <h4 class="text-lg font-semibold">Alerts</h4>
        <div class="space-y-2">
          <div class="p-3 rounded-md bg-primary/10 border border-primary/20">
            <p class="text-sm text-primary-foreground">Primary alert message</p>
          </div>
          <div class="p-3 rounded-md bg-muted border">
            <p class="text-sm text-muted-foreground">Muted alert message</p>
          </div>
          <div class="p-3 rounded-md bg-destructive/10 border border-destructive/20">
            <p class="text-sm text-destructive-foreground">Destructive alert message</p>
          </div>
        </div>
      </div>

      <!-- Badges and Tags -->
      <div class="p-6 rounded-lg border bg-card space-y-4">
        <h4 class="text-lg font-semibold">Badges & Tags</h4>
        <div class="flex flex-wrap gap-2">
          <UiBadge>Default</UiBadge>
          <UiBadge variant="secondary">Secondary</UiBadge>
          <UiBadge variant="outline">Outline</UiBadge>
          <UiBadge variant="destructive">Destructive</UiBadge>
        </div>
        <div class="flex flex-wrap gap-2">
          <UiBadge variant="outline" class="text-xs">Small</UiBadge>
          <UiBadge variant="secondary" class="text-xs">Tag</UiBadge>
          <UiBadge class="text-xs">New</UiBadge>
        </div>
      </div>

      <!-- Progress and Status -->
      <div class="p-6 rounded-lg border bg-card space-y-4">
        <h4 class="text-lg font-semibold">Progress Indicators</h4>
        <div class="space-y-3">
          <div>
            <div class="flex justify-between text-xs mb-1">
              <span>Progress</span>
              <span>60%</span>
            </div>
            <div class="h-2 w-full rounded-full bg-muted overflow-hidden">
              <div class="h-full bg-primary rounded-full" style="width: 60%"></div>
            </div>
          </div>
          <div>
            <div class="flex justify-between text-xs mb-1">
              <span>Loading</span>
              <span>80%</span>
            </div>
            <div class="h-2 w-full rounded-full bg-muted overflow-hidden">
              <div class="h-full bg-accent rounded-full" style="width: 80%"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Table Example -->
      <div class="p-6 rounded-lg border bg-card space-y-4">
        <h4 class="text-lg font-semibold">Table</h4>
        <div class="border rounded-md overflow-hidden">
          <table class="w-full text-sm">
            <thead class="bg-muted">
              <tr>
                <th class="px-4 py-2 text-left font-medium">Name</th>
                <th class="px-4 py-2 text-left font-medium">Status</th>
                <th class="px-4 py-2 text-left font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr class="border-t">
                <td class="px-4 py-2">Item 1</td>
                <td class="px-4 py-2">
                  <UiBadge variant="secondary" class="text-xs">Active</UiBadge>
                </td>
                <td class="px-4 py-2">
                  <UiButton size="sm" variant="ghost">Edit</UiButton>
                </td>
              </tr>
              <tr class="border-t bg-muted/50">
                <td class="px-4 py-2">Item 2</td>
                <td class="px-4 py-2">
                  <UiBadge variant="outline" class="text-xs">Pending</UiBadge>
                </td>
                <td class="px-4 py-2">
                  <UiButton size="sm" variant="ghost">Edit</UiButton>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Code Block -->
      <div class="p-6 rounded-lg border bg-card space-y-4">
        <h4 class="text-lg font-semibold">Code Block</h4>
        <div class="p-4 rounded-md bg-muted border font-mono text-sm overflow-x-auto">
          <pre><code>const theme = {
  colors: {
    primary: 'oklch(...)',
    secondary: 'oklch(...)',
  }
}</code></pre>
        </div>
      </div>

      <!-- Sidebar Example -->
      <div class="p-6 rounded-lg border bg-card space-y-4">
        <h4 class="text-lg font-semibold">Sidebar Elements</h4>
        <div class="space-y-2">
          <div class="p-2 rounded-md bg-sidebar hover:bg-sidebar-accent cursor-pointer">
            <p class="text-sm text-sidebar-foreground">Sidebar Item 1</p>
          </div>
          <div class="p-2 rounded-md bg-sidebar-accent hover:bg-sidebar-primary cursor-pointer">
            <p class="text-sm text-sidebar-accent-foreground">Active Item</p>
          </div>
          <div class="p-2 rounded-md bg-sidebar hover:bg-sidebar-accent cursor-pointer">
            <p class="text-sm text-sidebar-foreground">Sidebar Item 3</p>
          </div>
        </div>
      </div>

      <!-- Chart Colors Preview -->
      <div class="p-6 rounded-lg border bg-card space-y-4">
        <h4 class="text-lg font-semibold">Chart Colors</h4>
        <div class="grid grid-cols-5 gap-2">
          <div
            v-for="i in 5"
            :key="i"
            class="h-16 rounded-md border"
            :style="{ backgroundColor: `var(--chart-${i})` }"
          />
        </div>
        <p class="text-xs text-muted-foreground">Chart color palette</p>
      </div>

      <!-- Input States -->
      <div class="p-6 rounded-lg border bg-card space-y-4">
        <h4 class="text-lg font-semibold">Input States</h4>
        <div class="space-y-3">
          <UiInput placeholder="Default input" />
          <UiInput placeholder="Focused input" class="ring-2 ring-ring" />
          <UiInput placeholder="Disabled input" disabled />
          <UiInput placeholder="Error input" class="border-destructive" />
        </div>
      </div>

      <!-- Tabs Example -->
      <div class="p-6 rounded-lg border bg-card space-y-4">
        <h4 class="text-lg font-semibold">Tabs</h4>
        <div class="flex gap-2 border-b">
          <button class="px-4 py-2 border-b-2 border-primary text-primary font-medium">
            Tab 1
          </button>
          <button class="px-4 py-2 text-muted-foreground hover:text-foreground">
            Tab 2
          </button>
          <button class="px-4 py-2 text-muted-foreground hover:text-foreground">
            Tab 3
          </button>
        </div>
        <p class="text-sm text-muted-foreground">Tab content area</p>
      </div>

      <!-- Tooltip/Popover Example -->
      <div class="p-6 rounded-lg border bg-card space-y-4">
        <h4 class="text-lg font-semibold">Popover</h4>
        <div class="p-4 rounded-md bg-popover border border-border">
          <p class="text-sm text-popover-foreground">
            This is a popover component with custom background and foreground colors.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
// This component showcases various UI components using the theme colors
// No props needed - it uses CSS variables directly
</script>

