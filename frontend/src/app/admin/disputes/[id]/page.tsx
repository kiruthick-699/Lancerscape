"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";

type Dispute = {
  id?: string;
  projectId?: string;
  milestoneId?: number;
  openedBy?: string;
  reason?: string; // client statement
  freelancerResponse?: string | null;
  status?: string;
  evidenceHashes?: string[];
  aiSummary?: {
    summary?: string;
    recommendation?: "approve" | "reject" | "partial";
    confidence?: number;
    reasoning?: string; // JSON string with strengths & inconsistencies
  } | null;
  milestoneTitle?: string;
  amount?: string;
};

export default function AdminDisputeReviewPage({ params }: { params: { id: string } }) {
  const [dispute, setDispute] = useState<Dispute | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<"freelancer" | "client" | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const { toast } = useToast();

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`${apiUrl}/api/admin/disputes/${params.id}`);
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || `Failed with status ${res.status}`);
        }
        const data = await res.json();
        setDispute(data.dispute || null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load dispute");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [apiUrl, params.id]);

  const aiParsed = useMemo(() => {
    if (!dispute?.aiSummary) return null;
    const summaryText = dispute.aiSummary.summary || "";
    let clientStrengths: string[] = [];
    let freelancerStrengths: string[] = [];
    let inconsistencies: string[] = [];
    if (dispute.aiSummary.reasoning) {
      try {
        const parsed = JSON.parse(dispute.aiSummary.reasoning);
        clientStrengths = Array.isArray(parsed.clientStrengths) ? parsed.clientStrengths : [];
        freelancerStrengths = Array.isArray(parsed.freelancerStrengths) ? parsed.freelancerStrengths : [];
        inconsistencies = Array.isArray(parsed.inconsistencies) ? parsed.inconsistencies : [];
      } catch {}
    }
    return { summaryText, clientStrengths, freelancerStrengths, inconsistencies, suggestedOutcome: dispute.aiSummary.recommendation };
  }, [dispute]);

  const handleResolve = async (decision: "client" | "freelancer") => {
    try {
      setActionLoading(decision);
      setActionMessage(null);
      const res = await fetch(`${apiUrl}/api/admin/disputes/${params.id}/resolve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Send both keys for backend compatibility while following new payload shape
        body: JSON.stringify({ decision, resolverDecision: decision }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || `Failed with status ${res.status}`);
      }
      const decided = (data.decision || decision) as "client" | "freelancer";
      setActionMessage(`Decision recorded: ${decided}`);
      // Optimistically update local status
      setDispute((prev) => (prev ? { ...prev, status: "resolved" } : prev));
      toast({
        title: "Resolution Saved",
        description:
          decided === "freelancer"
            ? "Funds will be released to the freelancer (off-chain for now)."
            : "Client refund recorded (off-chain for now).",
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to resolve dispute";
      setActionMessage(msg);
      toast({ title: "Resolution Failed", description: msg, variant: "destructive" });
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto">
        <Card className="p-6">
          <div className="flex items-center space-x-3">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent"></div>
            <p className="text-sm text-muted-foreground">Loading dispute…</p>
          </div>
        </Card>
      </div>
    );
  }

  if (error || !dispute) {
    return (
      <div className="max-w-5xl mx-auto">
        <Card className="p-6 border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
          <p className="text-sm text-red-800 dark:text-red-200">{error || "Dispute not found"}</p>
        </Card>
      </div>
    );
  }

  const evidenceFiles = Array.isArray(dispute.evidenceHashes) ? dispute.evidenceHashes : [];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Admin Dispute Review</h1>
        <span className="px-3 py-1 rounded-md bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-sm font-medium">
          {dispute.status === "resolved" ? "Resolved" : "Pending Review"}
        </span>
      </div>

      {/* Milestone Details */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Milestone Details</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Project ID:</span>
            <p className="font-mono mt-1">{dispute.projectId || "-"}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Milestone ID:</span>
            <p className="font-mono mt-1">{typeof dispute.milestoneId === "number" ? dispute.milestoneId : "-"}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Title:</span>
            <p className="font-medium mt-1">{dispute.milestoneTitle || "—"}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Amount:</span>
            <p className="font-medium mt-1">{dispute.amount || "—"}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Opened By:</span>
            <p className="font-mono mt-1">{dispute.openedBy || "-"}</p>
          </div>
        </div>
      </Card>

      {/* Client Statement */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-3 flex items-center space-x-2">
          <span className="text-blue-600 dark:text-blue-400">👤</span>
          <span>Client Statement</span>
        </h2>
        <p className="text-sm leading-relaxed bg-blue-50 dark:bg-blue-900/10 p-4 rounded-md border border-blue-100 dark:border-blue-900/30">
          {dispute.reason || "—"}
        </p>
      </Card>

      {/* Freelancer Statement */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-3 flex items-center space-x-2">
          <span className="text-green-600 dark:text-green-400">💼</span>
          <span>Freelancer Statement</span>
        </h2>
        <p className="text-sm leading-relaxed bg-green-50 dark:bg-green-900/10 p-4 rounded-md border border-green-100 dark:border-green-900/30">
          {dispute.freelancerResponse || "—"}
        </p>
      </Card>

      {/* Evidence List */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-3">Evidence Files</h2>
        {evidenceFiles.length > 0 ? (
          <ul className="space-y-2">
            {evidenceFiles.map((file, idx) => (
              <li
                key={idx}
                className="flex items-center space-x-3 p-3 rounded-md bg-muted/50 hover:bg-muted transition-colors"
              >
                <span className="text-muted-foreground">📎</span>
                <span className="font-mono text-sm">{file}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">No evidence files provided</p>
        )}
      </Card>

      {/* AI Summary Panel */}
      <Card className="p-6 border-2 border-purple-200 dark:border-purple-800">
        <div className="flex items-center space-x-2 mb-4">
          <span className="text-purple-600 dark:text-purple-400 text-xl">🤖</span>
          <h2 className="text-lg font-semibold">AI Analysis Summary</h2>
        </div>

        {aiParsed ? (
          <div className="space-y-4">
            {/* Summary Text */}
            <div>
              <h3 className="text-sm font-medium mb-2">Summary</h3>
              <p className="text-sm bg-purple-50 dark:bg-purple-900/10 p-3 rounded-md">
                {aiParsed.summaryText}
              </p>
            </div>

            {/* Suggested Outcome */}
            {aiParsed.suggestedOutcome && (
              <div>
                <h3 className="text-sm font-medium mb-2">AI Suggested Outcome</h3>
                <div className="inline-block px-4 py-2 rounded-md bg-purple-100 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
                  <span className="text-purple-800 dark:text-purple-200 font-medium capitalize">
                    {aiParsed.suggestedOutcome}
                  </span>
                </div>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-4">
              {/* Client Strengths */}
              <div>
                <h3 className="text-sm font-medium mb-2">Client Strengths</h3>
                {aiParsed.clientStrengths.length > 0 ? (
                  <ul className="space-y-1">
                    {aiParsed.clientStrengths.map((s, idx) => (
                      <li key={idx} className="flex items-start space-x-2 text-sm">
                        <span className="text-blue-600 dark:text-blue-400 mt-0.5">✓</span>
                        <span className="text-muted-foreground">{s}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">—</p>
                )}
              </div>

              {/* Freelancer Strengths */}
              <div>
                <h3 className="text-sm font-medium mb-2">Freelancer Strengths</h3>
                {aiParsed.freelancerStrengths.length > 0 ? (
                  <ul className="space-y-1">
                    {aiParsed.freelancerStrengths.map((s, idx) => (
                      <li key={idx} className="flex items-start space-x-2 text-sm">
                        <span className="text-green-600 dark:text-green-400 mt-0.5">✓</span>
                        <span className="text-muted-foreground">{s}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">—</p>
                )}
              </div>
            </div>

            {/* Inconsistencies */}
            <div>
              <h3 className="text-sm font-medium mb-2">Inconsistencies</h3>
              {aiParsed.inconsistencies.length > 0 ? (
                <ul className="space-y-1">
                  {aiParsed.inconsistencies.map((item, idx) => (
                    <li key={idx} className="flex items-start space-x-2 text-sm">
                      <span className="text-amber-600 dark:text-amber-400 mt-0.5">⚠</span>
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">—</p>
              )}
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">AI summary not available.</p>
        )}
      </Card>

      {/* Admin Action Buttons */}
      <Card className="p-6 bg-slate-50 dark:bg-slate-900/50">
        <h2 className="text-lg font-semibold mb-4">Admin Actions</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Review the evidence and AI analysis, then choose an outcome.
        </p>
        <div className="grid md:grid-cols-2 gap-4">
          <Button
            onClick={() => handleResolve("freelancer")}
            disabled={actionLoading !== null}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            {actionLoading === "freelancer" ? "Processing..." : "Release Funds to Freelancer"}
          </Button>
          <Button
            onClick={() => handleResolve("client")}
            disabled={actionLoading !== null}
            variant="ghost"
            className="w-full border-2 border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
          >
            {actionLoading === "client" ? "Processing..." : "Refund Client"}
          </Button>
        </div>
        {actionMessage && (
          <p className="text-xs mt-3 text-center text-muted-foreground">{actionMessage}</p>
        )}
      </Card>
    </div>
  );
}
