import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import axios from 'axios';
import { Skill, SkillFormValues } from '@/schema/skill-schema';

interface SkillState {
  // State
  skills: Skill[];
  isLoading: boolean;

  // Actions
  setSkills: (skills: Skill[]) => void;
  setIsLoading: (isLoading: boolean) => void;
  fetchSkills: () => Promise<void>;
  addSkill: (data: SkillFormValues) => Promise<void>;
  updateSkill: (skillId: string, data: SkillFormValues) => Promise<void>;
  deleteSkill: (skillId: string) => Promise<void>;
  reset: () => void;
}

const initialState = {
  skills: [],
  isLoading: true,
};

export const useSkillStore = create<SkillState>()(
  devtools(
    immer((set, get) => ({
      // Initial State
      ...initialState,

      // Actions
      setSkills: (skills) =>
        set(
          (state) => {
            state.skills = skills;
          },
          false,
          'setSkills'
        ),

      setIsLoading: (isLoading) =>
        set(
          (state) => {
            state.isLoading = isLoading;
          },
          false,
          'setIsLoading'
        ),

      fetchSkills: async () => {
        try {
          set(
            (state) => {
              state.isLoading = true;
            },
            false,
            'fetchSkills/start'
          );

          const response = await axios.get<Skill[]>('/api/skill');

          if (Array.isArray(response.data)) {
            set(
              (state) => {
                state.skills = response.data;
              },
              false,
              'fetchSkills/success'
            );
          } else {
            console.error('API response is not an array:', response.data);
            set(
              (state) => {
                state.skills = [];
              },
              false,
              'fetchSkills/error'
            );
          }
        } catch (error) {
          console.error('Error fetching skills:', error);
          set(
            (state) => {
              state.skills = [];
            },
            false,
            'fetchSkills/error'
          );
        } finally {
          set(
            (state) => {
              state.isLoading = false;
            },
            false,
            'fetchSkills/complete'
          );
        }
      },

      addSkill: async (data) => {
        const tempId = `temp-${Date.now()}`;
        const optimisticSkill: Skill = {
          id: tempId,
          name: data.name,
          icon: data.icon,
        };

        // Optimistic update
        set(
          (state) => {
            state.skills.unshift(optimisticSkill);
          },
          false,
          'addSkill/optimistic'
        );

        try {
          const response = await axios.post<Skill>('/api/skill', data);

          if (response.data && response.data.id) {
            set(
              (state) => {
                const index = state.skills.findIndex((s: Skill) => s.id === tempId);
                if (index !== -1) {
                  state.skills[index] = response.data;
                }
              },
              false,
              'addSkill/success'
            );
          } else {
            set(
              (state) => {
                const index = state.skills.findIndex((s: Skill) => s.id === tempId);
                if (index !== -1) {
                  state.skills[index] = { ...optimisticSkill, id: `skill-${Date.now()}` };
                }
              },
              false,
              'addSkill/fallback'
            );
          }
        } catch (error) {
          // Rollback
          set(
            (state) => {
              state.skills = state.skills.filter((s: Skill) => s.id !== tempId);
            },
            false,
            'addSkill/error'
          );
          throw error;
        }
      },

      updateSkill: async (skillId, data) => {
        const skillToUpdate = get().skills.find((s: Skill) => s.id === skillId);
        if (!skillToUpdate) {
          console.error('Skill not found for update:', skillId);
          return;
        }

        const updatedSkill: Skill = {
          ...skillToUpdate,
          name: data.name,
          icon: data.icon,
        };

        // Optimistic update
        set(
          (state) => {
            const index = state.skills.findIndex((s: Skill) => s.id === skillId);
            if (index !== -1) {
              state.skills[index] = updatedSkill;
            }
          },
          false,
          'updateSkill/optimistic'
        );

        try {
          const response = await axios.put<Skill>(`/api/skill/${skillId}`, {
            id: skillId,
            name: data.name,
            icon: data.icon,
          });

          if (response.data && response.data.id) {
            set(
              (state) => {
                const index = state.skills.findIndex((s: Skill) => s.id === skillId);
                if (index !== -1) {
                  state.skills[index] = response.data;
                }
              },
              false,
              'updateSkill/success'
            );
          } else {
            console.warn('API update response invalid, keeping optimistic update');
          }
        } catch (error) {
          console.error('Error updating skill:', error);
          // Rollback
          set(
            (state) => {
              const index = state.skills.findIndex((s: Skill) => s.id === skillId);
              if (index !== -1) {
                state.skills[index] = skillToUpdate;
              }
            },
            false,
            'updateSkill/error'
          );
          throw error;
        }
      },

      deleteSkill: async (skillId) => {
        const skillToDelete = get().skills.find((s) => s.id === skillId);
        if (!skillToDelete) {
          console.error('Skill not found for deletion:', skillId);
          return;
        }

        // Optimistic delete
        set(
          (state) => {
            state.skills = state.skills.filter((s: Skill) => s.id !== skillId);
          },
          false,
          'deleteSkill/optimistic'
        );

        try {
          await axios.delete(`/api/skill/${skillId}`);
        } catch (error) {
          console.error('Error deleting skill:', error);
          // Rollback
          set(
            (state) => {
              state.skills.push(skillToDelete);
            },
            false,
            'deleteSkill/error'
          );
          throw error;
        }
      },

      reset: () => set(initialState, false, 'reset'),
    })),
    { name: 'SkillStore' }
  )
);