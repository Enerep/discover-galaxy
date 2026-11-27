import alzheimers from './alzheimers/dataset.json' with { type: 'json' };
import lewyBodies from './lewy-bodies/dataset.json' with { type: 'json' };

export const DEFAULT_COLLECTION = 'alzheimers';

export const DISEASE_COLLECTIONS = {
  alzheimers: { data: alzheimers, initialEntityId: 'gene-apoe', liveSources: true },
  'lewy-bodies': { data: lewyBodies, initialEntityId: 'disease-dlb', liveSources: false },
} as const;

export type CollectionId = keyof typeof DISEASE_COLLECTIONS;

export function isCollectionId(value: string | null): value is CollectionId {
  return value !== null && Object.hasOwn(DISEASE_COLLECTIONS, value);
}
