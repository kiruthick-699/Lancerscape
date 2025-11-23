import React from "react";
import { ProjectCard } from "@/components/ProjectCard";

const placeholderProjects = [
  {
    title: "Website Redesign",
    client: "Acme Corp",
    status: "Active",
    milestones: 5,
  },
  {
    title: "Mobile App Launch",
    client: "Beta LLC",
    status: "Pending",
    milestones: 3,
  },
  {
    title: "API Integration",
    client: "Gamma Inc",
    status: "Completed",
    milestones: 4,
  },
];

export function ProjectGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {placeholderProjects.map((project, idx) => (
        <ProjectCard
          key={idx}
          title={project.title}
          client={project.client}
          status={project.status as "Pending" | "Active" | "Completed"}
          milestones={project.milestones}
        />
      ))}
    </div>
  );
}
