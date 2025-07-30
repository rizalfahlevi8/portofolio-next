import { useState, useCallback } from 'react';
import axios from 'axios';
import { WorkExperience, WorkExperienceFormValues } from '@/domain/admin/workexperience-schema';

interface UseWorkExperienceManagerReturn {
  workExperiences: WorkExperience[];
  isLoading: boolean;
  addWorkExperience: (data: WorkExperienceFormValues) => Promise<void>;
  updateWorkExperience: (workExperienceId: string, data: WorkExperienceFormValues) => Promise<void>;
  deleteWorkExperience: (workExperienceId: string) => Promise<void>;
  fetchWorkExperiences: () => Promise<void>;
}

export function useWorkExperienceManager(): UseWorkExperienceManagerReturn {
  const [workExperiences, setWorkExperiences] = useState<WorkExperience[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchWorkExperiences = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await axios.get<WorkExperience[]>('/api/work-experience');

      if (Array.isArray(response.data)) {
        setWorkExperiences(response.data);
      } else {
        console.error('API response is not an array:', response.data);
        setWorkExperiences([]);
      }
    } catch (error) {
      console.error('Error fetching work experiences:', error);
      setWorkExperiences([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addWorkExperience = useCallback(async (data: WorkExperienceFormValues) => {
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
      Skills: []
    };

    setWorkExperiences(prev => [optimisticWorkExperience, ...prev]);

    try {
      const response = await axios.post<WorkExperience>('/api/work-experience', data);

      // Ganti dengan response data jika ada, atau fallback ke optimistic data
      if (response.data && response.data.id) {
        setWorkExperiences(prev => prev.map(workExperience =>
          workExperience.id === tempId ? response.data : workExperience
        ));
      } else {
        // Fallback: tetap gunakan optimistic data dengan ID permanen
        setWorkExperiences(prev => prev.map(workExperience =>
          workExperience.id === tempId ? { ...optimisticWorkExperience, id: `work-experience-${Date.now()}` } : workExperience
        ));
      }
    } catch (error) {
      setWorkExperiences(prev => prev.filter(workExperience => workExperience.id !== tempId));
      throw error;
    }
  }, []);

  const updateWorkExperience = useCallback(async (workExperienceId: string, data: WorkExperienceFormValues) => {

    const workExperienceToUpdate = workExperiences.find(workExperience => workExperience.id === workExperienceId);
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

    setWorkExperiences(prev => prev.map(workExperience =>
      workExperience.id === workExperienceId ? updatedWorkExperience : workExperience
    ));

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

      const response = await axios.put<WorkExperience>(`/api/work-experience/${workExperienceId}`, requestData);

      if (response.data && response.data.id) {
        setWorkExperiences(prev => prev.map(workExperience =>
          workExperience.id === workExperienceId ? response.data : workExperience
        ));
      } else {
        await fetchWorkExperiences();
      }
    } catch (error) {
      setWorkExperiences(prev => prev.map(workExperience =>
        workExperience.id === workExperienceId ? workExperienceToUpdate : workExperience
      ));
      throw error;
    }
  }, [workExperiences, fetchWorkExperiences]);

  const deleteWorkExperience = useCallback(async (workExperienceId: string) => {
    const workExperienceToDelete = workExperiences.find(workExperience => workExperience.id === workExperienceId);
    if (!workExperienceToDelete) {
      console.error('Work experience not found for deletion:', workExperienceId);
      return;
    }

    // Optimistic delete
    setWorkExperiences(prev => prev.filter(workExperience => workExperience.id !== workExperienceId));

    try {
      await axios.delete(`/api/work-experience/${workExperienceId}`);
    } catch (error) {
      console.error('Error deleting work experience:', error);
      setWorkExperiences(prev => [...prev, workExperienceToDelete]);
      throw error;
    }
  }, [workExperiences]);

  return {
    workExperiences,
    isLoading,
    addWorkExperience,
    updateWorkExperience,
    deleteWorkExperience,
    fetchWorkExperiences,
  };
}