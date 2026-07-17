"use client";

import { LoaderCircleIcon, MicIcon, SquareIcon, XIcon } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const EMPTY_TRANSCRIPTS: string[] = [];
const NOOP = () => {};

const buttonSize = {
  default: "size-9",
  sm: "size-8",
  lg: "size-10",
} as const;

export type VoiceInputSize = keyof typeof buttonSize;
export type VoiceInputState = "idle" | "connecting" | "recording";

export interface VoiceInputData {
  /** The current partial (in-progress) transcript */
  partialTranscript: string;
  /** Array of all committed (finalized) transcripts */
  committedTranscripts: string[];
  /** Full transcript combining committed and partial transcripts */
  transcript: string;
}

interface VoiceInputContextValue extends VoiceInputData {
  state: VoiceInputState;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  start: () => Promise<void> | void;
  stop: () => Promise<void> | void;
  cancel: () => Promise<void> | void;
  size: VoiceInputSize;
}

const VoiceInputContext = React.createContext<VoiceInputContextValue | null>(
  null,
);

function useVoiceInput() {
  const context = React.useContext(VoiceInputContext);
  if (!context) {
    throw new Error(
      "VoiceInput compound components must be used within a VoiceInput",
    );
  }
  return context;
}

function buildTranscript({
  partialTranscript,
  committedTranscripts,
}: {
  partialTranscript: string;
  committedTranscripts: string[];
}): string {
  const committed = committedTranscripts.join(" ").trim();
  const partial = partialTranscript.trim();

  return [committed, partial].filter(Boolean).join(" ");
}

export interface VoiceInputProps
  extends Omit<React.ComponentPropsWithoutRef<"div">, "children" | "onCancel"> {
  children: React.ReactNode;

  /**
   * Indicates whether the underlying speech service is currently connected/recording.
   */
  isConnected: boolean;

  /**
   * Indicates whether the speech service is in the process of connecting.
   * @default false
   */
  isConnecting?: boolean;

  /**
   * Current partial (in-progress) transcript
   * @default ""
   */
  partialTranscript?: string;

  /**
   * Array of finalized transcript segments
   * @default []
   */
  committedTranscripts?: string[];

  /**
   * Full transcript. If omitted, it will be derived from committed + partial transcripts.
   */
  transcript?: string;

  /**
   * Error message surfaced by the host speech service (if any).
   * @default null
   */
  error?: string | null;

  /**
   * Called when the record button triggers a start action.
   */
  onStart?: () => Promise<void> | void;

  /**
   * Called when the record button triggers a stop action.
   */
  onStop?: () => Promise<void> | void;

  /**
   * Called when the cancel button is pressed.
   */
  onCancel?: () => Promise<void> | void;

  /**
   * Size variant for the component buttons
   * @default "default"
   */
  size?: VoiceInputSize;
}

const VoiceInput = React.forwardRef<HTMLDivElement, VoiceInputProps>(
  function VoiceInput(
    {
      children,
      className,
      size = "default",
      isConnected,
      isConnecting = false,
      partialTranscript = "",
      committedTranscripts = EMPTY_TRANSCRIPTS,
      transcript,
      error = null,
      onStart,
      onStop,
      onCancel,
      ...props
    },
    ref,
  ) {
    const state: VoiceInputState = isConnecting
      ? "connecting"
      : isConnected
        ? "recording"
        : "idle";

    const computedData = React.useMemo(() => {
      const safeCommitted = committedTranscripts ?? EMPTY_TRANSCRIPTS;
      const safePartial = partialTranscript ?? "";

      return {
        partialTranscript: safePartial,
        committedTranscripts: safeCommitted,
        transcript:
          transcript ??
          buildTranscript({
            partialTranscript: safePartial,
            committedTranscripts: safeCommitted,
          }),
      };
    }, [committedTranscripts, partialTranscript, transcript]);

    const contextValue: VoiceInputContextValue = React.useMemo(
      () => ({
        state,
        isConnected,
        isConnecting,
        start: onStart ?? NOOP,
        stop: onStop ?? NOOP,
        cancel: onCancel ?? NOOP,
        error: error ?? null,
        size,
        ...computedData,
      }),
      [
        state,
        isConnected,
        isConnecting,
        onStart,
        onStop,
        onCancel,
        error,
        size,
        computedData,
      ],
    );

    return (
      <VoiceInputContext.Provider value={contextValue}>
        <div
          {...props}
          ref={ref}
          data-slot="voice-input"
          data-state={state}
          className={cn(
            "relative inline-flex items-center overflow-hidden rounded-md transition-[background-color,box-shadow] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none",
            state !== "idle" &&
              "bg-background shadow-[inset_0_0_0_1px_var(--color-input),0_1px_2px_0_rgb(0_0_0/0.05)]",
            className,
          )}
        >
          {children}
        </div>
      </VoiceInputContext.Provider>
    );
  },
);

VoiceInput.displayName = "VoiceInput";

export type VoiceInputRecordButtonProps = Omit<
  React.ComponentPropsWithoutRef<typeof Button>,
  "size"
>;

/**
 * Toggle button for starting/stopping speech recording.
 * Shows a microphone icon when idle and a stop icon when recording.
 */
const VoiceInputRecordButton = React.forwardRef<
  HTMLButtonElement,
  VoiceInputRecordButtonProps
