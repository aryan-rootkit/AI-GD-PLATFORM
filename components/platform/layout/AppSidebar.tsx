"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { AthenaLogo } from "@/components/branding/AthenaLogo";
import { ATHENA_TAGLINE } from "@/lib/branding";

const navItems = [
  { href: "/", label: "Home", icon: "⌂" },
  { href: "/interview/setup", label: "Mock Interview", icon: "◉" },
  { href: "/gd/setup", label: "Group Discussion", icon: "◎" },
  { href: "/history", label: "History", icon: "◷" },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="platform-sidebar">
      <Link href="/" className="block px-2 mb-8">
        <AthenaLogo size="sm" />
        <p className="text-[10px] text-platform-muted mt-2 leading-tight max-w-[140px]">
          {ATHENA_TAGLINE}
        </p>
      </Link>

      <nav className="flex flex-col gap-1">
        {navItems.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn("platform-nav-item", active && "platform-nav-active")}
            >
              <span className="text-base opacity-70">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto pt-6 px-2 text-xs text-platform-muted">
        <p>AI-powered preparation</p>
        <p className="mt-1">for colleges & students</p>
      </div>
    </aside>
  );
}
