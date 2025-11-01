import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import axios from 'axios';
import { WorkExperience, WorkExperienceFormValues } from '@/schema/workexperience-schema';

interface WorkExperienceState {
  // State
  workExperiences: WorkExperience[];
  isLoading: boolean;

  // Actions
  setWorkExperiences: (workExperiences: WorkExperience[]) => void;
  setIsLoading: (isLoading: boolean) => void;
  fetchWorkExperiences: () => Promise<void>;
  addWorkExperience: (data: WorkExperienceFormValues) => Promise<void>;
  updateWorkExperience: (workExperienceId: string, data: WorkExperienceFormValues) => Promise<void>;
  deleteWorkExperience: (workExperienceId: string) => Promise<void>;
  reset: () => void;
}

const initialState = {
  workExperiences: [],
  isLoading: true,
};

export const useWorkExperienceStore = create<WorkExperienceState>()(
  devtools(
    immer((set, get) => ({
      // Initial State
      ...initialState,

      // Actions
      setWorkExperiences: (workExperiences) =>
        set(
          (state) => {
            state.workExperiences = workExperiences;
          },
          false,
          'setWorkExperiences'
        ),

      setIsLoading: (isLoading) =>
        set(
          (state) => {
            state.isLoading = isLoading;
          },
          false,
          'setIsLoading'
        ),

      fetchWorkExperiences: async () => {
        try {
          set(
            (state) => {
              state.isLoading = true;
            },
            false,
            'fetchWorkExperiences/start'
          );

          const response = await axios.get<WorkExperience[]>('/api/work-experience');

          if (Array.isArray(response.data)) {
            set(
              (state) => {
                state.workExperiences = response.data;
              },
              false,
              'fetchWorkExperiences/success'
            );
          } else {
            console.error('API response is not an array:', response.data);
            set(
              (state) => {
                state.workExperiences = [];
              },
              false,
              'fetchWorkExperiences/error'
            );
          }
        } catch (error) {
          console.error('Error fetching work experiences:', error);
          set(
            (state) => {
              state.workExperiences = [];
            },
            false,
            'fetchWorkExperiences/error'
          );
        } finally {
          set(
            (state) => {
              state.isLoading = false;
            },
            false,
            'fetchWorkExperiences/complete'
          );
        }
      },

      addWorkExperience: async (data) => {
        const tempId = `temp-${Date.now()}`;
        const optimisticWorkExperience: WorkExperience = {
          id: tempId,
          position: data.position,
          employmenttype: data.employmenttype,
          company: data.company,
          location: data.location,
          locationtype: data.locationtype,
          description: data.description,
          startDate: data.startDate,
          endDate: data.endDate ?? null,
          Skills: [],
        };

        // Optimistic update
        set(
          (state) => {
            state.workExperiences.unshift(optimisticWorkExperience);
          },
          false,
          'addWorkExperience/optimistic'
        );

        try {
          const response = await axios.post<WorkExperience>('/api/work-experience', data);

          if (response.data && response.data.id) {
            set(
              (state) => {
                const index = state.workExperiences.findIndex((we) => we.id === tempId);
                if (index !== -1) {
                  state.workExperiences[index] = response.data;
                }
              },
              false,
              'addWorkExperience/success'
            );
          } else {
            set(
              (state) => {
                const index = state.workExperiences.findIndex((we) => we.id === tempId);
                if (index !== -1) {
                  state.workExperiences[index] = {
                    ...optimisticWorkExperience,
                    id: `work-experience-${Date.now()}`,
                  };
                }
              },
              false,
              'addWorkExperience/fallback'
            );
          }
        } catch (error) {
          // Rollback
          set(
            (state) => {
              state.workExperiences = state.workExperiences.filter((we) => we.id !== tempId);
            },
            false,
            'addWorkExperience/error'
          );
          throw error;
        }
      },

      updateWorkExperience: async (workExperienceId, data) => {
        const workExperienceToUpdate = get().workExperiences.find(
          (we) => we.id === workExperienceId
        );

        if (!workExperienceToUpdate) {
          console.error('❌ Work experience not found for update:', workExperienceId);
          return;
        }

        const updatedWorkExperience: WorkExperience = {
          ...workExperienceToUpdate,
          position: data.position,
          employmenttype: data.employmenttype,
          company: data.company,
          location: data.location,
          locationtype: data.locationtype,
          description: data.description,
          startDate: data.startDate,
          endDate: data.endDate ?? null,
          Skills: workExperienceToUpdate.Skills || [],
        };

        // Optimistic update
        set(
          (state) => {
            const index = state.workExperiences.findIndex((we) => we.id === workExperienceId);
            if (index !== -1) {
              state.workExperiences[index] = updatedWorkExperience;
            }
          },
          false,
          'updateWorkExperience/optimistic'
        );

        try {
          const requestData = {
            id: workExperienceId,
            position: data.position,
            employmenttype: data.employmenttype,
            company: data.company,
            location: data.location,
            locationtype: data.locationtype,
            description: data.description,
            startDate: data.startDate,
            endDate: data.endDate,
            skillId: data.skillId || [],
          };

          const response = await axios.put<WorkExperience>(
            `/api/work-experience/${workExperienceId}`,
            requestData
          );

          if (response.data && response.data.id) {
            set(
              (state) => {
                const index = state.workExperiences.findIndex(
                  (we) => we.id === workExperienceId
                );
                if (index !== -1) {
                  state.workExperiences[index] = response.data;
                }
              },
              false,
              'updateWorkExperience/success'
            );
          } else {
            console.warn('Server response missing work experience data, refetching...');
            await get().fetchWorkExperiences();
          }
        } catch (error) {
          console.error('Error updating work experience:', error);
          // Rollback
          set(
            (state) => {
              const index = state.workExperiences.findIndex(
                (we) => we.id === workExperienceId
              );
              if (index !== -1) {
                state.workExperiences[index] = workExperienceToUpdate;
              }
            },
            false,
            'updateWorkExperience/error'
          );
          throw error;
        }
      },

      deleteWorkExperience: async (workExperienceId) => {
        const workExperienceToDelete = get().workExperiences.find(
          (we) => we.id === workExperienceId
        );

        if (!workExperienceToDelete) {
          console.error('Work experience not found for deletion:', workExperienceId);
          return;
        }

        // Optimistic delete
        set(
          (state) => {
            state.workExperiences = state.workExperiences.filter(
              (we) => we.id !== workExperienceId
            );
          },
          false,
          'deleteWorkExperience/optimistic'
        );

        try {
          await axios.delete(`/api/work-experience/${workExperienceId}`);
        } catch (error) {
          console.error('Error deleting work experience:', error);
          // Rollback
          set(
            (state) => {
              state.workExperiences.push(workExperienceToDelete);
            },
            false,
            'deleteWorkExperience/error'
          );
          throw error;
        }
      },

      reset: () =>
        set(
          initialState,
          false,
          'reset'
        ),
    })),
    { name: 'WorkExperienceStore' }
  )
);