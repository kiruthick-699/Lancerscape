'use client';

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ConnectButton } from "@rainbow-me/rainbowkit";

const sidebarItems = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Projects", href: "/projects" },
  { label: "Milestones", href: "/milestones" },
  { label: "Disputes", href: "/disputes" },
  { label: "Settings", href: "/settings" },
];

export function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 border-r bg-card flex flex-col py-6">
        <nav className="flex flex-col divide-y divide-border/30 px-4">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.label} href={item.href} className="py-1">
                <Button
                  variant="ghost"
                  className={cn(
                    "justify-start w-full h-12 px-4 text-base font-medium",
                    isActive && "bg-accent text-accent-foreground"
                  )}
                >
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </nav>
      </aside>
      {/* Main content area */}
      <div className="flex-1 flex flex-col ml-64">
        {/* Top nav */}
        <header className="h-16 border-b bg-card flex items-center justify-between px-6 sticky top-0 z-10">
          <Link href="/" className="font-semibold text-lg hover:text-primary">
            LancerScape
          </Link>
          <div className="flex items-center gap-4">
            <ConnectButton />
            <ThemeToggle />
          </div>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
