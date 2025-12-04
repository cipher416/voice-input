"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { MicIcon, SquareIcon, XIcon } from "lucide-react";
import { motion } from "motion/react";
import * as React from "react";

import { cn } from "@/lib/utils";
import { Button } from "./button";
import { Skeleton } from "./skeleton";

const buttonVariants = cva("!px-0", {
  variants: {
    size: {
      default: "h-9 w-9",
      sm: "h-8 w-8",
      lg: "h-10 w-10",
    },
  },
  defaultVariants: {
    size: "default",
  },
});

type ButtonSize = VariantProps<typeof buttonVariants>["size"];

export interface VoiceInputData {
  /** The current partial (in-progress) transcript */
  partialTranscript: string;
  /** Array of all committed (finalized) transcripts */
  committedTranscripts: string[];
  /** Full transcript combining committed and partial transcripts */
  transcript: string;
}

interface VoiceInputContextValue {
  isConnected: boolean;
  isConnecting: boolean;
  transcript: string;
  partialTranscript: string;
  committedTranscripts: string[];
  error: string | null;
  start: () => Promise<void> | void;
  stop: () => Promise<void> | void;
  cancel: () => Promise<void> | void;
  size: ButtonSize;
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

  if (committed && partial) {
    return `${committed} ${partial}`;
  }
  return committed || partial;
}

export interface VoiceInputProps {
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
   * Additional CSS classes for the root container
   */
  className?: string;

  /**
   * Size variant for the component buttons
   * @default "default"
   */
  size?: ButtonSize;
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
      committedTranscripts = [],
      transcript,
      error = null,
      onStart,
      onStop,
      onCancel,
    },
    ref,
  ) {
    const noop = React.useCallback(() => {}, []);

    const computedData = React.useMemo(() => {
      const safeCommitted = committedTranscripts ?? [];
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
        isConnected,
        isConnecting,
        start: onStart ?? noop,
        stop: onStop ?? noop,
        cancel: onCancel ?? noop,
        error: error ?? null,
        size,
        ...computedData,
      }),
      [
        isConnected,
        isConnecting,
        onStart,
        onStop,
        onCancel,
        error,
        size,
        computedData,
        noop,
      ],
    );

    return (
      <VoiceInputContext.Provider value={contextValue}>
        <div
          ref={ref}
          className={cn(
            "relative inline-flex items-center overflow-hidden rounded-md transition-all duration-200",
            isConnected
              ? "bg-background dark:bg-muted shadow-[inset_0_0_0_1px_var(--color-input),0_1px_2px_0_rgba(0,0,0,0.05)]"
              : "",
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
      onClick={(e) => {
        if (voiceInput.isConnected) {
          voiceInput.stop();
        } else {
          voiceInput.start();
        }
        onClick?.(e);
      }}
      disabled={disabled ?? voiceInput.isConnecting}
      className={cn(
        buttonVariants({ size: voiceInput.size }),
        "relative flex items-center justify-center transition-all",
        voiceInput.isConnected && "scale-[80%]",
        className,
      )}
      aria-label={voiceInput.isConnected ? "Stop recording" : "Start recording"}
      {...props}
    >
      <Skeleton
        className={cn(
          "absolute h-4 w-4 rounded-full transition-all duration-200",
          voiceInput.isConnecting
            ? "bg-primary scale-90"
            : "scale-[60%] bg-transparent",
        )}
      />
      <SquareIcon
        className={cn(
          "text-destructive absolute h-4 w-4 fill-current transition-all duration-200",
          !voiceInput.isConnecting && voiceInput.isConnected
            ? "scale-100 opacity-100"
            : "scale-[60%] opacity-0",
        )}
      />
      <MicIcon
        className={cn(
          "absolute h-4 w-4 transition-all duration-200",
          !voiceInput.isConnecting && !voiceInput.isConnected
            ? "scale-100 opacity-100"
            : "scale-[60%] opacity-0",
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
}

/**
 * Displays the current transcript with a placeholder when empty.
 * Only visible when actively recording.
 */
const VoiceInputPreview = React.forwardRef<
  HTMLDivElement,
  VoiceInputPreviewProps
>(function VoiceInputPreview(
  { className, placeholder = "Listening...", ...props },
  ref,
) {
  const voiceInput = useVoiceInput();

  const displayText = voiceInput.transcript || placeholder;
  const showPlaceholder = !voiceInput.transcript.trim();

  return (
    <div
      ref={ref}
      inert={voiceInput.isConnected ? undefined : true}
      className={cn(
        "relative self-stretch text-sm transition-[opacity,transform,width] duration-200 ease-out",
        showPlaceholder
          ? "text-muted-foreground italic"
          : "text-muted-foreground",
        voiceInput.isConnected ? "w-28 opacity-100" : "w-0 opacity-0",
        className,
      )}
      title={displayText}
      aria-hidden={!voiceInput.isConnected}
      {...props}
    >
      <div className="absolute inset-y-0 -right-1 -left-1 [mask-image:linear-gradient(to_right,transparent,black_10px,black_calc(100%-10px),transparent)]">
        <motion.p
          key="text"
          layout="position"
          className="absolute top-0 right-0 bottom-0 flex h-full min-w-full items-center px-1 whitespace-nowrap"
        >
          {displayText}
        </motion.p>
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
      inert={voiceInput.isConnected ? undefined : true}
      onClick={(e) => {
        voiceInput.cancel();
        onClick?.(e);
      }}
      className={cn(
        buttonVariants({ size: voiceInput.size }),
        "transition-[opacity,transform,width] duration-200 ease-out",
        voiceInput.isConnected
          ? "scale-[80%] opacity-100"
          : "pointer-events-none w-0 scale-100 opacity-0",
        className,
      )}
      aria-label="Cancel recording"
      {...props}
    >
      <XIcon className="h-3 w-3" />
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
