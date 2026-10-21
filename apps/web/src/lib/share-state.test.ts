import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { loadDataset } from './dataset.ts';
import { buildShareUrl, parseShareState } from './share-state.ts';
import type { ExplorerShareState } from './share-state.ts';

const snapshot = loadDataset(JSON.parse(await readFile(new URL('../../../../data/alzheimers/dataset.json', import.meta.url), 'utf8')));
const base = new URL('https://discovery.example/research/');
const selected: ExplorerShareState = {
  entityId: 'gene-apoe', claimId: 'claim-apoe-e2-risk', query: '', filter: 'all', view: 'graph',
};

test('shared state restores the selected variant finding and Unicode search in either view', () => {
  for (const view of ['graph', 'list'] as const) {
    const state = { ...selected, query: 'APOE ε2/ε3 — Alzheimer’s', filter: 'gene' as const, view };
    const link = buildShareUrl(base, state, snapshot);
    assert.deepEqual(parseShareState(new URL(link), snapshot), state);
    assert.equal(new URL(link).search, '');
    assert.ok(new URL(link).hash.includes('q='));
  }
});

test('shared paper selections accept only findings cited by that paper', () => {
  const state = { ...selected, entityId: 'paper-corder-1994' };
  assert.deepEqual(parseShareState(new URL(buildShareUrl(base, state, snapshot)), snapshot), state);
  const unrelated = new URL('https://discovery.example/#entity=paper-corder-1994&claim=claim-trem2-r47h-risk');
  assert.equal(parseShareState(unrelated, snapshot), null);
  assert.throws(() => buildShareUrl(base, { ...state, claimId: 'claim-trem2-r47h-risk' }, snapshot), /invalid explorer/);
});

test('unknown selections, unrelated claims, invalid modes and ambiguous parameters safely fall back', () => {
  for (const fragment of [
    'entity=not-in-the-dataset',
    'entity=gene-apoe&claim=not-in-the-dataset',
    'entity=gene-apoe&claim=claim-abca1-n1800h-risk',
    'entity=gene-apoe&claim=',
    'entity=gene-apoe&type=protein',
    'entity=gene-apoe&type=unknown',
    'entity=gene-apoe&view=unknown',
    'entity=gene-apoe&entity=gene-trem2',
    'entity=gene-apoe&q=APOE&q=TREM2',
  ]) assert.equal(parseShareState(new URL(`${base.href}#${fragment}`), snapshot), null, fragment);
  assert.equal(parseShareState(base, snapshot), null);
  assert.equal(parseShareState(new URL(`${base.href}#explorer`), snapshot), null);
});

test('malformed and excessive fragment input does not become search state', () => {
  for (const query of ['%', '%GG', '%FF', '%E0%A4', '%00', '%0A', 'x'.repeat(257)]) {
    assert.equal(parseShareState(new URL(`${base.href}#entity=gene-apoe&q=${query}`), snapshot), null, query);
  }
  assert.equal(parseShareState(new URL(`${base.href}#entity=gene-apoe&ignored=${'x'.repeat(4096)}`), snapshot), null);
  assert.throws(() => buildShareUrl(base, { ...selected, query: 'x'.repeat(257) }, snapshot), /invalid explorer/);
  const boundary = { ...selected, query: 'x'.repeat(256) };
  assert.deepEqual(parseShareState(new URL(buildShareUrl(base, boundary, snapshot)), snapshot), boundary);
});

test('canonical URLs preserve the application path while removing credentials and unrelated tokens', () => {
  const privateBase = new URL('https://user:secret@discovery.example/research/?token=secret&bypass=private#unknown=secret');
  const link = buildShareUrl(privateBase, selected, snapshot);
  const url = new URL(link);
  assert.equal(url.origin, 'https://discovery.example');
  assert.equal(url.pathname, '/research/');
  assert.equal(url.username, '');
  assert.equal(url.password, '');
  assert.equal(url.search, '');
  assert.equal(url.hash, '#entity=gene-apoe&claim=claim-apoe-e2-risk');
  assert.ok(!link.includes('secret'));
  const withUnknown = new URL(`${link}&unknown=ignored`);
  assert.deepEqual(parseShareState(withUnknown, snapshot), selected);
  assert.equal(buildShareUrl(withUnknown, parseShareState(withUnknown, snapshot)!, snapshot), link);
});

test('minimal links use safe defaults and unsupported protocols cannot be shared', () => {
  assert.deepEqual(parseShareState(new URL(`${base.href}#entity=gene-apoe`), snapshot), { ...selected, claimId: null });
  assert.equal(parseShareState(new URL('javascript:alert(1)#entity=gene-apoe'), snapshot), null);
  assert.throws(() => buildShareUrl(new URL('javascript:alert(1)'), selected, snapshot), /HTTP or HTTPS/);
});
