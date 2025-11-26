"use client";

import { useEffect, useRef } from "react";
import { useToast } from "@/components/ui/use-toast";

export type TxState = "idle" | "pending" | "success" | "failed";

type Props = {
  state: TxState;
  hash?: string;
  pendingText?: string;
  successText?: string;
  failedText?: string;
  title?: string;
};

export default function TransactionToast({
  state,
  hash,
  pendingText = "Waiting for confirmation...",
  successText = "Transaction confirmed",
  failedText = "Transaction failed",
  title,
}: Props) {
  const { toast } = useToast();
  const lastState = useRef<TxState>("idle");

  useEffect(() => {
    if (state === lastState.current) return;
    lastState.current = state;

    if (state === "pending") {
      toast({
        title: title ?? "Transaction Pending",
        description: pendingText,
      });
    } else if (state === "success") {
      toast({
        title: title ?? "Success",
        description: hash ? `Tx: ${hash}` : successText,
      });
    } else if (state === "failed") {
      toast({
        title: title ?? "Failed",
        description: failedText,
        variant: "destructive",
      });
    }
  }, [state, title, pendingText, successText, failedText, hash, toast]);

  return null;
}
