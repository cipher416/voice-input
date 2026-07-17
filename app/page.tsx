import { InstallSnippet } from "@/components/install-snippet";
import { ThemeSwitcher } from "@/components/kibo-ui/theme-switcher";
import { Button } from "@/components/ui/button";
import { VoiceInputCodeExample } from "@/components/voice-input-code-example";
import { WebSpeechDemo } from "@/components/web-speech-demo";
import Image from "next/image";
import Link from "next/link";
import GithubIcon from "./assets/github.svg";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-svh max-w-3xl flex-col gap-8 px-4 py-8 sm:py-12">
      <header className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold">Voice Input</h1>
          <p className="text-muted-foreground max-w-lg text-sm">
            A composable recording control for any browser speech provider.
          </p>
        </div>
        <ThemeSwitcher className="shadow-sm" />
      </header>

      <Button asChild variant="link" className="px-0 w-fit h-auto">
        <Link
          href="https://github.com/cipher416/voice-input/"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 text-sm"
        >
          <Image
            src={GithubIcon}
            alt=""
            width={16}
            height={16}
            className="size-4 filter dark:invert"
          />
          <span>github.com/cipher416/voice-input</span>
        </Link>
      </Button>

      <section aria-labelledby="install-heading" className="flex flex-col gap-3">
        <div>
          <h2 id="install-heading" className="text-sm font-medium">
            Install
          </h2>
          <p className="text-muted-foreground text-xs">
            Add the component and its shadcn dependencies in one command.
          </p>
        </div>
        <InstallSnippet />
      </section>

      <section aria-label="Voice input demo" className="flex flex-col gap-6">
        <WebSpeechDemo />
        <VoiceInputCodeExample />
      </section>
    </main>
  );
}
