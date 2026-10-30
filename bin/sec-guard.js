#!/usr/bin/env node

import { runCli } from '../src/cli.js';

runCli(process.argv.slice(2))
  .then(exitCode => {
    process.exit(exitCode);
  })
  .catch(err => {
    console.error('Fatal Error:', err);
    process.exit(1);
  });

