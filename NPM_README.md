# UI Thing

Beautiful and accessible UI components for Vue and Nuxt applications. Built with Reka UI, Tailwind CSS, and TypeScript.

## 🚀 Quick Start

### Installation

```bash
# Using npm
npm install @ui-thing/components

# Using yarn
yarn add @ui-thing/components

# Using pnpm
pnpm add @ui-thing/components

# Using bun
bun add @ui-thing/components
```

### Using the CLI

The easiest way to add components to your project:

```bash
# Initialize ui-thing in your project
npx ui-thing init

# Add components
npx ui-thing add button
npx ui-thing add card input label
npx ui-thing add dialog
```

## 📚 Components

UI Thing includes 60+ production-ready components:

### Form Components
- Button
- Input
- Label
- Textarea
- Select
- Checkbox
- Radio Group
- Switch
- Slider
- Date Picker
- Calendar
- Currency Input
- Tags Input
- Pin Input
- Number Field
- Autocomplete
- Combobox

### Layout Components
- Card
- Container
- Separator
- Divider
- Aspect Ratio
- Scroll Area
- Splitter

### Overlay Components
- Dialog
- Drawer
- Sheet
- Popover
- Hover Card
- Tooltip
- Context Menu
- Dropdown Menu
- Command
- Alert Dialog

### Data Display
- Table
- TanStack Table
- Data Table
- Avatar
- Badge
- Chip
- Progress
- Skeleton
- Timeline
- Tree
- List
- Description List

### Navigation
- Tabs
- Breadcrumbs
- Pagination
- Navbar
- Navigation Menu
- Menubar
- Sidebar
- Stepper

### Feedback
- Alert
- Sonner (Toast)
- Loader
- Placeholder

### Advanced
- Apex Charts
- Full Calendar
- Tiptap Editor
- Quill Editor
- Carousel
- Collapsible
- Accordion
- Form Builder

## 💻 Usage

### Basic Example

```vue
<template>
  <div>
    <UiButton @click="handleClick">
      Click me
    </UiButton>
    
    <UiCard>
      <UiCardHeader>
        <UiCardTitle>Card Title</UiCardTitle>
        <UiCardDescription>Card description</UiCardDescription>
      </UiCardHeader>
      <UiCardContent>
        <p>Card content goes here</p>
      </UiCardContent>
    </UiCard>
  </div>
</template>

<script setup>
const handleClick = () => {
  console.log('Button clicked!')
}
</script>
```

### With Nuxt Auto-imports

If you're using Nuxt, components are auto-imported:

```vue
<template>
  <UiButton>No import needed!</UiButton>
</template>
```

### Manual Import

```vue
<script setup>
import UiButton from '@ui-thing/components/Button.vue'
import UiCard from '@ui-thing/components/Card/Card.vue'
</script>
```

## 🎨 Theming

UI Thing supports multiple color themes:

- Zinc (default)
- Slate
- Stone
- Gray
- Neutral
- Red
- Rose
- Orange
- Green
- Blue
- Yellow
- Violet

### Customize Theme

```css
/* In your CSS file */
@layer base {
  :root {
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
    /* ... more variables */
  }
}
```

## 🔧 Configuration

### Tailwind CSS

Add to your `tailwind.config.js`:

```js
export default {
  content: [
    './components/**/*.{js,vue,ts}',
    './node_modules/@ui-thing/components/**/*.vue',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

### Nuxt Configuration

Add to your `nuxt.config.ts`:

```ts
export default defineNuxtConfig({
  modules: [
    'reka-ui/nuxt',
    '@vueuse/nuxt',
    '@nuxtjs/color-mode',
  ],
  colorMode: {
    classSuffix: '',
  },
})
```

## 📖 Documentation

For full documentation, visit: [https://ui-thing.behonbaker.com](https://ui-thing.behonbaker.com)

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines.

## 📄 License

MIT License - see LICENSE.md for details

## 🙏 Credits

Built with:
- [Vue 3](https://vuejs.org/)
- [Nuxt 3](https://nuxt.com/)
- [Reka UI](https://reka-ui.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [VueUse](https://vueuse.org/)

## 🔗 Links

- [Documentation](https://ui-thing.behonbaker.com)
- [GitHub](https://github.com/BayBreezy/ui-thing)
- [NPM](https://www.npmjs.com/package/@ui-thing/components)
- [Author](https://behonbaker.com)

## 💬 Support

- [GitHub Issues](https://github.com/BayBreezy/ui-thing/issues)
- [Discord Community](https://discord.gg/your-discord)

---

Made with ❤️ by [Behon Baker](https://behonbaker.com)
