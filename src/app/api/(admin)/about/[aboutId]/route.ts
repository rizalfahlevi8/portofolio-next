import { Prisma } from "@/generated/prisma";
import db from "@/lib/db";
import { safeDeleteFile, saveFile } from "@/lib/utils";
import { NextRequest } from "next/server";

export async function PUT(
    req: NextRequest,
    context: { params: Promise<{ aboutId: string }> }
) {
    try {
        const { aboutId } = await context.params;
        const formData = await req.formData();

        // Ambil semua value
        const name = formData.get("name") as string;
        const jobTitle = formData.get("jobTitle") as string;
        const introduction = formData.get("introduction") as string;
        const skillId = JSON.parse(formData.get("skillId") as string) as string[];
        const sosmed = JSON.parse(formData.get("sosmed") as string) as string[];
        const projects = JSON.parse(formData.get("projects") as string) as string[];

        // Profile logic
        const oldProfile = formData.get("oldProfile") as string;
        let profilePath = oldProfile;

        if (formData.has("profile")) {
            const file = formData.get("profile") as File;
            if (oldProfile) await safeDeleteFile(oldProfile);
            profilePath = await saveFile(file, "profile");
        } else if (formData.get("profileDeleted") === "true") {
            if (oldProfile) await safeDeleteFile(oldProfile);
            profilePath = "";
        }

        // Update database
        const updateData: Prisma.AboutUpdateInput = {
            name,
            jobTitle,
            introduction,
            profilePicture: profilePath,
            Skills: { set: skillId.map((id: string) => ({ id })) },
            sosmed: { set: sosmed.map((id: string) => ({ id })) },
            projects: { set: projects.map((id: string) => ({ id })) }
        };


        const about = await db.about.update({
            where: { id: aboutId },
            data: updateData,
            include: {
                Skills: { select: { id: true, name: true, icon: true } },
                sosmed: true,
                projects: true,
                workExperiences: true,
            }
        });

        return Response.json(about);
    } catch (error) {
        console.log('[ABOUT_UPDATE]', error);
        return new Response("Internal error", { status: 500 });
    }
}