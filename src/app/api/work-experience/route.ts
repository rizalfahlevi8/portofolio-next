import db from "@/lib/db";

export async function GET() {
  try {
    const workExperience = await db.workExperience.findMany({
      select: {
        id: true,
        position: true,
        employmenttype: true,
        company: true,
        location: true,
        locationtype: true,
        description: true,
        startDate: true,
        endDate: true,
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

    return Response.json(workExperience);
  } catch (error) {
    console.error("[WORK_EXPERIENCE_GET]", error);
    return new Response("Internal Error", { status: 500 });
  }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();

        const { position, employmenttype, company, location, locationtype, description, startDate, endDate, skillId } = body;

        const workExperience = await db.workExperience.create({
            data: {
                position,
                employmenttype,
                company,
                location,
                locationtype,
                description,
                startDate,
                endDate,
                Skills: {
                    connect: skillId?.map((id: string) => ({ id })) || []
                }
            }
        });

        return Response.json(workExperience);
    } catch (error) {
        console.log("[WORK_EXPERIENCE_POST]", error);
        return new Response("Internal Error", { status: 500 });
    }
}