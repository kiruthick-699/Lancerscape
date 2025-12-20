"use client";

import React, { useState } from "react";
import { useAccount } from "wagmi";
import { Card, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { openDispute } from "@/lib/api/disputes";

export function FileDisputeForm() {
  const { address, isConnected } = useAccount();
  const { toast } = useToast();

  const [projectId, setProjectId] = useState("");
  const [milestoneId, setMilestoneId] = useState("");
  const [reason, setReason] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [milestoneDescription, setMilestoneDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isConnected || !address) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to open a dispute",
        variant: "destructive",
      });
      return;
    }

    if (!projectId.trim() || !projectId.startsWith("0x")) {
      toast({
        title: "Invalid Project ID",
        description: "Please enter a valid project contract address",
        variant: "destructive",
      });
      return;
    }

    if (!milestoneId.trim() || isNaN(parseInt(milestoneId))) {
      toast({
        title: "Invalid Milestone ID",
        description: "Please enter a valid milestone number",
        variant: "destructive",
      });
      return;
    }

    if (reason.trim().length < 10) {
      toast({
        title: "Reason Too Short",
        description: "Please provide at least 10 characters explaining the dispute",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const result = await openDispute({
        projectId: projectId.trim(),
        milestoneId: parseInt(milestoneId),
        reason: reason.trim(),
        openedBy: address,
        projectDescription: projectDescription.trim() || undefined,
        milestoneDescription: milestoneDescription.trim() || undefined,
      });

      toast({
        title: "Dispute Created",
        description: `Dispute ${result.dispute.id} has been created successfully`,
        variant: "default",
      });

      // Reset form
      setProjectId("");
      setMilestoneId("");
      setReason("");
      setProjectDescription("");
      setMilestoneDescription("");
    } catch (error) {
      console.error("Error opening dispute:", error);
      toast({
        title: "Failed to Create Dispute",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-xl w-full mx-auto">
      <form onSubmit={handleSubmit}>
        <CardTitle className="p-6 pb-0">Open New Dispute</CardTitle>
        <CardContent className="space-y-4">
          <div>
            <label htmlFor="projectId" className="block font-medium mb-1">
              Project Contract Address *
            </label>
            <input
              id="projectId"
              type="text"
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="block w-full border rounded px-3 py-2 bg-background"
              placeholder="0x..."
              disabled={loading}
              required
            />
          </div>

          <div>
            <label htmlFor="milestoneId" className="block font-medium mb-1">
              Milestone ID *
            </label>
            <input
              id="milestoneId"
              type="number"
              min="0"
              value={milestoneId}
              onChange={(e) => setMilestoneId(e.target.value)}
              className="block w-full border rounded px-3 py-2 bg-background"
              placeholder="0"
              disabled={loading}
              required
            />
          </div>

          <div>
            <label htmlFor="reason" className="block font-medium mb-1">
              Reason for Dispute *
            </label>
            <textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="block w-full border rounded px-3 py-2 bg-background"
              rows={4}
              placeholder="Describe your reason... (minimum 10 characters)"
              disabled={loading}
              required
              minLength={10}
            />
            <div className="text-xs text-muted-foreground mt-1">
              {reason.length}/5000 characters
            </div>
          </div>

          <div>
            <label htmlFor="projectDesc" className="block font-medium mb-1">
              Project Description (Optional)
            </label>
            <input
              id="projectDesc"
              type="text"
              value={projectDescription}
              onChange={(e) => setProjectDescription(e.target.value)}
              className="block w-full border rounded px-3 py-2 bg-background"
              placeholder="Brief project description"
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="milestoneDesc" className="block font-medium mb-1">
              Milestone Description (Optional)
            </label>
            <input
              id="milestoneDesc"
              type="text"
              value={milestoneDescription}
              onChange={(e) => setMilestoneDescription(e.target.value)}
              className="block w-full border rounded px-3 py-2 bg-background"
              placeholder="Brief milestone description"
              disabled={loading}
            />
          </div>

          {!isConnected && (
            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded text-sm text-yellow-800 dark:text-yellow-200">
              ⚠️ Please connect your wallet to submit a dispute
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button
            type="submit"
            variant="default"
            className="w-full"
            disabled={!isConnected || loading}
          >
            {loading ? (
              <span className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Submitting...</span>
              </span>
            ) : (
              "Submit Dispute"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
