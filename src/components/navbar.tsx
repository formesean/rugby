"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  BookOpen,
  Code2,
  KeyRound,
  LayoutDashboard,
  Menu,
  MonitorSmartphone,
  User,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { signOut } from "@/lib/auth/client";
import { cn } from "@/lib/utils";

type Props = {
  role: string | null;
  isAuthenticated: boolean;
};

const adminItems = [
  {
    icon: LayoutDashboard,
    title: "Dashboard",
    description: "Auth events, active sessions, and user sign-up trends.",
    href: "/dashboard",
  },
  {
    icon: Users,
    title: "Users",
    description: "Manage user roles and view all registered accounts.",
    href: "/dashboard/users",
  },
];

const devItems = [
  {
    icon: Code2,
    title: "API Reference",
    description: "Interactive Scalar docs for every endpoint in this app.",
    href: "/api/docs",
    external: true,
  },
  {
    icon: BookOpen,
    title: "Guides",
    description: "Step-by-step guides for extending the template.",
    href: "/developers/guides",
  },
];

const settingsItems = [
  {
    icon: User,
    title: "Profile",
    description: "Update your display name and account details.",
    href: "/account/profile",
  },
  {
    icon: KeyRound,
    title: "Password",
    description: "Change your account password.",
    href: "/account/password",
  },
  {
    icon: MonitorSmartphone,
    title: "Sessions",
    description: "Manage devices currently signed in to your account.",
    href: "/account/sessions",
  },
];

