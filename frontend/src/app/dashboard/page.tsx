'use client';

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6 p-6">
      <h1 className="text-3xl font-bold">Dashboard (MVP)</h1>
      <Card className="p-6 space-y-4">
        <p className="text-muted-foreground">
          MVP focuses on milestone escrow and disputes. Use the quick links below to run through the core flow.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href="/milestones/1/submit">
            <Button>Submit Work</Button>
          </Link>
          <Link href="/milestones/1/approve">
            <Button variant="outline">Approve Milestone</Button>
          </Link>
          <Link href="/milestones/1/dispute">
            <Button variant="secondary">Open Dispute</Button>
          </Link>
          <Link href="/disputes/1">
            <Button variant="ghost">View Dispute</Button>
          </Link>
        </div>
        <p className="text-xs text-muted-foreground">
          Replace the id in URLs for different milestones. Non-MVP widgets removed for simplicity.
        </p>
      </Card>
    </div>
  );
}
