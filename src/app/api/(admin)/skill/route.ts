import db from "@/lib/db";

export async function GET() {
    try {
        const skill = await db.skill.findMany({
            select: {
                id: true,
                name: true,
                icon: true,
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return Response.json(
            skill
        );
    } catch (error) {
        console.error("[SKILL_GET]", error);
        return new Response("Internal Error", { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();

        const { icon, name } = body;

        const skill = await db.skill.create({
            data: {
                icon,
                name
            }
        });

        return Response.json(skill);
    } catch (error) {
        console.log("[SKILL_POST]", error);
        return new Response("Internal Error", { status: 500 });
    }
}