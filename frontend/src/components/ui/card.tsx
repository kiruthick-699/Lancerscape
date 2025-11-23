import * as React from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Card({ className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "bg-card border rounded-lg shadow-sm p-6",
        className
      )}
      {...props}
    />
  );
}

export function CardTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-lg font-semibold mb-2">{children}</h2>;
}

export function CardContent({ children }: { children: React.ReactNode }) {
  return <div className="mb-4">{children}</div>;
}

export function CardFooter({ children }: { children: React.ReactNode }) {
  return <div className="pt-2 border-t mt-4">{children}</div>;
}
