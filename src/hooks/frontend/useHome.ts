import { About } from "@/domain/admin/about-schema";
import { useCallback, useState } from "react";
import axios from "axios";

interface UseHomeManagerReturn {
    home: About[];
    isLoading: boolean;
    fetchHome: () => Promise<void>;
}

export function useHomeManager(): UseHomeManagerReturn {
    const [home, setHome] = useState<About[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const fetchHome = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await axios.get<About[]>('/api/home');

            if (Array.isArray(response.data)) {
                setHome(response.data);
            } else {
                console.error('API response is not an array:', response.data);
                setHome([]);
            }
        } catch (error) {
            console.error('Error fetching home:', error);
            setHome([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    return { home, isLoading, fetchHome };
}