import { readdir } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
process.chdir(root);

const files = ['server.js'];

for (const directory of ['src', 'public', 'scripts', 'test']) {
  const entries = await readdir(directory);
  for (const entry of entries) {
    if (entry.endsWith('.js')) files.push(`${directory}/${entry}`);
  }
}

for (const file of files) {
  const result = spawnSync(process.execPath, ['--check', file], { stdio: 'inherit' });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

console.log(`Syntax checked: ${files.length} JavaScript files`);
const tests = spawnSync(process.execPath, ['--test'], { stdio: 'inherit' });
process.exit(tests.status ?? 1);
