# Voice Input Registry

## What’s inside

- Next.js app with live Web Speech demo and code snippet.
- Registry items defined in `registry.json` and built to `public/r/*.json`.
- Tailwind v4 + new-york theme.
- Theme switcher and install snippet UI for quick copy/paste commands.

## Run locally

```bash
pnpm install
pnpm dev    # starts Next.js at http://localhost:3000
```

## Build the registry

Regenerate static registry files (including `voice-input.json`):

```bash
pnpm registry:build
```

Output is written to `public/r/`.

## Consume the voice-input component

Direct one-liner (no extra config):

```
pnpm dlx shadcn@latest add https://voice-input.cristoper.dev/r/voice-input.json
```

Other package managers:

- npm: `npx shadcn@latest add https://voice-input.cristoper.dev/r/voice-input.json`
- yarn: `yarn dlx shadcn@latest add https://voice-input.cristoper.dev/r/voice-input.json`
- bun: `bunx shadcn@latest add https://voice-input.cristoper.dev/r/voice-input.json`

The component is controlled and provider-agnostic. Import the installed parts
from `@/components/voice-input`, then connect `isConnected`, transcript data,
and the start/stop/cancel handlers to your speech service.

```tsx
<VoiceInput
  isConnected={speech.isConnected}
  partialTranscript={speech.partialTranscript}
  committedTranscripts={speech.committedTranscripts}
  onStart={speech.start}
  onStop={speech.stop}
  onCancel={speech.cancel}
>
  <VoiceInputRecordButton />
  <VoiceInputPreview />
  <VoiceInputCancelButton />
</VoiceInput>
```

See `components/web-speech-demo.tsx` for a complete browser Web Speech adapter.

## Docs

- shadcn registry guide: https://ui.shadcn.com/docs/registry
- Tailwind v4 info: https://tailwindcss.com
