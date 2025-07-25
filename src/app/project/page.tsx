"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useProjectManager } from "@/hooks/useProject";
import { Code, Loader2 } from "lucide-react";
import { useEffect } from "react";
import AddProjectDialog from "./components/project-add-dialog";

export default function Project() {
    const { project, isLoading: isLoadingProjects, fetchProjects } = useProjectManager();

    useEffect(() => {
        fetchProjects();
    }, [fetchProjects]);

    const validProjects = project?.filter((proj) => proj && proj.id) || [];

    const handleProjectAdded = () => {
        fetchProjects();
    };

    const isTemporaryProject = (projectId: string | undefined | null): boolean => {
        return projectId ? projectId.startsWith("temp-") : false;
    };

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
                        <div className="flex items-center gap-4">
                            <AddProjectDialog onProjectAdded={handleProjectAdded} />
                        </div>
                    </div>
                    <Separator />
                    {isLoadingProjects ? (
                        <div className="text-center py-12">
                            <Loader2 className="h-8 w-8 mx-auto mb-4 animate-spin text-muted-foreground" />
                            <p className="text-muted-foreground">Loading Proyek...</p>
                        </div>
                    ) : validProjects.length > 0 ? (
                        <div className="space-y-6">
                            {validProjects.map((project) => {
                                const isTemp = isTemporaryProject(project.id);
                                return (
                                    <div key={project.id} className={`p-4 border rounded ${isTemp ? "bg-yellow-100" : "bg-white"}`}>
                                        <h3 className="font-semibold">{project.title}</h3>
                                        <p className="text-sm text-muted-foreground">{project.description}</p>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-12 text-muted-foreground">
                            <Code className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p className="text-lg font-medium mb-2">Belum ada proyek yang ditambahkan</p>
                            <p className="text-sm">
                                Mulai tambahkan proyek pertama kamu menggunakan tombol tambah di atas!
                            </p>
                        </div>
                    )}
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}