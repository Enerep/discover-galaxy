import type { Entity, EntityType } from '../lib/types.ts';

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

  papers.forEach((entity, index) => {
    const angle = (index / Math.max(papers.length, 1)) * Math.PI * 2 + Math.PI / 4;
    positions.set(entity.id, [Math.cos(angle) * 6.35, Math.sin(angle) * 4.4, -0.9 + Math.sin(angle * 2) * 0.4]);
  });

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
