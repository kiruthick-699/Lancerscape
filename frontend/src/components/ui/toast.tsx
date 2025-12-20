"use client";
import * as React from "react"

import { cn } from "@/lib/utils"

const ToastProviderContext = React.createContext<{
  toasts: ToastProps[]
  setToasts: React.Dispatch<React.SetStateAction<ToastProps[]>>
} | null>(null)

export type ToastProps = {
  id?: string | number
  title?: React.ReactNode
  description?: React.ReactNode
  action?: React.ReactNode
  variant?: "default" | "destructive"
  duration?: number
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastProps[]>([])
  return (
    <ToastProviderContext.Provider value={{ toasts, setToasts }}>
      {children}
      <ToastViewport />
    </ToastProviderContext.Provider>
  )
}

export function useToastCore() {
  const ctx = React.useContext(ToastProviderContext)
  if (!ctx) throw new Error("useToastCore must be used within ToastProvider")
  const { toasts, setToasts } = ctx

  const toast = React.useCallback((props: ToastProps) => {
    const id = props.id ?? Math.random().toString(36).slice(2)
    const duration = props.duration ?? 5000
    setToasts((t) => [...t, { ...props, id }])
    const timer = setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id))
    }, duration)
    return {
      id,
      dismiss: () => {
        clearTimeout(timer)
        setToasts((t) => t.filter((x) => x.id !== id))
      },
    }
  }, [setToasts])

  return { toasts, toast }
}

export function ToastViewport() {
  const ctx = React.useContext(ToastProviderContext)
  if (!ctx) return null
  const { toasts, setToasts } = ctx

  return (
    <div className="fixed top-0 right-0 z-50 m-4 flex w-96 flex-col gap-2">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onClose={() => setToasts((s) => s.filter((x) => x.id !== t.id))} />)
      )}
    </div>
  )
}

export function ToastItem({ toast, onClose }: { toast: ToastProps; onClose: () => void }) {
  return (
    <div className={cn(
      "rounded-md border bg-background p-4 shadow",
      toast.variant === "destructive" ? "border-red-500/40" : "border-border"
    )}>
      {toast.title && <div className="font-semibold mb-1">{toast.title}</div>}
      {toast.description && <div className="text-sm text-muted-foreground">{toast.description}</div>}
      {toast.action && <div className="mt-3">{toast.action}</div>}
      <button className="absolute right-3 top-3 text-sm text-muted-foreground" onClick={onClose}>✕</button>
    </div>
  )
}
