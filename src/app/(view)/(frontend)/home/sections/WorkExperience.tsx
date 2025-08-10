import { About } from "@/domain/admin/about-schema";
import { SectionHeader } from "../components/SectionHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Briefcase,
    Building,
    Calendar,
    Zap,
    ChevronRight,
    ArrowUpRightIcon,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useCallback, useEffect, useRef, useState } from "react";

interface WorkExperienceSectionProps {
    home: About;
}

export const WorkExperienceSection = ({ home }: WorkExperienceSectionProps) => {
    const [visibleItems, setVisibleItems] = useState<Set<number>>(new Set());
    const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

    // Memoize formatDate function untuk menghindari re-creation
    const formatDate = useCallback((dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short'
        });
    }, []);

    // Memoize processed work experiences
    const processedWorkExperiences = useMemo(() => {
        return home.workExperiences?.map((work) => ({
            ...work,
            formattedStartDate: formatDate(typeof work.startDate === 'string' ? work.startDate : work.startDate.toISOString()),
            formattedEndDate: work.endDate ? formatDate(typeof work.endDate === 'string' ? work.endDate : work.endDate.toISOString()) : 'Present'
        }));
    }, [home.workExperiences, formatDate]);

    // Intersection Observer untuk animasi scroll
    useEffect(() => {
        const observers: IntersectionObserver[] = [];

        itemRefs.current.forEach((ref, index) => {
            if (ref) {
                const observer = new IntersectionObserver(
                    ([entry]) => {
                        if (entry.isIntersecting) {
                            setVisibleItems(prev => new Set([...prev, index]));
                        }
                    },
                    {
                        threshold: 0.3,
                        rootMargin: '-50px 0px'
                    }
                );

                observer.observe(ref);
                observers.push(observer);
            }
        });

        return () => {
            observers.forEach(observer => observer.disconnect());
        };
    }, [processedWorkExperiences]);

    return (
        <section className="pb-16 lg:py-24">
            <div className="container">
                <SectionHeader
                    eyebrow="Professional Journey"
                    title="Work Experience"
                    description="A timeline of my professional growth and contributions across different organizations."
                />

                <div className="relative mt-10 md:mt-20 lg:mx-72">
                    {/* Animated Timeline line */}
                    <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary/20 via-primary/50 to-primary/20 hidden lg:block">
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary to-transparent opacity-50 animate-pulse" />
                    </div>

                    <div className="space-y-12">
                        {processedWorkExperiences?.map((work, workIndex) => (
                            <div
                                key={work.id}
                                ref={el => { itemRefs.current[workIndex] = el; }}
                                className={`relative group transition-all duration-700 ease-out ${visibleItems.has(workIndex)
                                        ? 'opacity-100 translate-y-0 scale-100'
                                        : 'opacity-0 translate-y-8 scale-95'
                                    }`}
                                style={{
                                    transitionDelay: `${workIndex * 150}ms`
                                }}
                            >
                                {/* Animated Timeline dot */}
                                <div className={`absolute left-6 top-8 w-4 h-4 rounded-full border-2 border-background shadow-lg z-10 hidden lg:block transition-all duration-500 ${visibleItems.has(workIndex)
                                        ? 'bg-primary scale-110 shadow-primary/50'
                                        : 'bg-primary/50 scale-100'
                                    }`}>
                                    <div className="absolute inset-0 bg-primary rounded-full animate-ping opacity-20" />
                                </div>

                                {/* Glowing effect for timeline dot */}
                                <div className={`absolute left-5 top-7 w-6 h-6 bg-primary/20 rounded-full blur-sm z-0 hidden lg:block transition-all duration-500 ${visibleItems.has(workIndex) ? 'opacity-100' : 'opacity-0'
                                    }`} />

                                {/* Enhanced Card with hover effects */}
                                <Card className={`lg:ml-16 border-2 transition-all duration-500 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10 group-hover:-translate-y-1 ${visibleItems.has(workIndex)
                                        ? 'border-border shadow-md'
                                        : 'border-border/50'
                                    }`}>
                                    <CardContent className="p-6 relative overflow-hidden">
                                        {/* Content with staggered animations */}
                                        <div className="space-y-4">
                                            <div className={`flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 transition-all duration-500 ${visibleItems.has(workIndex)
                                                    ? 'opacity-100 translate-x-0'
                                                    : 'opacity-0 -translate-x-4'
                                                }`} style={{ transitionDelay: `${workIndex * 150 + 200}ms` }}>
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-2 group/title">
                                                        <Briefcase className="w-5 h-5 text-primary transition-transform duration-300 group-hover/title:rotate-12" />
                                                        <h3 className="text-xl font-bold group-hover:text-primary transition-colors duration-300">{work.position}</h3>
                                                    </div>
                                                    <div className="flex items-center gap-2 group/company">
                                                        <Building className="w-4 h-4 text-primary transition-transform duration-300 group-hover/company:scale-110" />
                                                        <h4 className="text-lg text-primary font-semibold group-hover:text-primary/80 transition-colors duration-300">{work.company}</h4>
                                                    </div>

                                                    <div className="flex flex-wrap gap-2">
                                                        {[work.employmenttype, work.location, work.locationtype].map((badge, badgeIndex) => (
                                                            <Badge
                                                                key={badgeIndex}
                                                                variant="outline"
                                                                className={`text-xs transition-all duration-300 hover:bg-primary hover:text-primary-foreground transform hover:scale-105 ${visibleItems.has(workIndex)
                                                                        ? 'opacity-100 translate-y-0'
                                                                        : 'opacity-0 translate-y-2'
                                                                    }`}
                                                                style={{ transitionDelay: `${workIndex * 150 + 300 + badgeIndex * 50}ms` }}
                                                            >
                                                                {badge}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className={`flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-3 py-2 rounded-lg backdrop-blur-sm transition-all duration-500 ${visibleItems.has(workIndex)
                                                        ? 'opacity-100 translate-x-0'
                                                        : 'opacity-0 translate-x-4'
                                                    }`} style={{ transitionDelay: `${workIndex * 150 + 250}ms` }}>
                                                    <Calendar size={14} className="text-primary" />
                                                    <span className="font-medium">{work.formattedStartDate} - {work.formattedEndDate}</span>
                                                </div>
                                            </div>

                                            {/* Job Description with slide-in animation */}
                                            {work.description && work.description.length > 0 && (
                                                <div className={`space-y-3 transition-all duration-500 ${visibleItems.has(workIndex)
                                                        ? 'opacity-100 translate-y-0'
                                                        : 'opacity-0 translate-y-4'
                                                    }`} style={{ transitionDelay: `${workIndex * 150 + 400}ms` }}>
                                                    <h5 className="font-semibold flex items-center gap-2 text-primary">
                                                        <Briefcase size={14} className="text-primary" />
                                                        Key Responsibilities & Achievements
                                                    </h5>
                                                    <ul className="space-y-2">
                                                        {work.description.map((desc, descIndex) => (
                                                            <li
                                                                key={descIndex}
                                                                className={`flex items-start gap-2 text-sm text-muted-foreground transition-all duration-300 hover:text-foreground group/item ${visibleItems.has(workIndex)
                                                                        ? 'opacity-100 translate-x-0'
                                                                        : 'opacity-0 -translate-x-2'
                                                                    }`}
                                                                style={{ transitionDelay: `${workIndex * 150 + 500 + descIndex * 100}ms` }}
                                                            >
                                                                <ChevronRight size={14} className="text-primary mt-0.5 flex-shrink-0 transition-transform duration-300 group-hover/item:translate-x-1" />
                                                                <span>{desc}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}

                                            {/* Skills with staggered animation */}
                                            {work.Skills && work.Skills.length > 0 && (
                                                <div className={`space-y-3 transition-all duration-500 ${visibleItems.has(workIndex)
                                                        ? 'opacity-100 translate-y-0'
                                                        : 'opacity-0 translate-y-4'
                                                    }`} style={{ transitionDelay: `${workIndex * 150 + 600}ms` }}>
                                                    <h5 className="font-semibold flex items-center gap-2 text-primary">
                                                        <Zap size={14} className="text-primary" />
                                                        Technologies & Tools
                                                    </h5>
                                                    <div className="flex flex-wrap gap-2">
                                                        {work.Skills.map((skill, skillIndex) => (
                                                            <div
                                                                key={skill.id}
                                                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 bg-muted rounded-lg text-sm transition-all duration-300 hover:bg-primary hover:text-primary-foreground hover:scale-105 hover:shadow-lg cursor-default ${visibleItems.has(workIndex)
                                                                        ? 'opacity-100 scale-100'
                                                                        : 'opacity-0 scale-90'
                                                                    }`}
                                                                style={{ transitionDelay: `${workIndex * 150 + 700 + skillIndex * 50}ms` }}
                                                            >
                                                                {skill.icon && (
                                                                    <i className={`${skill.icon} text-base transition-transform duration-300 hover:rotate-12`}></i>
                                                                )}
                                                                <span className="font-medium">{skill.name}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Enhanced CTA Button */}
                <div className="flex justify-center mt-12">
                    <Link
                        href="/work-experience"
                        className="group relative bg-white border-2 border-gray-950 text-gray-950 h-12 px-8 rounded-xl font-semibold inline-flex items-center justify-center gap-2 hover:bg-gray-950 hover:text-white transition-all duration-300 cursor-pointer overflow-hidden"
                    >
                        {/* Button background animation */}
                        <div className="absolute inset-0 bg-gray-950 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300 ease-out" />

                        <span className="relative z-10 transition-transform duration-300 group-hover:scale-105">
                            View All Work Experience
                        </span>
                        <ArrowUpRightIcon className="relative z-10 w-4 h-4 transition-all duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
                    </Link>
                </div>
            </div>
        </section>
    );
};