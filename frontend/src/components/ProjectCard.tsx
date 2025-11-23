import React from "react";
import { Card, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export interface ProjectCardProps {
  title: string;
  client: string;
  status: "Pending" | "Active" | "Completed";
  milestones: number;
}

export function ProjectCard({ title, client, status, milestones }: ProjectCardProps) {
  return (
    <Card className="w-full max-w-xs">
      <CardTitle>{title}</CardTitle>
      <CardContent>
        <div className="text-sm text-muted-foreground mb-1">Client: {client}</div>
        <div className="text-sm mb-1">Status: <span className={status === "Completed" ? "text-green-600" : status === "Active" ? "text-blue-600" : "text-yellow-600"}>{status}</span></div>
        <div className="text-sm">Milestones: {milestones}</div>
      </CardContent>
      <CardFooter>
        <Button variant="default" className="w-full">View</Button>
      </CardFooter>
    </Card>
  );
}
