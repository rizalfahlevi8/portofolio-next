import { About } from "@/schema/about-schema";
import { useState, useEffect } from "react";
import { SectionHeader } from "../components/SectionHeader";
import { Card } from "../components/Card";
import { CardHeader } from "../components/CardHeader";
import Image from "next/image";
import mapImage from "@/assets/images/map.png";
import smileMemoji from "@/assets/images/memoji-smile.png";
import { ToolboxItems } from "../components/ToolboxItems";
import { Button } from "@/components/ui/button";
import { truncateText } from "@/lib/utils";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface AboutSectionProps {
    home: About;
}

export const AboutSection = ({ home }: AboutSectionProps) => {
    const [imageError, setImageError] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isLargeScreen, setIsLargeScreen] = useState(false);
    const [showTooltip, setShowTooltip] = useState(false);

    // Hook untuk mendeteksi ukuran layar
    useEffect(() => {
        const checkScreenSize = () => {
            setIsLargeScreen(window.innerWidth >= 1024); // lg breakpoint (1024px)
        };

        // Cek ukuran layar saat component mount
        checkScreenSize();

        // Add event listener untuk resize
        window.addEventListener('resize', checkScreenSize);

        // Cleanup event listener
        return () => window.removeEventListener('resize', checkScreenSize);
    }, []);

    // Tentukan limit berdasarkan ukuran layar
    const truncateLimit = isLargeScreen ? 200 : 180;
    const shouldShowReadMore = home.introduction && home.introduction.length > 250;


    return (
        <div className="py-20 lg:py-28">
            <div className="container">
                <SectionHeader eyebrow="About Me" title="A Glimpse Into My World" description="Learn more about who I am, what I do, and what inspires me." />
                <div className="mt-20 flex flex-col gap-8 mx-10 md:mx-10 lg:mx-30 xl:mx-60">
                    <div className="grid grid-cols-1 gap-8 md:grid-cols-5 lg:grid-cols-3">
                        <Card className="md:col-span-2 lg:col-span-1 h-[320px] relative overflow-hidden group">
                            <div className="absolute inset-0">
                                {!imageError && home.profilePicture ? (
                                    <Image
                                        src={home.profilePicture}
                                        alt="Rizal Fahlevi"
                                        fill
                                        className="object-cover object-center group-hover:scale-110 transition-transform duration-500"
                                        onError={() => setImageError(true)}
                                        priority
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                        <div className="text-center text-white">
                                            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                                                </svg>
                                            </div>
                                            <p className="text-lg font-medium">Rizal Fahlevi</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Overlay dengan info */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end">
                                <div className="p-6 text-white">
                                    <h3 className="text-xl font-bold mb-2">{home.name}</h3>
                                    <p className="text-sm opacity-90">{home.jobTitle}</p>
                                </div>
                            </div>
                        </Card>
                        <Card className="h-[320px] p-0 flex flex-col md:col-span-3 lg:col-span-2">
                            <CardHeader title="About Me" description="Explore my background, interests, and passions." className="px-6 py-6" />
                            <div className="mx-6 md:mx-10 mb-6 flex-1 flex flex-col">
                                <div className="flex-1">
                                    <p className="text-sm lg:text-base text-black/70 leading-relaxed">
                                        {shouldShowReadMore
                                            ? truncateText(home.introduction, truncateLimit)
                                            : home.introduction
                                        }
                                    </p>
                                </div>

                                {/* Tombol "Lihat Lebih Banyak" */}
                                {shouldShowReadMore && (
                                    <div className="mt-1 pt-3 border-t border-gray-200">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setIsDialogOpen(true)}
                                            className="text-xs"
                                        >
                                            Lihat Lebih Banyak
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </Card>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-5 lg:grid-cols-3 gap-8">
                        <Card className="h-[320px] md:col-span-3 lg:col-span-2 overflow-hidden">
                            <CardHeader title="My Toolbox" description="Explore the technologies and tools I use to craft exceptional digital experiences." className="" />
                            <ToolboxItems items={home.Skills} className="" itemsWrapperClassName="animate-move-left [animation-duration:30s]" />
                            <ToolboxItems items={home.Skills} className="mt-6" itemsWrapperClassName="animate-move-right [animation-duration:15s]" />
                        </Card>
                        
                        <TooltipProvider>
                            <Tooltip open={showTooltip} onOpenChange={setShowTooltip}>
                                <TooltipTrigger asChild>
                                    <Card 
                                        className="h-[320px] p-0 relative md:col-span-2 lg:col-span-1 cursor-pointer hover:scale-105 transition-transform duration-300"
                                        onTouchStart={() => setShowTooltip(true)}
                                        onTouchEnd={() => setTimeout(() => setShowTooltip(false), 2000)}
                                        onMouseEnter={() => setShowTooltip(true)}
                                        onMouseLeave={() => setShowTooltip(false)}
                                    >
                                        <Image src={mapImage} alt="map" className="h-full w-full object-cover object-left-top" />
                                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-20 rounded-full bg-gradient-to-r from-gray-300 to-gray-500 after:content-[''] after:absolute after:inset-0 after:outline after:outline-2 after:-outline-offset-2 after:rounded-full after:outline-gray-950/30">
                                            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-gray-300 to-gray-500 -z-20 animate-ping [animation-duration:2s]"></div>
                                            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-gray-300 to-gray-500 -z-10"></div>
                                            <Image src={smileMemoji} alt="smile memoji" className="size-20" />
                                        </div>
                                    </Card>
                                </TooltipTrigger>
                                <TooltipContent 
                                    side="top" 
                                    className="bg-black text-white px-3 py-2 text-sm rounded-md shadow-lg"
                                    sideOffset={10}
                                >
                                    <div className="flex items-center gap-2">
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                                        </svg>
                                        <span>Tulungagung, East Java, Indonesia</span>
                                    </div>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                </div>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>About {home.name}</DialogTitle>
                        <DialogDescription>
                            {home.jobTitle}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="mt-4">
                        <p className="text-sm lg:text-base text-gray-700 leading-relaxed whitespace-pre-line">
                            {home.introduction}
                        </p>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}