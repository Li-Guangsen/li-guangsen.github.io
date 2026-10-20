import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { build } from 'velite';

process.chdir(fileURLToPath(new URL('../', import.meta.url)));
// Finish the first content compilation before Next reads the generated JSON.
await build({ watch: true, strict: true });
const next = spawn(process.execPath, [fileURLToPath(new URL('../node_modules/next/dist/bin/next', import.meta.url)), 'dev', '--hostname', '127.0.0.1'], { stdio: 'inherit' });
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => next.kill(signal));
next.on('error', (error) => { console.error(error.message); process.exit(1); });
next.on('exit', (code) => process.exit(code ?? 0));
