"use client"

import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";


export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="flex-1 space-y-6 p-8">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}