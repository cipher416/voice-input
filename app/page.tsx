"use client";
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
    <div className="max-w-3xl mx-auto flex flex-col min-h-svh px-4 py-8 gap-8">
      <div className="flex items-center justify-between gap-3">
        <h1 className="font-semibold text-2xl">Voice Input</h1>
        <ThemeSwitcher className="shadow-sm" />
      </div>
      <Button asChild variant="link" className="px-0 w-fit h-auto">
        <Link
          href="https://github.com/cipher416/voice-input/"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 text-sm"
        >
          <Image
            src={GithubIcon}
            alt="GitHub"
            width={16}
            height={16}
            className="size-4 filter dark:invert"
            priority
          />
          <span>github.com/cipher416/voice-input</span>
        </Link>
      </Button>

      <InstallSnippet />

      <div className="flex flex-col gap-4 border rounded-lg p-4 relative">
        <WebSpeechDemo />
        <VoiceInputCodeExample />
      </div>
    </div>
  );
}
