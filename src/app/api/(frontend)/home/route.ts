import db from "@/lib/db";

export async function GET() {
    try {
        const about = await db.about.findMany({
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
            },
        });

        const projects = await db.project.findMany({
            include: {
                Skills: true,
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        // Struktur response yang menggabungkan about dan projects
        const response = {
            about: about.length > 0 ? about[0] : null,
            projects: projects,
            allData: about.length > 0 ? {
                ...about[0],
                projects: projects
            } : null
        };

        console.log("[HOME_GET] Response:", response);
        
        // Return dalam format array seperti sebelumnya untuk compatibility
        if (response.allData) {
            return Response.json([response.allData]);
        } else {
            return Response.json([]);
        }
    } catch (error) {
        console.error("[HOME_GET] Error:", error);
        return new Response("Internal Error", { status: 500 });
    }
}