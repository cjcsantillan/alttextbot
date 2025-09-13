#!/usr/bin/env node
import { VERSION } from './index';

function parseArgs(argv: string[]) {
  const [, , ...rest] = argv;
  return { input: rest[0], flags: rest.slice(1) };
}

function main() {
  const { input } = parseArgs(process.argv);
  if (!input) {
    console.error('Usage: alttextbot <image-path-or-url>');
    process.exit(1);
  }
  console.log(`alttextbot v${VERSION} processing: ${input}`);
}

main();
