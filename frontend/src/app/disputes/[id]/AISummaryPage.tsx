import React from "react";
import { Card, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function AISummaryPage() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto py-8">
      {/* Milestone Details */}
      <Card>
        <CardTitle>Milestone Details</CardTitle>
        <CardContent>
          <div className="font-medium">Design Phase</div>
          <div className="text-sm text-muted-foreground">Amount: $1,000</div>
          <div className="text-sm mt-1">Description: Initial design and wireframes for client approval.</div>
        </CardContent>
      </Card>
      {/* AI Summary */}
      <Card>
        <CardTitle>AI Summary</CardTitle>
        <CardContent>
          <div className="text-sm">The AI has reviewed the submitted evidence and found that the work delivered matches the requirements outlined in the milestone. No major discrepancies detected.</div>
        </CardContent>
      </Card>
      {/* Evidence Comparison */}
      <Card className="md:col-span-2">
        <CardTitle>Evidence Comparison</CardTitle>
        <CardContent>
          <div className="text-sm">Evidence from both parties will be compared here. (Placeholder)</div>
        </CardContent>
        <CardFooter>
          <div className="flex gap-4 justify-end">
            <Button variant="default" disabled>Approve</Button>
            <Button variant="ghost" disabled>Reject</Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
