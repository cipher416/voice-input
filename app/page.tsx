import { ThemeSwitcher } from "@/components/kibo-ui/theme-switcher";
import { VoiceInputCodeExample } from "@/components/voice-input-code-example";
import { WebSpeechDemo } from "@/components/web-speech-demo";
import { Github } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="max-w-3xl mx-auto flex flex-col min-h-svh px-4 py-8 gap-8">
      <div className="flex items-center justify-between gap-3">
        <h1 className="font-semibold text-2xl">Voice Input</h1>
        <ThemeSwitcher className="shadow-sm" />
      </div>
      <Button asChild>
        
      <Link
        href="https://github.com/cipher416/voice-input/"
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-2 w-fit rounded-full border px-3 py-1 text-sm text-muted-foreground hover:text-foreground hover:border-foreground transition"
      >
        <Github className="h-4 w-4" aria-hidden="true" />
        <span>github.com/cipher416/voice-input</span>
      </Button>
      </Link>
      <div className="flex flex-col gap-4 border rounded-lg p-4 relative">
        <WebSpeechDemo />
        <VoiceInputCodeExample />
      </div>
    </div>
  );
}
