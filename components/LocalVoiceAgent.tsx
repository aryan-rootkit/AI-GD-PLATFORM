"use client";

import { SessionExperience } from "@/components/platform/session/SessionExperience";

const LocalVoiceAgent = (props: AgentProps) => {
  const mode = props.type === "generate" ? "gd" : "interview";
  return <SessionExperience {...props} mode={mode} />;
};

export default LocalVoiceAgent;
