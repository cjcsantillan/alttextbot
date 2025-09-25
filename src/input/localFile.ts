import { readFile } from 'fs/promises';
import { extname } from 'path';

export interface ImageSource {
  buffer: Buffer;
  mimeType: string;
}

const MIME_BY_EXT: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
};

export class UnsupportedImageFormatError extends Error {
  constructor(ext: string) {
    super(`Unsupported image extension: "${ext}". Supported: ${Object.keys(MIME_BY_EXT).join(', ')}`);
    this.name = 'UnsupportedImageFormatError';
  }
}

export async function loadLocalImage(path: string): Promise<ImageSource> {
  const ext = extname(path).toLowerCase();
  const mimeType = MIME_BY_EXT[ext];
  if (!mimeType) {
    throw new UnsupportedImageFormatError(ext);
  }
  const buffer = await readFile(path);
  return { buffer, mimeType };
}
