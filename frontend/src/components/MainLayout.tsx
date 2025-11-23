import React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";

const sidebarItems = [
  { label: "Dashboard" },
  { label: "Projects" },
  { label: "Milestones" },
  { label: "Disputes" },
  { label: "Settings" },
];

export function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-56 border-r bg-card flex flex-col py-6">
        <nav className="flex flex-col gap-2 px-4">
          {sidebarItems.map((item) => (
            <Button
              key={item.label}
              variant="ghost"
              className="justify-start w-full"
            >
              {item.label}
            </Button>
          ))}
        </nav>
      </aside>
      {/* Main content area */}
      <div className="flex-1 flex flex-col ml-56">
        {/* Top nav */}
        <header className="h-16 border-b bg-card flex items-center px-6 sticky top-0 z-10">
          <span className="font-semibold text-lg">LancerScape</span>
          <ThemeToggle />
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
