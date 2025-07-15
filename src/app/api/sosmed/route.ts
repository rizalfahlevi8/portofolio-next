import db from "@/lib/db";

export async function GET() {
    try {
        const sosmed = await db.sosmed.findMany({
            select: {
                id: true,
                name: true,
                url: true,
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return Response.json(
            sosmed
        );
    } catch (error) {
        console.error("[SOSMED_GET]", error);
        return new Response("Internal Error", { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();

        const { name, url } = body;

        const sosmed = await db.sosmed.create({
            data: {
                name,
                url
            }
        });

        return Response.json(sosmed);
    } catch (error) {
        console.log("[SOSMED_POST]", error);
        return new Response("Internal Error", { status: 500 });
    }
}