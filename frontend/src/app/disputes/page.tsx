import { MainLayout } from "@/components/MainLayout";
import { FileDisputeForm } from "@/app/disputes/FileDisputeForm";

export default function DisputesPage() {
  return (
    <MainLayout>
      <h1 className="text-2xl font-bold mb-4">Disputes</h1>
      <section className="py-2">
        <FileDisputeForm />
      </section>
    </MainLayout>
  );
}
