import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseArgs } from '../src/cli';

test('parseArgs extracts input and flags', () => {
  const result = parseArgs(['node', 'cli.js', 'photo.png', '--json']);
  assert.equal(result.input, 'photo.png');
  assert.deepEqual(result.flags, ['--json']);
});

test('parseArgs returns undefined input when none given', () => {
  const result = parseArgs(['node', 'cli.js']);
  assert.equal(result.input, undefined);
});
