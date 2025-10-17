import { About } from "@/domain/admin/about-schema";
import useSWR from "swr";
import axios, { AxiosError } from "axios";

interface UseHomeManagerReturn {
    home: About[];
    isLoading: boolean;
    error: AxiosError | undefined;
    mutate: () => void;
}

const fetcher = async (url: string): Promise<About[]> => {
    const response = await axios.get<About[]>(url);
    
    if (Array.isArray(response.data)) {
        return response.data;
    } else {
        console.error('API response is not an array:', response.data);
        return [];
    }
};

export function useHomeManager(): UseHomeManagerReturn {
    const { data, error, isLoading, mutate } = useSWR<About[], AxiosError>(
        '/api/home',
        fetcher,
        {
            revalidateOnFocus: false,
            revalidateOnReconnect: false,
            revalidateIfStale: false,
            dedupingInterval: 60000, // Cache selama 1 menit
            focusThrottleInterval: 60000,
            keepPreviousData: true, // Keep previous data while fetching new data
            // Aggressive caching
            refreshInterval: 0, // Disable auto refresh
        }
    );

    return {
        home: data || [],
        isLoading,
        error,
        mutate,
    };
}