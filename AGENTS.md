# alttextbot

Accessible alt-text generator. Next.js 15 (App Router), React frontend, one
process — the Bedrock call happens server-side in a route handler, never in
the browser. Built for the AWS AI Agent Global Hackathon.

## Commands

| Command | Notes |
|---|---|
| `npm install` | also installs the lefthook pre-commit hook (prepare script) |
| `npm run dev` | Next dev server on `PORT`/3000 |
| `npm run build` | production build (`output: "standalone"`) |
| `npm start` | serves the production build |

No test suite by design.

## Architecture

- **`app/layout.js` / `app/page.js`**: root layout and the single landing
  page — hero, `<Uploader />`, a "how it works" section.
- **`app/api/alt-text/route.js`**: `POST` handler — validates the uploaded
  file (MIME allowlist, 5 MB cap), then delegates to `lib/altTextService.js`.
- **`lib/bedrockClient.js`**: single shared `BedrockRuntimeClient`; resolves
  credentials via `AWS_PROFILE` (through `fromIni`) when set, otherwise the
  default SDK provider chain.
- **`lib/altTextService.js`**: builds the vision prompt, invokes the model,
  strictly parses the JSON response (`altText` + `caption`), tolerating a
  stray code fence.
- **`components/Uploader.jsx`**: client component — drag/drop + file picker,
  preview, submit, result panel, and a capped in-memory history of past
  generations. `components/CopyButton.jsx` is a small shared control.

## Conventions

- Route handlers throw a typed `BedrockInvocationError` rather than leaking
  SDK error internals to the client.
- `.env` is gitignored — copy `.env.example` and fill in real values locally.
- Plain JavaScript, not TypeScript — kept intentionally lightweight; see the
  sibling `triage` project for the TypeScript + CLI variant of this pattern.
