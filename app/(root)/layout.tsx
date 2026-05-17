import { ReactNode } from "react";
import { redirect } from "next/navigation";

import { PlatformShell } from "@/components/platform/layout/PlatformShell";
import {
  ensureAuthSession,
  isAuthenticated,
} from "@/lib/actions/auth.action";
import { shouldSkipAuth } from "@/lib/local-dev";

const Layout = async ({ children }: { children: ReactNode }) => {
  if (shouldSkipAuth()) {
    await ensureAuthSession();
  } else {
    const isUserAuthenticated = await isAuthenticated();
    if (!isUserAuthenticated) redirect("/sign-in");
  }

  return <PlatformShell>{children}</PlatformShell>;
};

export default Layout;
