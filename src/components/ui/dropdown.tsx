"use client";

import { useState, useRef, useEffect, type ReactNode } from "react";
import Link from "next/link";

interface DropdownItem {
  label: string;
  href?: string;
  onClick?: () => void;
  icon?: ReactNode;
  divider?: boolean;
}

interface DropdownProps {
  trigger: ReactNode;
  items: DropdownItem[];
  align?: "left" | "right";
  className?: string;
}

export function Dropdown({ trigger, items, align = "left", className = "" }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className={`relative inline-block ${className}`}>
      <div onClick={() => setOpen(!open)} className="cursor-pointer">
        {trigger}
      </div>
      {open && (
        <div
          className={`absolute z-50 mt-2 min-w-[200px] rounded-xl border border-[var(--border)] bg-[var(--card)] py-2 shadow-lg ${
            align === "right" ? "right-0" : "left-0"
          }`}
        >
          {items.map((item, i) => (
            <div key={i}>
              {item.divider && <div className="my-1 border-t border-[var(--border)]" />}
              {item.href ? (
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-[var(--fg)] transition-colors hover:bg-[var(--muted-bg)]"
                >
                  {item.icon && <span className="text-primary">{item.icon}</span>}
                  {item.label}
                </Link>
              ) : (
                <button
                  onClick={() => {
                    item.onClick?.();
                    setOpen(false);
                  }}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-[var(--fg)] transition-colors hover:bg-[var(--muted-bg)]"
                >
                  {item.icon && <span className="text-primary">{item.icon}</span>}
                  {item.label}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
