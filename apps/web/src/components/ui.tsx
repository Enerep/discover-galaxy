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
    protein: <><path d="M7 5h9a3 3 0 0 1 0 6H8a4 4 0 0 0 0 8h9" /><circle cx="5" cy="5" r="2" /><circle cx="19" cy="19" r="2" /></>,
    pathway: <><path d="m7 6 10 2M18 10l-7 7M6 7l3 10" /><circle cx="5" cy="5" r="2" /><circle cx="19" cy="8" r="2" /><circle cx="10" cy="19" r="2" /></>,
    disease: <><circle cx="12" cy="12" r="8" /><path d="M8 12h8M12 8v8" /></>,
    plus: <path d="M5 12h14M12 5v14" />,
    minus: <path d="M5 12h14" />,
    share: <><path d="M12 16V3m-5 5 5-5 5 5M5 13v8h14v-8" /></>,
    download: <><path d="M12 3v12m-5-5 5 5 5-5M5 17v4h14v-4" /></>,
    sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5 19 19M5 19l1.5-1.5M17.5 6.5 19 5" /></>,
    moon: <path d="M20.5 13a8.5 8.5 0 0 1-9.5-9.5A8.5 8.5 0 1 0 20.5 13Z" />,
    monitor: <><rect x="3" y="4" width="18" height="13" rx="2" /><path d="M8 21h8M12 17v4" /></>,
    compare: <><path d="M5 7h14l-4-4M19 17H5l4 4M19 7v4M5 17v-4" /></>,
    pin: <><path d="m8 3 8 0-1 6 4 4v2H5v-2l4-4-1-6M12 15v7" /></>,
    brief: <><path d="M6 3h13v18H6a3 3 0 0 1 0-6h13M6 3a3 3 0 0 0-3 3v12M9 7h6M9 11h6" /></>,
    analysis: <><path d="M4 3v17h17M8 15l4-6 4 3 5-8" /><circle cx="8" cy="15" r="1" /><circle cx="12" cy="9" r="1" /><circle cx="16" cy="12" r="1" /></>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {paths[name] ?? paths.info}
    </svg>
  );
}
