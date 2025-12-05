"use client";

import {
  Snippet,
  SnippetCopyButton,
  SnippetHeader,
  SnippetTabsContent,
  SnippetTabsList,
  SnippetTabsTrigger,
} from "@/components/kibo-ui/snippet";
import { BoxIcon, PackageIcon, RocketIcon, TerminalIcon } from "lucide-react";
import { useState } from "react";

const commands = [
  {
    label: "pnpm",
    icon: BoxIcon,
    code:
      "pnpm dlx shadcn@latest add https://voice-input.cristoper.dev/r/voice-input.json",
  },
  {
    label: "npm",
    icon: PackageIcon,
    code:
      "npx shadcn@latest add https://voice-input.cristoper.dev/r/voice-input.json",
  },
  {
    label: "yarn",
    icon: RocketIcon,
    code:
      "yarn dlx shadcn@latest add https://voice-input.cristoper.dev/r/voice-input.json",
  },
  {
    label: "bun",
    icon: TerminalIcon,
    code:
      "bunx shadcn@latest add https://voice-input.cristoper.dev/r/voice-input.json",
  },
];

export function InstallSnippet() {
  const [value, setValue] = useState(commands[0].label);
  const active = commands.find((cmd) => cmd.label === value) ?? commands[0];

  return (
    <Snippet onValueChange={setValue} value={value}>
      <SnippetHeader>
        <SnippetTabsList>
          {commands.map((command) => (
            <SnippetTabsTrigger key={command.label} value={command.label}>
              <command.icon size={14} />
              <span>{command.label}</span>
            </SnippetTabsTrigger>
          ))}
        </SnippetTabsList>
        <SnippetCopyButton value={active.code} aria-label={`Copy ${active.label} command`} />
      </SnippetHeader>

      {commands.map((command) => (
        <SnippetTabsContent key={command.label} value={command.label}>
          {command.code}
        </SnippetTabsContent>
      ))}
    </Snippet>
  );
}

