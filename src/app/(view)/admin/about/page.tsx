"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { useAboutStore } from "@/store/about-store";
import { extractUsernameFromUrl } from "@/lib/utils";
import {
  BriefcaseBusiness,
  Code,
  ExternalLink,
  FilePen,
  Github,
  Loader2,
  Tag,
  UserPen,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { EditAboutDialog } from "./components/about-edit-dialog";
import { AboutFormValues } from "@/schema/about-schema";

export default function About() {
  // Ambil state dan actions langsung dari Zustand store
  const about = useAboutStore((state) => state.about);
  const isLoadingAbout = useAboutStore((state) => state.isLoading);
  const isUploadingProfile = useAboutStore((state) => state.isUploadingProfile);
  const fetchAbout = useAboutStore((state) => state.fetchAbout);
  const updateAbout = useAboutStore((state) => state.updateAbout);

  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    fetchAbout();
  }, [fetchAbout]);

  const validAbout = about?.filter((item) => item && item.id) || [];
  const user = validAbout[0];

  function formatDate(date: Date | null) {
    if (!date) return "Sekarang";
    return date.toLocaleDateString("id-ID", { year: "numeric", month: "long" });
  }

  const handleUpdateAbout = async (
    aboutId: string,
    updateData: {
      data: AboutFormValues;
      profileFile?: File | null;
      profileDeleted?: boolean;
      oldProfile?: string;
    }
  ) => {
    setUpdatingId(aboutId);
    try {
      await updateAbout(aboutId, updateData);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="flex-1 space-y-8 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Heading title="About Management" description="Kelola data diri kamu" />
        <div className="flex items-center gap-4">
          {user && (
            <EditAboutDialog
              about={user}
              onUpdate={handleUpdateAbout}
              isUpdating={updatingId === user.id || isUploadingProfile}
            />
          )}
        </div>
      </div>

      <Separator />

      {/* Loading State */}
      {isLoadingAbout ? (
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 className="h-10 w-10 mb-4 animate-spin text-muted-foreground" />
          <p className="text-lg text-muted-foreground">Loading Data Diri...</p>
        </div>
      ) : user ? (
        <div className="space-y-8">
          {/* Profile Card */}
          <Card className="shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-xl">
                <UserPen className="h-5 w-5" />
                Data Diri Kamu
              </CardTitle>
              <CardDescription className="text-sm">
                Data ini akan ditampilkan di landing page
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex flex-col lg:flex-row gap-8">
                {/* Profile Picture */}
                <div className="flex-shrink-0 mx-auto lg:mx-0">
                  {user.profilePicture ? (
                    <div className="relative w-40 h-40 lg:w-48 lg:h-48 overflow-hidden rounded-xl border-2 border-border/50 shadow-md">
                      <Image
                        src={user.profilePicture}
                        alt={user.name}
                        fill
                        className="object-cover transition-transform hover:scale-105"
                      />
                    </div>
                  ) : (
                    <div className="w-40 h-40 lg:w-48 lg:h-48 bg-muted rounded-xl flex items-center justify-center border-2 border-border/50">
                      <Code className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                </div>

                {/* Profile Info */}
                <div className="flex-1 min-w-0 space-y-6">
                  {/* Basic Info */}
                  <div className="space-y-3 text-center lg:text-left">
                    <h3 className="text-2xl font-bold text-foreground">
                      {user.name}
                    </h3>
                    <p className="text-lg font-semibold text-primary">
                      {user.jobTitle}
                    </p>
                    <p
                      className="text-sm text-muted-foreground leading-relaxed max-w-2xl"
                      style={{ whiteSpace: "pre-line" }}
                    >
                      {user.introduction}
                    </p>
                  </div>

                  {/* Skills Section */}
                  {user.Skills && user.Skills.length > 0 && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                        <Tag className="h-4 w-4" />
                        Teknologi & Skills
                      </div>
                      <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
                        {user.Skills.map((skill) => (
                          <div
                            key={skill.id}
                            className="flex items-center gap-2 px-4 py-2 bg-secondary/80 border border-border rounded-lg text-sm font-medium text-secondary-foreground hover:bg-secondary transition-colors"
                          >
                            {skill.icon && (
                              <i className={`${skill.icon} text-lg`}></i>
                            )}
                            <span>{skill.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Social Media Section */}
                  {user.sosmed && user.sosmed.length > 0 && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                        <Tag className="h-4 w-4" />
                        Social Media
                      </div>
                      <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
                        {user.sosmed.map((sosmed) => {
                          const username = extractUsernameFromUrl(sosmed.url);
                          return (
                            <a
                              key={sosmed.id}
                              href={sosmed.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 px-4 py-2 bg-secondary/80 border border-border rounded-lg text-sm font-medium text-secondary-foreground hover:bg-secondary transition-colors group"
                            >
                              {sosmed.name ? (
                                <i
                                  className={`fa-brands fa-${sosmed.name} text-lg group-hover:scale-110 transition-transform`}
                                />
                              ) : (
                                <div className="w-5 h-5 bg-muted rounded flex items-center justify-center">
                                  <Code className="h-3 w-3 text-muted-foreground" />
                                </div>
                              )}
                              <span>{username || "UnURL"}</span>
                            </a>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Projects Section */}
          {user.projects && user.projects.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <FilePen className="h-6 w-6" />
                <h2 className="text-2xl font-bold">Proyek</h2>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {user.projects.map((project) => (
                  <Card
                    key={project.id}
                    className="shadow-sm hover:shadow-md transition-shadow"
                  >
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg">{project.title}</CardTitle>
                      <CardDescription className="text-sm leading-relaxed">
                        {project.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex gap-3">
                        {project.githubUrl && (
                          <Button
                            size="sm"
                            variant="outline"
                            asChild
                            className="text-xs"
                          >
                            <a
                              href={project.githubUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Github className="h-4 w-4 mr-2" />
                              Source Code
                            </a>
                          </Button>
                        )}
                        {project.liveUrl && (
                          <Button size="sm" asChild className="text-xs">
                            <a
                              href={project.liveUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <ExternalLink className="h-4 w-4 mr-2" />
                              Live Demo
                            </a>
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Work Experience Section */}
          {user.workExperiences && user.workExperiences.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <BriefcaseBusiness className="h-6 w-6" />
                <h2 className="text-2xl font-bold">Pengalaman Kerja</h2>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {user.workExperiences.map((exp) => (
                  <Card
                    key={exp.id}
                    className="shadow-sm hover:shadow-md transition-shadow"
                  >
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg">{exp.position}</CardTitle>
                      <CardDescription>
                        <div className="space-y-1">
                          <div className="flex flex-wrap gap-2 text-sm">
                            <span className="font-medium text-primary">
                              {exp.company}
                            </span>
                            <span className="text-muted-foreground">•</span>
                            <span className="text-muted-foreground">
                              {exp.employmenttype}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                            <span>{exp.location}</span>
                            <span>•</span>
                            <span>{exp.locationtype}</span>
                          </div>
                        </div>
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="text-xs font-medium text-muted-foreground bg-muted/50 px-3 py-2 rounded-lg inline-block">
                        {formatDate(new Date(exp.startDate))} -{" "}
                        {formatDate(exp.endDate ? new Date(exp.endDate) : null)}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-6">
            <Code className="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">
            Data Tidak Ditemukan
          </h3>
          <p className="text-muted-foreground max-w-md">
            Data diri kamu gagal dimuat. Silakan coba refresh halaman atau
            hubungi administrator.
          </p>
        </div>
      )}
    </div>
  );
}
