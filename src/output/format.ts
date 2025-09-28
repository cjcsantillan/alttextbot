export type OutputFormat = 'text' | 'json';

export function formatResult(input: string, altText: string, format: OutputFormat): string {
  if (format === 'json') {
    return JSON.stringify({ input, altText }, null, 2);
  }
  return altText;
}
