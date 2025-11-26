"use client";

import * as React from "react"
import { ToastProvider } from "./use-toast"

export function Toaster({ children }: { children: React.ReactNode }) {
  return <ToastProvider>{children}</ToastProvider>
}
