import { existsSync, mkdirSync, writeFileSync } from 'fs'
import { join } from 'path'

export async function initCommand() {
  console.log('🚀 Initializing ui-thing in your project...')

  const cwd = process.cwd()
  const componentsDir = join(cwd, 'components', 'ui')

  // Create components/ui directory if it doesn't exist
  if (!existsSync(componentsDir)) {
    mkdirSync(componentsDir, { recursive: true })
    console.log('✅ Created components/ui directory')
  }

  // Create utils directory if it doesn't exist
  const utilsDir = join(cwd, 'lib')
  if (!existsSync(utilsDir)) {
    mkdirSync(utilsDir, { recursive: true })
    console.log('✅ Created lib directory')
  }

  // Create utils/cn.ts file
  const cnUtilPath = join(utilsDir, 'utils.ts')
  if (!existsSync(cnUtilPath)) {
    const cnUtilContent = `import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
`
    writeFileSync(cnUtilPath, cnUtilContent)
    console.log('✅ Created lib/utils.ts')
  }

  // Create tailwind.config.js if it doesn't exist
  const tailwindConfigPath = join(cwd, 'tailwind.config.js')
  if (!existsSync(tailwindConfigPath)) {
    const tailwindConfig = `/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './components/**/*.{js,vue,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './plugins/**/*.{js,ts}',
    './app.vue',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
`
    writeFileSync(tailwindConfigPath, tailwindConfig)
    console.log('✅ Created tailwind.config.js')
  }

  console.log('\\n🎉 ui-thing initialized successfully!')
  console.log('\\nNext steps:')
  console.log('  1. Run: npx ui-thing add button')
  console.log('  2. Import and use components in your project')
}
