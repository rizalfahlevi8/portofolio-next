import React, { useEffect, useState } from "react";

type NavItem = {
  id: string;
  label: string;
};

export const Header: React.FC = () => {
  const navItems: NavItem[] = [
    { id: "hero", label: "Home" },
    { id: "projects", label: "Project" },
    { id: "work-experience", label: "Work" },
    { id: "about", label: "About" },
    { id: "contact", label: "Contact" },
  ];

  const [active, setActive] = useState<string>("hero");

  useEffect(() => {
    // Observe all sections with matching IDs
    const sections = navItems
      .map((n) => document.getElementById(n.id))
      .filter(Boolean) as HTMLElement[];

    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Pick the visible entry with the largest intersection ratio
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visible) {
          setActive(visible.target.id);
        } else {
          // If none intersecting, find the section closest to top
          const sortedByTop = sections
            .map((el) => ({ id: el.id, top: Math.abs(el.getBoundingClientRect().top) }))
            .sort((a, b) => a.top - b.top);
          if (sortedByTop[0]) setActive(sortedByTop[0].id);
        }
      },
      {
        // adjust rootMargin so header height doesn't hide the target
        root: null,
        rootMargin: "-30% 0px -60% 0px",
        threshold: [0, 0.25, 0.5, 0.75, 1],
      }
    );

    sections.forEach((s) => observer.observe(s));

    return () => observer.disconnect();
  }, []);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    // update active immediately for better UX on click
    setActive(id);
    // update the URL hash (optional)
    history.replaceState(null, "", `#${id}`);
  };

  return (
    <div className="flex justify-center items-center fixed w-full top-3 z-10 pointer-events-none">
      <nav className="pointer-events-auto flex gap-1 p-0.5 border border-black/15 rounded-full bg-black/10 backdrop-blur">
        {navItems.map((item) => {
          const isActive = active === item.id;
          return (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={(e) => handleClick(e, item.id)}
              aria-current={isActive ? "page" : undefined}
              className={
                // keep your original classes; adjust active state styles here
                `nav-item px-4 py-2 rounded-full transition-colors duration-150 ${
                  isActive
                    ? "bg-white text-gray-900 shadow-md"
                    : "text-gray-700 hover:bg-white/70 hover:text-gray-900"
                }`
              }
            >
              {item.label}
            </a>
          );
        })}
      </nav>
    </div>
  );
};