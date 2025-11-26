"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function DisputeDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateAIAnalysis = async () => {
    setLoading(true);
    setError(null);

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

      // Redirect to summary page on success
      router.push(`/disputes/${params.id}/summary`);
    } catch (err) {
      console.error('Error generating AI analysis:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate AI analysis');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Dispute {params.id}</h1>

      <Card className="p-6 space-y-4">
        <h2 className="text-lg font-semibold">Dispute Details</h2>
        <p className="text-sm text-muted-foreground">
          View and manage dispute information.
        </p>

        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-red-800 dark:text-red-200 text-sm">
            Error: {error}
          </div>
        )}

        <div className="pt-4">
          <Button
            onClick={handleGenerateAIAnalysis}
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <span className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Generating AI Analysis...</span>
              </span>
            ) : (
              'Generate AI Analysis'
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
}
