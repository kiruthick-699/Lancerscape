import { FileDisputeForm } from "@/app/disputes/FileDisputeForm";

export default function DisputesPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Disputes</h1>
      <section className="py-2">
        <FileDisputeForm />
      </section>
    </div>
  );
}
