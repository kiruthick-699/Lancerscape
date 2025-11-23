import React from "react";
import { Card } from "@/components/ui/card";

export function SectionCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <Card className={className}>{children}</Card>
  );
}
