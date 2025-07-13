import { useState, useCallback } from 'react';
import axios from 'axios';
import { Skill, SkillFormValues } from '@/domain/skill-schema';

interface UseSkillsManagerReturn {
  skills: Skill[];
  isLoading: boolean;
  addSkill: (data: SkillFormValues) => Promise<void>;
  updateSkill: (skillId: string, data: SkillFormValues) => Promise<void>;
  deleteSkill: (skillId: string) => Promise<void>;
  fetchSkills: () => Promise<void>;
}

export function useSkillsManager(): UseSkillsManagerReturn {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSkills = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await axios.get<Skill[]>('/api/skill');
      
      if (Array.isArray(response.data)) {
        setSkills(response.data);
      } else {
        console.error('API response is not an array:', response.data);
        setSkills([]);
      }
    } catch (error) {
      console.error('Error fetching skills:', error);
      setSkills([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addSkill = useCallback(async (data: SkillFormValues) => {
    const tempId = `temp-${Date.now()}`;
    const optimisticSkill: Skill = {
      id: tempId,
      name: data.name,
      icon: data.icon,
    };

    setSkills(prev => [optimisticSkill, ...prev]);

    try {
      const response = await axios.post<Skill>('/api/skill', data);
      
      // Ganti dengan response data jika ada, atau fallback ke optimistic data
      if (response.data && response.data.id) {
        setSkills(prev => prev.map(skill => 
          skill.id === tempId ? response.data : skill
        ));
      } else {
        // Fallback: tetap gunakan optimistic data dengan ID permanen
        setSkills(prev => prev.map(skill => 
          skill.id === tempId ? { ...optimisticSkill, id: `skill-${Date.now()}` } : skill
        ));
      }
    } catch (error) {
      setSkills(prev => prev.filter(skill => skill.id !== tempId));
      throw error;
    }
  }, []);

  const updateSkill = useCallback(async (skillId: string, data: SkillFormValues) => {
    const skillToUpdate = skills.find(skill => skill.id === skillId);
    if (!skillToUpdate) {
      console.error('Skill not found for update:', skillId);
      return;
    }

    // Optimistic update - simpan data yang sudah diupdate
    const updatedSkill: Skill = {
      ...skillToUpdate,
      name: data.name,
      icon: data.icon,
    };

    setSkills(prev => prev.map(skill => 
      skill.id === skillId ? updatedSkill : skill
    ));

    try {
      const response = await axios.put<Skill>(`/api/skill/${skillId}`, {
        id: skillId,
        name: data.name,
        icon: data.icon,
      });
      
      // Update dengan response data jika valid, jika tidak tetap gunakan optimistic update
      if (response.data && response.data.id) {
        setSkills(prev => prev.map(skill => 
          skill.id === skillId ? response.data : skill
        ));
      } else {
        console.warn('API update response invalid, keeping optimistic update');
        // Optimistic update sudah di-set di atas, tidak perlu action tambahan
      }
    } catch (error) {
      console.error('Error updating skill:', error);
      // Rollback ke data original jika gagal
      setSkills(prev => prev.map(skill => 
        skill.id === skillId ? skillToUpdate : skill
      ));
      throw error;
    }
  }, [skills]);

  const deleteSkill = useCallback(async (skillId: string) => {
    const skillToDelete = skills.find(skill => skill.id === skillId);
    if (!skillToDelete) {
      console.error('Skill not found for deletion:', skillId);
      return;
    }
    
    // Optimistic delete
    setSkills(prev => prev.filter(skill => skill.id !== skillId));

    try {
      await axios.delete(`/api/skill/${skillId}`);
    } catch (error) {
      console.error('Error deleting skill:', error);
      // Rollback - tambahkan kembali skill yang dihapus
      setSkills(prev => [...prev, skillToDelete]);
      throw error;
    }
  }, [skills]);

  return {
    skills,
    isLoading,
    addSkill,
    updateSkill,
    deleteSkill,
    fetchSkills,
  };
}