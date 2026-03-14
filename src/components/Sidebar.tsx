"use client";

import { useState, useEffect } from "react";

export interface SidebarSection {
  id: string;
  label: string;
}

interface SidebarProps {
  sections: SidebarSection[];
}

export function Sidebar({ sections }: SidebarProps) {
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: "-80px 0px -60% 0px" }
    );

    for (const section of sections) {
      const el = document.getElementById(section.id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, [sections]);

  return (
    <>
      <nav className="hidden lg:block sticky top-24 self-start w-56 shrink-0">
        <ul className="space-y-1">
          {sections.map((s) => (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                className={`block px-3 py-1.5 text-sm rounded transition-colors ${
                  activeId === s.id
                    ? "bg-blue-50 text-blue-700 font-medium"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {s.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="lg:hidden sticky top-0 z-40 bg-white border-b border-gray-200 px-4 py-2">
        <select
          value={activeId}
          onChange={(e) => {
            const el = document.getElementById(e.target.value);
            el?.scrollIntoView({ behavior: "smooth" });
          }}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
        >
          {sections.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>
      </div>
    </>
  );
}
