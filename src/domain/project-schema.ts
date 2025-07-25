import * as z from "zod"
import { Skill } from "./skill-schema";

export interface Project {
  id: string;
  title: string;
  description: string;
  feature: string[];
  technology: string[];
  githubUrl: string;
  liveUrl: string;
  thumbnail: string;
  photo: string[];
  createdAt: Date;
  updatedAt: Date | null;
  Skills: Skill[];
}

// Updated schema dengan validasi yang lebih fleksibel
export const projectSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  feature: z.array(z.string().min(1, "Feature cannot be empty"))
    .min(1, "At least one feature is required")
    .refine(arr => arr.some(item => item.trim().length > 0), "At least one feature is required"),
  technology: z.array(z.string().min(1, "Technology cannot be empty"))
    .min(1, "At least one technology is required")
    .refine(arr => arr.some(item => item.trim().length > 0), "At least one technology is required"),
  githubUrl: z.string()
    .refine(val => val === "" || z.string().url().safeParse(val).success, "Invalid GitHub URL"),
  liveUrl: z.string()
    .refine(val => val === "" || z.string().url().safeParse(val).success, "Invalid Live URL"),
  thumbnail: z.string().min(1, "Thumbnail is required"),
  photo: z.array(z.string().min(1, "Photo cannot be empty"))
    .min(1, "At least one photo is required"),
  skillId: z.array(z.string()).optional(),
});

export type ProjectFormValues = z.infer<typeof projectSchema>