import { SetupWizard } from "@/components/platform/setup/SetupWizard";
import { STORAGE_KEYS } from "@/lib/branding";
import { gdSetupOptions } from "@/lib/data/platform-mock";

export default function GdSetupPage() {
  return (
    <SetupWizard
      title="Group discussion setup"
      description="Choose your GD configuration before joining a structured practice room."
      storageKey={STORAGE_KEYS.gdSetup}
      continueHref="/gd/session"
      continueLabel="Join discussion"
      fields={[
        { key: "topic", label: "Discussion topic", options: gdSetupOptions.topics },
        {
          key: "participants",
          label: "Participant count",
          options: gdSetupOptions.participantCounts,
        },
        {
          key: "moderator",
          label: "AI moderator",
          options: ["Enabled", "Disabled"],
        },
        {
          key: "evaluationMode",
          label: "Evaluation mode",
          options: gdSetupOptions.evaluationModes,
        },
      ]}
    />
  );
}
