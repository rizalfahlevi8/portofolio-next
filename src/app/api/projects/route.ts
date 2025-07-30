import db from "@/lib/db";
import { writeFile } from "fs/promises";
import { NextRequest } from "next/server";
import path from "path";

export async function GET() {
  try {
    const projects = await db.project.findMany({
      select: {
        id: true,
        title: true,
        description: true,
        feature: true,
        technology: true,
        githubUrl: true,
        liveUrl: true,
        thumbnail: true,
        photo: true,
        createdAt: true,
        updatedAt: true,
        About: true,
        Skills: {
          select: {
            id: true,
            name: true,
            icon: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return Response.json(projects);
  } catch (error) {
    console.error("[PROJECT_GET]", error);
    return new Response("Internal Error", { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    // Gunakan FormData, bukan JSON!
    const formData = await req.formData();

    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const githubUrl = formData.get("githubUrl") as string;
    const liveUrl = formData.get("liveUrl") as string;
    const skillId = JSON.parse(formData.get("skillId") as string || "[]") as string[];

    // Array string parse
    const feature = JSON.parse(formData.get("feature") as string || "[]");
    const technology = JSON.parse(formData.get("technology") as string || "[]");

    // File upload: thumbnail (single)
    let thumbnailUrl = "";
    const thumbnailFile = formData.get("thumbnail") as File | null;
    if (thumbnailFile && typeof thumbnailFile.arrayBuffer === "function") {
      thumbnailUrl = await saveFile(thumbnailFile, "thumbnails");
    }

    // File upload: photo (multiple)
    let photoUrls: string[] = [];
    const photoFiles = formData.getAll("photo") as File[];
    if (photoFiles && photoFiles.length > 0) {
      photoUrls = await Promise.all(
        photoFiles
          .filter(file => typeof file.arrayBuffer === "function")
          .map(file => saveFile(file, "photos"))
      );
    }

    // Insert ke DB
    const project = await db.project.create({
      data: {
        title,
        description,
        feature,
        technology,
        githubUrl,
        liveUrl,
        thumbnail: thumbnailUrl,
        photo: photoUrls,
        Skills: {
          connect: skillId?.map((id: string) => ({ id })) || []
        }
      }
    });

    return Response.json(project);
  } catch (error) {
    console.log("[PROJECT_POST]", error);
    return new Response("Internal Error", { status: 500 });
  }
}

async function saveFile(file: File, folder = "uploads") {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const filename = `${Date.now()}-${file.name}`;
  const uploadDir = path.join(process.cwd(), "public", folder, filename);
  await writeFile(uploadDir, buffer);
  return `/${folder}/${filename}`;
}