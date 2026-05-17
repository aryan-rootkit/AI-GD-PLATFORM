import { ReactNode } from "react";
import { redirect } from "next/navigation";

import { isAuthenticated } from "@/lib/actions/auth.action";
import { shouldSkipAuth } from "@/lib/local-dev";

const AuthLayout = async ({ children }: { children: ReactNode }) => {
  if (shouldSkipAuth()) redirect("/");

  const isUserAuthenticated = await isAuthenticated();
  if (isUserAuthenticated) redirect("/");

  return <div className="auth-layout">{children}</div>;
};

export default AuthLayout;
