import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs'
import { join } from 'path'
import { components } from '../registry'

export async function addCommand(componentNames: string[]) {
  if (!componentNames || componentNames.length === 0) {
    console.log('❌ Please specify at least one component to add')
    console.log('\\nExample: npx ui-thing add button card')
    console.log('\\nAvailable components:')
    Object.keys(components).forEach(name => {
      console.log(`  - ${name}`)
    })
    return
  }

  const cwd = process.cwd()
  const componentsDir = join(cwd, 'components', 'ui')

  // Check if components directory exists
  if (!existsSync(componentsDir)) {
    console.log('❌ Components directory not found. Please run: npx ui-thing init')
    return
  }

  console.log('📦 Adding components to your project...\\n')

  for (const componentName of componentNames) {
    const component = components[componentName.toLowerCase()]

    if (!component) {
      console.log(`❌ Component "${componentName}" not found`)
      continue
    }

    // Create component file
    const componentPath = join(componentsDir, component.file)
    const componentDir = join(componentsDir, component.file.split('/')[0])

    // Create directory if needed
    if (component.file.includes('/')) {
      if (!existsSync(componentDir)) {
        mkdirSync(componentDir, { recursive: true })
      }
    }

    // Write component file
    writeFileSync(componentPath, component.content)
    console.log(`✅ Added ${componentName}`)

    // Add dependencies if specified
    if (component.dependencies && component.dependencies.length > 0) {
      console.log(`   Dependencies: ${component.dependencies.join(', ')}`)
    }
  }

  console.log('\\n🎉 Components added successfully!')
  console.log('\\nImport and use them in your project:')
  componentNames.forEach(name => {
    const component = components[name.toLowerCase()]
    if (component) {
      console.log(`  import ${component.name} from '~/components/ui/${component.file}'`)
    }
  })
}
