import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile, rm } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { loadLocalImage, UnsupportedImageFormatError } from '../src/input/localFile';

test('loadLocalImage reads a supported image file', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'alttextbot-'));
  const path = join(dir, 'sample.png');
  await writeFile(path, Buffer.from([0x89, 0x50, 0x4e, 0x47]));

  const image = await loadLocalImage(path);

  assert.equal(image.mimeType, 'image/png');
  assert.ok(image.buffer.length > 0);

  await rm(dir, { recursive: true, force: true });
});

test('loadLocalImage throws on unsupported extension', async () => {
  await assert.rejects(() => loadLocalImage('sample.bmp'), UnsupportedImageFormatError);
});
