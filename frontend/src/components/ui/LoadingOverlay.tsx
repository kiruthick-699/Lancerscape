/**
 * frontend/src/components/ui/LoadingOverlay.tsx
 *
 * Reusable full-screen loading overlay component
 */

interface LoadingOverlayProps {
  active: boolean;
}

export function LoadingOverlay({ active }: LoadingOverlayProps) {
  if (!active) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-muted border-t-primary"></div>
        <p className="text-sm font-medium text-muted-foreground">Processing…</p>
      </div>
    </div>
  );
}
