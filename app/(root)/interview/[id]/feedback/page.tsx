import dayjs from "dayjs";
import { redirect } from "next/navigation";

import { SessionAnalyticsReport } from "@/components/platform/analytics/SessionAnalyticsReport";
import {
  getFeedbackByInterviewId,
  getInterviewById,
} from "@/lib/actions/general.action";
import { getCurrentUser } from "@/lib/actions/auth.action";

const Feedback = async ({ params }: RouteParams) => {
  const { id } = await params;
  const user = await getCurrentUser();

  const interview = await getInterviewById(id);
  if (!interview) redirect("/");

  const feedback = await getFeedbackByInterviewId({
    interviewId: id,
    userId: user?.id!,
  });

  return (
    <SessionAnalyticsReport
      role={interview.role}
      interviewId={id}
      totalScore={feedback?.totalScore}
      finalAssessment={feedback?.finalAssessment}
      strengths={feedback?.strengths}
      areasForImprovement={feedback?.areasForImprovement}
      categoryScores={feedback?.categoryScores}
      createdAt={
        feedback?.createdAt
          ? dayjs(feedback.createdAt).format("MMM D, YYYY h:mm A")
          : undefined
      }
    />
  );
};

export default Feedback;
