import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Project, ProjectFormValues } from '@/schema/project-schema';

interface ProjectState {
  // State
  project: Project[];
  isLoading: boolean;
  isUploadingThumbnail: boolean;
  isUploadingPhotos: boolean;

  // Actions
  setProject: (project: Project[]) => void;
  setIsLoading: (isLoading: boolean) => void;
  setIsUploadingThumbnail: (isUploading: boolean) => void;
  setIsUploadingPhotos: (isUploading: boolean) => void;
  fetchProjects: () => Promise<void>;
  addProject: (
    data: ProjectFormValues,
    thumbnailFile?: File | null,
    photoFiles?: File[]
  ) => Promise<void>;
  updateProject: (
    projectId: string,
    updateData: {
      data: ProjectFormValues;
      thumbnailFile?: File | null;
      photoFiles?: File[];
      existingPhotos?: string[];
      deletedPhotos?: string[];
      thumbnailDeleted?: boolean;
      oldThumbnail?: string;
    }
  ) => Promise<void>;
  deleteProject: (projectId: string) => Promise<void>;
  reset: () => void;
}

const initialState = {
  project: [],
  isLoading: true,
  isUploadingThumbnail: false,
  isUploadingPhotos: false,
};

export const useProjectStore = create<ProjectState>()(
  devtools(
    immer((set, get) => ({
      // Initial State
      ...initialState,

      // Actions
      setProject: (project) =>
        set(
          (state) => {
            state.project = project;
          },
          false,
          'setProject'
        ),

      setIsLoading: (isLoading) =>
        set(
          (state) => {
            state.isLoading = isLoading;
          },
          false,
          'setIsLoading'
        ),

      setIsUploadingThumbnail: (isUploading) =>
        set(
          (state) => {
            state.isUploadingThumbnail = isUploading;
          },
          false,
          'setIsUploadingThumbnail'
        ),

      setIsUploadingPhotos: (isUploading) =>
        set(
          (state) => {
            state.isUploadingPhotos = isUploading;
          },
          false,
          'setIsUploadingPhotos'
        ),

      fetchProjects: async () => {
        try {
          set(
            (state) => {
              state.isLoading = true;
            },
            false,
            'fetchProjects/start'
          );

          const response = await axios.get<Project[]>('/api/projects');

          if (Array.isArray(response.data)) {
            set(
              (state) => {
                state.project = response.data;
              },
              false,
              'fetchProjects/success'
            );
          } else {
            console.error('API response is not an array:', response.data);
            set(
              (state) => {
                state.project = [];
              },
              false,
              'fetchProjects/error'
            );
          }
        } catch (error) {
          console.error('Error fetching projects:', error);
          set(
            (state) => {
              state.project = [];
            },
            false,
            'fetchProjects/error'
          );
        } finally {
          set(
            (state) => {
              state.isLoading = false;
            },
            false,
            'fetchProjects/complete'
          );
        }
      },

      addProject: async (data, thumbnailFile, photoFiles) => {
        const tempId = `temp-${Date.now()}`;
        const optimisticProject: Project = {
          id: tempId,
          title: data.title,
          description: data.description,
          feature: data.feature,
          technology: data.technology,
          githubUrl: data.githubUrl,
          liveUrl: data.liveUrl,
          thumbnail: '',
          photo: [],
          createdAt: new Date(),
          updatedAt: null,
          Skills: [],
        };

        // Optimistic update
        set(
          (state) => {
            state.project.unshift(optimisticProject);
          },
          false,
          'addProject/optimistic'
        );

        try {
          const formData = new FormData();
          formData.append('title', data.title);
          formData.append('description', data.description);
          formData.append('feature', JSON.stringify(data.feature));
          formData.append('technology', JSON.stringify(data.technology));
          formData.append('githubUrl', data.githubUrl ?? '');
          formData.append('liveUrl', data.liveUrl ?? '');
          formData.append('skillId', JSON.stringify(data.skillId ?? []));

          if (thumbnailFile) {
            formData.append('thumbnail', thumbnailFile);
          }
          if (photoFiles && photoFiles.length > 0) {
            photoFiles.forEach((file) => formData.append('photo', file));
          }

          const response = await fetch('/api/projects', {
            method: 'POST',
            body: formData,
          });

          const result = await response.json();
          if (result && result.id) {
            set(
              (state) => {
                const index = state.project.findIndex((p: Project) => p.id === tempId);
                if (index !== -1) {
                  state.project[index] = result;
                }
              },
              false,
              'addProject/success'
            );
          } else {
            set(
              (state) => {
                const index = state.project.findIndex((p: Project) => p.id === tempId);
                if (index !== -1) {
                  state.project[index] = {
                    ...optimisticProject,
                    id: `project-${Date.now()}`,
                  };
                }
              },
              false,
              'addProject/fallback'
            );
          }
        } catch (error) {
          // Rollback
          set(
            (state) => {
              state.project = state.project.filter((p: Project) => p.id !== tempId);
            },
            false,
            'addProject/error'
          );
          throw error;
        }
      },

      updateProject: async (projectId, updateData) => {
        const {
          data,
          thumbnailFile,
          photoFiles = [],
          existingPhotos = [],
          deletedPhotos = [],
          thumbnailDeleted = false,
          oldThumbnail = '',
        } = updateData;

        const projectToUpdate = get().project.find((p) => p.id === projectId);
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
            toast.error('Minimal satu foto harus ada!');
            return;
          }

          const formData = new FormData();
          formData.append('title', data.title);
          formData.append('description', data.description);
          formData.append(
            'feature',
            JSON.stringify(data.feature.filter((desc) => desc.trim() !== ''))
          );
          formData.append(
            'technology',
            JSON.stringify(data.technology.filter((desc) => desc.trim() !== ''))
          );
          formData.append('githubUrl', data.githubUrl ?? '');
          formData.append('liveUrl', data.liveUrl ?? '');
          formData.append('skillId', JSON.stringify(data.skillId ?? []));

          formData.append('oldThumbnail', oldThumbnail || projectToUpdate.thumbnail || '');

          if (thumbnailFile) {
            set(
              (state) => {
                state.isUploadingThumbnail = true;
              },
              false,
              'updateProject/uploadingThumbnail'
            );
            formData.append('thumbnail', thumbnailFile);
          } else if (thumbnailDeleted && (oldThumbnail || projectToUpdate.thumbnail)) {
            formData.append('thumbnailDeleted', 'true');
          }

          formData.append('oldPhotos', JSON.stringify(existingPhotos));

          if (photoFiles.length > 0) {
            set(
              (state) => {
                state.isUploadingPhotos = true;
              },
              false,
              'updateProject/uploadingPhotos'
            );
            photoFiles.forEach((file) => formData.append('photo', file));
          }

          if (deletedPhotos.length > 0) {
            formData.append('deletedPhotos', JSON.stringify(deletedPhotos));
          }

          console.log('🚀 Sending update request for project:', projectId);

          const response = await fetch(`/api/projects/${projectId}`, {
            method: 'PUT',
            body: formData,
          });

          if (!response.ok) {
            throw new Error('Gagal update project');
          }

          const result = await response.json();

          if (result && result.id) {
            set(
              (state) => {
                const index = state.project.findIndex((p: Project) => p.id === projectId);
                if (index !== -1) {
                  state.project[index] = result;
                }
              },
              false,
              'updateProject/success'
            );
            toast.success('Proyek berhasil diupdate!');
            console.log('✅ Project updated successfully:', result);
          } else {
            console.warn('Server response missing project data, refetching...');
            await get().fetchProjects();
            toast.success('Proyek berhasil diupdate!');
          }
        } catch (error) {
          console.error('Error updating project:', error);
          toast.error('Gagal mengupdate proyek. Silakan coba lagi.');
          throw error;
        } finally {
          set(
            (state) => {
              state.isUploadingThumbnail = false;
              state.isUploadingPhotos = false;
            },
            false,
            'updateProject/complete'
          );
        }
      },

      deleteProject: async (projectId) => {
        const projectToDelete = get().project.find((p) => p.id === projectId);
        if (!projectToDelete) {
          console.error('Project not found for deletion:', projectId);
          return;
        }

        // Optimistic delete
        set(
          (state) => {
            state.project = state.project.filter((p: Project) => p.id !== projectId);
          },
          false,
          'deleteProject/optimistic'
        );

        try {
          await axios.delete(`/api/projects/${projectId}`);
        } catch (error) {
          console.error('Error deleting project:', error);
          // Rollback
          set(
            (state) => {
              state.project.push(projectToDelete);
            },
            false,
            'deleteProject/error'
          );
          throw error;
        }
      },

      reset: () => set(initialState, false, 'reset'),
    })),
    { name: 'ProjectStore' }
  )
);