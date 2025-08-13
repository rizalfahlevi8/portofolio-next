import * as z from "zod"
import { Skill } from "./skill-schema";
import { Sosmed } from "./sosmed-schema";
import { WorkExperience } from "./workexperience-schema";
import { Project } from "./project-schema";

export interface About {
  image: any;
  id: string;
  name: string;
  jobTitle: string;
  introduction: string;
  profilePicture: string;
  Skills: Skill[];
  sosmed?: Sosmed[];
  workExperiences?: WorkExperience[];
  projects?: Project[];
}

export const aboutSchema = z.object({
  name: z.string().min(1, "Name is required"),
  jobTitle: z.string().min(1, "Job title is required"),
  introduction: z.string().min(1, "Introduction is required"),
  profilePicture: z.string().min(1, "Thumbnail is required"),
  skillId: z.array(z.string()).optional(),
  sosmed: z.array(z.string()).optional(),
  workExperiences: z.array(z.string()).optional(),
  projects: z.array(z.string()).optional(),
});

export type AboutFormValues = z.infer<typeof aboutSchema>