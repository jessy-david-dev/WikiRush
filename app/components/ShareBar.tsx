"use client";

import { useState } from "react";
import { siX, siWhatsapp } from "simple-icons";

type ShareBarProps = {
  text: string; // texte du tweet/post
};

export function ShareBar({ text }: ShareBarProps) {
  const [copied, setCopied] = useState(false);
  const url = "https://wikirush.xyz";
  const encoded = encodeURIComponent(text + "\n" + url);

  const links = [
    {
      label: "X",
      href: `https://x.com/intent/tweet?text=${encoded}`,
      si: siX,
    },
    {
      label: "LinkedIn",
      href: `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(url)}&title=${encodeURIComponent("WikiRush")}&summary=${encodeURIComponent(text)}`,
      si: { hex: "0A66C2", path: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" },
    },
    {
      label: "WhatsApp",
      href: `https://wa.me/?text=${encoded}`,
      si: siWhatsapp,
    },
  ];

  function copyToClipboard() {
    navigator.clipboard.writeText(text + "\n" + url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="text-[10px] font-bold uppercase tracking-widest text-[#555]">
        Partager
      </span>
      <div className="flex gap-2 flex-wrap">
        {links.map(({ label, href, si }) => (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold
                       bg-[#1a1a1a] border border-[#2e2e2e] text-[#ccc]
                       hover:bg-[#242424] hover:border-[#3a3a3a] transition-colors"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0" style={{ fill: `#${si.hex}` }} aria-hidden>
              <path d={si.path} />
            </svg>
            {label}
          </a>
        ))}
        <button
          onClick={copyToClipboard}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold
                     bg-[#1a1a1a] border border-[#2e2e2e] text-[#ccc]
                     hover:bg-[#242424] hover:border-[#3a3a3a] transition-colors cursor-pointer"
        >
          {copied ? (
            <>
              <svg
                viewBox="0 0 24 24"
                className="w-4 h-4 fill-none stroke-current stroke-2"
                aria-hidden
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Copié !
            </>
          ) : (
            <>
              <svg
                viewBox="0 0 24 24"
                className="w-4 h-4 fill-none stroke-current stroke-2"
                aria-hidden
              >
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
              Copier
            </>
          )}
        </button>
      </div>
    </div>
  );
}
