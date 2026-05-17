import Agent from "@/components/Agent";
import { getCurrentUser } from "@/lib/actions/auth.action";

const Page = async () => {
  const user = await getCurrentUser();

  return (
    <div className="platform-page session-page-wrap">
      <Agent
        userName={user?.name!}
        userId={user?.id}
        type="generate"
        role="Software Engineer"
      />
    </div>
  );
};

export default Page;
