"use client";

import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { useWorkExperienceManager } from "@/hooks/admin/useWorkExperience";
import {
  Code,
  Loader2,
  MapPin,
  Calendar,
  Building2,
  Briefcase,
  Clock,
  CheckCircle2,
  Tag,
} from "lucide-react";
import { useEffect, useState } from "react";
import AddWorkExperienceDialog from "./components/workexperience-add-dialog";
import { WorkExperienceEditDropdown } from "./components/workexperience-edit-dropdown";
import { WorkExperienceFormValues } from "@/domain/admin/workexperience-schema";

export default function WorkExperience() {
  const {
    workExperiences,
    isLoading: isLoadingWorkExperiences,
    updateWorkExperience,
    deleteWorkExperience,
    fetchWorkExperiences,
  } = useWorkExperienceManager();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    fetchWorkExperiences();
  }, [fetchWorkExperiences]);

  const validWorkExperiences =
    workExperiences?.filter((experience) => experience && experience.id) || [];

  const formatDate = (date: Date | string): string => {
    return new Date(date).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getEmploymentTypeColor = (type: string): string => {
    const colors: Record<string, string> = {
      "Full-time": "bg-green-100 text-green-800 border-green-200",
      "Part-time": "bg-blue-100 text-blue-800 border-blue-200",
      Contract: "bg-yellow-100 text-yellow-800 border-yellow-200",
      Freelance: "bg-purple-100 text-purple-800 border-purple-200",
      Internship: "bg-orange-100 text-orange-800 border-orange-200",
    };
    return colors[type] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const handleWorkExperienceAdded = () => {
    fetchWorkExperiences();
  };

  const handleUpdateWorkExperience = async (
    workExperienceId: string,
    data: WorkExperienceFormValues
  ) => {
    setUpdatingId(workExperienceId);
    try {
      await updateWorkExperience(workExperienceId, data);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteWorkExperience = async (workExperienceId: string) => {
    setDeletingId(workExperienceId);
    try {
      await deleteWorkExperience(workExperienceId);
    } finally {
      setDeletingId(null);
    }
  };

  const isTemporaryWorkExperience = (
    workExperienceId: string | undefined | null
  ): boolean => {
    return workExperienceId ? workExperienceId.startsWith("temp-") : false;
  };

  return (
    <div className="flex-1 space-y-6 p-8">
      <div className="flex items-center justify-between">
        <Heading
          title="Work Experience Management"
          description="Kelola data pengalaman kerja yang kamu miliki"
        />
        <div className="flex items-center gap-4">
          <AddWorkExperienceDialog
            onWorkExperienceAdded={handleWorkExperienceAdded}
          />
        </div>
      </div>
      <Separator />

      {isLoadingWorkExperiences ? (
        <div className="text-center py-12">
          <Loader2 className="h-8 w-8 mx-auto mb-4 animate-spin text-muted-foreground" />
          <p className="text-muted-foreground">Loading Pengalaman Kerja...</p>
        </div>
      ) : validWorkExperiences.length > 0 ? (
        <div className="space-y-6">
          {validWorkExperiences.map((experience) => {
            const isTemp = isTemporaryWorkExperience(experience.id);

            return (
              <div
                key={experience.id}
                className="group relative bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 p-6 hover:border-gray-300"
              >
                {/* Header Section with Dropdown */}
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-3 mb-2">
                      <div className="p-2 bg-blue-50 rounded-lg">
                        <Briefcase className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-1">
                          {experience.position}
                        </h3>
                        <div className="flex items-center gap-2 text-gray-600 mb-2">
                          <Building2 className="h-4 w-4" />
                          <span className="font-medium">
                            {experience.company}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Employment Type Badge and Dropdown Container */}
                  <div className="flex items-start gap-2 mt-2 lg:mt-0">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getEmploymentTypeColor(
                        experience.employmenttype
                      )}`}
                    >
                      <Clock className="h-3 w-3 mr-1" />
                      {experience.employmenttype}
                    </span>

                    {/* Edit Dropdown - Moved here and positioned properly */}
                    {!isTemp && (
                      <div className="relative z-10">
                        <WorkExperienceEditDropdown
                          workExperience={experience}
                          onUpdate={handleUpdateWorkExperience}
                          onDelete={handleDeleteWorkExperience}
                          isUpdating={updatingId === experience.id}
                          isDeleting={deletingId === experience.id}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Location and Duration */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 mb-4">
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">
                      {experience.location} • {experience.locationtype}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">
                      {formatDate(experience.startDate)} -{" "}
                      {experience.endDate
                        ? formatDate(experience.endDate)
                        : "Present"}
                    </span>
                  </div>
                </div>

                {/* Description */}
                {experience.description &&
                  experience.description.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4" />
                        Deskripsi:
                      </h4>
                      <ul className="space-y-2">
                        {Array.isArray(experience.description) ? (
                          experience.description.map((desc, index) => (
                            <li
                              key={index}
                              className="flex items-start gap-2 text-sm text-gray-600"
                            >
                              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                              <span>{desc}</span>
                            </li>
                          ))
                        ) : (
                          <li className="flex items-start gap-2 text-sm text-gray-600">
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                            <span>{experience.description}</span>
                          </li>
                        )}
                      </ul>
                    </div>
                  )}

                {/* Skills */}
                {experience.Skills && experience.Skills.length > 0 && (
                  <div className="border-t border-gray-100 pt-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <Tag className="h-4 w-4" />
                      Teknologi & Skills:
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {experience.Skills.map((skill) => (
                        <div
                          key={skill.id}
                          className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                          {skill.icon && (
                            <i className={`${skill.icon} text-2xl`}></i>
                          )}
                          <span className="font-medium">{skill.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          <Code className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium mb-2">
            Belum ada pengalaman kerja yang ditambahkan
          </p>
          <p className="text-sm">
            Mulai tambahkan pengalaman kerja pertama kamu menggunakan tombol
            tambah di atas!
          </p>
        </div>
      )}
    </div>
  );
}
