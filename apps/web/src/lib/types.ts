export const ENTITY_TYPES = ['disease', 'gene', 'protein', 'drug', 'pathway', 'paper'] as const;
export type EntityType = (typeof ENTITY_TYPES)[number];
export type Context = Record<string, string | number | null | string[]>;
export type Identifier = { namespace: string; value: string };

export interface Review {
  status: 'draft' | 'approved';
  reviewer: string | null;
  date: string | null;
  rationale: string;
  human_reviewed?: boolean;
}

export interface Entity {
  id: string;
  type: EntityType;
  label: string;
  aliases: string[];
  external_ids: Identifier[];
  description?: string;
  description_claim_ids: string[];
  source_id?: string;
  provenance_source_ids: string[];
}

export type Predicate = 'associated_with' | 'encodes' | 'participates_in' | 'interacts_with' | 'targets';

export interface Claim {
  id: string;
  subject_id: string;
  object_id: string;
  predicate: Predicate;
  statement: string;
  context: Context;
  evidence_ids: string[];
  summary: string;
  limitations: string[];
  review: Review;
}

export interface Evidence {
  id: string;
  claim_id: string;
  source_id: string;
  upstream_source_ids: string[];
  relation: 'supports' | 'refutes' | 'mixed' | 'unclear';
  finding: string;
  locator: string;
  study_context: Context;
  limitations: string[];
  source_metrics?: { name: string; value: number; provider: string; release: string }[];
  review: Review;
}

export interface Source {
  id: string;
  kind: 'publication' | 'database_record';
  title: string;
  url: string;
  identifiers: Identifier[];
  publication_type?: string | null;
  authors: string[];
  year: number | null;
  provider?: string | null;
  release?: string | null;
  retrieved_at: string;
  reuse: {
    terms_url: string;
    attribution: string;
    retained_content: string;
    date_checked: string | null;
    permission_status: 'pending_review' | 'permitted';
  };
  publication_status: {
    status: 'not_checked' | 'no_notice_found' | 'corrected' | 'retracted';
    checked_at: string | null;
    notice_url: string | null;
  };
}

export interface Conflict {
  id: string;
  claim_ids: string[];
  evidence_ids: string[];
  label: string;
  comparison: string;
  context_differences: string[];
  review: Review;
}

export interface Hypothesis {
  id: string;
  question: string;
  basis_claim_ids: string[];
  basis_evidence_ids: string[];
  assumptions: string[];
  limitations: string[];
  suggested_test: string;
  origin: 'curated' | 'ai_generated';
  dataset_version: string;
  review: Review;
}

export interface Snapshot {
  schema_version: '0.1.0';
  dataset_version: string;
  release_status: 'development' | 'released';
  created_at: string;
  scope: { disease: string; inclusion_criteria: string; limitations: string[] };
  upstream_releases: {
    provider: string;
    release: string | null;
    accessed_at: string;
    source_url: string;
    reuse_terms_url: string;
    attribution: string;
  }[];
  entities: Entity[];
  claims: Claim[];
  evidence: Evidence[];
  sources: Source[];
  conflicts: Conflict[];
  hypotheses: Hypothesis[];
}