>(function VoiceInputRecordButton(
  { className, onClick, variant = "ghost", disabled, ...props },
  ref,
) {
  const voiceInput = useVoiceInput();

  return (
    <Button
      ref={ref}
      type="button"
      variant={variant}
      size="icon"
      data-slot="voice-input-record-button"
      data-state={voiceInput.state}
      onClick={(e) => {
        onClick?.(e);
        if (e.defaultPrevented) return;

        if (voiceInput.isConnected) {
          void voiceInput.stop();
        } else {
          void voiceInput.start();
        }
      }}
      disabled={Boolean(disabled || voiceInput.isConnecting)}
      className={cn(
        buttonSize[voiceInput.size],
        "relative transition-transform duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-[0.97] disabled:active:scale-100 motion-reduce:transform-none motion-reduce:transition-none",
        className,
      )}
      aria-busy={voiceInput.isConnecting}
      aria-label={
        voiceInput.isConnecting
          ? "Starting recording"
          : voiceInput.isConnected
            ? "Stop recording"
            : "Start recording"
      }
      {...props}
    >
      <LoaderCircleIcon
        aria-hidden="true"
        className={cn(
          "absolute transition-[opacity,transform] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none",
          voiceInput.isConnecting
            ? "scale-100 animate-spin opacity-100 motion-reduce:animate-none"
            : "scale-95 opacity-0",
        )}
      />
      <SquareIcon
        aria-hidden="true"
        className={cn(
          "text-destructive absolute fill-current transition-[opacity,transform] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none",
          !voiceInput.isConnecting && voiceInput.isConnected
            ? "scale-100 opacity-100"
            : "scale-95 opacity-0",
        )}
      />
      <MicIcon
        aria-hidden="true"
        className={cn(
          "absolute transition-[opacity,transform] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none",
          !voiceInput.isConnecting && !voiceInput.isConnected
            ? "scale-100 opacity-100"
            : "scale-95 opacity-0",
        )}
      />
    </Button>
  );
});

VoiceInputRecordButton.displayName = "VoiceInputRecordButton";

export interface VoiceInputPreviewProps
  extends React.ComponentPropsWithoutRef<"div"> {
  /**
   * Text to show when no transcript is available
   * @default "Listening..."
   */
  placeholder?: string;

  /**
   * Which text to display in the preview.
   * - "full": committed + partial transcript
   * - "partial": only the current partial transcript
   * @default "full"
   */
  display?: "full" | "partial";
}

/**
 * Displays the current transcript with a placeholder when empty.
 * Only visible when actively recording.
 */
const VoiceInputPreview = React.forwardRef<
  HTMLDivElement,
  VoiceInputPreviewProps
>(function VoiceInputPreview(
  { className, placeholder = "Listening...", display = "full", ...props },
  ref,
) {
  const voiceInput = useVoiceInput();
  const previewText =
    display === "partial"
      ? voiceInput.partialTranscript
      : voiceInput.transcript;
  const hasPreviewText = Boolean(previewText.trim());
  const showPlaceholder = !hasPreviewText && voiceInput.isConnected;
  const displayText = hasPreviewText
    ? previewText
    : voiceInput.isConnected
      ? placeholder
      : "";

  return (
    <div
      {...props}
      ref={ref}
      data-slot="voice-input-preview"
      data-state={voiceInput.state}
      inert={voiceInput.isConnected ? undefined : true}
      className={cn(
        "text-muted-foreground relative self-stretch text-sm transition-[opacity,width] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none",
        showPlaceholder && "italic",
        voiceInput.isConnected ? "w-28 opacity-100" : "w-0 opacity-0",
        className,
      )}
      title={displayText}
      aria-hidden={!voiceInput.isConnected}
    >
      <div className="absolute inset-y-0 -right-1 -left-1 [mask-image:linear-gradient(to_right,transparent,black_10px,black_calc(100%-10px),transparent)]">
        <p className="absolute top-0 right-0 bottom-0 flex h-full min-w-full items-center px-1 whitespace-nowrap">
          {displayText}
        </p>
      </div>
    </div>
  );
});

VoiceInputPreview.displayName = "VoiceInputPreview";

export type VoiceInputCancelButtonProps = Omit<
  React.ComponentPropsWithoutRef<typeof Button>,
  "size"
>;

/**
 * Button to cancel the current recording and discard the transcript.
 * Only visible when actively recording.
 */
const VoiceInputCancelButton = React.forwardRef<
  HTMLButtonElement,
  VoiceInputCancelButtonProps
>(function VoiceInputCancelButton(
  { className, onClick, variant = "ghost", ...props },
  ref,
) {
  const voiceInput = useVoiceInput();

  return (
    <Button
      ref={ref}
      type="button"
      variant={variant}
      size="icon"
      data-slot="voice-input-cancel-button"
      data-state={voiceInput.state}
      inert={voiceInput.isConnected ? undefined : true}
      onClick={(e) => {
        onClick?.(e);
        if (e.defaultPrevented) return;

        void voiceInput.cancel();
      }}
      className={cn(
        buttonSize[voiceInput.size],
        "transition-[opacity,transform,width] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-[0.97] motion-reduce:transform-none motion-reduce:transition-none",
        voiceInput.isConnected
          ? "scale-100 opacity-100"
          : "pointer-events-none w-0 scale-95 opacity-0",
        className,
      )}
      aria-label="Cancel recording"
      aria-hidden={!voiceInput.isConnected}
      {...props}
    >
      <XIcon aria-hidden="true" />
    </Button>
  );
});

VoiceInputCancelButton.displayName = "VoiceInputCancelButton";

export {
  useVoiceInput,
  VoiceInput,
  VoiceInputCancelButton,
  VoiceInputPreview,
  VoiceInputRecordButton,
};
