import * as React from "react"
import { ToastProps, ToastProvider, useToastCore } from "./toast"

export function useToast() {
  const { toast } = useToastCore()
  return { toast }
}

export { ToastProvider }
export type { ToastProps }
