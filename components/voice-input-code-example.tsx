import { ExternalLinkIcon, FileCode2Icon } from "lucide-react";

import { CodeBlockContent } from "@/components/kibo-ui/code-block/server";
import { SnippetCopyButton } from "@/components/kibo-ui/snippet";

const VOICE_INPUT_SNIPPET = `"use client";

import {
  VoiceInput,
  VoiceInputCancelButton,
  VoiceInputPreview,
  VoiceInputRecordButton,
} from "@/components/voice-input";

type SpeechController = {
  isConnected: boolean;
  isConnecting: boolean;
  partialTranscript: string;
  committedTranscripts: string[];
  start: () => Promise<void> | void;
  stop: () => Promise<void> | void;
  cancel: () => Promise<void> | void;
};

export function VoiceInputExample({ speech }: { speech: SpeechController }) {
  return (
    <VoiceInput
      isConnected={speech.isConnected}
      isConnecting={speech.isConnecting}
      partialTranscript={speech.partialTranscript}
      committedTranscripts={speech.committedTranscripts}
      onStart={speech.start}
      onStop={speech.stop}
      onCancel={speech.cancel}
      className="border"
    >
      <div className="flex w-full items-center gap-2 px-2">
        <VoiceInputRecordButton />
        <VoiceInputPreview className="flex-1" />
        <VoiceInputCancelButton />
      </div>
    </VoiceInput>
  );
}`;

export function VoiceInputCodeExample() {
  return (
    <section aria-labelledby="usage-heading" className="flex flex-col gap-3">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 id="usage-heading" className="text-sm font-medium">
            Compose with your speech provider
          </h2>
          <p className="text-muted-foreground text-xs">
            The component owns presentation; your adapter owns recording.
          </p>
        </div>
        <a
          href="https://github.com/cipher416/voice-input/blob/main/components/web-speech-demo.tsx"
          target="_blank"
          rel="noreferrer"
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-xs transition-colors"
        >
          Full Web Speech example
          <ExternalLinkIcon aria-hidden="true" className="size-3" />
        </a>
      </div>

      <div className="overflow-hidden rounded-lg border">
        <div className="bg-secondary flex h-10 items-center gap-2 border-b px-3">
          <FileCode2Icon aria-hidden="true" className="text-muted-foreground size-4" />
          <span className="text-muted-foreground text-xs">voice-input-example.tsx</span>
          <SnippetCopyButton
            value={VOICE_INPUT_SNIPPET}
            aria-label="Copy voice input example"
            className="ml-auto"
          />
        </div>
        <div className="overflow-x-auto text-sm [&_.shiki]:!bg-transparent [&_pre]:min-w-max [&_pre]:p-4 dark:[&_.shiki]:!text-[var(--shiki-dark)] dark:[&_.shiki_span]:!text-[var(--shiki-dark)]">
          <CodeBlockContent language="tsx">
            {VOICE_INPUT_SNIPPET}
          </CodeBlockContent>
        </div>
      </div>
    </section>
  );
}
