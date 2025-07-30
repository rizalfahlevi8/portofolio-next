import db from "@/lib/db";

export async function GET() {
    try {
        const about = await db.about.findMany({
            include: {
                Skills: true,
                sosmed: true,
                projects: true,
                workExperiences: true,
            },
        });

        console.log("[ABOUT_GET]", about);
        return Response.json(about);
    } catch (error) {
        console.error("[ABOUT_GET]", error);
        return new Response("Internal Error", { status: 500 });
    }
}