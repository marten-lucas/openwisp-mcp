#!/usr/bin/env node

import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../../');
const cliEntrypoint = path.join(rootDir, 'src', 'mcp', 'cli-full.ts');
const tsxBinary = path.join(rootDir, 'node_modules', '.bin', 'tsx');

const args = process.argv.slice(2);
const child = spawn(tsxBinary, [cliEntrypoint, ...args], {
  stdio: 'inherit',
  env: {
    ...process.env,
  },
});

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 1);
});
