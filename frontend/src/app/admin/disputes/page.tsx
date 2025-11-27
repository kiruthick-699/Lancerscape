"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Dispute = {
  id?: string;
  projectId?: string;
  milestoneId?: number;
  openedBy?: string;
  status?: string; // open | pending_review | resolved | closed
  aiSummary?: unknown | null;
};

export default function AdminDisputesListPage() {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

  useEffect(() => {
    const fetchDisputes = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`${apiUrl}/api/admin/disputes`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || `Failed with status ${res.status}`);
        }
        const data = await res.json();
        setDisputes(Array.isArray(data.disputes) ? data.disputes : []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch disputes");
      } finally {
        setLoading(false);
      }
    };
    fetchDisputes();
  }, [apiUrl]);

  function getDisplayStatus(d: Dispute): { label: string; className: string } {
    if (d.status === "resolved") {
      return { label: "Resolved", className: "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-200 dark:border-emerald-800" };
    }
    if (d.aiSummary) {
      return { label: "AI Generated", className: "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/20 dark:text-purple-200 dark:border-purple-800" };
    }
    return { label: "Pending", className: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/20 dark:text-amber-200 dark:border-amber-800" };
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <Card className="p-6">
          <div className="flex items-center space-x-3">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent"></div>
            <p className="text-sm text-muted-foreground">Loading disputes…</p>
          </div>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto">
        <Card className="p-6 border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
          <p className="text-sm text-red-800 dark:text-red-200">Error: {error}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Admin Disputes</h1>
        <div className="text-sm text-muted-foreground">Total: {disputes.length}</div>
      </div>

      {disputes.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">No disputes found.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {disputes.map((d) => {
            const status = getDisplayStatus(d);
            return (
              <Card key={d.id} className="p-5">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <Link href={`/admin/disputes/${d.id}`} className="text-base font-semibold hover:underline">
                        {d.id}
                      </Link>
                      <span className={`px-2.5 py-1 rounded-md text-xs font-medium border ${status.className}`}>
                        {status.label}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                      <div className="truncate">
                        <span className="text-muted-foreground">Project:</span>{" "}
                        <span className="font-mono">{d.projectId || "-"}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Milestone:</span>{" "}
                        <span className="font-medium">{typeof d.milestoneId === "number" ? d.milestoneId : "-"}</span>
                      </div>
                      <div className="truncate">
                        <span className="text-muted-foreground">Opened By:</span>{" "}
                        <span className="font-mono">{d.openedBy || "-"}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 md:self-start">
                    <Link href={`/admin/disputes/${d.id}`}>
                      <Button>Review</Button>
                    </Link>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
