/**
 * frontend/src/components/notifications.ts
 *
 * Toast notification helpers using shadcn/ui Toast
 */

import { toast } from "@/components/ui/use-toast";

/**
 * showSuccess
 *
 * Display a success toast notification
 * @param message - Success message to display
 */
export function showSuccess(message: string) {
  toast({
    title: "Success",
    description: message,
  });
}

/**
 * showError
 *
 * Display an error toast notification
 * @param message - Error message to display
 */
export function showError(message: string) {
  toast({
    title: "Error",
    description: message,
    variant: "destructive",
  });
}

/**
 * showInfo
 *
 * Display an info toast notification
 * @param message - Info message to display
 */
export function showInfo(message: string) {
  toast({
    title: "Info",
    description: message,
  });
}
