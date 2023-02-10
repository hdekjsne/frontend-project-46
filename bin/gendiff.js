#!/usr/bin/env node

import { program } from 'commander';
// import { gendiff } from '../src/gendiff.js';

program
  .version('1.0.0')
  .description('Compares two configuration files and shows a difference.')

program.parse(process.argv)
