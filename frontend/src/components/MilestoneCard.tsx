import React from "react";
import { Card, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export interface MilestoneCardProps {
  title: string;
  amount: string;
  dueDate: string;
  status: "Pending" | "Submitted" | "Approved";
}

export function MilestoneCard({ title, amount, dueDate, status }: MilestoneCardProps) {
  return (
    <Card className="w-full max-w-md">
      <CardTitle>{title}</CardTitle>
      <CardContent>
        <div className="text-sm mb-1">Amount: <span className="font-medium">{amount}</span></div>
        <div className="text-sm mb-1">Due: {dueDate}</div>
        <div className="text-sm mb-1">Status: <span className={status === "Approved" ? "text-green-600" : status === "Submitted" ? "text-blue-600" : "text-yellow-600"}>{status}</span></div>
      </CardContent>
      <CardFooter>
        <div className="flex gap-2">
          <Button variant="default" disabled>Submit Work</Button>
          <Button variant="ghost" disabled>View</Button>
          <Button variant="ghost" disabled>Raise Dispute</Button>
        </div>
      </CardFooter>
    </Card>
  );
}
