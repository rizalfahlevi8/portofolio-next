import { About } from "@/domain/admin/about-schema";
import { SectionHeader } from "../components/SectionHeader"
import { Card } from "../components/Card";
import grainImage from "@/assets/images/grain.jpg";
import { ArrowUpRightIcon, CheckCircleIcon, ImageOffIcon } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

interface ProjectSectionProps {
    home: About;
}

export const ProjectsSection = ({ home }: ProjectSectionProps) => {
    const [imageErrors, setImageErrors] = useState<{ [key: string]: boolean }>({});

    const handleImageError = (projectId: string) => {
        setImageErrors(prev => ({ ...prev, [projectId]: true }));
    };

    return <section className="pb-16 lg:py-24">
        <div className="container">
            <SectionHeader eyebrow="Real-world Results" title="Featured Projects" description="See how I transformed concepts into engaging digital experiences." />
            <div className="flex flex-col mt-10 md:mt-20 gap-20">
                {home.projects?.map((project, projectIndex) => (
                    <Card
                        key={project.id}
                        className="lg:mx-30 xl:mx-72 px-8 pt-8 pb-0 md:pt-12 md:px-10 lg:pt-16 lg:px-20 lg:pb-0 sticky overflow-hidden"
                        style={{
                            top: `calc(64px + ${projectIndex * 40}px`,
                        }}
                    >
                        <div className="absolute inset-0 -z-10 opacity-5" style={{
                            backgroundImage: `url(${grainImage.src})`,
                        }}></div>
                        <div className="lg:grid lg:grid-cols-2 lg:gap-16 lg:h-full">
                            <div className="lg:pb-16">
                                <h3 className="font-serif text-2xl mt-2 md:mt-5 md:text-4xl">{project.title}</h3>
                                <hr className="border-t-2 border-black/5 mt-4 md:mt-5" />
                                <div className="mt-4 md:mt-5">
                                    <span className="text-base md:text-lg text-gray-500">{project.description}</span>
                                </div>

                                <ul className="flex flex-col gap-4 mt-4 md:mt-5">
                                    {project.technology.slice(0, 2).map((technology, index) => (
                                        <li key={index} className="flex gap-2 text-sm md:text-base text-black/50">
                                            <CheckCircleIcon className="size-5 md:size-6" />
                                            <span>{technology}</span>
                                        </li>
                                    ))}
                                    {project.technology.length > 2 && (
                                        <li className="flex gap-2 text-sm md:text-base text-black/30">
                                            <CheckCircleIcon className="size-5 md:size-6" />
                                            <span className="italic">and {project.technology.length - 2} more...</span>
                                        </li>
                                    )}
                                </ul>

                                {/* Skills horizontal scroll */}
                                {project.Skills?.length > 0 && (
                                    <div className="mt-6 flex flex-wrap gap-3 overflow-x-auto">
                                        {project.Skills.map((skill) => (
                                            <div
                                                key={skill.id}
                                                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl shadow-sm text-base text-gray-700 hover:bg-gray-100 hover:shadow-md transition-all duration-150 cursor-pointer"
                                            >
                                                {skill.icon && (
                                                    <i className={`${skill.icon} text-xl md:text-2xl text-gray-600`}></i>
                                                )}
                                                <span className="font-semibold">{skill.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <Link href="#" className="bg-gray-950 text-white h-12 w-full md:w-auto px-6 rounded-xl font-semibold inline-flex items-center justify-center gap-2 mt-8 cursor-pointer">
                                    <span>Details</span>
                                    <ArrowUpRightIcon className="size-4" />
                                </Link>
                            </div>
                            <div className="relative mt-8 lg:mt-0 lg:-mr-20 lg:-mb-16">
                                <div className="relative w-full h-[250px] md:h-[300px] lg:h-[500px] lg:w-[120%]">
                                    {imageErrors[project.id] ? (
                                        <div className="w-full h-full bg-gray-200 rounded-lg lg:rounded-none flex items-center justify-center">
                                            <ImageOffIcon className="w-12 h-12 text-gray-400" />
                                        </div>
                                    ) : (
                                        <Image
                                            src={project.thumbnail}
                                            alt={project.title}
                                            fill
                                            className="object-cover object-top lg:object-bottom-left rounded-lg lg:rounded-none"
                                            onError={() => handleImageError(project.id)}
                                        />
                                    )}
                                </div>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
            
            {/* More Projects Button */}
            <div className="flex justify-center mt-20">
                <Link
                        href="/projects"
                        className="group relative bg-white border-2 border-gray-950 text-gray-950 h-12 px-8 rounded-xl font-semibold inline-flex items-center justify-center gap-2 hover:bg-gray-950 hover:text-white transition-all duration-300 cursor-pointer overflow-hidden"
                    >
                        {/* Button background animation */}
                        <div className="absolute inset-0 bg-gray-950 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300 ease-out" />

                        <span className="relative z-10 transition-transform duration-300 group-hover:scale-105">
                            View All Projects
                        </span>
                        <ArrowUpRightIcon className="relative z-10 w-4 h-4 transition-all duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
                    </Link>
            </div>
        </div>
    </section>
}