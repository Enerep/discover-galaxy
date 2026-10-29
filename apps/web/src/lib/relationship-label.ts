import type { Claim } from './types.ts';

/** A short predicate label viewed from the claim's subject, or its object when reversed. */
export function relationshipLabel(claim: Claim, reverse = false): string {
  switch (claim.predicate) {
    case 'encodes': return reverse ? 'Encoded by' : 'Encodes';
    case 'participates_in':
      return claim.context.annotation_level === 'gene'
        ? reverse ? 'Annotated gene' : 'Annotated to'
        : reverse ? 'Participant' : 'Part of';
    case 'interacts_with': return 'Interacts with';
    case 'associated_with': return claim.context.variant ? 'Variant association' : 'Associated with';
    case 'targets': return reverse ? 'Targeted by' : 'Targets';
  }
}
