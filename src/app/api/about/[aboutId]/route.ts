import { Prisma } from "@/generated/prisma";
import db from "@/lib/db";
import { mkdir, unlink, writeFile } from "fs/promises";
import { NextRequest } from "next/server";
import path from "path";

async function saveFile(file: File, folder = "uploads") {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const uploadDir = path.join(process.cwd(), "public", folder);
    await mkdir(uploadDir, { recursive: true }); // <--- FIX: Pastikan folder ada!
    const filename = `${Date.now()}-${file.name}`;
    const filePath = path.join(uploadDir, filename);
    await writeFile(filePath, buffer);
    return `/${folder}/${filename}`;
}

// Helper untuk hapus file
async function safeDeleteFile(filePath: string) {
    if (!filePath) return;
    const fullPath = path.join(process.cwd(), "public", filePath.startsWith("/") ? filePath : `/${filePath}`);
    try {
        await unlink(fullPath);
    } catch (err) {
        if ((err as NodeJS.ErrnoException)?.code !== "ENOENT") {
            console.log(`[FILE_DELETE_ERROR]`, err);
        }
    }
}

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