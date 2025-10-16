"use client";

import { useHomeManager } from "@/hooks/frontend/useHome";
import { useEffect } from "react";
import { Header } from "./sections/Header";
import { HeroSection } from "./sections/Hero";
import { ProjectsSection } from "./sections/projects";
import { TapeSection } from "./sections/Tape";
import { WorkExperienceSection } from "./sections/WorkExperience";
import { AboutSection } from "./sections/About";
import { ContactSection } from "./sections/Contact";
import { FooterSection } from "./sections/Footer";
import { HomeNoData } from "./sections/NoData";

export default function Home() {
  const { home, isLoading: isLoadingHome, fetchHome } = useHomeManager();

  useEffect(() => {
    fetchHome();
  }, [fetchHome]);

  const validHome = home?.filter((item) => item && item.id) || [];
  const homeData = validHome[0];

  if (isLoadingHome) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          <p className="text-muted-foreground animate-pulse">Loading portfolio...</p>
        </div>
      </div>
    );
  }

  if (!home || !homeData) {
    return <HomeNoData onReload={fetchHome} />;
  }

  return (
    <div>
      <Header />

      {/* Each section wrapped with an id that matches Header nav links */}
      <section id="hero">
        <HeroSection home={homeData} />
      </section>

      <section id="projects">
        <ProjectsSection home={homeData} />
      </section>

      <section aria-hidden className="min-h-[120px]">
        <TapeSection rotation="-rotate-3" animation="animate-move-left [animation-duration:400s]" />
      </section>

      <section id="work-experience">
        <WorkExperienceSection home={homeData} />
      </section>

      <section aria-hidden className="min-h-[120px]">
        <TapeSection rotation="rotate-3" animation="animate-move-right [animation-duration:400s]" />
      </section>

      <section id="about">
        <AboutSection home={homeData} />
      </section>

      <section id="contact">
        <ContactSection />
      </section>

      <section aria-label="footer">
        <FooterSection home={homeData} />
      </section>
    </div>
  );
}