/**
 * frontend/src/components/ui/ErrorBanner.tsx
 *
 * Reusable dismissible error banner component
 */

import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface ErrorBannerProps {
  message: string;
}

export function ErrorBanner({ message }: ErrorBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <Alert variant="destructive" className="relative">
      <AlertDescription>{message}</AlertDescription>
      <Button
        variant="ghost"
        size="sm"
        className="absolute right-2 top-2 h-6 w-6 p-0 hover:bg-transparent"
        onClick={() => setDismissed(true)}
      >
        ✕
      </Button>
    </Alert>
  );
}
