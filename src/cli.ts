#!/usr/bin/env node
import { VERSION } from './index';

export interface ParsedArgs {
  input?: string;
  flags: string[];
  maxLength?: number;
}

export function parseArgs(argv: string[]): ParsedArgs {
  const [, , ...rest] = argv;
  const maxLengthFlagIndex = rest.indexOf('--max-length');
  const maxLength =
    maxLengthFlagIndex !== -1 ? Number(rest[maxLengthFlagIndex + 1]) : undefined;

  const flags = rest.slice(1).filter((_, i) => {
    const idx = i + 1;
    return idx !== maxLengthFlagIndex && idx !== maxLengthFlagIndex + 1;
  });

  return { input: rest[0], flags, maxLength };
}

export function truncateAltText(altText: string, maxLength?: number): string {
  if (!maxLength || altText.length <= maxLength) {
    return altText;
  }
  return `${altText.slice(0, maxLength - 1).trimEnd()}…`;
}

export const EXIT_CODE = {
  SUCCESS: 0,
  RUNTIME_ERROR: 1,
  USAGE_ERROR: 2,
} as const;

async function main() {
  const { input } = parseArgs(process.argv);
  if (!input) {
    console.error('Usage: alttextbot <image-path-or-url> [--max-length <n>]');
    process.exit(EXIT_CODE.USAGE_ERROR);
  }

  try {
    console.log(`alttextbot v${VERSION} processing: ${input}`);
    process.exit(EXIT_CODE.SUCCESS);
  } catch (err) {
    console.error((err as Error).message);
    process.exit(EXIT_CODE.RUNTIME_ERROR);
  }
}

if (require.main === module) {
  main();
}
