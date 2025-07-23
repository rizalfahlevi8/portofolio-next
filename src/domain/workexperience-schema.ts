import * as z from "zod"
import { Skill } from "./skill-schema";

export interface WorkExperience {
  id: string;
  position: string;
  employmenttype: string;
  company: string;
  location: string;
  locationtype: string;
  description: string[];
  startDate: Date;
  endDate: Date | null;
  Skills: Skill[]; 
}


// Make sure your schema includes these fields
export const workExperienceSchema = z.object({
  position: z.string().min(1, "Position is required"),
  employmenttype: z.string().min(1, "Employment type is required"),
  company: z.string().min(1, "Company is required"),
  location: z.string().min(1, "Location is required"),
  locationtype: z.string().min(1, "Location type is required"),
  description: z.array(z.string()).min(1, "At least one description is required"),
  startDate: z.date(),
  endDate: z.date().nullable().optional(),
  skillId: z.array(z.string()).optional(), // ✅ skillId: string[] | undefined
});

export type WorkExperienceFormValues = z.infer<typeof workExperienceSchema>