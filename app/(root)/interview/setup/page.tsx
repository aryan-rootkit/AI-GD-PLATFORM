import { SetupWizard } from "@/components/platform/setup/SetupWizard";
import { STORAGE_KEYS } from "@/lib/branding";
import { interviewSetupOptions } from "@/lib/data/platform-mock";

export default function InterviewSetupPage() {
  return (
    <SetupWizard
      title="Mock interview setup"
      description="Configure your practice session for a realistic, focused interview experience."
      storageKey={STORAGE_KEYS.interviewSetup}
      continueHref="/interview"
      continueLabel="Start interview"
      fields={[
        { key: "role", label: "Target role", options: interviewSetupOptions.roles },
        {
          key: "difficulty",
          label: "Experience level",
          options: interviewSetupOptions.difficulties,
        },
        {
          key: "companyType",
          label: "Company type",
          options: interviewSetupOptions.companyTypes,
        },
        { key: "topic", label: "Subject / topic", options: interviewSetupOptions.topics },
        {
          key: "style",
          label: "Interview style",
          options: interviewSetupOptions.styles,
        },
      ]}
    />
  );
}
