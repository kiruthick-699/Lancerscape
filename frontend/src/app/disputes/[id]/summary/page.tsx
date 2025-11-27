"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useReadContract } from "wagmi";

const PROJECT_READ_ABI = [
  {
    type: "function",
    name: "isMilestoneResolved",
    stateMutability: "view",
    inputs: [{ name: "milestoneId", type: "uint256" }],
    outputs: [{ name: "resolved", type: "bool" }],
  },
] as const;

export default function DisputeSummaryPage({ params }: { params: { id: string } }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<{
    summaryText: string;
    clientStrengths: string[];
    freelancerStrengths: string[];
    inconsistencies: string[];
    suggestedOutcome: string;
  } | null>(null);

  const contractAddress = process.env.NEXT_PUBLIC_PROJECT_CONTRACT_ADDRESS as `0x${string}` | undefined;
  const milestoneIdBigInt = (() => {
    try {
      return BigInt(params.id);
    } catch {
      return undefined;
    }
  })();

  const {
    data: isResolved,
    refetch: refetchStatus,
    isLoading: statusLoading,
  } = useReadContract({
    abi: PROJECT_READ_ABI,
    address: contractAddress!,
    functionName: "isMilestoneResolved",
    args: milestoneIdBigInt !== undefined ? [milestoneIdBigInt] : undefined,
    // only enable when we have address and id parsed
    query: { enabled: Boolean(contractAddress && milestoneIdBigInt !== undefined) },
  });

  const fetchAISummary = async () => {
    setLoading(true);
    setError(null);
    setSummary(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const response = await fetch(`${apiUrl}/api/disputes/ai-summary`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          disputeId: params.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Request failed with status ${response.status}`);
      }

      const data = await response.json();
      setSummary(data.summary);
    } catch (err) {
      console.error('Error fetching AI summary:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch AI summary');
    } finally {
      setLoading(false);
    }
  };

  // Re-check status after generating or on mount
  useEffect(() => {
    if (refetchStatus) {
      refetchStatus();
    }
  }, [refetchStatus, summary?.summaryText]);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">AI Dispute Summary</h1>
          {isResolved ? (
            <span className="px-2.5 py-1 rounded-md text-xs font-medium border bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-200 dark:border-emerald-800">
              Resolved
            </span>
          ) : statusLoading ? (
            <span className="text-xs text-muted-foreground">Checking status…</span>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={fetchAISummary}
            disabled={loading || Boolean(isResolved)}
            title={isResolved ? 'Dispute resolved. Summary is final.' : 'Generate AI Summary'}
          >
            {isResolved ? 'Finalized' : loading ? 'Generating...' : 'Generate AI Summary'}
          </Button>
          <Button variant="ghost" onClick={() => refetchStatus?.()} disabled={statusLoading}>
            {statusLoading ? 'Refreshing…' : 'Refresh Status'}
          </Button>
        </div>
      </div>

      {error && (
        <Card className="p-4 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
          <p className="text-red-800 dark:text-red-200 text-sm">
            <strong>Error:</strong> {error}
          </p>
        </Card>
      )}

      {loading && (
        <Card className="p-6">
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <p className="text-muted-foreground">Analyzing dispute with AI...</p>
          </div>
        </Card>
      )}

      {summary && (
        <div className="space-y-4">
          {/* Summary Overview */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-3">Summary</h2>
            <div className="flex items-center gap-2 mb-2">
              {isResolved && (
                <span className="px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-200">
                  Final
                </span>
              )}
            </div>
            <p className="text-sm leading-relaxed">{summary.summaryText}</p>
          </Card>

          {/* Suggested Outcome */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-3">Suggested Outcome</h2>
            <div className="inline-block px-4 py-2 rounded-md bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
              <span className="text-blue-800 dark:text-blue-200 font-medium capitalize">
                {summary.suggestedOutcome}
              </span>
            </div>
          </Card>

          {/* Client Strengths */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-3">Client's Strengths</h2>
            {summary.clientStrengths.length > 0 ? (
              <ul className="space-y-2">
                {summary.clientStrengths.map((strength, idx) => (
                  <li key={idx} className="flex items-start space-x-2 text-sm">
                    <span className="text-green-600 dark:text-green-400 mt-0.5">✓</span>
                    <span>{strength}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No strengths identified</p>
            )}
          </Card>

          {/* Freelancer Strengths */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-3">Freelancer's Strengths</h2>
            {summary.freelancerStrengths.length > 0 ? (
              <ul className="space-y-2">
                {summary.freelancerStrengths.map((strength, idx) => (
                  <li key={idx} className="flex items-start space-x-2 text-sm">
                    <span className="text-green-600 dark:text-green-400 mt-0.5">✓</span>
                    <span>{strength}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No strengths identified</p>
            )}
          </Card>

          {/* Inconsistencies */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-3">Inconsistencies</h2>
            {summary.inconsistencies.length > 0 ? (
              <ul className="space-y-2">
                {summary.inconsistencies.map((item, idx) => (
                  <li key={idx} className="flex items-start space-x-2 text-sm">
                    <span className="text-amber-600 dark:text-amber-400 mt-0.5">⚠</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No inconsistencies identified</p>
            )}
          </Card>
        </div>
      )}

      {!summary && !loading && !error && (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">
            Click "Generate AI Summary" to analyze this dispute with AI.
          </p>
        </Card>
      )}
    </div>
  );
}
