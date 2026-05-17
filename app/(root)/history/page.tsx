import { HistoryPage } from "@/components/platform/history/HistoryPage";
import { getCurrentUser } from "@/lib/actions/auth.action";
import { getInterviewsByUserId } from "@/lib/actions/general.action";

export default async function HistoryRoute() {
  const user = await getCurrentUser();
  const interviews = user?.id
    ? await getInterviewsByUserId(user.id)
    : [];

  return <HistoryPage interviews={interviews ?? []} />;
}
