"use client";

import { useHomeStore } from "@/store/home-store";
import { Header } from "./sections/Header";
import { HeroSection } from "./sections/Hero";
import { ProjectsSection } from "./sections/projects";
import { TapeSection } from "./sections/Tape";
import { WorkExperienceSection } from "./sections/WorkExperience";
import { AboutSection } from "./sections/About";
import { ContactSection } from "./sections/Contact";
import { FooterSection } from "./sections/Footer";
import { HomeNoData } from "./sections/NoData";
import { Suspense, useEffect, useState, useRef, useMemo } from "react";

const TIMEOUT_DURATION = 5000; // 5 detik

// Custom hook untuk handle timeout
function useNoDataTimeout(isLoading: boolean, hasData: boolean, hasError: boolean) {
  const [timeoutExpired, setTimeoutExpired] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    // Reset state jika mulai loading atau ada data
    if (isLoading || hasData) {
      // Gunakan setTimeout untuk menghindari synchronous setState
      if (timeoutExpired) {
        setTimeout(() => setTimeoutExpired(false), 0);
      }
      return;
    }

    // Jika ada error, langsung set timeout expired
    if (hasError) {
      setTimeout(() => setTimeoutExpired(true), 0);
      return;
    }

    // Set timeout untuk menampilkan "No Data"
    timeoutRef.current = setTimeout(() => {
      setTimeoutExpired(true);
    }, TIMEOUT_DURATION);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [isLoading, hasData, hasError, timeoutExpired]);

  return timeoutExpired;
}

// Loading component
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
  const { home, isLoading, error, fetchHome, refetch } = useHomeStore();

  // Fetch data saat component mount
  useEffect(() => {
    fetchHome();
  }, [fetchHome]);

  const validHome = useMemo(
    () => home?.filter((item) => item && item.id) || [],
    [home]
  );
  const homeData = validHome[0];
  const hasData = Boolean(homeData);

  // Use custom hook untuk timeout
  const timeoutExpired = useNoDataTimeout(isLoading, hasData, Boolean(error));

  // Tampilkan loading
  if (isLoading) {
    return <LoadingSpinner />;
  }

  // Tampilkan No Data jika timeout expired atau ada error
  if ((!homeData && timeoutExpired) || error) {
    return <HomeNoData onReload={refetch} />;
  }

  // Tampilkan loading jika belum ada data dan belum timeout
  if (!homeData) {
    return <LoadingSpinner />;
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
        <TapeSection
          rotation="-rotate-3"
          animation="animate-move-left [animation-duration:400s]"
        />
      </section>

      <section id="work-experience">
        <WorkExperienceSection home={homeData} />
      </section>

      <section aria-hidden className="min-h-[120px]">
        <TapeSection
          rotation="rotate-3"
          animation="animate-move-right [animation-duration:400s]"
        />
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