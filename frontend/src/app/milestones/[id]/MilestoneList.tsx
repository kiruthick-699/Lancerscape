import React from "react";
import { MilestoneCard } from "@/components/MilestoneCard";

const mockMilestones = [
  {
    title: "Design Phase",
    amount: "$1,000",
    dueDate: "2025-12-01",
    status: "Pending",
  },
  {
    title: "Development Phase",
    amount: "$2,500",
    dueDate: "2026-01-15",
    status: "Submitted",
  },
  {
    title: "Testing & QA",
    amount: "$800",
    dueDate: "2026-02-10",
    status: "Approved",
  },
];

export function MilestoneList() {
  return (
    <div className="flex flex-col gap-6">
      {mockMilestones.map((milestone, idx) => (
        <MilestoneCard
          key={idx}
          title={milestone.title}
          amount={milestone.amount}
          dueDate={milestone.dueDate}
          status={milestone.status as "Pending" | "Submitted" | "Approved"}
        />
      ))}
    </div>
  );
}
