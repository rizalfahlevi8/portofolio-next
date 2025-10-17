"use client";

import { SWRConfig } from "swr";
import { ReactNode } from "react";

export function SWRProviders({ children }: { children: ReactNode }) {
  return (
    <SWRConfig
      value={{
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
        dedupingInterval: 60000,
        keepPreviousData: true,
        errorRetryCount: 3,
        errorRetryInterval: 5000,
        loadingTimeout: 3000,
        focusThrottleInterval: 60000,
      }}
    >
      {children}
    </SWRConfig>
  );
}