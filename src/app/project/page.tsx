import { AppSidebar } from "@/components/app-sidebar";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default function Project() {
    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <div className="flex-1 space-y-6 p-8">
                    <div className="flex items-center justify-between">
                        <Heading
                            title="Project Management"
                            description="Kelola data proyek yang kamu miliki"
                        />
                    </div>
                    <Separator />
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}