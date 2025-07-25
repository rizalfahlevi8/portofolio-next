import db from "@/lib/db";

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

export async function POST(req: Request) {
    try {
        const body = await req.json();

        const { title, description, feature, technology, githubUrl, liveUrl, thumbnail, photo, skillId } = body;

        const project = await db.project.create({
            data: {
                title,
                description,
                feature,
                technology,
                githubUrl,
                liveUrl,
                thumbnail,
                photo,
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