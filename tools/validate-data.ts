import { DISEASE_COLLECTIONS } from '../data/collections.ts';
import type { CollectionId } from '../data/collections.ts';
import { loadDataset } from '../apps/web/src/lib/dataset.ts';
import { buildMapComparison } from '../apps/web/src/lib/map-comparison.ts';
import type { Snapshot } from '../apps/web/src/lib/types.ts';
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

if (!process.exitCode) {
  try {
    const snapshots = Object.fromEntries(Object.entries(DISEASE_COLLECTIONS)
      .map(([id, { data }]) => [id, loadDataset(data)])) as Record<CollectionId, Snapshot>;
    const comparison = buildMapComparison(snapshots);
    if (release && (comparison.review.status !== 'approved' || comparison.review.human_reviewed !== true)) {
      throw new Error(`${comparison.version} requires independent scientific review.`);
    }
    console.log(`${comparison.version} valid: two findings with a shared study and controls.`);
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
