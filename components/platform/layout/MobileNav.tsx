"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const items = [
  { href: "/", label: "Home" },
  { href: "/interview/setup", label: "Interview" },
  { href: "/gd/setup", label: "GD" },
  { href: "/history", label: "History" },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 border-t border-[#252830] bg-[#0a0b0f]/95 backdrop-blur flex justify-around py-2 px-2">
      {items.map((item) => {
        const active =
          pathname === item.href ||
          (item.href !== "/" && pathname.startsWith(item.href));
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "text-[10px] px-2 py-1 rounded-lg",
              active ? "text-[#9b93f0]" : "text-[#8b92a8]"
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
