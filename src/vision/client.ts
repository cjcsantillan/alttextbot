import type { ImageSource } from '../input/localFile';

export interface VisionClientOptions {
  apiKey: string;
  model?: string;
  maxRetries?: number;
}

export interface AltTextResult {
  altText: string;
}

const RETRYABLE_STATUS_CODES = new Set([429, 500, 502, 503, 504]);

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class VisionClient {
  private apiKey: string;
  private model: string;
  private maxRetries: number;

  constructor(options: VisionClientOptions) {
    this.apiKey = options.apiKey;
    this.model = options.model ?? 'default-vision-model';
    this.maxRetries = options.maxRetries ?? 3;
  }

  async generateAltText(image: ImageSource, prompt: string): Promise<AltTextResult> {
    let attempt = 0;
    let lastError: Error | undefined;

    while (attempt <= this.maxRetries) {
      const res = await fetch('https://api.example.com/v1/vision/describe', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          prompt,
          image: image.buffer.toString('base64'),
          mimeType: image.mimeType,
        }),
      });

      if (res.ok) {
        const data = (await res.json()) as { description: string };
        return { altText: data.description };
      }

      if (!RETRYABLE_STATUS_CODES.has(res.status) || attempt === this.maxRetries) {
        throw new Error(`Vision API error: ${res.status} ${res.statusText}`);
      }

      lastError = new Error(`Vision API error: ${res.status} ${res.statusText}`);
      const backoffMs = 2 ** attempt * 500;
      await sleep(backoffMs);
      attempt += 1;
    }

    throw lastError ?? new Error('Vision API request failed');
  }
}
