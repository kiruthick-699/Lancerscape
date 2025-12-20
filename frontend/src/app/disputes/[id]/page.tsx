"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { useResolveDispute } from "@/hooks/useProjectContract";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { getDispute, uploadEvidence, generateAISummary } from "@/lib/api/disputes";

export default function DisputeDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const { toast } = useToast();

  const [dispute, setDispute] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [resolving, setResolving] = useState<"client" | "freelancer" | null>(null);
  const adminAddress = process.env.NEXT_PUBLIC_ADMIN_ADDRESS?.toLowerCase();

  // Wagmi: resolve dispute hook (project address from env or dispute data)
  const projectAddress =
    (process.env.NEXT_PUBLIC_PROJECT_ADDRESS as string | undefined) || dispute?.projectId;
  const {
    write: resolveWrite,
    isPending: isResolvePending,
    isConfirming: isResolveConfirming,
    isConfirmed: isResolveConfirmed,
    isError: isResolveError,
    error: resolveError,
  } = useResolveDispute(projectAddress ?? "");

  // Fetch dispute details on mount
  useEffect(() => {
    const fetchDispute = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await getDispute(params.id);
        setDispute(result.dispute);
      } catch (err) {
        console.error('Error fetching dispute:', err);
        setError(err instanceof Error ? err.message : 'Failed to load dispute');
      } finally {
        setLoading(false);
      }
    };

    fetchDispute();
  }, [params.id]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      if (selectedFiles.length > 5) {
        toast({
          title: "Too Many Files",
          description: "Maximum 5 files allowed",
          variant: "destructive",
        });
        return;
      }
      setFiles(selectedFiles);
    }
  };

  const handleUploadEvidence = async () => {
    if (!isConnected || !address) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to upload evidence",
        variant: "destructive",
      });
      return;
    }

    if (files.length === 0) {
      toast({
        title: "No Files Selected",
        description: "Please select at least one file to upload",
        variant: "destructive",
      });
      return;
    }

    setUploadLoading(true);

    try {
      const result = await uploadEvidence({
        disputeId: params.id,
        uploadedBy: address,
        files,
      });

      toast({
        title: "Evidence Uploaded",
        description: `Successfully uploaded ${result.uploadedFiles.length} file(s)`,
        variant: "default",
      });

      // Refresh dispute data
      const updatedDispute = await getDispute(params.id);
      setDispute(updatedDispute.dispute);
      setFiles([]);
    } catch (err) {
      console.error('Error uploading evidence:', err);
      toast({
        title: "Upload Failed",
        description: err instanceof Error ? err.message : "Failed to upload evidence",
        variant: "destructive",
      });
    } finally {
      setUploadLoading(false);
    }
  };

  const handleGenerateAIAnalysis = async () => {
    setAiLoading(true);

    try {
      await generateAISummary(params.id);

      toast({
        title: "AI Analysis Complete",
        description: "AI summary has been generated",
        variant: "default",
      });

      // Redirect to summary page
      router.push(`/disputes/${params.id}/summary`);
    } catch (err) {
      console.error('Error generating AI analysis:', err);
      toast({
        title: "AI Analysis Failed",
        description: err instanceof Error ? err.message : "Failed to generate AI analysis",
        variant: "destructive",
      });
    } finally {
      setAiLoading(false);
    }
  };

  // Handle admin resolution flow: on-chain then backend
  const handleAdminResolve = async (decision: "client" | "freelancer") => {
    if (!dispute) return;
    if (!projectAddress) {
      toast({ title: "Missing Project Address", description: "Project address not set", variant: "destructive" });
      return;
    }
    if (!adminAddress || address?.toLowerCase() !== adminAddress) {
      toast({ title: "Admin Only", description: "Connect with the admin wallet to resolve", variant: "destructive" });
      return;
    }
    if (!isConnected || !address) {
      toast({ title: "Wallet Not Connected", description: "Connect wallet to resolve", variant: "destructive" });
      return;
    }

    setResolving(decision);

    try {
      // 1) Send on-chain resolution
      resolveWrite?.({ disputeId: Number(dispute.milestoneId), decision });
    } catch (err) {
      console.error("Error initiating on-chain resolve:", err);
      toast({ title: "Transaction Error", description: err instanceof Error ? err.message : "Failed to send tx", variant: "destructive" });
      setResolving(null);
    }
  };

  // Toasts for wagmi transaction states
  useEffect(() => {
    if (isResolveConfirmed && resolving) {
      toast({ title: "On-chain Resolved", description: "Updating backend status..." });
      // 2) Update backend
      (async () => {
        try {
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
          const res = await fetch(`${apiUrl}/api/admin/disputes/${params.id}/resolve`, {
            method: "POST",
            headers: { 
              "Content-Type": "application/json",
              "x-admin-address": address?.toLowerCase() || "",
            },
            body: JSON.stringify({ resolverDecision: resolving }),
          });
          if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            throw new Error(data.error || `Backend update failed (${res.status})`);
          }
          toast({ title: "Dispute Resolved", description: "Backend updated successfully" });
          // Refresh dispute
          const updatedDispute = await getDispute(params.id);
          setDispute(updatedDispute.dispute);
        } catch (err) {
          console.error("Backend resolve error:", err);
          toast({ title: "Backend Update Failed", description: err instanceof Error ? err.message : "Failed to update backend", variant: "destructive" });
        } finally {
          setResolving(null);
        }
      })();
    }
  }, [isResolveConfirmed, resolving, params.id, toast]);

  useEffect(() => {
    if (isResolveError && resolveError) {
      toast({ title: "Transaction Failed", description: resolveError.message, variant: "destructive" });
      setResolving(null);
    }
  }, [isResolveError, resolveError, toast]);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-white mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading dispute details...</p>
      </div>
    );
  }

  if (error || !dispute) {
    return (
      <div className="max-w-2xl mx-auto py-12">
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-red-600 mb-2">Error Loading Dispute</h2>
          <p className="text-muted-foreground">{error || "Dispute not found"}</p>
        {/* Admin Decision Card */}
        {adminAddress ? (
          <Card className="p-6 space-y-4">
            <h2 className="text-lg font-semibold">Admin Decision</h2>
            <p className="text-sm text-muted-foreground">Resolve the dispute by awarding to one party.</p>

            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="destructive"
                disabled={
                  !!dispute.resolvedAt ||
                  isResolvePending ||
                  isResolveConfirming ||
                  resolving !== null ||
                  !isConnected ||
                  address?.toLowerCase() !== adminAddress
                }
                onClick={() => handleAdminResolve("client")}
              >
                {resolving === "client" || isResolvePending || isResolveConfirming ? (
                  <span className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Resolving to Client...</span>
                  </span>
                ) : (
                  "Award to Client"
                )}
              </Button>

              <Button
                variant="default"
                disabled={
                  !!dispute.resolvedAt ||
                  isResolvePending ||
                  isResolveConfirming ||
                  resolving !== null ||
                  !isConnected ||
                  address?.toLowerCase() !== adminAddress
                }
                onClick={() => handleAdminResolve("freelancer")}
              >
                {resolving === "freelancer" || isResolvePending || isResolveConfirming ? (
                  <span className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Resolving to Freelancer...</span>
                  </span>
                ) : (
                  "Award to Freelancer"
                )}
              </Button>
            </div>

            {address?.toLowerCase() !== adminAddress && (
              <p className="text-sm text-yellow-600">Connect with the admin wallet to enable resolution.</p>
            )}

            {dispute.resolvedAt && (
              <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded text-sm">
                ✓ Dispute resolved on {new Date(dispute.resolvedAt).toLocaleString()}.
              </div>
            )}
          </Card>
        ) : null}
        
        <div>
          <label className="block font-medium mb-2">Select Files (Max 5, 10MB each)</label>
          <input
            type="file"
            multiple
            accept="image/*,application/pdf,.doc,.docx"
            onChange={handleFileChange}
            disabled={uploadLoading}
            className="block w-full border rounded px-3 py-2 bg-background"
          />
          {files.length > 0 && (
            <div className="mt-2 text-sm text-muted-foreground">
              Selected: {files.map(f => f.name).join(", ")}
            </div>
          )}
        </div>

        <Button
          onClick={handleUploadEvidence}
          disabled={!isConnected || uploadLoading || files.length === 0}
          className="w-full"
        >
          {uploadLoading ? (
            <span className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Uploading...</span>
            </span>
          ) : (
            "Upload Evidence"
          )}
        </Button>

        {!isConnected && (
          <p className="text-sm text-yellow-600">Connect your wallet to upload evidence</p>
        )}
      </Card>

      {/* AI Analysis Card */}
      <Card className="p-6 space-y-4">
        <h2 className="text-lg font-semibold">AI Analysis</h2>
        <p className="text-sm text-muted-foreground">
          Generate an AI-powered analysis of the dispute based on submitted evidence.
        </p>

        {dispute.aiSummary && (
          <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded text-sm">
            ✓ AI summary already generated. Click below to view.
          </div>
        )}

        <Button
          onClick={handleGenerateAIAnalysis}
          disabled={aiLoading}
          className="w-full"
          variant={dispute.aiSummary ? "outline" : "default"}
        >
          {aiLoading ? (
            <span className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
              <span>Generating AI Analysis...</span>
            </span>
          ) : dispute.aiSummary ? (
            "View AI Summary"
          ) : (
            "Generate AI Analysis"
          )}
        </Button>
      </Card>

      {/* Admin Decision Card */}
      <Card className="p-6 space-y-4">
        <h2 className="text-lg font-semibold">Admin Decision</h2>
        <p className="text-sm text-muted-foreground">Resolve the dispute by awarding to one party.</p>

        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="destructive"
            disabled={
              !!dispute.resolvedAt ||
              isResolvePending ||
              isResolveConfirming ||
              resolving !== null
            }
            onClick={() => handleAdminResolve("client")}
          >
            {resolving === "client" || isResolvePending || isResolveConfirming ? (
              <span className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Resolving to Client...</span>
              </span>
            ) : (
              "Award to Client"
            )}
          </Button>

          <Button
            variant="default"
            disabled={
              !!dispute.resolvedAt ||
              isResolvePending ||
              isResolveConfirming ||
              resolving !== null
            }
            onClick={() => handleAdminResolve("freelancer")}
          >
            {resolving === "freelancer" || isResolvePending || isResolveConfirming ? (
              <span className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Resolving to Freelancer...</span>
              </span>
            ) : (
              "Award to Freelancer"
            )}
          </Button>
        </div>

        {dispute.resolvedAt && (
          <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded text-sm">
            ✓ Dispute resolved on {new Date(dispute.resolvedAt).toLocaleString()}.
          </div>
        )}
      </Card>
    </div>
  );
}
