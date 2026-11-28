import type { CollectionId } from './collections.ts';
import type { Review } from '../apps/web/src/lib/types.ts';

export interface MapComparisonGroup {
  collection: CollectionId;
  claimId: string;
  diseaseId: string;
  tableLabel: string;
  label: string;
  carriers: number;
  estimate: number;
  lower: number;
  upper: number;
}

interface MapComparisonDefinition {
  version: string;
  title: string;
  geneId: string;
  ncbiGeneId: string;
  sourceId: string;
  pmid: string;
  doi: string;
  controlCarriers: number;
  groups: readonly [MapComparisonGroup, MapComparisonGroup];
  interpretation: string;
  review: Review;
}

export const APOE_MAP_COMPARISON: MapComparisonDefinition = {
  version: 'apoe-e4-tsuang-2013-0.1.0',
  title: 'APOE ε4 across maps',
  geneId: 'gene-apoe',
  ncbiGeneId: '348',
  sourceId: 'source-tsuang-2013',
  pmid: '23407718',
  doi: '10.1001/jamaneurol.2013.600',
  controlCarriers: 37,
  groups: [
    {
      collection: 'alzheimers', claimId: 'claim-ad-apoe-e4-tsuang-2013', diseaseId: 'disease-alzheimers',
      tableLabel: 'AD', label: 'Alzheimer’s disease', carriers: 153, estimate: 9.9, lower: 6.4, upper: 15.3,
    },
    {
      collection: 'lewy-bodies', claimId: 'claim-dlb-apoe-e4-low-pathology-tsuang-2013', diseaseId: 'disease-dlb',
      tableLabel: 'pDLB', label: 'DLB with low or absent Alzheimer’s changes', carriers: 47, estimate: 6.1, lower: 3.5, upper: 10.5,
    },
  ],
  interpretation: 'The intervals describe each case group relative to the shared controls. A direct comparison between the two case groups would require a separate estimate.',
  review: {
    status: 'draft',
    reviewer: 'Discovery Galaxy source check (AI)',
    date: '2026-11-28',
    human_reviewed: false,
    rationale: 'Checked case and control definitions, summed ε4 carrier genotypes from Table 2, and verified the adjusted AD and pDLB estimates in Table 3.',
  },
};
