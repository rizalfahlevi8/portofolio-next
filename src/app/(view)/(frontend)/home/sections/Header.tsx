import React, { useEffect, useRef, useState } from "react";

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
  const navRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Helper to compute active section by distance from top (account for header height)
    const getSections = () =>
      navItems.map((n) => document.getElementById(n.id)).filter(Boolean) as HTMLElement[];

    let ticking = false;

    const updateActiveByScroll = () => {
      const sections = getSections();
      if (!sections.length) return;

      const headerHeight = navRef.current?.getBoundingClientRect().height ?? 0;
      const offset = headerHeight + 16; // small offset so the section just under the header is preferred

      let bestId = sections[0].id;
      let bestDistance = Infinity;

      sections.forEach((el) => {
        const rect = el.getBoundingClientRect();
        const distance = Math.abs(rect.top - offset);
        if (distance < bestDistance) {
          bestDistance = distance;
          bestId = el.id;
        }
      });

      setActive((prev) => (prev !== bestId ? bestId : prev));
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(() => {
          updateActiveByScroll();
          ticking = false;
        });
      }
    };

    // initial set after a short delay to allow layout to stabilize
    const initTimeout = setTimeout(updateActiveByScroll, 50);

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    // listen custom nav activation events (dispatched from Hero button, etc.)
    const onNavActivate = (e: Event) => {
      try {
        const custom = e as CustomEvent;
        const id = custom?.detail?.id;
        if (id && navItems.some((n) => n.id === id)) {
          setActive(id);
        }
      } catch {
        // ignore
      }
    };
    window.addEventListener("nav:activate", onNavActivate as EventListener);

    // also observe DOM mutations (optional) - in case sections are added dynamically
    const observer = new MutationObserver(() => {
      updateActiveByScroll();
    });
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      clearTimeout(initTimeout);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      window.removeEventListener("nav:activate", onNavActivate as EventListener);
      observer.disconnect();
    };
    // navItems is static here so leaving dependency array empty is fine
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    <div className="flex justify-center items-center fixed w-full top-3 z-10 pointer-events-none" ref={navRef}>
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