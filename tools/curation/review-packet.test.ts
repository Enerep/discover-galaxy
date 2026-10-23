import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import { loadDataset } from '../../apps/web/src/lib/dataset.ts';
import { renderReviewPacket } from './review-packet.ts';

const snapshot = loadDataset(JSON.parse(await readFile(new URL('../../data/alzheimers/dataset.json', import.meta.url), 'utf8')));

test('the packet is deterministic and cannot silently modify scientific review state', () => {
  const before = JSON.stringify(snapshot);
  const packet = renderReviewPacket(snapshot);
  assert.equal(packet, renderReviewPacket(structuredClone(snapshot)));
  assert.equal(JSON.stringify(snapshot), before);
  assert.match(packet, /Release status:\*\* development/);
  assert.equal((packet.match(/\*\*Review status:\*\* draft/g) ?? []).length, snapshot.claims.length + snapshot.evidence.length + snapshot.conflicts.length);
  const unrecorded = [...snapshot.claims, ...snapshot.evidence, ...snapshot.conflicts].filter(({ review }) => review.reviewer === null).length;
  assert.equal((packet.match(/\*\*Reviewer:\*\* Not recorded/g) ?? []).length, unrecorded);
  assert.doesNotMatch(packet, /\*\*Review status:\*\* approved/);
  assert.match(packet, /does not inspect publications, establish study independence, or grant scientific approval/);
});

test('each finding keeps its original citation, locator, and source-specific context', () => {
  const packet = renderReviewPacket(snapshot);
  for (const evidence of snapshot.evidence) {
    const source = snapshot.sources.find(({ id }) => id === evidence.source_id)!;
    assert.ok(packet.includes(`(${source.url})`));
    assert.ok(packet.includes(evidence.id));
    assert.ok(packet.includes(evidence.locator));
    assert.ok(packet.includes(evidence.finding));
    for (const value of Object.values(evidence.study_context)) {
      if (typeof value === 'number') assert.ok(packet.includes(String(value)));
    }
  }
  assert.match(packet, /sequenced discovery individuals/);
  assert.match(packet, /2261/);
  assert.match(packet, /APOE ε2\/ε3 genotype/);
  assert.match(packet, /not an independent experiment or cohort/);
});

test('the review packet fails closed on a broken citation rather than omitting it', () => {
  // Deliberately malformed copy is isolated to this validation test.
  const malformed = structuredClone(snapshot);
  malformed.evidence[0].source_id = 'source-missing-for-test';
  assert.throws(() => renderReviewPacket(malformed), /Unable to load knowledge dataset/);
});

test('source-context comparisons retain their citations, limits and actual draft review record', () => {
  const packet = renderReviewPacket(snapshot);
  for (const note of snapshot.conflicts) {
    assert.ok(packet.includes(note.id));
    assert.ok(packet.includes(note.comparison));
    assert.ok(packet.includes(note.review.rationale));
    for (const value of note.context_differences) assert.ok(packet.includes(value));
    for (const id of note.evidence_ids) {
      const evidence = snapshot.evidence.find((item) => item.id === id)!;
      const source = snapshot.sources.find((item) => item.id === evidence.source_id)!;
      assert.ok(packet.includes(`${id}: [`));
      assert.ok(packet.includes(`(${source.url})`));
    }
  }
});

test('every source retains pending reuse and publication-status checks without fabricated dates', () => {
  const packet = renderReviewPacket(snapshot);
  for (const source of snapshot.sources) {
    assert.ok(packet.includes(`### ${source.id}`));
    assert.ok(packet.includes(source.url));
    assert.ok(packet.includes(source.retrieved_at));
    assert.ok(packet.includes(source.reuse.terms_url));
  }
  assert.equal((packet.match(/\*\*Reuse permission status:\*\* pending\\_review/g) ?? []).length, snapshot.sources.filter(({ reuse }) => reuse.permission_status === 'pending_review').length);
  assert.equal((packet.match(/\*\*Reuse checked:\*\* Not recorded/g) ?? []).length, snapshot.sources.filter(({ reuse }) => reuse.date_checked === null).length);
  assert.equal((packet.match(/\*\*Publication status checked:\*\* Not recorded/g) ?? []).length, snapshot.sources.filter(({ publication_status }) => publication_status.checked_at === null).length);
  for (const source of snapshot.sources) {
    if (source.reuse.date_checked) assert.ok(packet.includes(`**Reuse checked:** ${source.reuse.date_checked}`));
    if (source.publication_status.checked_at) assert.ok(packet.includes(`**Publication status checked:** ${source.publication_status.checked_at}`));
  }
});
