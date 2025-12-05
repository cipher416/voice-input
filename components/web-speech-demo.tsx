"use client";

import { Badge } from "@/components/ui/badge";
import {
  VoiceInput,
  VoiceInputCancelButton,
  VoiceInputPreview,
  VoiceInputRecordButton,
} from "@/registry/new-york/ui/voice-input";
import * as React from "react";

type SpeechRecognitionAlternative = {
  transcript: string;
  confidence: number;
};

type SpeechRecognitionResult = SpeechRecognitionAlternative[] & {
  isFinal: boolean;
};

type SpeechRecognitionEvent = Event & {
  resultIndex: number;
  results: SpeechRecognitionResult[];
};

type SpeechRecognitionErrorEvent = Event & {
  error?: string;
};

interface WebSpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
}

type SpeechRecognitionCtor = new () => WebSpeechRecognition;

function getSpeechRecognitionCtor(): SpeechRecognitionCtor | undefined {
  if (typeof window === "undefined") return undefined;
  return (
    (
      window as typeof window & {
        webkitSpeechRecognition?: SpeechRecognitionCtor;
        SpeechRecognition?: SpeechRecognitionCtor;
      }
    ).SpeechRecognition ||
    (
      window as typeof window & {
        webkitSpeechRecognition?: SpeechRecognitionCtor;
        SpeechRecognition?: SpeechRecognitionCtor;
      }
    ).webkitSpeechRecognition
  );
}

export function WebSpeechDemo() {
  const recognitionRef = React.useRef<WebSpeechRecognition | null>(null);

  const [isConnected, setIsConnected] = React.useState(false);
  const [isConnecting, setIsConnecting] = React.useState(false);
  const [partialTranscript, setPartialTranscript] = React.useState("");
  const [committedTranscripts, setCommittedTranscripts] = React.useState<
    string[]
  >([]);
  const [error, setError] = React.useState<string | null>(null);
  const [isSupported, setIsSupported] = React.useState<boolean | null>(null);
  const [isPending, startTransition] = React.useTransition();

  React.useEffect(() => {
    startTransition(() => {
      setIsSupported(Boolean(getSpeechRecognitionCtor()));
    });
  }, []);

  const ensureRecognizer = React.useCallback(() => {
    const Ctor = getSpeechRecognitionCtor();
    if (!Ctor) return null;

    if (recognitionRef.current) return recognitionRef.current;

    const recognition = new Ctor();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      setIsConnecting(false);
      setIsConnected(true);
    };

    recognition.onresult = (event) => {
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i];
        const transcript = result[0]?.transcript?.trim() ?? "";

        if (!transcript) continue;

        if (result.isFinal) {
          setCommittedTranscripts((prev) => [...prev, transcript]);
          setPartialTranscript("");
        } else {
          setPartialTranscript(transcript);
        }
      }
    };

    recognition.onerror = (event) => {
      setError(event.error ?? "Speech recognition error");
      setIsConnecting(false);
      setIsConnected(false);
    };

    recognition.onend = () => {
      setIsConnecting(false);
      setIsConnected(false);
      setPartialTranscript("");
    };

    recognitionRef.current = recognition;
    return recognition;
  }, []);

  const start = React.useCallback(() => {
    setError(null);
    setCommittedTranscripts([]);
    setPartialTranscript("");

    const recognition = ensureRecognizer();
    if (!recognition) {
      setError("Web Speech API is not supported in this browser.");
      return;
    }

    setIsConnecting(true);

    try {
      recognition.start();
    } catch (err) {
      setIsConnecting(false);
      setError(err instanceof Error ? err.message : String(err));
    }
  }, [ensureRecognizer]);

  const stop = React.useCallback(() => {
    const recognition = recognitionRef.current;
    if (!recognition) return;
    setIsConnecting(false);
    setIsConnected(false);
    recognition.stop();
  }, []);

  const cancel = React.useCallback(() => {
    const recognition = recognitionRef.current;
    setCommittedTranscripts([]);
    setPartialTranscript("");
    setIsConnecting(false);
    setIsConnected(false);
    recognition?.stop();
  }, []);

  React.useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
      recognitionRef.current = null;
    };
  }, []);

  return (
    <div className="flex flex-col gap-3 rounded-lg border p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Web Speech API demo</p>
          <p className="text-xs text-muted-foreground/80">
            Press the mic, speak, and see interim + final transcripts.
          </p>
        </div>
        <Badge
          variant={
            isPending || isSupported === null
              ? "outline"
              : isSupported
                ? "secondary"
                : "destructive"
          }
          aria-live="polite"
          aria-atomic="true"
        >
          {isPending || isSupported === null
            ? "Checking support…"
            : isSupported
              ? "Supported"
              : "Not supported"}
        </Badge>
      </div>

      <VoiceInput
        isConnected={isConnected}
        isConnecting={isConnecting}
        partialTranscript={partialTranscript}
        committedTranscripts={committedTranscripts}
        error={error}
        onStart={start}
        onStop={stop}
        onCancel={cancel}
        className="w-full border bg-card"
      >
        <div className="flex items-center gap-2 px-3 py-2 w-full">
          <VoiceInputRecordButton />
          <VoiceInputPreview className="flex-1" display="full" />
          <VoiceInputCancelButton />
        </div>
      </VoiceInput>

      <div className="text-sm text-muted-foreground">
        <p className="font-medium text-foreground">Transcript</p>
        <div className="mt-1 rounded-md border bg-muted/40 p-2 min-h-[72px] whitespace-pre-wrap">
          {committedTranscripts.length === 0 && !partialTranscript ? (
            <span className="text-muted-foreground">Nothing yet.</span>
          ) : (
            <span>{[...committedTranscripts].filter(Boolean).join(" ")}</span>
          )}
        </div>
      </div>

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
