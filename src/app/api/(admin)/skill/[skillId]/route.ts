import db from "@/lib/db";

export async function DELETE(
  _req: Request,
  context: { params: Promise<{ skillId: string }> }
) {
  try {
    const { skillId } = await context.params;

    const skill = await db.skill.deleteMany({
      where: {
        id: skillId,
      },
    });

    return Response.json(skill);
  } catch (error) {
    console.log("SKILL_DELETE]", error);
    return new Response("Internal error", { status: 500 });
  }
}

export async function PUT(
  _req: Request,
  context: { params: Promise<{ skillId: string }> }
) {
  try {
    const { skillId } = await context.params;
    const body = await _req.json();

    const { id, name, icon } = body;

    const skill = await db.skill.updateMany({
      where: {
        id: skillId,
      },
      data: {
        id,
        name,
        icon
      }
    })

    return Response.json(skill)

  } catch (error) {
    console.log('[SKILL_UPDATE]', error)
    return new Response("Internal error", { status: 500 })
  }
}
