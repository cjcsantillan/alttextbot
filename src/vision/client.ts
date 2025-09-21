import type { ImageSource } from '../input/localFile';

export interface VisionClientOptions {
  apiKey: string;
  model?: string;
}

export interface AltTextResult {
  altText: string;
}

export class VisionClient {
  private apiKey: string;
  private model: string;

  constructor(options: VisionClientOptions) {
    this.apiKey = options.apiKey;
    this.model = options.model ?? 'default-vision-model';
  }

  async generateAltText(image: ImageSource, prompt: string): Promise<AltTextResult> {
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

    if (!res.ok) {
      throw new Error(`Vision API error: ${res.status} ${res.statusText}`);
    }

    const data = (await res.json()) as { description: string };
    return { altText: data.description };
  }
}