function DropdownContent({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

type NavItem = {
  icon: React.ElementType;
  title: string;
  description: string;
  href: string;
  external?: boolean;
};

function isItemActive(item: NavItem, pathname: string, siblings: NavItem[]): boolean {
  if (item.external) return false;
  if (pathname === item.href) return true;
  if (!pathname.startsWith(`${item.href}/`)) return false;
  return !siblings.some(
    (s) =>
      !s.external &&
      s.href.length > item.href.length &&
      (pathname === s.href || pathname.startsWith(`${s.href}/`)),
  );
}

function isGroupActive(items: NavItem[], pathname: string): boolean {
  return items.some((i) => isItemActive(i, pathname, items));
}

const ACTIVE_TRIGGER = "bg-muted! text-foreground font-semibold ring-1 ring-border";

function MenuGrid({ items, pathname }: { items: NavItem[]; pathname: string }) {
  return (
    <div className="grid grid-cols-2 gap-1 p-2">
      {items.map((item) => {
        const active = isItemActive(item, pathname, items);
        const className = cn(
          "group flex flex-col gap-1.5 rounded-2xl p-3 transition-colors outline-none",
          active ? "bg-muted" : "hover:bg-muted focus:bg-muted",
        );
        const inner = (
          <>
            <item.icon
              className={cn(
                "size-5 transition-colors",
                active ? "text-foreground" : "text-muted-foreground group-hover:text-foreground",
              )}
            />
            <p className="text-sm font-medium text-foreground">{item.title}</p>
            <p className="text-xs leading-snug text-muted-foreground">{item.description}</p>
          </>
        );
        return (
          <NavigationMenuLink asChild key={item.title}>
            {item.external ? (
              <a href={item.href} target="_blank" rel="noopener noreferrer" className={className}>
                {inner}
              </a>
            ) : (
              <Link href={item.href} className={className}>
                {inner}
              </Link>
            )}
          </NavigationMenuLink>
        );
      })}
    </div>
  );
}

export function Navbar({ role, isAuthenticated }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isAdmin = role === "admin";
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  async function handleSignOut() {
    await signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <motion.header
      initial={{ y: -16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="sticky top-0 z-50 w-full border-b border-border bg-background"
    >
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        {/* Logo */}
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 text-sm font-semibold text-foreground"
        >
          <div className="flex size-7 items-center justify-center rounded-sm bg-foreground text-background text-xs font-bold">
            R
          </div>
          Rugby
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center">
          <NavigationMenu viewport={false}>
            <NavigationMenuList className="gap-0">
              {isAdmin && (
                <NavigationMenuItem>
                  <NavigationMenuTrigger
                    className={cn(isGroupActive(adminItems, pathname) && ACTIVE_TRIGGER)}
                  >
                    Admin
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <DropdownContent>
                      <div className="w-[400px]">
                        <MenuGrid items={adminItems} pathname={pathname} />
                      </div>
                    </DropdownContent>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              )}

              <NavigationMenuItem>
                <NavigationMenuTrigger
                  className={cn(isGroupActive(devItems, pathname) && ACTIVE_TRIGGER)}
                >
                  Developers
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <DropdownContent>
                    <div className="w-[400px]">
                      <MenuGrid items={devItems} pathname={pathname} />
                    </div>
                  </DropdownContent>
                </NavigationMenuContent>
              </NavigationMenuItem>

              {isAuthenticated && (
                <NavigationMenuItem>
                  <NavigationMenuTrigger
                    className={cn(isGroupActive(settingsItems, pathname) && ACTIVE_TRIGGER)}
                  >
                    Settings
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <DropdownContent>
                      <div className="w-[460px]">
                        <MenuGrid items={settingsItems} pathname={pathname} />
                      </div>
                    </DropdownContent>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              )}
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* Desktop right */}
        <div className="hidden md:flex shrink-0 items-center gap-2">
          {isAuthenticated ? (
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              Log out
            </Button>
          ) : (
            <>
              <Button
                variant="ghost"
                size="sm"
                asChild
                className={cn(isActive("/login") && "bg-muted")}
              >
                <Link href="/login">Login</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/register">Sign Up</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <div className="md:hidden">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open menu">
                <AnimatePresence mode="wait" initial={false}>
                  {mobileOpen ? (
                    <motion.span
                      key="close"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.15 }}
                    >
                      <X className="size-5" />
                    </motion.span>
                  ) : (
                    <motion.span
                      key="open"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.15 }}
                    >
                      <Menu className="size-5" />
                    </motion.span>
                  )}
                </AnimatePresence>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64 pt-10">
              <SheetTitle className="sr-only">Navigation</SheetTitle>
              <nav className="flex flex-col gap-1">
                {isAdmin && (
                  <>
                    <p className="px-3 pb-1 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Admin
                    </p>
                    {adminItems.map((item, i) => (
                      <motion.div
                        key={item.href}
                        initial={{ x: 16, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: i * 0.04, duration: 0.18 }}
                      >
                        <Link
                          href={item.href}
                          onClick={() => setMobileOpen(false)}
                          className={cn(
                            "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                            isItemActive(item, pathname, adminItems)
                              ? "bg-muted text-foreground font-medium"
                              : "text-muted-foreground hover:bg-muted hover:text-foreground",
                          )}
                        >
                          <item.icon className="size-4" />
                          {item.title}
                        </Link>
                      </motion.div>
                    ))}
                  </>
                )}

                {isAdmin && (
                  <motion.div
                    initial={{ x: 16, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.1, duration: 0.18 }}
                    className="my-2 border-t border-border"
                  />
                )}
                <p className="px-3 pb-1 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Developers
                </p>
                {devItems.map((item, i) => {
                  const mobileClass = cn(
                    "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                    isItemActive(item, pathname, devItems)
                      ? "bg-muted text-foreground font-medium"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  );
                  return (
                    <motion.div
                      key={item.href}
                      initial={{ x: 16, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: (isAdmin ? 0.12 : 0) + i * 0.04, duration: 0.18 }}
                    >
                      {item.external ? (
                        <a
                          href={item.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => setMobileOpen(false)}
                          className={mobileClass}
                        >
                          <item.icon className="size-4" />
                          {item.title}
                        </a>
                      ) : (
                        <Link
                          href={item.href}
                          onClick={() => setMobileOpen(false)}
                          className={mobileClass}
                        >
                          <item.icon className="size-4" />
                          {item.title}
                        </Link>
                      )}
                    </motion.div>
                  );
                })}

                {/* Settings (authenticated) */}
                {isAuthenticated && (
                  <>
                    <motion.div
                      initial={{ x: 16, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.18, duration: 0.18 }}
                      className="my-2 border-t border-border"
                    />
                    <p className="px-3 pb-1 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Settings
                    </p>
                    {settingsItems.map((item, i) => (
                      <motion.div
                        key={item.href}
                        initial={{ x: 16, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.2 + i * 0.04, duration: 0.18 }}
                      >
                        <Link
                          href={item.href}
                          onClick={() => setMobileOpen(false)}
                          className={cn(
                            "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                            isItemActive(item, pathname, settingsItems)
                              ? "bg-muted text-foreground font-medium"
                              : "text-muted-foreground hover:bg-muted hover:text-foreground",
                          )}
                        >
                          <item.icon className="size-4" />
                          {item.title}
                        </Link>
                      </motion.div>
                    ))}
                  </>
                )}

                {/* Auth */}
                {isAuthenticated ? (
                  <>
                    <motion.div
                      initial={{ x: 16, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.32, duration: 0.18 }}
                      className="my-2 border-t border-border"
                    />
                    <motion.div
                      initial={{ x: 16, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.36, duration: 0.18 }}
                    >
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start px-3"
                        onClick={() => {
                          setMobileOpen(false);
                          handleSignOut();
                        }}
                      >
                        Log out
                      </Button>
                    </motion.div>
                  </>
                ) : (
                  <>
                    <motion.div
                      initial={{ x: 16, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.24, duration: 0.18 }}
                    >
                      <Link
                        href="/login"
                        onClick={() => setMobileOpen(false)}
                        className={cn(
                          "block rounded-md px-3 py-2 text-sm transition-colors",
                          isActive("/login")
                            ? "bg-muted text-foreground font-medium"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground",
                        )}
                      >
                        Login
                      </Link>
                    </motion.div>
                    <motion.div
                      initial={{ x: 16, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.28, duration: 0.18 }}
                    >
                      <Button className="mt-1 w-full" size="sm" asChild>
                        <Link href="/register" onClick={() => setMobileOpen(false)}>
                          Sign Up
                        </Link>
                      </Button>
                    </motion.div>
                  </>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </motion.header>
  );
}
