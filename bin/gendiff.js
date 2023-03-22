#!/usr/bin/env node

import { program } from 'commander';
import gendiff from '../src/index.js';

program
  .name('gendiff')
  .version('1.0.0')
  .description('Compares two configuration files and shows a difference.')
  .option('-f, --format <type>', 'output format')

  .argument('<path1>', 'relative/absolute path to a first file')
  .argument('<path2>', 'relative/absolute path to a second file')
  
program
  .action((path1, path2) => {
    console.log(gendiff(path1, path2, program.opts().format));
  })

/* eslint-disable-next-line */
program.parse()
