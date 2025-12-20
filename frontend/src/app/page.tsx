import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-16">
      <Card className="max-w-2xl w-full p-8 space-y-6 text-center">
        <h1 className="text-3xl font-bold">LancerScape MVP</h1>
        <p className="text-muted-foreground">
          Minimal flow: fund milestone, submit work, approve or open a dispute, and resolve.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/milestones/1/submit">
            <Button size="lg">Submit Work</Button>
          </Link>
          <Link href="/milestones/1/approve">
            <Button size="lg" variant="outline">Approve Milestone</Button>
          </Link>
          <Link href="/disputes/1">
            <Button size="lg" variant="secondary">Dispute Detail</Button>
          </Link>
        </div>
        <p className="text-xs text-muted-foreground">
          For other pages, use direct routes: /milestones/[id]/submit, /approve, /dispute.
        </p>
      </Card>
    </div>
  );
}
