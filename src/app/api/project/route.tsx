import db from "@/lib/db";

export async function GET() {
  try {
    const projects = await db.project.findMany({
      select: {
        id: true,
        title: true,
        description: true,
        Feature: true,
        Technology: true,
        githubUrl: true,
        liveUrl: true,
        thumbnail: true,
        pageThumbnail: true,
        createdAt: true,
        updatedAt: true,
        Page: true,
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


