import { readFile } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const run = promisify(execFile);
const root = new URL('../../', import.meta.url);
const lock = JSON.parse(await readFile(new URL('package-lock.json', root), 'utf8'));
const policy = JSON.parse(await readFile(new URL('tools/security/dependency-policy.json', root), 'utf8'));
const manifest = JSON.parse(await readFile(new URL('apps/web/package.json', root), 'utf8'));
const errors = [];
const packages = [];
const scripts = [];

if (lock.lockfileVersion !== 3) errors.push('Expected npm lockfile version 3.');
for (const [name, version] of Object.entries({ ...manifest.dependencies, ...manifest.devDependencies })) {
  if (!/^\d+\.\d+\.\d+$/.test(version)) errors.push(`${name} must have an exact stable version.`);
}
for (const [path, item] of Object.entries(lock.packages)) {
  if (!path.includes('node_modules/') || item.link) continue;
  const name = path.split('node_modules/').at(-1);
  if (!item.resolved?.startsWith(policy.registry)) errors.push(`${name}: unapproved package source.`);
  if (!/^sha512-/.test(item.integrity ?? '')) errors.push(`${name}: missing SHA-512 integrity.`);
  if (item.hasInstallScript) scripts.push(`${name}@${item.version}`);
  if (item.deprecated) errors.push(`${name}@${item.version}: deprecated: ${item.deprecated}`);
  packages.push({ name, version: item.version });
}

if (process.argv.includes('--metadata')) {
  // npm metadata queries do not load or execute downloaded package code.
  const queue = [...packages];
  await Promise.all(Array.from({ length: 6 }, async () => {
    while (queue.length) {
      const item = queue.shift();
      try {
        const { stdout } = await run('npm', ['view', `${item.name}@${item.version}`, 'time', '--json', '--ignore-scripts'], { maxBuffer: 8 * 1024 * 1024 });
        const published = JSON.parse(stdout)[item.version];
        if (!published || Number.isNaN(Date.parse(published))) errors.push(`${item.name}: missing publication date.`);
        else if (Date.parse(published) > Date.parse(policy.resolution_cutoff)) errors.push(`${item.name}@${item.version}: published after reviewed cutoff (${published}).`);
      } catch (error) {
        errors.push(`${item.name}@${item.version}: metadata verification failed (${error.code ?? 'unknown error'}).`);
      }
    }
  }));
}

console.log(`Inspected ${packages.length} locked registry packages. Install-script declarations: ${scripts.length ? scripts.join(', ') : 'none'}.`);
console.log(`Lifecycle scripts stay disabled; reviewed resolution cutoff: ${policy.resolution_cutoff}.`);
if (!process.argv.includes('--metadata')) console.log('Publication dates not queried. Use --metadata with network access when reviewing lockfile changes.');
if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else console.log('Dependency source, integrity, and exact-pin checks passed. This is not a malware guarantee.');
