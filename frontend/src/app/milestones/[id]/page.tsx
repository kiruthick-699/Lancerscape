"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import type { Address } from "viem";
import { useGetMilestone } from "@/hooks/useProjectContract";

export default function MilestoneDetailsPage() {
  const { id: idParam } = useParams() as { id?: string };
  const id = useMemo(() => Number(idParam ?? "0"), [idParam]);
  const router = useRouter();
  const { toast } = useToast();

  const projectAddress = (process.env.NEXT_PUBLIC_PROJECT_ADDRESS || "") as Address;

  const [reason, setReason] = useState("");
  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem(`milestone_reason_${id}`) : null;
    if (saved) setReason(saved);
  }, [id]);

  let milestoneData: any = null;
  let isLoading = false;
  try {
    const { data, isLoading: l } = useGetMilestone(projectAddress, id);
    milestoneData = data ?? null;
    isLoading = l ?? false;
  } catch {
    milestoneData = null;
    isLoading = false;
  }

  const handleSaveReason = () => {
    const trimmed = reason.trim();
    if (!trimmed) {
      toast({ title: "Reason Required", description: "Please provide a brief reason.", variant: "destructive" });
      return;
    }
    localStorage.setItem(`milestone_reason_${id}`, trimmed);
    toast({ title: "Reason Saved", description: "Your reason was saved locally." });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Milestone #{id}</h1>

      <Card className="p-6 space-y-3">
        <h2 className="text-lg font-semibold">Details</h2>
        {isLoading ? (
          <p className="text-muted-foreground">Loading milestone...</p>
        ) : milestoneData ? (
          <div className="space-y-1 text-sm text-muted-foreground">
            <p>Amount: <span className="font-mono">{String(milestoneData.amount ?? "-")} ETH</span></p>
            <p>Status: <span className="font-mono">{String(milestoneData.status ?? "-")}</span></p>
            {milestoneData.evidenceHash && (
              <p>Evidence: <span className="font-mono break-all">{String(milestoneData.evidenceHash)}</span></p>
            )}
          </div>
        ) : (
          <p className="text-muted-foreground">No on-chain data available. Ensure project contract address is set.</p>
        )}
      </Card>

      <Card className="p-6 space-y-4">
        <h2 className="text-lg font-semibold">Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Button onClick={() => router.push(`/milestones/${id}/submit`)} className="w-full">
            Submit Work
          </Button>
          <Button onClick={() => router.push(`/milestones/${id}/dispute`)} variant="outline" className="w-full">
            Open Dispute
          </Button>
        </div>
      </Card>

      <Card className="p-6 space-y-3">
        <h2 className="text-lg font-semibold">Reason for Delay / Not Submitting</h2>
        <p className="text-sm text-muted-foreground">Share context with the client. This note is saved locally for now.</p>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={4}
          placeholder="E.g., waiting on assets, blocked by dependency, illness, etc."
          className="w-full rounded-md border bg-background p-3 text-sm"
        />
        <div className="flex justify-end">
          <Button onClick={handleSaveReason}>Save Reason</Button>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => router.push(`/milestones`)}>
            ← Back to Milestones
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.push(`/milestones/${id}/approve`)}>Approve (Client)</Button>
            <Button variant="outline" onClick={() => router.push(`/disputes/${id}`)}>View Dispute</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
