"use client";

import { useHomeManager } from "@/hooks/frontend/useHome";
import { Header } from "./sections/Header";
import { HeroSection } from "./sections/Hero";
import { ProjectsSection } from "./sections/projects";
import { TapeSection } from "./sections/Tape";
import { WorkExperienceSection } from "./sections/WorkExperience";
import { AboutSection } from "./sections/About";
import { ContactSection } from "./sections/Contact";
import { FooterSection } from "./sections/Footer";
import { HomeNoData } from "./sections/NoData";
import { Suspense } from "react";

// Loading component lebih ringan
function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center space-y-4">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900"></div>
        <p className="text-gray-600 text-sm">Loading...</p>
      </div>
    </div>
  );
}

function HomeContent() {
  const { home, isLoading, error, mutate } = useHomeManager();

  const validHome = home?.filter((item) => item && item.id) || [];
  const homeData = validHome[0];

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error || !homeData) {
    return <HomeNoData onReload={() => mutate()} />;
  }

  return (
    <>
      <Header />

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
    </>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <HomeContent />
    </Suspense>
  );
}