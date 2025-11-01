import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import axios from 'axios';
import { About } from '@/schema/about-schema';

interface HomeState {
  home: About[];
  isLoading: boolean;
  error: Error | null;
  fetchHome: () => Promise<void>;
  refetch: () => Promise<void>;
}

const initialState = {
  home: [],
  isLoading: false,
  error: null,
};

export const useHomeStore = create<HomeState>()(
  devtools(
    (set, get) => ({
      ...initialState,
      
      fetchHome: async () => {
        set({ isLoading: true, error: null }, false, 'fetchHome/start');
        try {
          const response = await axios.get<About[]>('/api/home');
          const data = Array.isArray(response.data) ? response.data : [];
          set({ home: data, isLoading: false }, false, 'fetchHome/success');
        } catch (error) {
          console.error('Error fetching home data:', error);
          set({ 
            error: error instanceof Error ? error : new Error('Unknown error'),
            isLoading: false,
            home: []
          }, false, 'fetchHome/error');
        }
      },
      
      refetch: async () => {
        await get().fetchHome();
      }
    }),
    { name: 'HomeStore' }
  )
);