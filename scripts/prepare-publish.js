#!/usr/bin/env node

/**
 * Prepare the package for publishing
 * This script helps ensure everything is ready before publishing to NPM
 */

import { execSync } from 'child_process'
import { existsSync } from 'fs'
import { join } from 'path'

console.log('📦 Preparing ui-thing for NPM publishing...\n')

// Check if logged in to NPM
console.log('🔐 Checking NPM authentication...')
try {
  const npmUser = execSync('npm whoami', { encoding: 'utf-8' }).trim()
  console.log(`✅ Logged in as: ${npmUser}\n`)
} catch (error) {
  console.log('❌ You are not logged in to NPM')
  console.log('Please run: npm login\n')
  process.exit(1)
}

// Check required files
console.log('📋 Checking required files...')
const requiredFiles = [
  'package.json',
  'README.md',
  'LICENSE.md',
  'cli/index.ts',
  'cli/package.json'
]

let allFilesExist = true
requiredFiles.forEach(file => {
  if (existsSync(file)) {
    console.log(`✅ ${file}`)
  } else {
    console.log(`❌ ${file} - MISSING`)
    allFilesExist = false
  }
})

if (!allFilesExist) {
  console.log('\n❌ Some required files are missing')
  process.exit(1)
}

console.log('')

// Build CLI
console.log('🔨 Building CLI...')
try {
  execSync('npm run build:cli', { stdio: 'inherit' })
  console.log('✅ CLI built successfully\n')
} catch (error) {
  console.log('❌ CLI build failed\n')
  process.exit(1)
}

// Run dry-run
console.log('🧪 Running publish dry-run...')
try {
  execSync('npm publish --dry-run', { stdio: 'inherit' })
  console.log('\n✅ Dry run successful\n')
} catch (error) {
  console.log('\n❌ Dry run failed\n')
  process.exit(1)
}

console.log('🎉 Package is ready to publish!\n')
console.log('To publish, run:')
console.log('  npm publish --access public\n')
console.log('Or use the automated script:')
console.log('  Windows: .\\scripts\\publish-package.ps1')
console.log('  Linux/Mac: ./scripts/publish-package.sh\n')
