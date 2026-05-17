"use client";

import { ReactNode } from "react";
import { AppSidebar } from "@/components/platform/layout/AppSidebar";
import { MobileNav } from "@/components/platform/layout/MobileNav";

export function PlatformShell({ children }: { children: ReactNode }) {
  return (
    <div className="platform-shell">
      <AppSidebar />
      <main className="platform-main pb-20 md:pb-8">{children}</main>
      <MobileNav />
    </div>
  );
}
