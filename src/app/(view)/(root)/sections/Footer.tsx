import { About } from "@/schema/about-schema";
import { ArrowUpRightIcon } from "lucide-react";
import Link from "next/link";

interface FooterSectionProps {
    home: About;
}

export const FooterSection = ({ home }: FooterSectionProps) => {
    const currentYear = new Date().getFullYear();
    return (
        <footer className="relative z-10 overflow-x-clip">
            <div className="container">
                <div className="border-t border-black/15 py-6 text-sm flex flex-col md:flex-row md:justify-between items-center gap-8">
                    <div className="ml-5 text-black/40">&copy; {currentYear}. All rights reserved.</div>
                    <nav className="mr-5 flex flex-col md:flex-row items-center gap-8">
                        {home.sosmed?.map(sosmed => (
                            <a
                              href={sosmed.url}
                              key={sosmed.id}
                              className="inline-flex items-center gap-1.5 hover:text-blue-600 transition-colors"
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ zIndex: 100, position: "relative", pointerEvents: "auto" }}
                            >
                                <i className={`fa-brands fa-${sosmed.name} text-2xl`} />
                                <span className="font-semibold">{sosmed.name}</span>
                                <ArrowUpRightIcon className="size-4" />
                            </a>
                        ))}
                        <Link
                              href="/admin/about"
                              className="inline-flex items-center gap-1.5 hover:text-blue-600 transition-colors"
                              style={{ zIndex: 100, position: "relative", pointerEvents: "auto" }}
                            >
                                <i className="fa-solid fa-gear text-2xl" />
                                <span className="font-semibold">Dashboard</span>
                                <ArrowUpRightIcon className="size-4" />
                            </Link>
                    </nav>
                </div>
            </div>
        </footer>
    )
}