import React from "react";

export function PageHeader({ title, description }: { title: string; description?: string }) {
  return (
    <header className="mb-6">
      <h1 className="text-2xl font-bold mb-1">{title}</h1>
      {description && <p className="text-muted-foreground text-sm">{description}</p>}
    </header>
  );
}
