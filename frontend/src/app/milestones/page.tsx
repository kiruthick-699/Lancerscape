'use client';

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type MilestoneStatus = "Pending" | "In Progress" | "Completed" | "Disputed";

interface Milestone {
  id: number;
  title: string;
  amount: number;
  status: MilestoneStatus;
}

export default function MilestonesPage() {
  const [selectedFilter, setSelectedFilter] = useState<MilestoneStatus | "All">("All");

  // Sample milestone data
  const milestones: Milestone[] = [
    { id: 1, title: "Initial Design Mockups", amount: 0.5, status: "Completed" },
    { id: 2, title: "Frontend Development", amount: 1.2, status: "In Progress" },
    { id: 3, title: "Backend API Integration", amount: 1.5, status: "Pending" },
    { id: 4, title: "Smart Contract Deployment", amount: 2.0, status: "Pending" },
    { id: 5, title: "Payment Gateway Setup", amount: 0.8, status: "Disputed" },
    { id: 6, title: "UI/UX Review", amount: 0.6, status: "Completed" },
    { id: 7, title: "Testing & QA", amount: 1.0, status: "In Progress" },
    { id: 8, title: "Documentation", amount: 0.4, status: "Pending" },
  ];

  const filters: Array<MilestoneStatus | "All"> = [
    "All",
    "Pending",
    "In Progress",
    "Completed",
    "Disputed",
  ];

  // Filter milestones based on selected filter
  const filteredMilestones = selectedFilter === "All"
    ? milestones
    : milestones.filter((milestone) => milestone.status === selectedFilter);

  // Get badge variant based on status
  const getBadgeVariant = (status: MilestoneStatus): "default" | "secondary" | "success" | "warning" | "destructive" => {
    switch (status) {
      case "Completed":
        return "success";
      case "In Progress":
        return "default";
      case "Pending":
        return "secondary";
      case "Disputed":
        return "destructive";
      default:
        return "default";
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">All Milestones</h1>

      {/* Filter Bar */}
      <div className="flex gap-2 flex-wrap">
        {filters.map((filter) => (
          <Button
            key={filter}
            variant={selectedFilter === filter ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedFilter(filter)}
          >
            {filter}
          </Button>
        ))}
      </div>

      {/* Milestone List */}
      <div className="space-y-4">
        {filteredMilestones.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="space-y-2">
              <p className="text-lg font-medium text-muted-foreground">
                No milestones found
              </p>
              <p className="text-sm text-muted-foreground">
                There are no milestones matching the selected filter.
              </p>
            </div>
          </Card>
        ) : (
          filteredMilestones.map((milestone) => (
            <Card key={milestone.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold">{milestone.title}</h3>
                    <Badge variant={getBadgeVariant(milestone.status)}>
                      {milestone.status}
                    </Badge>
                  </div>
                  <p className="text-xl font-bold text-primary">
                    {milestone.amount} ETH
                  </p>
                </div>
                <Button size="sm">View</Button>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
