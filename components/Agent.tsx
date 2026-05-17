"use client";

import { useVoicePipelineClient } from "@/lib/ai/config";
import LocalVoiceAgent from "@/components/LocalVoiceAgent";
import VapiAgent from "@/components/VapiAgent";

const Agent = (props: AgentProps) => {
  if (useVoicePipelineClient()) {
    return <LocalVoiceAgent {...props} />;
  }
  return <VapiAgent {...props} />;
};

export default Agent;
