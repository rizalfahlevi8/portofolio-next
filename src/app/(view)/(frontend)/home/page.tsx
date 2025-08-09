"use client";

import { Card, CardContent } from "@/components/ui/card";
import { useHomeManager } from "@/hooks/frontend/useHome";
import { useEffect } from "react";

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

  if (!home) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="text-4xl mb-4">🔍</div>
            <h2 className="text-2xl font-bold mb-2">No Data Found</h2>
            <p className="text-muted-foreground">Portfolio data could not be loaded.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      {isLoadingHome ? (
        <p>Loading...</p>
      ) : homeData ? (
        <div>
          <h1 className="text-2xl font-bold">{homeData.name}</h1>
          <p>{homeData.jobTitle}</p>
        </div>
      ) : (
        <p>No home data available.</p>
      )}
    </div>
  )
}