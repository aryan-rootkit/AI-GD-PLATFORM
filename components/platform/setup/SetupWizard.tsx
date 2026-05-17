"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GlassCard } from "@/components/platform/ui/GlassCard";
import { cn } from "@/lib/utils";

export interface SetupField {
  key: string;
  label: string;
  options: readonly string[] | number[];
}

interface SetupWizardProps {
  title: string;
  description: string;
  fields: SetupField[];
  storageKey: string;
  continueHref: string;
  continueLabel?: string;
}

export function SetupWizard({
  title,
  description,
  fields,
  storageKey,
  continueHref,
  continueLabel = "Begin session",
}: SetupWizardProps) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [values, setValues] = useState<Record<string, string | number>>(() => {
    const init: Record<string, string | number> = {};
    fields.forEach((f) => {
      init[f.key] = f.options[0];
    });
    return init;
  });

  const current = fields[step];
  const isLast = step === fields.length - 1;

  const handleContinue = () => {
    if (!isLast) {
      setStep((s) => s + 1);
      return;
    }
    sessionStorage.setItem(storageKey, JSON.stringify(values));
    router.push(continueHref);
  };

  return (
    <div className="platform-page max-w-2xl mx-auto">
      <p className="platform-eyebrow">Guided setup</p>
      <h1 className="platform-title">{title}</h1>
      <p className="platform-subtitle mb-8">{description}</p>

      <div className="flex gap-2 mb-8">
        {fields.map((_, i) => (
          <span
            key={i}
            className={cn(
              "h-1 flex-1 rounded-full transition-colors",
              i <= step ? "bg-platform-accent" : "bg-platform-border"
            )}
          />
        ))}
      </div>

      <GlassCard className="!p-8">
        <p className="text-xs text-platform-muted mb-2">
          Step {step + 1} of {fields.length}
        </p>
        <h2 className="text-lg font-medium text-white mb-6">{current.label}</h2>
        <div className="grid gap-2">
          {current.options.map((opt) => {
            const val = String(opt);
            const selected = String(values[current.key]) === val;
            return (
              <button
                key={val}
                type="button"
                onClick={() =>
                  setValues((v) => ({
                    ...v,
                    [current.key]: typeof opt === "number" ? opt : val,
                  }))
                }
                className={cn(
                  "setup-option",
                  selected && "setup-option-selected"
                )}
              >
                {val}
              </button>
            );
          })}
        </div>

        <div className="flex gap-3 mt-8">
          {step > 0 && (
            <button
              type="button"
              className="platform-btn-ghost flex-1"
              onClick={() => setStep((s) => s - 1)}
            >
              Back
            </button>
          )}
          <button
            type="button"
            className="platform-btn-primary flex-1"
            onClick={handleContinue}
          >
            {isLast ? continueLabel : "Continue"}
          </button>
        </div>
      </GlassCard>
    </div>
  );
}
