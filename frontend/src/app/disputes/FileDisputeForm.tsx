import React from "react";
import { Card, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function FileDisputeForm() {
  return (
    <Card className="max-w-xl w-full mx-auto">
      <CardTitle>Milestone Overview</CardTitle>
      <CardContent>
        <div className="mb-4">
          <div className="font-medium">Design Phase</div>
          <div className="text-sm text-muted-foreground">Amount: $1,000</div>
          <div className="text-sm mt-1">Description: Initial design and wireframes for client approval.</div>
        </div>
        <div className="mb-4">
          <label className="block font-medium mb-1">Upload Supporting Files</label>
          <input type="file" multiple className="block w-full border rounded px-3 py-2" disabled />
          <div className="text-xs text-muted-foreground mt-1">(File upload placeholder, no logic)</div>
        </div>
        <div className="mb-4">
          <label htmlFor="reason" className="block font-medium mb-1">Reason for Dispute</label>
          <textarea id="reason" className="block w-full border rounded px-3 py-2" rows={3} placeholder="Describe your reason..." disabled />
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="default" className="w-full" disabled>Submit Dispute</Button>
      </CardFooter>
    </Card>
  );
}
