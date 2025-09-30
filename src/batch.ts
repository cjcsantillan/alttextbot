import { isUrl, loadRemoteImage } from './input/remoteUrl';
import { loadLocalImage } from './input/localFile';
import type { ImageSource } from './input/localFile';

export async function loadImage(input: string): Promise<ImageSource> {
  return isUrl(input) ? loadRemoteImage(input) : loadLocalImage(input);
}

export async function processBatch<T>(
  inputs: string[],
  handler: (input: string) => Promise<T>,
): Promise<Array<{ input: string; result?: T; error?: string }>> {
  const results = [];
  for (const input of inputs) {
    try {
      const result = await handler(input);
      results.push({ input, result });
    } catch (err) {
      results.push({ input, error: (err as Error).message });
    }
  }
  return results;
}
