import { readFile } from 'node:fs/promises';
import { validateDataset } from '../apps/web/src/lib/validate.ts';

const input = JSON.parse(await readFile(new URL('../data/alzheimers/dataset.json', import.meta.url), 'utf8'));
const result = validateDataset(input, { release: process.argv.includes('--release') });
for (const warning of result.warnings) console.warn(`WARNING: ${warning}`);
for (const error of result.errors) console.error(`ERROR: ${error}`);
if (!result.valid) process.exitCode = 1;
else console.log(`Dataset valid in ${process.argv.includes('--release') ? 'release' : 'development'} mode: ${input.entities.length} entities, ${input.claims.length} claims.`);
