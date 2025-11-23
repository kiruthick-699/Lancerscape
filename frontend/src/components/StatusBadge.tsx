import React from "react";

export function StatusBadge({ status }: { status: "Pending" | "Active" | "Completed" }) {
  let color = "bg-yellow-100 text-yellow-800";
  if (status === "Active") color = "bg-blue-100 text-blue-800";
  if (status === "Completed") color = "bg-green-100 text-green-800";
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${color}`}>{status}</span>
  );
}
