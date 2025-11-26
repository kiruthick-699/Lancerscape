"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function AdminDisputeReviewPage({ params }: { params: { id: string } }) {
  const [loading, setLoading] = useState(false);

  // Placeholder data - will be replaced with actual API calls
  const milestoneDetails = {
    projectId: "0x1234...5678",
    milestoneId: params.id,
    title: "Design Phase Completion",
    amount: "0.5 ETH",
    status: "Disputed",
  };

  const clientStatement = "The delivered design does not match the agreed specifications. Key features are missing and the color scheme is incorrect.";
  
  const freelancerStatement = "All deliverables were completed as per the original requirements. The client requested additional changes after approval of initial designs.";

  const evidenceFiles = [
    "original_requirements.pdf",
    "design_mockups_v1.zip",
    "client_approval_email.png",
    "final_deliverables.zip",
  ];

  const aiSummary = {
    summaryText: "Dispute centers on scope creep and specification clarity. Both parties have valid concerns.",
    clientStrengths: [
      "Provided detailed requirements documentation",
      "Clear communication of initial expectations",
    ],
    freelancerStrengths: [
      "Submitted work on time",
      "Provided evidence of client approval",
    ],
    inconsistencies: [
      "Discrepancy in agreed design specifications",
      "Unclear change request process",
    ],
    suggestedOutcome: "partial",
  };

  const handleReleaseFunds = async () => {
    setLoading(true);
    // TODO: Implement blockchain logic to release funds to freelancer
    console.log("Release funds to freelancer");
    setTimeout(() => setLoading(false), 1000);
  };

  const handleRefundClient = async () => {
    setLoading(true);
    // TODO: Implement blockchain logic to refund client
    console.log("Refund client");
    setTimeout(() => setLoading(false), 1000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Admin Dispute Review</h1>
        <span className="px-3 py-1 rounded-md bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-sm font-medium">
          Pending Review
        </span>
      </div>

      {/* Milestone Details */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Milestone Details</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Project ID:</span>
            <p className="font-mono mt-1">{milestoneDetails.projectId}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Milestone ID:</span>
            <p className="font-mono mt-1">{milestoneDetails.milestoneId}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Title:</span>
            <p className="font-medium mt-1">{milestoneDetails.title}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Amount:</span>
            <p className="font-medium mt-1">{milestoneDetails.amount}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Status:</span>
            <p className="font-medium mt-1">{milestoneDetails.status}</p>
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
          {clientStatement}
        </p>
      </Card>

      {/* Freelancer Statement */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-3 flex items-center space-x-2">
          <span className="text-green-600 dark:text-green-400">💼</span>
          <span>Freelancer Statement</span>
        </h2>
        <p className="text-sm leading-relaxed bg-green-50 dark:bg-green-900/10 p-4 rounded-md border border-green-100 dark:border-green-900/30">
          {freelancerStatement}
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

        <div className="space-y-4">
          {/* Summary Text */}
          <div>
            <h3 className="text-sm font-medium mb-2">Summary</h3>
            <p className="text-sm bg-purple-50 dark:bg-purple-900/10 p-3 rounded-md">
              {aiSummary.summaryText}
            </p>
          </div>

          {/* Suggested Outcome */}
          <div>
            <h3 className="text-sm font-medium mb-2">AI Suggested Outcome</h3>
            <div className="inline-block px-4 py-2 rounded-md bg-purple-100 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
              <span className="text-purple-800 dark:text-purple-200 font-medium capitalize">
                {aiSummary.suggestedOutcome}
              </span>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {/* Client Strengths */}
            <div>
              <h3 className="text-sm font-medium mb-2">Client Strengths</h3>
              <ul className="space-y-1">
                {aiSummary.clientStrengths.map((strength, idx) => (
                  <li key={idx} className="flex items-start space-x-2 text-sm">
                    <span className="text-blue-600 dark:text-blue-400 mt-0.5">✓</span>
                    <span className="text-muted-foreground">{strength}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Freelancer Strengths */}
            <div>
              <h3 className="text-sm font-medium mb-2">Freelancer Strengths</h3>
              <ul className="space-y-1">
                {aiSummary.freelancerStrengths.map((strength, idx) => (
                  <li key={idx} className="flex items-start space-x-2 text-sm">
                    <span className="text-green-600 dark:text-green-400 mt-0.5">✓</span>
                    <span className="text-muted-foreground">{strength}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Inconsistencies */}
          <div>
            <h3 className="text-sm font-medium mb-2">Inconsistencies</h3>
            <ul className="space-y-1">
              {aiSummary.inconsistencies.map((item, idx) => (
                <li key={idx} className="flex items-start space-x-2 text-sm">
                  <span className="text-amber-600 dark:text-amber-400 mt-0.5">⚠</span>
                  <span className="text-muted-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Card>

      {/* Admin Action Buttons */}
      <Card className="p-6 bg-slate-50 dark:bg-slate-900/50">
        <h2 className="text-lg font-semibold mb-4">Admin Actions</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Review the evidence and AI analysis, then choose an outcome.
        </p>
        <div className="grid md:grid-cols-2 gap-4">
          <Button
            onClick={handleReleaseFunds}
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            {loading ? "Processing..." : "Release Funds to Freelancer"}
          </Button>
          <Button
            onClick={handleRefundClient}
            disabled={loading}
            variant="ghost"
            className="w-full border-2 border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
          >
            {loading ? "Processing..." : "Refund Client"}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-3 text-center">
          ⚠️ This action will be recorded on-chain and cannot be reversed.
        </p>
      </Card>
    </div>
  );
}
