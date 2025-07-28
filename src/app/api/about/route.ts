import db from "@/lib/db";

export async function GET() {
    try {
        const pages = await db.page.findMany({
            include: {
                sosmed: true,
                skills: true,
                projects: true,

            },
        });

        return Response.json(pages);
    } catch (error) {
        console.error("[PAGE_GET]", error);
        return new Response("Internal Error", { status: 500 });
    }
}