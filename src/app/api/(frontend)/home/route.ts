import db from "@/lib/db";
import { NextResponse } from "next/server";

export const revalidate = 60; // Revalidate setiap 60 detik (ISR)
export const dynamic = 'force-static'; // atau 'force-cache' untuk caching penuh

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
        
        return NextResponse.json(home, {
            headers: {
                'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
            },
        });
    } catch (error) {
        console.error("[HOME_GET] Error:", error);
        return new Response("Internal Error", { status: 500 });
    }
}