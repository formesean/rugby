"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Profile", href: "/account/profile" },
  { label: "Password", href: "/account/password" },
  { label: "Sessions", href: "/account/sessions" },
];

export function AccountNav() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1 border-b border-border pb-0">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "px-3 py-2 text-sm font-medium transition-colors border-b-2 -mb-px",
            pathname === item.href
              ? "border-foreground text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground",
          )}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
