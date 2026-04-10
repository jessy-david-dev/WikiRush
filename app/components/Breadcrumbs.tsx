"use client";

import { useRef } from "react";

export function Breadcrumbs({ history, endRef }: { history: string[]; endRef: React.RefObject<HTMLDivElement | null> }) {
  return (
    <div className="flex items-center flex-nowrap overflow-x-auto gap-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {history.map((title, i) => (
        <span key={i} className="flex items-center whitespace-nowrap shrink-0">
          {i > 0 && <span className="text-[#888] text-xs px-1">›</span>}
          <span className={i === history.length - 1 ? "text-xs font-bold text-[#f0f0f0]" : "text-xs text-[#888]"}>
            {title}
          </span>
        </span>
      ))}
      <div ref={endRef} />
    </div>
  );
}

export function useBreadcrumbScroll() {
  const endRef = useRef<HTMLDivElement>(null);
  return endRef;
}
