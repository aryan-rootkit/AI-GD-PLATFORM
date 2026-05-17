import { DashboardHub } from "@/components/platform/dashboard/DashboardHub";
import { getCurrentUser } from "@/lib/actions/auth.action";

async function Home() {
  const user = await getCurrentUser();
  const name = user?.name?.split(" ")[0] || "Student";

  return <DashboardHub userName={name} />;
}

export default Home;
