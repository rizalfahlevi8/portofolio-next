import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import axios from 'axios';
import { Sosmed, SosmedFormValues } from '@/schema/sosmed-schema';

interface SosmedState {
  // State
  sosmed: Sosmed[];
  isLoading: boolean;

  // Actions
  setSosmed: (sosmed: Sosmed[]) => void;
  setIsLoading: (isLoading: boolean) => void;
  fetchSosmed: () => Promise<void>;
  addSosmed: (data: SosmedFormValues) => Promise<void>;
  updateSosmed: (sosmedId: string, data: SosmedFormValues) => Promise<void>;
  deleteSosmed: (sosmedId: string) => Promise<void>;
  reset: () => void;
}

const initialState = {
  sosmed: [],
  isLoading: true,
};

export const useSosmedStore = create<SosmedState>()(
  devtools(
    immer((set, get) => ({
      // Initial State
      ...initialState,

      // Actions
      setSosmed: (sosmed) =>
        set(
          (state) => {
            state.sosmed = sosmed;
          },
          false,
          'setSosmed'
        ),

      setIsLoading: (isLoading) =>
        set(
          (state) => {
            state.isLoading = isLoading;
          },
          false,
          'setIsLoading'
        ),

      fetchSosmed: async () => {
        try {
          set(
            (state) => {
              state.isLoading = true;
            },
            false,
            'fetchSosmed/start'
          );

          const response = await axios.get<Sosmed[]>('/api/sosmed');

          if (Array.isArray(response.data)) {
            set(
              (state) => {
                state.sosmed = response.data;
              },
              false,
              'fetchSosmed/success'
            );
          } else {
            console.error('API response is not an array:', response.data);
            set(
              (state) => {
                state.sosmed = [];
              },
              false,
              'fetchSosmed/error'
            );
          }
        } catch (error) {
          console.error('Error fetching sosmed:', error);
          set(
            (state) => {
              state.sosmed = [];
            },
            false,
            'fetchSosmed/error'
          );
        } finally {
          set(
            (state) => {
              state.isLoading = false;
            },
            false,
            'fetchSosmed/complete'
          );
        }
      },

      addSosmed: async (data) => {
        const tempId = `temp-${Date.now()}`;
        const optimisticSosmed: Sosmed = {
          id: tempId,
          name: data.name,
          url: data.url,
        };

        // Optimistic update
        set(
          (state) => {
            state.sosmed.unshift(optimisticSosmed);
          },
          false,
          'addSosmed/optimistic'
        );

        try {
          const response = await axios.post<Sosmed>('/api/sosmed', data);

          if (response.data && response.data.id) {
            set(
              (state) => {
                const index = state.sosmed.findIndex((s: Sosmed) => s.id === tempId);
                if (index !== -1) {
                  state.sosmed[index] = response.data;
                }
              },
              false,
              'addSosmed/success'
            );
          } else {
            set(
              (state) => {
                const index = state.sosmed.findIndex((s: Sosmed) => s.id === tempId);
                if (index !== -1) {
                  state.sosmed[index] = { ...optimisticSosmed, id: `sosmed-${Date.now()}` };
                }
              },
              false,
              'addSosmed/fallback'
            );
          }
        } catch (error) {
          // Rollback
          set(
            (state) => {
              state.sosmed = state.sosmed.filter((s: Sosmed) => s.id !== tempId);
            },
            false,
            'addSosmed/error'
          );
          throw error;
        }
      },

      updateSosmed: async (sosmedId, data) => {
        const sosmedToUpdate = get().sosmed.find((s: Sosmed) => s.id === sosmedId);
        if (!sosmedToUpdate) {
          console.error('Sosmed not found for update:', sosmedId);
          return;
        }

        const updatedSosmed: Sosmed = {
          ...sosmedToUpdate,
          name: data.name,
          url: data.url,
        };

        // Optimistic update
        set(
          (state) => {
            const index = state.sosmed.findIndex((s: Sosmed) => s.id === sosmedId);
            if (index !== -1) {
              state.sosmed[index] = updatedSosmed;
            }
          },
          false,
          'updateSosmed/optimistic'
        );

        try {
          const response = await axios.put<Sosmed>(`/api/sosmed/${sosmedId}`, {
            id: sosmedId,
            name: data.name,
            url: data.url,
          });

          if (response.data && response.data.id) {
            set(
              (state) => {
                const index = state.sosmed.findIndex((s: Sosmed) => s.id === sosmedId);
                if (index !== -1) {
                  state.sosmed[index] = response.data;
                }
              },
              false,
              'updateSosmed/success'
            );
          } else {
            console.warn('API update response invalid, keeping optimistic update');
          }
        } catch (error) {
          console.error('Error updating sosmed:', error);
          // Rollback
          set(
            (state) => {
              const index = state.sosmed.findIndex((s: Sosmed) => s.id === sosmedId);
              if (index !== -1) {
                state.sosmed[index] = sosmedToUpdate;
              }
            },
            false,
            'updateSosmed/error'
          );
          throw error;
        }
      },

      deleteSosmed: async (sosmedId) => {
        const sosmedToDelete = get().sosmed.find((s: Sosmed) => s.id === sosmedId);
        if (!sosmedToDelete) {
          console.error('Sosmed not found for deletion:', sosmedId);
          return;
        }

        // Optimistic delete
        set(
          (state) => {
            state.sosmed = state.sosmed.filter((s: Sosmed) => s.id !== sosmedId);
          },
          false,
          'deleteSosmed/optimistic'
        );

        try {
          await axios.delete(`/api/sosmed/${sosmedId}`);
        } catch (error) {
          console.error('Error deleting sosmed:', error);
          // Rollback
          set(
            (state) => {
              state.sosmed.push(sosmedToDelete);
            },
            false,
            'deleteSosmed/error'
          );
          throw error;
        }
      },

      reset: () => set(initialState, false, 'reset'),
    })),
    { name: 'SosmedStore' }
  )
);