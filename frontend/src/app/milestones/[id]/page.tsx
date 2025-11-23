import { MainLayout } from "@/components/MainLayout";
import { MilestoneList } from "@/app/milestones/[id]/MilestoneList";

export default function MilestoneDetailsPage() {
  return (
    <MainLayout>
      <h1 className="text-2xl font-bold mb-4">Milestone Details</h1>
      <section className="py-2">
        <MilestoneList />
      </section>
    </MainLayout>
  );
}
