import type { Claim, Entity, EntityType } from '../lib/types.ts';

export type Position = [number, number, number];

export const ENTITY_COLORS: Record<EntityType, string> = {
  disease: '#e9ac72',
  gene: '#8bdbc5',
  protein: '#79b7cc',
  drug: '#e2a0a5',
  pathway: '#d6cf8a',
  paper: '#a5b9df',
};

// Positions are a navigation aid, not a measurement of biological proximity.
// Use the complete snapshot to preserve positions when the visible set changes.
export function createGalaxyLayout(entities: Entity[]): Map<string, Position> {
  const positions = new Map<string, Position>();
  const sorted = [...entities].sort((a, b) => a.id.localeCompare(b.id));
  const diseases = sorted.filter((entity) => entity.type === 'disease');
  const papers = sorted.filter((entity) => entity.type === 'paper');
  const genes = sorted.filter((entity) => entity.type === 'gene');
  const proteins = sorted.filter((entity) => entity.type === 'protein');
  const pathways = sorted.filter((entity) => entity.type === 'pathway');

  diseases.forEach((entity, index) => {
    positions.set(entity.id, [index * 1.4, 0, index * -0.35]);
  });

  function ring(group: Entity[], width: number, height: number, phase = 0) {
    group.forEach((entity, index) => {
      const angle = index / Math.max(group.length, 1) * Math.PI * 2 + Math.PI / 2 + phase;
      positions.set(entity.id, [Math.cos(angle) * width, Math.sin(angle) * height, Math.sin(angle * 2) * 0.7]);
    });
  }
  ring(genes, 2.7, 2.35);
  ring(proteins, 4.6, 3.45, 0.09);
  ring(pathways, 6.1, 2.8, Math.PI / 2);
  ring(sorted.filter(({ type }) => type === 'drug'), 4.1, 2.8, Math.PI / 4);

  const upperPapers = Math.ceil(papers.length / 2);
  papers.forEach((entity, index) => {
    // Two outer arcs leave the horizontal pathway/protein labels clear.
    const upper = index < upperPapers;
    const count = upper ? upperPapers : papers.length - upperPapers;
    const offset = upper ? index : index - upperPapers;
    const fraction = count === 1 ? 0.5 : offset / (count - 1);
    const angle = (upper ? Math.PI / 6 : 7 * Math.PI / 6) + fraction * Math.PI * 2 / 3;
    positions.set(entity.id, [Math.cos(angle) * 6.8, Math.sin(angle) * 5, -0.9 + Math.sin(angle * 2) * 0.4]);
  });

  return positions;
}

/** A readable neighbourhood; positions are navigation aids, never biological distance. */
export function createFocusedLayout(entities: Entity[], selectedId: string, directIds: Set<string>, claims: Claim[] = []): Map<string, Position> {
  if (entities.some(({ id, type }) => id === selectedId && type === 'pathway')) {
    return createPathwayLayout(entities, selectedId, directIds, claims);
  }
  const positions = new Map<string, Position>([[selectedId, [0, 0, 0]]]);
  const ordered = [...entities].filter(({ id }) => id !== selectedId)
    .sort((a, b) => a.type.localeCompare(b.type) || a.id.localeCompare(b.id));
  for (const direct of [true, false]) {
    const group = ordered.filter(({ id }) => directIds.has(id) === direct);
    const radius = direct ? 3.4 : 6.5;
    group.forEach(({ id }, index) => {
      const angle = Math.PI / 2 + index / Math.max(group.length, 1) * Math.PI * 2;
      positions.set(id, [Math.cos(angle) * radius, Math.sin(angle) * radius * 0.82, Math.sin(angle * 2) * 0.3]);
    });
  }
  return positions;
}

function createPathwayLayout(entities: Entity[], selectedId: string, directIds: Set<string>, claims: Claim[]): Map<string, Position> {
  const positions = new Map<string, Position>([[selectedId, [0, 0, 0]]]);
  const byId = new Map(entities.map((entity) => [entity.id, entity]));
  const ordered = [...entities].filter(({ id }) => id !== selectedId).sort((a, b) => a.id.localeCompare(b.id));
  const direct = ordered.filter(({ id }) => directIds.has(id));

  // Only an explicit encodes record can align a gene and protein. Use the full
  // claim set, including counterparts not yet visible, to reserve their slots.
  // Deterministic one-to-one matching also keeps multiple mappings from stacking.
  const pairs = new Map<string, { geneId: string; proteinId: string }>();
  const mappings = claims.filter(({ predicate, subject_id, object_id }) => predicate === 'encodes'
    && (directIds.has(subject_id) || directIds.has(object_id))
    && (!byId.has(subject_id) || byId.get(subject_id)!.type === 'gene')
    && (!byId.has(object_id) || byId.get(object_id)!.type === 'protein'))
    .sort((a, b) => a.subject_id.localeCompare(b.subject_id) || a.object_id.localeCompare(b.object_id) || a.id.localeCompare(b.id));
  for (const { subject_id: geneId, object_id: proteinId } of mappings) {
    if (pairs.has(geneId) || pairs.has(proteinId)) continue;
    const pair = { geneId, proteinId };
    pairs.set(geneId, pair);
    pairs.set(proteinId, pair);
  }

  const rowKey = (id: string) => pairs.get(id)?.geneId ?? id;
  const rows = [...new Set(direct.map(({ id }) => rowKey(id)))].sort((a, b) => a.localeCompare(b));
  const rowByKey = new Map(rows.map((key, index) => [key, ((rows.length - 1) / 2 - index) * 2.05]));
  const column = (type: EntityType) => type === 'gene' ? -12.5 : -7.5;
  for (const entity of ordered) {
    const y = rowByKey.get(rowKey(entity.id));
    if (y !== undefined && (directIds.has(entity.id) || pairs.has(entity.id))) {
      positions.set(entity.id, [column(entity.type), y, 0]);
    }
  }

  // Other next-level neighbours sit below the destination pathway. Sharing an
  // identity row above never adds a pathway membership or changes any claim.
  const remaining = ordered.filter(({ id }) => !positions.has(id));
  const bottom = -Math.max(4.5, (rows.length - 1) / 2 * 2.05 + 1.8);
  remaining.forEach(({ id }, index) => positions.set(id, [0, bottom - index * 3.2, 0]));
  return positions;
}

export function decorativeStars(count = 650): Float32Array {
  const points = new Float32Array(count * 3);
  let seed = 73;
  const random = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
  for (let index = 0; index < count; index += 1) {
    points[index * 3] = (random() - 0.5) * 54;
    points[index * 3 + 1] = (random() - 0.5) * 32;
    points[index * 3 + 2] = -6 - random() * 18;
  }
  return points;
}
