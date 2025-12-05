import { VoiceInputCodeExample } from "@/components/voice-input-code-example";
import { WebSpeechDemo } from "@/components/web-speech-demo";

export default function Home() {
  return (
    <div className="max-w-3xl mx-auto flex flex-col min-h-svh px-4 py-8 gap-8">
      <h1 className="font-semibold text-2xl">Voice Input</h1>
      <div className="flex flex-col gap-4 border rounded-lg p-4 relative">
        <WebSpeechDemo />
        <VoiceInputCodeExample />
      </div>
    </div>
  );
}
