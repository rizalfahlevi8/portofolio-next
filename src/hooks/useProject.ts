// hooks/useProject.ts
import { useState, useCallback } from 'react';
import axios from 'axios';
import { Project, ProjectFormValues } from '@/domain/project-schema';
import toast from 'react-hot-toast';

interface UseProjectManagerReturn {
    project: Project[];
    isLoading: boolean;
    isUploadingThumbnail: boolean;
    isUploadingPhotos: boolean;
    addProject: (
        data: ProjectFormValues,
        thumbnailFile?: File | null,
        photoFiles?: File[]
    ) => Promise<void>;
    updateProject: (projectId: string, updateData: {
        data: ProjectFormValues;
        thumbnailFile?: File | null;
        photoFiles?: File[];
        existingPhotos?: string[];
        deletedPhotos?: string[];
        thumbnailDeleted?: boolean;
        oldThumbnail?: string;
    }) => Promise<void>;
    deleteProject: (projectId: string) => Promise<void>;
    fetchProjects: () => Promise<void>;
}

export function useProjectManager(): UseProjectManagerReturn {
    const [project, setProject] = useState<Project[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploadingThumbnail, setIsUploadingThumbnail] = useState(false);
    const [isUploadingPhotos, setIsUploadingPhotos] = useState(false);

    const fetchProjects = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await axios.get<Project[]>('/api/projects');

            if (Array.isArray(response.data)) {
                setProject(response.data);
            } else {
                console.error('API response is not an array:', response.data);
                setProject([]);
            }
        } catch (error) {
            console.error('Error fetching projects:', error);
            setProject([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // ADD PROJECT (pakai FormData)
    const addProject = useCallback(
        async (data: ProjectFormValues, thumbnailFile?: File | null, photoFiles?: File[]) => {
            const tempId = `temp-${Date.now()}`;
            const optimisticProject: Project = {
                id: tempId,
                title: data.title,
                description: data.description,
                feature: data.feature,
                technology: data.technology,
                githubUrl: data.githubUrl,
                liveUrl: data.liveUrl,
                thumbnail: "", // will be set by backend
                photo: [],
                createdAt: new Date(),
                updatedAt: null,
                Skills: []
            };

            setProject(prev => [optimisticProject, ...prev]);

            try {
                // Build FormData
                const formData = new FormData();
                formData.append("title", data.title);
                formData.append("description", data.description);
                formData.append("feature", JSON.stringify(data.feature));
                formData.append("technology", JSON.stringify(data.technology));
                formData.append("githubUrl", data.githubUrl ?? "");
                formData.append("liveUrl", data.liveUrl ?? "");
                formData.append("skillId", JSON.stringify(data.skillId ?? []));

                if (thumbnailFile) {
                    formData.append("thumbnail", thumbnailFile);
                }
                if (photoFiles && photoFiles.length > 0) {
                    photoFiles.forEach(file => formData.append("photo", file));
                }

                // Pakai fetch, bukan axios!
                const response = await fetch('/api/projects', {
                    method: 'POST',
                    body: formData,
                });

                const result = await response.json();
                if (result && result.id) {
                    setProject(prev =>
                        prev.map(p => (p.id === tempId ? result : p))
                    );
                } else {
                    setProject(prev =>
                        prev.map(p =>
                            p.id === tempId ? { ...optimisticProject, id: `project-${Date.now()}` } : p
                        )
                    );
                }
            } catch (error) {
                setProject(prev => prev.filter(p => p.id !== tempId));
                throw error;
            }
        },
        []
    );

    // UPDATE PROJECT - Refactored dengan logika dari handleUpdate
    const updateProject = useCallback(
        async (projectId: string, updateData: {
            data: ProjectFormValues;
            thumbnailFile?: File | null;
            photoFiles?: File[];
            existingPhotos?: string[];
            deletedPhotos?: string[];
            thumbnailDeleted?: boolean;
            oldThumbnail?: string;
        }) => {
            const { 
                data, 
                thumbnailFile, 
                photoFiles = [], 
                existingPhotos = [], 
                deletedPhotos = [], 
                thumbnailDeleted = false,
                oldThumbnail = ""
            } = updateData;

            const projectToUpdate = project.find(p => p.id === projectId);
            if (!projectToUpdate) {
                console.error('❌ Project not found for update:', projectId);
                return;
            }

            try {
                // Validasi minimal satu foto
                const hasExistingPhotos = existingPhotos.length > 0;
                const hasNewPhotos = photoFiles.length > 0;
                const allPhotosDeleted = !hasExistingPhotos && !hasNewPhotos;

                if (allPhotosDeleted) {
                    toast.error("Minimal satu foto harus ada!");
                    return;
                }

                // Siapkan FormData
                const formData = new FormData();
                formData.append("title", data.title);
                formData.append("description", data.description);
                formData.append("feature", JSON.stringify(data.feature.filter(desc => desc.trim() !== "")));
                formData.append("technology", JSON.stringify(data.technology.filter(desc => desc.trim() !== "")));
                formData.append("githubUrl", data.githubUrl ?? "");
                formData.append("liveUrl", data.liveUrl ?? "");
                formData.append("skillId", JSON.stringify(data.skillId ?? []));

                // Kirim info thumbnail lama ke backend
                formData.append("oldThumbnail", oldThumbnail || projectToUpdate.thumbnail || "");

                // Handle thumbnail baru/hapus
                if (thumbnailFile) {
                    setIsUploadingThumbnail(true);
                    formData.append("thumbnail", thumbnailFile); // file baru
                } else if (thumbnailDeleted && (oldThumbnail || projectToUpdate.thumbnail)) {
                    formData.append("thumbnailDeleted", "true"); // flag hapus
                }
                // Kalau undefined, berarti tetap

                // Kirim info foto lama ke backend
                formData.append("oldPhotos", JSON.stringify(existingPhotos)); // foto yang dipertahankan

                // Handle upload foto baru
                if (photoFiles.length > 0) {
                    setIsUploadingPhotos(true);
                    photoFiles.forEach(file => formData.append("photo", file)); // file baru
                }

                // Handle foto yang dihapus
                if (deletedPhotos.length > 0) {
                    formData.append("deletedPhotos", JSON.stringify(deletedPhotos)); // path yang mau dihapus
                }

                console.log('🚀 Sending update request for project:', projectId);

                // Request update ke API Next.js
                const response = await fetch(`/api/projects/${projectId}`, {
                    method: 'PUT',
                    body: formData,
                });

                if (!response.ok) {
                    throw new Error('Gagal update project');
                }

                const result = await response.json();
                
                if (result && result.id) {
                    // Update state with server response
                    setProject(prev =>
                        prev.map(p => (p.id === projectId ? result : p))
                    );
                    toast.success("Proyek berhasil diupdate!");
                    console.log('✅ Project updated successfully:', result);
                } else {
                    console.warn('Server response missing project data, refetching...');
                    await fetchProjects();
                    toast.success("Proyek berhasil diupdate!");
                }

            } catch (error) {
                console.error("Error updating project:", error);
                toast.error("Gagal mengupdate proyek. Silakan coba lagi.");
                throw error;
            } finally {
                setIsUploadingThumbnail(false);
                setIsUploadingPhotos(false);
            }
        },
        [project, fetchProjects]
    );

    // DELETE: backend akan handle delete file-file terkait
    const deleteProject = useCallback(async (projectId: string) => {
        const projectToDelete = project.find(p => p.id === projectId);
        if (!projectToDelete) {
            console.error('Project not found for deletion:', projectId);
            return;
        }

        // Optimistic delete
        setProject(prev => prev.filter(p => p.id !== projectId));

        try {
            await axios.delete(`/api/projects/${projectId}`);
        } catch (error) {
            console.error('Error deleting project:', error);
            setProject(prev => [...prev, projectToDelete]);
            throw error;
        }
    }, [project]);

    return {
        project,
        isLoading,
        isUploadingThumbnail,
        isUploadingPhotos,
        addProject,
        updateProject,
        deleteProject,
        fetchProjects,
    };
}