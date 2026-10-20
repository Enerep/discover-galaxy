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
  const biological = sorted.filter((entity) => entity.type !== 'disease' && entity.type !== 'paper');

  diseases.forEach((entity, index) => {
    positions.set(entity.id, [index * 1.4, 0, index * -0.35]);
  });

  biological.forEach((entity, index) => {
    const angle = (index / Math.max(biological.length, 1)) * Math.PI * 2 + Math.PI / 2;
    positions.set(entity.id, [Math.cos(angle) * 3.25, Math.sin(angle) * 2.65, Math.sin(angle * 2) * 0.7]);
  });

  papers.forEach((entity, index) => {
    const angle = (index / Math.max(papers.length, 1)) * Math.PI * 2 + Math.PI / 4;
    positions.set(entity.id, [Math.cos(angle) * 5.45, Math.sin(angle) * 3.8, -0.9 + Math.sin(angle * 2) * 0.4]);
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
