import { Prisma } from "@/generated/prisma";
import db from "@/lib/db";

export async function DELETE(
  _req: Request,
  context: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await context.params;

    const project = await db.project.deleteMany({
      where: {
        id: projectId,
      },
    });

    return Response.json(project);
  } catch (error) {
    console.log("PROJECT_DELETE]", error);
    return new Response("Internal error", { status: 500 });
  }
}

export async function PUT(
  _req: Request,
  context: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await context.params;
    const body = await _req.json();

    const { 
      title,
      description,
      feature,
      technology,
      thumbnail,
      photo, 
      githubUrl,
      liveUrl,
      skills,
      skillId
    } = body;

    let skillIds: string[] = [];
    
    if (skills && Array.isArray(skills)) {
      skillIds = skills;
    } else if (skillId && Array.isArray(skillId)) {
      skillIds = skillId;
    } else if (typeof skills === 'string') {
      skillIds = [skills];
    } else if (typeof skillId === 'string') {
      skillIds = [skillId];
    }

    const updateData: Prisma.ProjectUpdateInput = {
      title,
      description,
      feature,
      technology,
      githubUrl,
      liveUrl,
      thumbnail,
      photo,
    };

    if (skillIds.length > 0) {
      updateData.Skills = {
        set: skillIds.map((skillId: string) => ({ id: skillId })),
      };
    } else {
      updateData.Skills = {
        set: [],
      };
    }

    const project = await db.project.update({
      where: {
        id: projectId,
      },
      data: updateData,
      include: {
        Skills: {
          select: {
            id: true,
            name: true,
            icon: true,
          },
        },
      },
    });

    return Response.json(project);

  } catch (error) {
    console.log('[PROJECT_UPDATE]', error);
    return new Response("Internal error", { status: 500 });
  }
}