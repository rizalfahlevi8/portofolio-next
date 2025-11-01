import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import axios from "axios";
import toast from "react-hot-toast";
import { About, AboutFormValues } from "@/schema/about-schema";
import { useHomeStore } from "./home-store";

interface AboutState {
  // State
  about: About[];
  isLoading: boolean;
  isUploadingProfile: boolean;

  // Actions
  setAbout: (about: About[]) => void;
  setIsLoading: (isLoading: boolean) => void;
  setIsUploadingProfile: (isUploadingProfile: boolean) => void;
  fetchAbout: () => Promise<void>;
  updateAbout: (
    aboutId: string,
    updateData: {
      data: AboutFormValues;
      profileFile?: File | null;
      profileDeleted?: boolean;
      oldProfile?: string;
    }
  ) => Promise<void>;
  reset: () => void;
}

const initialState = {
  about: [],
  isLoading: true,
  isUploadingProfile: false,
};

export const useAboutStore = create<AboutState>()(
  devtools(
    immer((set, get) => ({
      // Initial State
      ...initialState,

      // Actions
      setAbout: (about) =>
        set(
          (state) => {
            state.about = about;
          },
          false,
          "setAbout"
        ),

      setIsLoading: (isLoading) =>
        set(
          (state) => {
            state.isLoading = isLoading;
          },
          false,
          "setIsLoading"
        ),

      setIsUploadingProfile: (isUploadingProfile) =>
        set(
          (state) => {
            state.isUploadingProfile = isUploadingProfile;
          },
          false,
          "setIsUploadingProfile"
        ),

      fetchAbout: async () => {
        try {
          set(
            (state) => {
              state.isLoading = true;
            },
            false,
            "fetchAbout/start"
          );

          const response = await axios.get<About[]>("/api/about");

          if (Array.isArray(response.data)) {
            set(
              (state) => {
                state.about = response.data;
              },
              false,
              "fetchAbout/success"
            );
          } else {
            console.error("API response is not an array:", response.data);
            set(
              (state) => {
                state.about = [];
              },
              false,
              "fetchAbout/error"
            );
          }
        } catch (error) {
          console.error("Error fetching about:", error);
          set(
            (state) => {
              state.about = [];
            },
            false,
            "fetchAbout/error"
          );
        } finally {
          set(
            (state) => {
              state.isLoading = false;
            },
            false,
            "fetchAbout/complete"
          );
        }
      },

      updateAbout: async (aboutId, updateData) => {
        const {
          data,
          profileFile,
          profileDeleted = false,
          oldProfile = "",
        } = updateData;

        const aboutToUpdate = get().about.find((a) => a.id === aboutId);
        if (!aboutToUpdate) {
          console.error("❌ About not found for update:", aboutId);
          return;
        }

        // OPTIMISTIC UPDATE: Simpan data lama untuk rollback
        const previousAbout = { ...aboutToUpdate };

        // Update optimistic - perbarui state sebelum request ke server
        // Hanya update field yang berupa string/primitif, bukan relasi
        const optimisticAbout: About = {
          ...aboutToUpdate,
          name: data.name,
          jobTitle: data.jobTitle,
          introduction: data.introduction,
          // Pertahankan relasi yang sudah ada (Skills, sosmed, workExperiences, projects)
          // karena form values hanya mengirim ID, bukan objek lengkap
          Skills: aboutToUpdate.Skills || [],
          sosmed: aboutToUpdate.sosmed || [],
          workExperiences: aboutToUpdate.workExperiences || [],
          projects: aboutToUpdate.projects || [],
          // Jika ada file baru, bisa tampilkan preview URL, atau tetap gunakan yang lama
          profilePicture: profileDeleted
            ? ""
            : aboutToUpdate.profilePicture || "",
        };

        set(
          (state) => {
            const index = state.about.findIndex((a) => a.id === aboutId);
            if (index !== -1) {
              state.about[index] = optimisticAbout;
            }
          },
          false,
          "updateAbout/optimistic"
        );

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
          formData.append(
            "oldProfile",
            oldProfile || aboutToUpdate.profilePicture || ""
          );

          // Handle thumbnail baru/hapus
          if (profileFile) {
            set(
              (state) => {
                state.isUploadingProfile = true;
              },
              false,
              "updateAbout/uploadingProfile"
            );
            formData.append("profile", profileFile);
          } else if (
            profileDeleted &&
            (oldProfile || aboutToUpdate.profilePicture)
          ) {
            formData.append("profileDeleted", "true");
          }

          console.log("🚀 Sending update request for about:", aboutId);

          // Request update ke API Next.js
          const response = await fetch(`/api/about/${aboutId}`, {
            method: "PUT",
            body: formData,
          });

          if (!response.ok) {
            throw new Error("Gagal update about");
          }

          const result = await response.json();

          if (result && result.id) {
            // Update state dengan data lengkap dari server (termasuk relasi)
            set(
              (state) => {
                const index = state.about.findIndex(
                  (a: About) => a.id === aboutId
                );
                if (index !== -1) {
                  state.about[index] = result;
                }
              },
              false,
              "updateAbout/success"
            );
            // Import useHomeStore di bagian atas file
            useHomeStore.getState().fetchHome();

            toast.success("About berhasil diupdate!");
            console.log("✅ About updated successfully:", result);
          } else {
            console.warn("Server response missing about data, refetching...");
            await get().fetchAbout();
            useHomeStore.getState().fetchHome();
            toast.success("About berhasil diupdate!");
          }
        } catch (error) {
          console.error("Error updating about:", error);
          toast.error("Gagal mengupdate about. Silakan coba lagi.");

          // ROLLBACK: Kembalikan ke data sebelumnya jika gagal
          set(
            (state) => {
              const index = state.about.findIndex((a) => a.id === aboutId);
              if (index !== -1) {
                state.about[index] = previousAbout;
              }
            },
            false,
            "updateAbout/error"
          );
          throw error;
        } finally {
          set(
            (state) => {
              state.isUploadingProfile = false;
            },
            false,
            "updateAbout/complete"
          );
        }
      },

      reset: () => set(initialState, false, "reset"),
    })),
    { name: "AboutStore" }
  )
);
