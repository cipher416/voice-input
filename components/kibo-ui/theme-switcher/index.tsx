"use client";

import { MonitorIcon, MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { useState, useSyncExternalStore } from "react";

import { cn } from "@/lib/utils";

type ThemeValue = "light" | "dark" | "system";

const themes = [
  {
    key: "system",
    icon: MonitorIcon,
    label: "System theme",
  },
  {
    key: "light",
    icon: SunIcon,
    label: "Light theme",
  },
  {
    key: "dark",
    icon: MoonIcon,
    label: "Dark theme",
  },
] as const;

const subscribeToHydration = () => () => {};

function isThemeValue(value: string | undefined): value is ThemeValue {
  return value === "light" || value === "dark" || value === "system";
}

export type ThemeSwitcherProps = {
  value?: ThemeValue;
  onChange?: (theme: ThemeValue) => void;
  defaultValue?: ThemeValue;
  className?: string;
};

export function ThemeSwitcher({
  value,
  onChange,
  defaultValue = "system",
  className,
}: ThemeSwitcherProps) {
  const { theme: providerTheme, setTheme: setProviderTheme } = useTheme();
  const [shouldAnimate, setShouldAnimate] = useState(false);
  const mounted = useSyncExternalStore(
    subscribeToHydration,
    () => true,
    () => false,
  );
  const selectedTheme =
    value ??
    (mounted && isThemeValue(providerTheme) ? providerTheme : defaultValue);
  const selectedIndex = themes.findIndex(({ key }) => key === selectedTheme);

  const handleThemeChange = (nextTheme: ThemeValue) => {
    setShouldAnimate(true);
    onChange?.(nextTheme);
    setProviderTheme(nextTheme);
  };

  return (
    <div
      role="group"
      aria-label="Color theme"
      className={cn(
        "bg-background ring-border relative isolate flex h-9 shrink-0 rounded-full p-1 ring-1",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "bg-secondary pointer-events-none absolute top-1 left-1 size-7 rounded-full shadow-xs",
          shouldAnimate &&
            "transition-transform duration-200 ease-[cubic-bezier(0.77,0,0.175,1)] motion-reduce:transition-none",
        )}
        style={{ transform: `translateX(${Math.max(selectedIndex, 0) * 100}%)` }}
      />

      {themes.map(({ key, icon: Icon, label }) => {
        const isActive = selectedTheme === key;

        return (
          <button
            key={key}
            type="button"
            aria-label={label}
            aria-pressed={isActive}
            title={label}
            disabled={!mounted}
            onClick={() => handleThemeChange(key)}
            className={cn(
              "focus-visible:ring-ring relative z-10 grid size-7 place-items-center rounded-full outline-none transition-[color,transform] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-[0.94] focus-visible:ring-[3px] motion-reduce:transform-none motion-reduce:transition-none",
              isActive ? "text-foreground" : "text-muted-foreground",
            )}
          >
            <Icon aria-hidden="true" className="size-4" />
          </button>
        );
      })}
    </div>
  );
}
