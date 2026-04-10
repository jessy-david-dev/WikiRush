"use client";

import { useRef } from "react";

export function Breadcrumbs({ history, endRef }: { history: string[]; endRef: React.RefObject<HTMLDivElement | null> }) {
  return (
    <div className="breadcrumb-trail">
      {history.map((title, i) => (
        <span key={i} className="breadcrumb-item">
          {i > 0 && <span className="breadcrumb-sep">›</span>}
          <span className={i === history.length - 1 ? "breadcrumb-current" : "breadcrumb-past"}>
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
