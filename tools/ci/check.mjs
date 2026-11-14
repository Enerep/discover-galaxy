import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

// Shared by local checks and GitHub Actions. Live scientific providers are never
// called here; the optional security mode contacts only npm and pinned IOC feeds.
process.chdir(fileURLToPath(new URL('../../', import.meta.url)));
const args = process.argv.slice(2);
if (args.length > 1 || (args.length === 1 && args[0] !== '--security')) {
  console.error('Usage: node tools/ci/check.mjs [--security]');
  process.exit(2);
}

if (process.platform === 'win32') {
  console.error('Run the shared CI checks in WSL; the runner supports Linux and macOS.');
  process.exit(2);
}
const npm = 'npm';
const manager = JSON.parse(readFileSync('package.json', 'utf8')).packageManager;
const npmVersion = spawnSync(npm, ['--version'], { encoding: 'utf8', shell: false });
if (Number(process.versions.node.split('.')[0]) !== 24 || npmVersion.status !== 0
  || `npm@${npmVersion.stdout.trim()}` !== manager) {
  console.error(`Use Node.js 24 and ${manager}, as declared by the project.`);
  process.exit(2);
}

const steps = args[0] === '--security'
  ? [
    [npm, ['run', 'check:dependencies', '--', '--metadata']],
    [npm, ['audit', '--audit-level=low']],
    ['python3', ['tools/security/check-iocs.py']],
  ]
  : [
    [npm, ['run', 'check:dependencies']],
    [npm, ['test']],
    [npm, ['run', 'typecheck:tools']],
    [npm, ['run', 'validate:data']],
    [npm, ['run', 'reference:check']],
    [npm, ['run', 'curation:check']],
    [npm, ['run', 'curation:coverage:check']],
    [npm, ['run', 'curation:seed:check']],
    ['python3', ['-m', 'unittest', 'discover', '-s', 'tools/security', '-p', 'test_*.py']],
    [npm, ['run', 'build']],
  ];

for (const [command, commandArgs] of steps) {
  console.log(`\nRunning ${command} ${commandArgs.join(' ')}`);
  const result = spawnSync(command, commandArgs, { stdio: 'inherit', shell: false });
  if (result.error) {
    console.error(`Unable to start ${command}; ensure the documented runtime tools are installed.`);
    process.exit(2);
  }
  if (result.status !== 0) process.exit(result.status ?? 1);
}
