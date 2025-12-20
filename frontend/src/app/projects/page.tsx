import { ProjectGrid } from "@/app/projects/ProjectGrid";

export default function ProjectsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Projects</h1>
      <section className="py-2">
        <ProjectGrid />
      </section>
    </div>
  );
}
