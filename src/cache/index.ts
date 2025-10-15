import { createHash } from 'crypto';

export interface Cache {
  get(key: string): string | undefined;
  set(key: string, value: string): void;
}

export class InMemoryCache implements Cache {
  private store = new Map<string, string>();

  get(key: string): string | undefined {
    return this.store.get(key);
  }

  set(key: string, value: string): void {
    this.store.set(key, value);
  }
}

export function hashImage(buffer: Buffer): string {
  return createHash('sha256').update(buffer).digest('hex');
}
