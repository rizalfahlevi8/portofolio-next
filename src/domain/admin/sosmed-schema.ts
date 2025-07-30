import * as z from "zod"

export interface Sosmed {
  id: string;
  name: string;
  url: string;
}

// Schema untuk single sosmed (untuk backend)
export const sosmedSchema = z.object({
  name: z.string().min(1, "Name is required"),
  url: z.string().min(1, { message: "URL sosial media wajib diisi" }),
});
export type SosmedFormValues = z.infer<typeof sosmedSchema>