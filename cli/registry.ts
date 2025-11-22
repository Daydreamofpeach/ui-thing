import { readFileSync } from 'fs'
import { join } from 'path'

export interface ComponentRegistry {
  name: string
  file: string
  content: string
  dependencies?: string[]
}

export const components: Record<string, ComponentRegistry> = {
  button: {
    name: 'UiButton',
    file: 'Button.vue',
    content: '', // Will be populated from actual files
    dependencies: ['reka-ui', 'tailwind-variants']
  },
  card: {
    name: 'UiCard',
    file: 'Card/Card.vue',
    content: '',
    dependencies: []
  },
  input: {
    name: 'UiInput',
    file: 'Input.vue',
    content: '',
    dependencies: []
  },
  label: {
    name: 'UiLabel',
    file: 'Label.vue',
    content: '',
    dependencies: ['reka-ui']
  },
  dialog: {
    name: 'UiDialog',
    file: 'Dialog/Dialog.vue',
    content: '',
    dependencies: ['reka-ui']
  },
  // Add more components as needed
}

// Function to load component content from actual files
export function loadComponentContent(componentPath: string): string {
  try {
    const fullPath = join(__dirname, '..', '..', 'app', 'components', 'Ui', componentPath)
    return readFileSync(fullPath, 'utf-8')
  } catch (error) {
    return ''
  }
}
