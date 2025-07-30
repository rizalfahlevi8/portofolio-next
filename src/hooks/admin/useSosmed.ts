import { useState, useCallback } from 'react';
import axios from 'axios';
import { Sosmed, SosmedFormValues } from '@/domain/admin/sosmed-schema';

interface UseSosmedManagerReturn {
    sosmed: Sosmed[];
    isLoading: boolean;
    addSosmed: (data: SosmedFormValues) => Promise<void>;
    updateSosmed: (sosmedId: string, data: SosmedFormValues) => Promise<void>;
    deleteSosmed: (sosmedId: string) => Promise<void>;
    fetchSosmed: () => Promise<void>;
}

export function useSosmedManager(): UseSosmedManagerReturn {
    const [sosmed, setSosmed] = useState<Sosmed[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchSosmed = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await axios.get<Sosmed[]>('/api/sosmed');

            if (Array.isArray(response.data)) {
                setSosmed(response.data);
            } else {
                console.error('API response is not an array:', response.data);
                setSosmed([]);
            }
        } catch (error) {
            console.error('Error fetching sosial media:', error);
            setSosmed([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const addSosmed = useCallback(async (data: SosmedFormValues) => {
        const tempId = `temp-${Date.now()}`;
        const optimisticSosmed: Sosmed = {
            id: tempId,
            name: data.name,
            url: data.url,
        };

        setSosmed(prev => [optimisticSosmed, ...prev]);

        try {
            const response = await axios.post<Sosmed>('/api/sosmed', data);

            // Ganti dengan response data jika ada, atau fallback ke optimistic data
            if (response.data && response.data.id) {
                setSosmed(prev => prev.map(sosmed =>
                    sosmed.id === tempId ? response.data : sosmed
                ));
            } else {
                // Fallback: tetap gunakan optimistic data dengan ID permanen
                setSosmed(prev => prev.map(sosmed =>
                    sosmed.id === tempId ? { ...optimisticSosmed, id: `sosmed-${Date.now()}` } : sosmed
                ));
            }
        } catch (error) {
            setSosmed(prev => prev.filter(sosmed => sosmed.id !== tempId));
            throw error;
        }
    }, []);

    const updateSosmed = useCallback(async (sosmedId: string, data: SosmedFormValues) => {
        const skillToUpdate = sosmed.find(sosmed => sosmed.id === sosmedId);
        if (!skillToUpdate) {
            console.error('Sosial Media not found for update:', sosmedId);
            return;
        }

        // Optimistic update - simpan data yang sudah diupdate
        const updatedSkill: Sosmed = {
            ...skillToUpdate,
            name: data.name,
            url: data.url,
        };

        setSosmed(prev => prev.map(sosmed =>
            sosmed.id === sosmedId ? updatedSkill : sosmed
        ));

        try {
            const response = await axios.put<Sosmed>(`/api/sosmed/${sosmedId}`, {
                id: sosmedId,
                name: data.name,
                url: data.url,
            });

            // Update dengan response data jika valid, jika tidak tetap gunakan optimistic update
            if (response.data && response.data.id) {
                setSosmed(prev => prev.map(sosmed =>
                    sosmed.id === sosmedId ? response.data : sosmed
                ));
            } else {
                console.warn('API update response invalid, keeping optimistic update');
                // Optimistic update sudah di-set di atas, tidak perlu action tambahan
            }
        } catch (error) {
            console.error('Error updating sosmed:', error);
            // Rollback ke data original jika gagal
            setSosmed(prev => prev.map(sosmed =>
                sosmed.id === sosmedId ? skillToUpdate : sosmed
            ));
            throw error;
        }
    }, [sosmed]);

    const deleteSosmed = useCallback(async (sosmedId: string) => {
        const skillToDelete = sosmed.find(sosmed => sosmed.id === sosmedId);
        if (!skillToDelete) {
            console.error('Sosmed not found for deletion:', sosmedId);
            return;
        }

        // Optimistic delete
        setSosmed(prev => prev.filter(sosmed => sosmed.id !== sosmedId));

        try {
            await axios.delete(`/api/sosmed/${sosmedId}`);
        } catch (error) {
            console.error('Error deleting sosmed:', error);
            // Rollback - tambahkan kembali sosmed yang dihapus
            setSosmed(prev => [...prev, skillToDelete]);
            throw error;
        }
    }, [sosmed]);


    return {
        sosmed,
        isLoading,
        addSosmed,
        updateSosmed,
        deleteSosmed,
        fetchSosmed,
    };

}