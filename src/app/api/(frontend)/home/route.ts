import db from "@/lib/db";

export async function GET() {
    try {
        const home = await db.about.findMany({
            include: {
                Skills: true,
                sosmed: true,
                workExperiences: {
                    include: {
                        Skills: true,
                    },
                    orderBy: {
                        startDate: "desc",
                    },
                },
                projects: {
                    include: {
                        Skills: true,
                    },
                    orderBy: {
                        createdAt: "desc",
                    },
                },
            },
        });

        console.log("[HOME_GET]", home);
        return Response.json(home);
    } catch (error) {
        console.error("[HOME_GET] Error:", error);
        return new Response("Internal Error", { status: 500 });
    }
}