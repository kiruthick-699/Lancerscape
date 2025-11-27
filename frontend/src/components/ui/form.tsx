import * as React from "react";
import { cn } from "@/lib/utils";

interface FormFieldContextValue {
  name: string;
  error?: string;
}

const FormFieldContext = React.createContext<FormFieldContextValue | null>(null);

export function FormField({
  name,
  error,
  children,
}: {
  name: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <FormFieldContext.Provider value={{ name, error }}>
      <div className="space-y-2">{children}</div>
    </FormFieldContext.Provider>
  );
}

export function FormLabel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("block text-sm font-medium", className)}>
      {children}
    </label>
  );
}

export function FormControl({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function FormMessage() {
  const context = React.useContext(FormFieldContext);
  
  if (!context?.error) {
    return null;
  }

  return (
    <p className="text-sm text-red-600 dark:text-red-400">
      {context.error}
    </p>
  );
}

export function FormItem({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("space-y-2", className)}>{children}</div>;
}
