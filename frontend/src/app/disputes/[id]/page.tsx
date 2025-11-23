import { MainLayout } from "@/components/MainLayout";
import { AISummaryPage } from "@/app/disputes/[id]/AISummaryPage";

export default function DisputeDetailsPage() {
  return (
    <MainLayout>
      <h1 className="text-2xl font-bold mb-4">Dispute Details</h1>
      <section className="py-2">
        <AISummaryPage />
      </section>
    </MainLayout>
  );
}
