import { DISEASE_COLLECTIONS } from '../data/collections.ts';
import { validateDataset } from '../apps/web/src/lib/validate.ts';

const release = process.argv.includes('--release');
for (const { data, initialEntityId } of Object.values(DISEASE_COLLECTIONS)) {
  const { dataset_version: version } = data;
  const result = validateDataset(data, { release });
  if (result.valid && !data.entities.some(({ id }) => id === initialEntityId)) {
    result.errors.push(`Collection opens at missing entity ${initialEntityId}.`);
  }
  for (const warning of result.warnings) console.warn(`WARNING [${version}]: ${warning}`);
  for (const error of result.errors) console.error(`ERROR [${version}]: ${error}`);
  if (result.errors.length) process.exitCode = 1;
  else console.log(`${version} valid in ${release ? 'release' : 'development'} mode: ${data.entities.length} entities, ${data.claims.length} claims.`);
}
