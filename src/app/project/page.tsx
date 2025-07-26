"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useProjectManager } from "@/hooks/useProject";
import { deleteFromSupabase, getSupabaseImageUrl } from "@/lib/supabase";
import {
    Code,
    Loader2,
    ExternalLink,
    Github,
    Calendar,
    Layers,
    Wrench,
    Star,
    Monitor
} from "lucide-react";
import { useEffect, useState } from "react";
import AddProjectDialog from "./components/project-add-dialog";
import Image from "next/image";
import { ProjectEditDropdown } from "./components/project-edit-dialog";
import { ProjectFormValues } from "@/domain/project-schema";

export default function Project() {
    const { project, isLoading: isLoadingProjects, updateProject, deleteProject, fetchProjects } = useProjectManager();
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [updatingId, setUpdatingId] = useState<string | null>(null);

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

    const formatDate = (date: Date | string) => {
        return new Date(date).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const handleUpdateProject = async (projectId: string, data: ProjectFormValues) => {
        setUpdatingId(projectId);
        try {
            await updateProject(projectId, data);
        } finally {
            setUpdatingId(null);
        }
    };

    const handleDeleteProject = async (projectId: string) => {
        const data = project.find((p) => p.id === projectId);
        if (!data) return;

        setDeletingId(projectId);
        try {
            await deleteFromSupabase(data.thumbnail, 'thumbnails');
            await Promise.all(data.photo.map((path) => deleteFromSupabase(path, 'photos')));
            await deleteProject(projectId);
        } finally {
            setDeletingId(null);
        }
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
                        <div className="space-y-4">
                            {validProjects.map((projectItem) => {
                                const isTemp = isTemporaryProject(projectItem.id);
                                const thumbnailUrl = projectItem.thumbnail ? getSupabaseImageUrl(projectItem.thumbnail, 'thumbnails') : null;

                                return (
                                    <Card
                                        key={projectItem.id}
                                        className={`group hover:shadow-lg transition-all duration-300 overflow-hidden ${isTemp ? "border-yellow-400 bg-yellow-50/50" : "border-border hover:border-primary/50"
                                            }`}
                                    >
                                        <CardContent className="p-6">
                                            <div className="flex gap-6">
                                                {/* Thumbnail Section */}
                                                <div className="flex-shrink-0">
                                                    {thumbnailUrl ? (
                                                        <div className="relative w-48 h-32 overflow-hidden rounded-lg border">
                                                            <Image
                                                                src={thumbnailUrl}
                                                                alt={projectItem.title}
                                                                fill
                                                                className="object-cover transition-transform group-hover:scale-105"
                                                            />
                                                            {isTemp && (
                                                                <div className="absolute top-2 left-2">
                                                                    <Badge variant="secondary" className="bg-yellow-500 text-yellow-900 text-xs">
                                                                        Temp
                                                                    </Badge>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <div className="w-48 h-32 bg-muted rounded-lg flex items-center justify-center border">
                                                            <Code className="h-8 w-8 text-muted-foreground" />
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Main Content */}
                                                <div className="flex-1 min-w-0 overflow-hidden">
                                                    {/* Header */}
                                                    <div className="flex items-start justify-between mb-3 gap-4">
                                                        <div className="flex-1 min-w-0 overflow-hidden">
                                                            <h3 className="text-xl font-bold leading-tight mb-2 truncate">
                                                                {projectItem.title}
                                                            </h3>
                                                            <div className="text-sm text-muted-foreground">
                                                                <p
                                                                    className="leading-5 overflow-hidden"
                                                                    style={{
                                                                        display: '-webkit-box',
                                                                        WebkitBoxOrient: 'vertical',
                                                                        WebkitLineClamp: 2,
                                                                        lineHeight: '1.25rem',
                                                                        maxHeight: '2.5rem',
                                                                        wordBreak: 'break-word'
                                                                    }}
                                                                >
                                                                    {projectItem.description}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        {/* Action Menu */}
                                                        <div className="flex-shrink-0">
                                                            <ProjectEditDropdown
                                                                project={projectItem}
                                                                onUpdate={handleUpdateProject}
                                                                onDelete={handleDeleteProject}
                                                                isUpdating={updatingId === projectItem.id}
                                                                isDeleting={deletingId === projectItem.id}
                                                            />
                                                        </div>
                                                    </div>

                                                    {/* Content Grid */}
                                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                                                        {/* Left Column */}
                                                        <div className="space-y-3 min-w-0">
                                                            {/* Features */}
                                                            {projectItem.feature && projectItem.feature.length > 0 && (
                                                                <div className="space-y-1">
                                                                    <div className="flex items-center gap-2">
                                                                        <Layers className="h-4 w-4 text-primary flex-shrink-0" />
                                                                        <span className="text-sm font-medium">Features</span>
                                                                    </div>
                                                                    <div className="flex flex-wrap gap-1">
                                                                        {projectItem.feature.slice(0, 2).map((feature, index) => (
                                                                            <Badge key={index} variant="outline" className="text-xs">
                                                                                {feature}
                                                                            </Badge>
                                                                        ))}
                                                                        {projectItem.feature.length > 2 && (
                                                                            <Badge variant="outline" className="text-xs">
                                                                                +{projectItem.feature.length - 2} more
                                                                            </Badge>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {/* Technologies */}
                                                            {projectItem.technology && projectItem.technology.length > 0 && (
                                                                <div className="space-y-1">
                                                                    <div className="flex items-center gap-2">
                                                                        <Wrench className="h-4 w-4 text-primary flex-shrink-0" />
                                                                        <span className="text-sm font-medium">Tech Stack</span>
                                                                    </div>
                                                                    <div className="flex flex-wrap gap-1">
                                                                        {projectItem.technology.slice(0, 2).map((tech, index) => (
                                                                            <Badge key={index} variant="secondary" className="text-xs">
                                                                                {tech}
                                                                            </Badge>
                                                                        ))}
                                                                        {projectItem.technology.length > 2 && (
                                                                            <Badge variant="secondary" className="text-xs">
                                                                                +{projectItem.technology.length - 2} more
                                                                            </Badge>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Right Column */}
                                                        <div className="space-y-3 min-w-0">
                                                            {/* Skills */}
                                                            {projectItem.Skills && projectItem.Skills.length > 0 && (
                                                                <div className="space-y-1">
                                                                    <div className="flex items-center gap-2">
                                                                        <Star className="h-4 w-4 text-primary flex-shrink-0" />
                                                                        <span className="text-sm font-medium">Skills</span>
                                                                    </div>
                                                                    <div className="flex flex-wrap gap-1">
                                                                        {projectItem.Skills.slice(0, 4).map((skill) => (
                                                                            <Badge key={skill.id} variant="default" className="text-xs">
                                                                                {skill.name}
                                                                            </Badge>
                                                                        ))}
                                                                        {projectItem.Skills.length > 4 && (
                                                                            <Badge variant="default" className="text-xs">
                                                                                +{projectItem.Skills.length - 4} more
                                                                            </Badge>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {/* Project Photos - Renamed to "Tampilan Aplikasi" */}
                                                            {projectItem.photo && projectItem.photo.length > 0 && (
                                                                <div className="space-y-1">
                                                                    <div className="flex items-center gap-2">
                                                                        <Monitor className="h-4 w-4 text-primary flex-shrink-0" />
                                                                        <span className="text-sm font-medium">Tampilan Aplikasi ({projectItem.photo.length})</span>
                                                                    </div>
                                                                    <div className="flex gap-1">
                                                                        {projectItem.photo.slice(0, 4).map((photo, index) => {
                                                                            const photoUrl = getSupabaseImageUrl(photo, 'photos');
                                                                            return (
                                                                                <div key={index} className="relative w-12 h-8 rounded overflow-hidden border flex-shrink-0">
                                                                                    <Image
                                                                                        src={photoUrl}
                                                                                        alt={`${projectItem.title} tampilan aplikasi ${index + 1}`}
                                                                                        fill
                                                                                        className="object-cover hover:scale-110 transition-transform cursor-pointer"
                                                                                    />
                                                                                </div>
                                                                            );
                                                                        })}
                                                                        {projectItem.photo.length > 4 && (
                                                                            <div className="w-12 h-8 rounded border bg-muted flex items-center justify-center flex-shrink-0">
                                                                                <span className="text-[10px] font-medium text-muted-foreground">
                                                                                    +{projectItem.photo.length - 4}
                                                                                </span>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Footer */}
                                                    <div className="flex items-center justify-between pt-3 border-t gap-4">
                                                        {/* Date Info */}
                                                        <div className="flex items-center gap-2 text-xs text-muted-foreground min-w-0 flex-shrink">
                                                            <Calendar className="h-3 w-3 flex-shrink-0" />
                                                            <span className="truncate">Created {formatDate(projectItem.createdAt)}</span>
                                                            {projectItem.updatedAt && (
                                                                <span className="hidden sm:inline">• Updated {formatDate(projectItem.updatedAt)}</span>
                                                            )}
                                                        </div>

                                                        {/* Action Buttons */}
                                                        <div className="flex gap-2 flex-shrink-0">
                                                            {projectItem.githubUrl && (
                                                                <Button size="sm" variant="outline" asChild>
                                                                    <a href={projectItem.githubUrl} target="_blank" rel="noopener noreferrer">
                                                                        <Github className="h-4 w-4 mr-1" />
                                                                        Code
                                                                    </a>
                                                                </Button>
                                                            )}
                                                            {projectItem.liveUrl && (
                                                                <Button size="sm" asChild>
                                                                    <a href={projectItem.liveUrl} target="_blank" rel="noopener noreferrer">
                                                                        <ExternalLink className="h-4 w-4 mr-1" />
                                                                        Live Demo
                                                                    </a>
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
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