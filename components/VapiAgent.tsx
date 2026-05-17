"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

import { vapi } from "@/lib/vapi.sdk";
import { interviewer } from "@/constants";
import { createFeedback } from "@/lib/actions/general.action";
import { AgentCards, AgentTranscript } from "@/components/AgentCallUI";

enum CallStatus {
  INACTIVE = "INACTIVE",
  CONNECTING = "CONNECTING",
  ACTIVE = "ACTIVE",
  FINISHED = "FINISHED",
}

interface SavedMessage {
  role: "user" | "system" | "assistant";
  content: string;
}

const VapiAgent = ({
  userName,
  userId,
  interviewId,
  feedbackId,
  type,
  questions,
}: AgentProps) => {
  const router = useRouter();
  const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
  const [messages, setMessages] = useState<SavedMessage[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [lastMessage, setLastMessage] = useState("");
  const feedbackHandled = useRef(false);

  useEffect(() => {
    const onCallStart = () => setCallStatus(CallStatus.ACTIVE);
    const onCallEnd = () => setCallStatus(CallStatus.FINISHED);

    const onMessage = (message: Message) => {
      if (message.type === "transcript" && message.transcriptType === "final") {
        setMessages((prev) => [
          ...prev,
          { role: message.role, content: message.transcript },
        ]);
      }
    };

    vapi.on("call-start", onCallStart);
    vapi.on("call-end", onCallEnd);
    vapi.on("message", onMessage);
    vapi.on("speech-start", () => setIsSpeaking(true));
    vapi.on("speech-end", () => setIsSpeaking(false));

    return () => {
      vapi.off("call-start", onCallStart);
      vapi.off("call-end", onCallEnd);
      vapi.off("message", onMessage);
    };
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      setLastMessage(messages[messages.length - 1].content);
    }

    if (callStatus !== CallStatus.FINISHED || feedbackHandled.current) return;

    feedbackHandled.current = true;

    (async () => {
      if (type === "generate") {
        router.push("/");
        return;
      }

      const { success, feedbackId: id } = await createFeedback({
        interviewId: interviewId!,
        userId: userId!,
        transcript: messages,
        feedbackId,
      });

      router.push(success && id ? `/interview/${interviewId}/feedback` : "/");
    })();
  }, [messages, callStatus, feedbackId, interviewId, router, type, userId]);

  const handleCall = async () => {
    setCallStatus(CallStatus.CONNECTING);
    try {
      if (type === "generate") {
        await vapi.start(process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID!, {
          variableValues: { username: userName, userid: userId },
        });
      } else {
        const formattedQuestions =
          questions?.map((q) => `- ${q}`).join("\n") ?? "";
        await vapi.start(interviewer, {
          variableValues: { questions: formattedQuestions },
        });
      }
    } catch {
      setCallStatus(CallStatus.INACTIVE);
    }
  };

  return (
    <>
      <AgentCards userName={userName} isSpeaking={isSpeaking} />
      <AgentTranscript text={lastMessage} />

      <div className="w-full flex justify-center gap-4">
        {callStatus !== CallStatus.ACTIVE ? (
          <button className="relative btn-call" onClick={handleCall}>
            <span
              className={
                callStatus === CallStatus.CONNECTING
                  ? "absolute animate-ping rounded-full opacity-75 size-full"
                  : "hidden"
              }
            />
            <span className="relative">
              {callStatus === CallStatus.INACTIVE || callStatus === CallStatus.FINISHED
                ? "Call"
                : "Connecting..."}
            </span>
          </button>
        ) : (
          <button
            className="btn-disconnect"
            onClick={() => {
              vapi.stop();
              setCallStatus(CallStatus.FINISHED);
            }}
          >
            End
          </button>
        )}
      </div>
    </>
  );
};

export default VapiAgent;
