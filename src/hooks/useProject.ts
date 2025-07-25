import { useState, useCallback } from 'react';
import axios from 'axios';
import { Project, ProjectFormValues } from '@/domain/project-schema';

interface UseProjectManagerReturn {
    project: Project[];
    isLoading: boolean;
    addProject: (data: ProjectFormValues) => Promise<void>;
    updateProject: (projectId: string, data: ProjectFormValues) => Promise<void>;
    deleteProject: (projectId: string) => Promise<void>;
    fetchProjects: () => Promise<void>;
}

export function useProjectManager(): UseProjectManagerReturn {
    const [project, setProject] = useState<Project[]>([]);
    const [isLoading, setIsLoading] = useState(true);

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
            console.error('Error fetching work experiences:', error);
            setProject([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const addProject = useCallback(async (data: ProjectFormValues) => {
        const tempId = `temp-${Date.now()}`;
        const optimisticProject: Project = {
            id: tempId,
            title: data.title,
            description: data.description,
            feature: data.feature,
            technology: data.technology,
            githubUrl: data.githubUrl,
            liveUrl: data.liveUrl,
            thumbnail: data.thumbnail,
            photo: data.photo,
            createdAt: new Date(),
            updatedAt: null,
            Skills: []
        };

        setProject(prev => [optimisticProject, ...prev]);

        try {
            const response = await axios.post<Project>('/api/projects', data);

            // Ganti dengan response data jika ada, atau fallback ke optimistic data
            if (response.data && response.data.id) {
                setProject(prev => prev.map(project =>
                    project.id === tempId ? response.data : project
                ));
            } else {
                // Fallback: tetap gunakan optimistic data dengan ID permanen
                setProject(prev => prev.map(project =>
                    project.id === tempId ? { ...optimisticProject, id: `project-${Date.now()}` } : project
                ));
            }
        } catch (error) {
            setProject(prev => prev.filter(project => project.id !== tempId));
            throw error;
        }
    }, []);

    const updateProject = useCallback(async (projectId: string, data: ProjectFormValues) => {

        const projectToUpdate = project.find(project => project.id === projectId);
        if (!projectToUpdate) {
            console.error('❌ Project not found for update:', projectId);
            return;
        }

        const updatedProject: Project = {
            ...projectToUpdate,
            title: data.title,
            description: data.description,
            feature: data.feature,
            technology: data.technology,
            githubUrl: data.githubUrl,
            liveUrl: data.liveUrl,
            thumbnail: data.thumbnail,
            photo: data.photo,
            createdAt: projectToUpdate.createdAt,
            updatedAt: new Date(),
            Skills: projectToUpdate.Skills || [],
        };

        setProject(prev => prev.map(project =>
            project.id === projectId ? updatedProject : project
        ));

        try {
            const requestData = {
                id: projectId,
                title: data.title,
                description: data.description,
                feature: data.feature,
                technology: data.technology,
                githubUrl: data.githubUrl,
                liveUrl: data.liveUrl,
                thumbnail: data.thumbnail,
                photo: data.photo,
                skillId: data.skillId || [],
            };

            const response = await axios.put<Project>(`/api/projects/${projectId}`, requestData);

            if (response.data && response.data.id) {
                setProject(prev => prev.map(project =>
                    project.id === projectId ? response.data : project
                ));
            } else {
                await fetchProjects();
            }
        } catch (error) {
            setProject(prev => prev.map(project =>
                project.id === projectId ? projectToUpdate : project
            ));
            throw error;
        }
    }, [project, fetchProjects]);

    const deleteProject = useCallback(async (projectId: string) => {
        const projectToDelete = project.find(project => project.id === projectId);
        if (!projectToDelete) {
            console.error('Project not found for deletion:', projectId);
            return;
        }

        // Optimistic delete
        setProject(prev => prev.filter(project => project.id !== projectId));

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
        addProject,
        updateProject,
        deleteProject,
        fetchProjects,
    };
}