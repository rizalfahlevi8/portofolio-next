"use client";

import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { SkillFormValues, skillSchema } from "@/domain/admin/skill-schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Code, ExternalLink, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import { useSkillsManager } from "@/hooks/admin/useSkill";
import { SkillEditDropdown } from "@/app/(view)/admin/skill/components/skill-edit-dropdown";

export default function Skill() {
  const {
    skills,
    isLoading: isLoadingSkills,
    addSkill,
    updateSkill,
    deleteSkill,
    fetchSkills,
  } = useSkillsManager();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const form = useForm<SkillFormValues>({
    resolver: zodResolver(skillSchema),
    defaultValues: {
      name: "",
      icon: "",
    },
  });

  useEffect(() => {
    fetchSkills();
  }, [fetchSkills]);

  const onSubmit = async (data: SkillFormValues) => {
    try {
      setIsSubmitting(true);
      await addSkill(data);
      form.reset();
      toast.success("Skill berhasil ditambahkan!");
    } catch (error) {
      console.error("Error adding skill:", error);
      toast.error("Gagal menambahkan skill. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateSkill = async (skillId: string, data: SkillFormValues) => {
    setUpdatingId(skillId);
    try {
      await updateSkill(skillId, data);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteSkill = async (skillId: string) => {
    setDeletingId(skillId);
    try {
      await deleteSkill(skillId);
    } finally {
      setDeletingId(null);
    }
  };

  const iconValue = form.watch("icon");

  // Tambahkan null checks untuk skills
  const validSkills = skills?.filter((skill) => skill && skill.id) || [];

  // Group skills into rows of 3
  const groupedSkills = [];
  for (let i = 0; i < validSkills.length; i += 3) {
    groupedSkills.push(validSkills.slice(i, i + 3));
  }

  // Helper function untuk check temporary ID
  const isTemporarySkill = (skillId: string | undefined | null): boolean => {
    return skillId ? skillId.startsWith("temp-") : false;
  };

  return (
    <div className="flex-1 space-y-6 p-8">
      <div className="flex items-center justify-between">
        <Heading
          title="Skills Management"
          description="Kelola data kemampuan dan teknologi yang kamu kuasai"
        />
        <Badge variant="secondary" className="flex items-center gap-2">
          <Code className="h-4 w-4" />
          Total: {validSkills.length} Skills
        </Badge>
      </div>

      <Separator />

      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Tambah Skill Baru
          </CardTitle>
          <CardDescription>
            Masukkan nama skill dan icon class dari{" "}
            <a
              href="https://devicon.dev/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 underline"
            >
              Devicon
              <ExternalLink className="h-3 w-3" />
            </a>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-6 gap-4 items-end">
                <div className="lg:col-span-2">
                  <FormField
                    control={form.control}
                    name="icon"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Icon Class</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type="text"
                              placeholder="devicon-react-original"
                              {...field}
                              className="pr-12"
                              disabled={isSubmitting}
                            />
                            {iconValue && (
                              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                <i className={`${iconValue} text-lg`}></i>
                              </div>
                            )}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="lg:col-span-3">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nama Skill</FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            placeholder="React.js"
                            {...field}
                            disabled={isSubmitting}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="lg:col-span-1">
                  <Button
                    type="submit"
                    className="w-full h-10"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        Tambah
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <div className="text-sm text-muted-foreground bg-muted/50 p-4 rounded-lg">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <p className="font-medium mb-2">💡 Tips Penggunaan:</p>
                    <ul className="space-y-1 text-xs">
                      <li>
                        • Format:{" "}
                        <code className="bg-background px-1 rounded">
                          devicon-[tech]-[variant]
                        </code>
                      </li>
                      <li>
                        • Contoh:{" "}
                        <code className="bg-background px-1 rounded">
                          devicon-javascript-original
                        </code>
                      </li>
                      <li>• Variant: original, plain, plain-wordmark</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-medium mb-2">🔗 Resources:</p>
                    <ul className="space-y-1 text-xs">
                      <li>
                        •{" "}
                        <a
                          href="https://devicon.dev/"
                          target="_blank"
                          className="text-blue-600 underline"
                        >
                          Devicon Gallery
                        </a>{" "}
                        - Lihat semua icon
                      </li>
                      <li>
                        •{" "}
                        <a
                          href="https://github.com/devicons/devicon"
                          target="_blank"
                          className="text-blue-600 underline"
                        >
                          GitHub Repo
                        </a>{" "}
                        - Dokumentasi lengkap
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {(form.watch("name") || form.watch("icon")) && (
                <div className="border rounded-lg p-4 bg-muted/30">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-medium">Preview Skill Card:</p>
                    <Badge variant="outline" className="text-xs">
                      Live Preview
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="flex items-center gap-3 p-3 bg-background rounded border">
                      {iconValue ? (
                        <i className={`${iconValue} text-2xl`}></i>
                      ) : (
                        <div className="w-8 h-8 bg-muted rounded flex items-center justify-center">
                          <Code className="h-4 w-4 text-muted-foreground" />
                        </div>
                      )}
                      <span className="font-medium text-sm">
                        {form.watch("name") || "Nama Skill"}
                      </span>
                    </div>

                    <div className="flex items-center">
                      <Badge
                        variant="secondary"
                        className="flex items-center gap-2"
                      >
                        {iconValue ? (
                          <i className={`${iconValue} text-sm`}></i>
                        ) : (
                          <Code className="h-3 w-3" />
                        )}
                        {form.watch("name") || "Nama Skill"}
                      </Badge>
                    </div>

                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-background rounded-lg border flex items-center justify-center">
                        {iconValue ? (
                          <i className={`${iconValue} text-3xl`}></i>
                        ) : (
                          <Code className="h-6 w-6 text-muted-foreground" />
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      {iconValue ? (
                        <i className={`${iconValue} text-lg`}></i>
                      ) : (
                        <Code className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span>{form.watch("name") || "Nama Skill"}</span>
                    </div>
                  </div>
                </div>
              )}
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Daftar Skills</CardTitle>
              <CardDescription>Skills yang sudah ditambahkan</CardDescription>
            </div>
            <Button variant="outline" size="sm">
              <Code className="h-4 w-4 mr-2" />
              Import Skills
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoadingSkills ? (
            <div className="text-center py-12">
              <Loader2 className="h-8 w-8 mx-auto mb-4 animate-spin text-muted-foreground" />
              <p className="text-muted-foreground">Loading skills...</p>
            </div>
          ) : validSkills.length > 0 ? (
            <div className="space-y-6">
              {groupedSkills.map((row, rowIndex) => (
                <div
                  key={rowIndex}
                  className="grid grid-cols-1 lg:grid-cols-3 gap-4"
                >
                  {row.map((skill) => {
                    // Additional null check untuk skill
                    if (!skill || !skill.id) return null;

                    const isTemp = isTemporarySkill(skill.id);

                    return (
                      <div
                        key={skill.id}
                        className={`p-4 bg-background rounded-lg border hover:border-primary/20 transition-colors group relative ${
                          isTemp ? "opacity-60" : ""
                        }`}
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div className="flex-shrink-0">
                            {skill.icon ? (
                              <i className={`${skill.icon} text-2xl`}></i>
                            ) : (
                              <div className="w-8 h-8 bg-muted rounded flex items-center justify-center">
                                <Code className="h-4 w-4 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                          <span className="font-medium text-sm flex-1">
                            {skill.name || "Unnamed Skill"}
                          </span>
                          {isTemp && (
                            <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                          )}
                        </div>

                        {!isTemp && (
                          <div className="absolute top-2 right-2">
                            <SkillEditDropdown
                              skill={skill}
                              onUpdate={handleUpdateSkill}
                              onDelete={handleDeleteSkill}
                              isUpdating={updatingId === skill.id}
                              isDeleting={deletingId === skill.id}
                              disabled={
                                updatingId !== null || deletingId !== null
                              }
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Code className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">
                Belum ada skills yang ditambahkan
              </p>
              <p className="text-sm">
                Mulai tambahkan skill pertama kamu menggunakan form di atas!
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
