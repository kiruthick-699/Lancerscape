import React from "react";
import Link from "next/link";

interface BreadcrumbSegment {
  label: string;
  href: string;
}

interface BreadcrumbsProps {
  segments: BreadcrumbSegment[];
}

export function Breadcrumbs({ segments }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center space-x-2 text-sm">
      {segments.map((segment, index) => {
        const isLast = index === segments.length - 1;

        return (
          <React.Fragment key={segment.href}>
            {index > 0 && (
              <span className="text-muted-foreground">/</span>
            )}
            {isLast ? (
              <span className="text-foreground font-medium">
                {segment.label}
              </span>
            ) : (
              <Link
                href={segment.href}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {segment.label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
