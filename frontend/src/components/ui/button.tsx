import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "ghost" | "outline" | "destructive";
  size?: "default" | "sm" | "lg";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "rounded font-medium transition-colors",
          size === "default" && "px-4 py-2",
          size === "sm" && "px-3 py-1.5 text-sm",
          size === "lg" && "px-6 py-3 text-lg",
          variant === "default" && "bg-primary text-primary-foreground hover:bg-primary/90",
          variant === "ghost" && "bg-transparent hover:bg-accent",
          variant === "outline" && "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
          variant === "destructive" && "bg-destructive text-destructive-foreground hover:bg-destructive/90",
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
