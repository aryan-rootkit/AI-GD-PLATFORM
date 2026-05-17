import { ReactNode } from "react";
import { redirect } from "next/navigation";

import { PlatformShell } from "@/components/platform/layout/PlatformShell";
import { isAuthenticated } from "@/lib/actions/auth.action";

const Layout = async ({ children }: { children: ReactNode }) => {
  const isUserAuthenticated = await isAuthenticated();
  if (!isUserAuthenticated) redirect("/sign-in");

  return <PlatformShell>{children}</PlatformShell>;
};

export default Layout;
