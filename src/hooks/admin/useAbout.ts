import { About, AboutFormValues } from "@/domain/admin/about-schema";
import axios from "axios";
import { useCallback, useState } from "react";
import toast from "react-hot-toast";

interface UseAboutManagerReturn {
    about: About[];
    isLoading: boolean;
    isUploadingProfile: boolean;
    fetchAbout: () => Promise<void>;
    updateAbout: (aboutId: string, updateData: {
        data: AboutFormValues;
        profileFile?: File | null;
        profileDeleted?: boolean;
        oldProfile?: string;
    }) => Promise<void>;
}

export function useAboutManager(): UseAboutManagerReturn {
    const [about, setAbout] = useState<About[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isUploadingProfile, setIsUploadingProfile] = useState(false);

    const fetchAbout = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await axios.get<About[]>('/api/about');

            if (Array.isArray(response.data)) {
                setAbout(response.data);
            } else {
                console.error('API response is not an array:', response.data);
                setAbout([]);
            }
        } catch (error) {
            console.error('Error fetching about:', error);
            setAbout([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const updateAbout = useCallback(
        async (aboutId: string, updateData: {
            data: AboutFormValues;
            profileFile?: File | null;
            profileDeleted?: boolean;
            oldProfile?: string;
        }) => {
            const {
                data,
                profileFile,
                profileDeleted = false,
                oldProfile = ""
            } = updateData;

            const aboutToUpdate = about.find(a => a.id === aboutId);
            if (!aboutToUpdate) {
                console.error('❌ About not found for update:', aboutId);
                return;
            }

            try {
                // Siapkan FormData
                const formData = new FormData();
                formData.append("name", data.name);
                formData.append("jobTitle", data.jobTitle);
                formData.append("introduction", data.introduction);
                formData.append("skillId", JSON.stringify(data.skillId ?? []));
                formData.append("sosmed", JSON.stringify(data.sosmed ?? []));
                formData.append("projects", JSON.stringify(data.projects ?? []));

                // Kirim info thumbnail lama ke backend
                formData.append("oldProfile", oldProfile || aboutToUpdate.profilePicture || "");

                // Handle thumbnail baru/hapus
                if (profileFile) {
                    setIsUploadingProfile(true);
                    formData.append("profile", profileFile); // file baru
                } else if (profileDeleted && (oldProfile || aboutToUpdate.profilePicture)) {
                    formData.append("profileDeleted", "true"); // flag hapus
                }
                // Kalau undefined, berarti tetap

                console.log('🚀 Sending update request for about:', aboutId);

                // Request update ke API Next.js
                const response = await fetch(`/api/about/${aboutId}`, {
                    method: 'PUT',
                    body: formData,
                });

                if (!response.ok) {
                    throw new Error('Gagal update project');
                }

                const result = await response.json();

                if (result && result.id) {
                    // Update state with server response
                    setAbout(prev =>
                        prev.map(p => (p.id === aboutId ? result : p))
                    );
                    toast.success("About berhasil diupdate!");
                    console.log('✅ About updated successfully:', result);
                } else {
                    console.warn('Server response missing about data, refetching...');
                    await fetchAbout();
                    toast.success("About berhasil diupdate!");
                }

            } catch (error) {
                console.error("Error updating about:", error);
                toast.error("Gagal mengupdate about. Silakan coba lagi.");
                throw error;
            } finally {
                setIsUploadingProfile(false);
            }
        },
        [about, fetchAbout]
    );

    return {
        about,
        isLoading,
        isUploadingProfile,
        fetchAbout,
        updateAbout
    };
}