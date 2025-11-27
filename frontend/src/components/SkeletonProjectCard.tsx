import React from "react";
import { Card } from "@/components/ui/card";

export function SkeletonProjectCard() {
  return (
    <Card className="relative overflow-hidden">
      <div className="animate-pulse">
        {/* Title bar */}
        <div className="h-6 bg-muted rounded w-3/4 mb-3"></div>
        
        {/* Subtitle bar */}
        <div className="h-4 bg-muted rounded w-1/2 mb-4"></div>
        
        {/* Stats placeholder */}
        <div className="flex gap-4 mt-4">
          <div className="h-4 bg-muted rounded w-20"></div>
          <div className="h-4 bg-muted rounded w-24"></div>
        </div>
      </div>
      
      {/* Shimmer effect */}
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
    </Card>
  );
}
