import Agent from "@/components/Agent";
import { getCurrentUser } from "@/lib/actions/auth.action";

export default async function GdSessionPage() {
  const user = await getCurrentUser();

  return (
    <div className="platform-page session-page-wrap">
      <Agent
        userName={user?.name!}
        userId={user?.id}
        type="generate"
        role="Group Discussion"
      />
    </div>
  );
}
