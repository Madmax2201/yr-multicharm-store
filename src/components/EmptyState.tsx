"use client";

import { PackageOpen } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
}: EmptyStateProps) {
  const ActionWrapper = actionHref ? Link : "button";

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-6 text-[var(--muted)]">
        {icon || <PackageOpen size={64} strokeWidth={1} />}
      </div>
      <h3 className="mb-2 text-xl font-semibold text-[var(--fg)]">{title}</h3>
      {description && (
        <p className="mb-8 max-w-sm text-sm text-[var(--muted)]">{description}</p>
      )}
      {actionLabel && (
        <ActionWrapper
          href={actionHref || "#"}
          onClick={onAction}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
        >
          {actionLabel}
        </ActionWrapper>
      )}
    </div>
  );
}
