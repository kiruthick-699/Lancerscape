import React from "react";
import { ProjectCard } from "@/components/ProjectCard";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

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
  // Simulate empty state - set to empty array to test
  const projects = placeholderProjects;

  if (projects.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px] w-full">
        <Card className="w-full max-w-md mx-auto text-center py-6">
          <div className="mb-4">
            <svg
              className="w-16 h-16 text-muted-foreground mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold mb-2">No projects found</h3>
          <p className="text-muted-foreground mb-6">
            Get started by creating your first project
          </p>
          <Link href="/projects/create">
            <Button className="px-6 py-3 text-base">Create New Project</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {projects.map((project, idx) => (
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
