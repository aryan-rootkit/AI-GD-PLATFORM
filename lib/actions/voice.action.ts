"use server";

import { db } from "@/firebase/admin";

export interface VoiceEvaluationPayload {
  totalScore: number;
  categoryScores: Array<{ name: string; score: number; comment: string }>;
  strengths: string[];
  areasForImprovement: string[];
  finalAssessment: string;
}

export async function saveVoiceFeedback(params: {
  interviewId: string;
  userId: string;
  evaluation: VoiceEvaluationPayload;
  transcript: { role: string; content: string }[];
  feedbackId?: string;
}) {
  const { interviewId, userId, evaluation, transcript, feedbackId } = params;

  try {
    const feedback = {
      interviewId,
      userId,
      totalScore: evaluation.totalScore,
      categoryScores: evaluation.categoryScores,
      strengths: evaluation.strengths,
      areasForImprovement: evaluation.areasForImprovement,
      finalAssessment: evaluation.finalAssessment,
      transcript,
      source: "voice-pipeline",
      createdAt: new Date().toISOString(),
    };

    const feedbackRef = feedbackId
      ? db.collection("feedback").doc(feedbackId)
      : db.collection("feedback").doc();

    await feedbackRef.set(feedback);

    return { success: true, feedbackId: feedbackRef.id };
  } catch (error) {
    console.error("saveVoiceFeedback error:", error);
    return { success: false };
  }
}
