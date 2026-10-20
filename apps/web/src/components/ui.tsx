import type { ReactNode } from 'react';
import type { EntityType } from '../lib/types.ts';

export const TYPE_LABELS: Record<EntityType, string> = {
  disease: 'Disease', gene: 'Gene', protein: 'Protein',
  drug: 'Drug', pathway: 'Pathway', paper: 'Paper',
};

export function Icon({ name, size = 18 }: { name: string; size?: number }) {
  const paths: Record<string, ReactNode> = {
    search: <><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 4 4" /></>,
    arrow: <path d="m9 5 7 7-7 7" />,
    back: <path d="M19 12H5m6-6-6 6 6 6" />,
    down: <path d="m6 9 6 6 6-6" />,
    external: <><path d="M14 4h6v6M20 4 10 14M10 4H4v16h16v-6" /></>,
    galaxy: <><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(-35 12 12)" /><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(35 12 12)" /><circle cx="12" cy="12" r="2" /></>,
    list: <><path d="M9 6h12M9 12h12M9 18h12M3 6h1M3 12h1M3 18h1" /></>,
    reset: <><path d="M4 10a8 8 0 1 1 1 7M4 4v6h6" /></>,
    close: <path d="m6 6 12 12M18 6 6 18" />,
    info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v6M12 7v1" /></>,
    paper: <><path d="M6 3h9l4 4v14H6zM14 3v5h5M9 12h7M9 16h7" /></>,
    gene: <><path d="M7 3c0 8 10 10 10 18M17 3C17 11 7 13 7 21M8 5h8M8 19h8M9 9h6M9 15h6" /></>,
    disease: <><circle cx="12" cy="12" r="8" /><path d="M8 12h8M12 8v8" /></>,
    plus: <path d="M5 12h14M12 5v14" />,
    minus: <path d="M5 12h14" />,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {paths[name] ?? paths.info}
    </svg>
  );
}
