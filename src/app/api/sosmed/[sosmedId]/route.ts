import db from "@/lib/db";

export async function DELETE(
  _req: Request,
  context: { params: Promise<{ sosmedId: string }> }
) {
  try {
    const { sosmedId } = await context.params;

    const sosmed = await db.sosmed.deleteMany({
      where: {
        id: sosmedId,
      },
    });

    return Response.json(sosmed);
  } catch (error) {
    console.log("SOSMED_DELETE]", error);
    return new Response("Internal error", { status: 500 });
  }
}

export async function PUT(
  _req: Request,
  context: { params: Promise<{ sosmedId: string }> }
) {
  try {
    const { sosmedId } = await context.params;
    const body = await _req.json();

    const { id, name, url } = body;

    const sosmed = await db.sosmed.updateMany({
      where: {
        id: sosmedId,
      },
      data: {
        id,
        name,
        url
      }
    })

    return Response.json(sosmed)

  } catch (error) {
    console.log('[SOSMED_UPDATE]', error)
    return new Response("Internal error", { status: 500 })
  }
}
