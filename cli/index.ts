#!/usr/bin/env node

import { Command } from 'commander'
import { addCommand } from './commands/add'
import { initCommand } from './commands/init'

const program = new Command()

program
  .name('ui-thing')
  .description('Add beautiful UI components to your project')
  .version('1.0.0')

program
  .command('init')
  .description('Initialize ui-thing in your project')
  .action(initCommand)

program
  .command('add')
  .description('Add a component to your project')
  .argument('[components...]', 'components to add')
  .action(addCommand)

program.parse()
