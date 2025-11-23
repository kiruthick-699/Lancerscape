import React from "react";
import { Card, CardContent } from "@/components/ui/card";

export function DashboardStatCard({ icon, label, value }: { icon?: React.ReactNode; label: string; value: string | number }) {
  return (
    <Card className="flex items-center gap-4 p-4">
      {icon && <span className="text-xl">{icon}</span>}
      <CardContent>
        <div className="text-sm text-muted-foreground">{label}</div>
        <div className="text-lg font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}
