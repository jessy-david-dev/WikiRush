"use client";

import { useEffect, useRef } from "react";

const FORBIDDEN_NAMESPACES = [
  "Fichier:",
  "File:",
  "Wikipedia:",
  "Aide:",
  "Help:",
  "Categorie:",
  "Category:",
  "Discussion:",
  "Talk:",
  "Utilisateur:",
  "User:",
  "Special:",
  "Sp\u00e9cial:",
  "Portail:",
  "Portal:",
  "Mod\u00e8le:",
  "Template:",
  "Projet:",
  "WP:",
];

const REMOVED_SECTION_IDS = [
  "Liens_externes",
];

function getHeadingId(el: Element): string {
  // Nouvelle structure Wikipedia : <div class="mw-heading"><h2 id="...">
  const idEl = el.querySelector("[id]");
  if (idEl) return idEl.getAttribute("id") ?? "";
  // Ancienne structure : <h2><span id="...">
  const span = el.querySelector("span[id]");
  return span?.getAttribute("id") ?? "";
}

function cleanWikiHtml(container: HTMLElement): void {
  container.querySelectorAll(".mw-editsection").forEach((el) => el.remove());

  container
    .querySelectorAll(
      ".navbox, .navbox-inner, .vertical-navbox, .catlinks, .sistersitebox, .bandeau-portail",
    )
    .forEach((el) => el.remove());
  container
    .querySelectorAll(
      ".ambox, .tmbox, .cmbox, .ombox, .fmbox, .bandeau-container, .bandeau",
    )
    .forEach((el) => el.remove());
  container
    .querySelectorAll(".audio, .audiolink, audio, video")
    .forEach((el) => el.remove());
  container.querySelectorAll(".gallery").forEach((el) => el.remove());
  container.querySelectorAll("#toc, .toc").forEach((el) => el.remove());

  // Supprimer les divs de navigation pure (liens internes type sommaire flottant)
  // mais pas les listes de références qui contiennent des ancres #cite_note-
  container.querySelectorAll("div, nav").forEach((el) => {
    const links = el.querySelectorAll("a");
    if (links.length > 3) {
      const anchorOnly = Array.from(links).every((a) => {
        const href = a.getAttribute("href") ?? "";
        return href.startsWith("#") || href.includes("#");
      });
      const hasCiteLinks = Array.from(links).some((a) =>
        (a.getAttribute("href") ?? "").includes("cite_"),
      );
      if (anchorOnly && !hasCiteLinks) el.remove();
    }
  });

  // Supprimer les sections indésirables — supporte ancienne et nouvelle structure Wikipedia
  // Nouvelle : <div class="mw-heading mw-heading2"> / Ancienne : <h2><span id="...">
  const headingSelectors = "h2, h3, .mw-heading";
  container.querySelectorAll(headingSelectors).forEach((heading) => {
    const id = getHeadingId(heading);
    if (!id) return;
    if (REMOVED_SECTION_IDS.some((s) => id === s || id.startsWith(s + "_"))) {
      let sibling: Element | null = heading;
      while (sibling) {
        const next: Element | null = sibling.nextElementSibling;
        sibling.remove();
        sibling = next;
      }
    }
  });
}

export function ArticleView({
  html,
  onNavigate,
  disabled = false,
}: {
  html: string;
  onNavigate: (title: string) => void;
  disabled?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const onNavigateRef = useRef(onNavigate);
  const disabledRef = useRef(disabled);

  useEffect(() => {
    onNavigateRef.current = onNavigate;
  });
  useEffect(() => {
    disabledRef.current = disabled;
  });

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !html) return;

    container.innerHTML = html;
    cleanWikiHtml(container);

    container
      .querySelectorAll<HTMLAnchorElement>("a[href^='/wiki/']")
      .forEach((link) => {
        const href = link.getAttribute("href") ?? "";
        const path = href.replace("/wiki/", "");
        let decoded: string;
        try {
          decoded = decodeURIComponent(path);
        } catch {
          decoded = path;
        }
        const title = decoded.replace(/_/g, " ");

        if (
          FORBIDDEN_NAMESPACES.some((ns) => title.startsWith(ns)) ||
          title.includes("#")
        ) {
          link.removeAttribute("href");
          return;
        }
        link.setAttribute("data-wiki-title", title);
        link.removeAttribute("href");
        link.classList.add("wiki-link");
      });

    container.querySelectorAll<HTMLAnchorElement>("a[href]").forEach((link) => {
      link.removeAttribute("href");
    });

    const handleClick = (e: MouseEvent) => {
      if (disabledRef.current) return;
      const target = (e.target as HTMLElement).closest(
        "[data-wiki-title]",
      ) as HTMLElement | null;
      if (!target) return;
      e.preventDefault();
      const title = target.getAttribute("data-wiki-title");
      if (title) onNavigateRef.current(title);
    };

    container.addEventListener("click", handleClick);
    return () => container.removeEventListener("click", handleClick);
  }, [html]);

  return <div ref={containerRef} className="article-content" />;
}
