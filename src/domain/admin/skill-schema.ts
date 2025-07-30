import * as z from "zod"

export interface Skill {
  id: string;
  name: string;
  icon: string;
}

export const skillSchema = z.object({
  name: z.string().min(1, "Name is required"),
  icon: z.string()
});

export type SkillFormValues = z.infer<typeof skillSchema>