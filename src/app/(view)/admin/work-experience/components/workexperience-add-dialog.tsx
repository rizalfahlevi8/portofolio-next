"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  WorkExperienceFormValues,
  workExperienceSchema,
} from "@/schema/workexperience-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Save, Plus, X, Calendar } from "lucide-react";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import ReactSelect from "react-select";
import ClientOnly from "@/components/ClientOnly";
import { useSkillStore } from "@/store/skill-store";
import { useWorkExperienceStore } from "@/store/workexperience-store";

interface AddWorkExperienceDialogProps {
  onWorkExperienceAdded?: () => void;
}

export default function AddWorkExperienceDialog({
  onWorkExperienceAdded,
}: AddWorkExperienceDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCurrentJob, setIsCurrentJob] = useState(false);
  const [descriptionFields, setDescriptionFields] = useState<string[]>([""]);

  const skills = useSkillStore((state) => state.skills);
  const isLoadingSkills = useSkillStore((state) => state.isLoading);
  const fetchSkills = useSkillStore((state) => state.fetchSkills);
  // ❌ DIHAPUS: const addWorkExperience = useWorkExperienceStore((state) => state.addWorkExperience);

  const form = useForm<WorkExperienceFormValues>({
    resolver: zodResolver(workExperienceSchema),
    defaultValues: {
      position: "",
      employmenttype: "",
      company: "",
      location: "",
      locationtype: "",
      description: [""],
      startDate: new Date(),
      endDate: new Date(),
      skillId: [],
    },
  });

  // Fetch skills on component mount
  useEffect(() => {
    if (isOpen) {
      fetchSkills();
    }
  }, [isOpen, fetchSkills]);

  // Update form values when descriptionFields changes
  useEffect(() => {
    form.setValue("description", descriptionFields);
  }, [descriptionFields, form]);

  const addDescriptionField = () => {
    setDescriptionFields([...descriptionFields, ""]);
  };

  const removeDescriptionField = (index: number) => {
    if (descriptionFields.length > 1) {
      const newFields = descriptionFields.filter((_, i) => i !== index);
      setDescriptionFields(newFields);
    }
  };

  const updateDescriptionField = (index: number, value: string) => {
    const newFields = [...descriptionFields];
    newFields[index] = value;
    setDescriptionFields(newFields);
  };

  const formatDateForInput = (date: Date) => {
    return date.toISOString().split("T")[0];
  };

  const resetForm = () => {
    form.reset();
    setDescriptionFields([""]);
  };

  const onSubmit = async (data: WorkExperienceFormValues) => {
    try {
      setIsSubmitting(true);

      const filteredData = {
        ...data,
        description: data.description.filter((desc) => desc.trim() !== ""),
      };

      // ✅ DIUBAH: Menggunakan addWorkExperience dari store secara langsung
      await useWorkExperienceStore.getState().addWorkExperience(filteredData);

      resetForm();
      setIsOpen(false);
      toast.success("Pengalaman kerja berhasil ditambahkan!");

      // Call callback to refresh the list
      if (onWorkExperienceAdded) {
        onWorkExperienceAdded();
      }
    } catch (error) {
      console.error("Error adding work experience:", error);
      toast.error("Gagal menambahkan pengalaman kerja. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      resetForm();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="h-10 w-full justify-between px-4">
          <span className="flex items-center">
            <Plus className="h-4 w-4 mr-2" />
            Tambah
          </span>
          <span />
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Save className="h-5 w-5" />
            Tambah Pengalaman Kerja
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit, (errors) => {
                console.log("Form validation errors:", errors);
                toast.error("Form tidak valid. Cek input kamu.");
              })}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 lg:grid-cols-6 gap-4 items-end">
                <div className="lg:col-span-full">
                  <FormField
                    control={form.control}
                    name="position"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="uppercase text-sm font-semibold text-gray-700">
                          Position
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            placeholder="Ex: Software Engineer"
                            {...field}
                            disabled={isSubmitting}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="lg:col-span-3">
                  <FormField
                    control={form.control}
                    name="employmenttype"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="uppercase text-sm font-semibold text-gray-700">
                          Employment Type
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Employment Type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Full-time">Full-time</SelectItem>
                            <SelectItem value="Part-time">Part-time</SelectItem>
                            <SelectItem value="Self-employed">
                              Self-employed
                            </SelectItem>
                            <SelectItem value="Freelance">Freelance</SelectItem>
                            <SelectItem value="Internship">
                              Internship
                            </SelectItem>
                            <SelectItem value="Apprenticeship">
                              Apprenticeship
                            </SelectItem>
                            <SelectItem value="Seasonal">Seasonal</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="lg:col-span-3">
                  <FormField
                    control={form.control}
                    name="locationtype"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="uppercase text-sm font-semibold text-gray-700">
                          Location Type
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Location Type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="On-site">On-site</SelectItem>
                            <SelectItem value="Hybrid">Hybrid</SelectItem>
                            <SelectItem value="Remote">Remote</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="lg:col-span-3">
                  <FormField
                    control={form.control}
                    name="company"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="uppercase text-sm font-semibold text-gray-700">
                          Company
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            placeholder="Ex: PT. Semangat Coding"
                            {...field}
                            disabled={isSubmitting}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="lg:col-span-3">
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="uppercase text-sm font-semibold text-gray-700">
                          Location
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            placeholder="Ex: Jakarta, Indonesia"
                            {...field}
                            disabled={isSubmitting}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="lg:col-span-3">
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="uppercase text-sm font-semibold text-gray-700 flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Start Date
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            {...field}
                            value={
                              field.value ? formatDateForInput(field.value) : ""
                            }
                            onChange={(e) => {
                              const date = e.target.value
                                ? new Date(e.target.value)
                                : new Date();
                              field.onChange(date);
                            }}
                            disabled={isSubmitting}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="lg:col-span-3">
                  <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="uppercase text-sm font-semibold text-gray-700 flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          End Date
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            {...field}
                            value={
                              field.value ? formatDateForInput(field.value) : ""
                            }
                            onChange={(e) => {
                              const date = e.target.value
                                ? new Date(e.target.value)
                                : new Date();
                              field.onChange(date);
                            }}
                            disabled={isSubmitting}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="lg:col-span-full">
                  <div className="flex items-center gap-2 mt-2">
                    <input
                      type="checkbox"
                      id="current-job"
                      checked={isCurrentJob}
                      onChange={(e) => {
                        setIsCurrentJob(e.target.checked);
                        if (e.target.checked) {
                          form.setValue("endDate", null);
                        } else {
                          form.setValue("endDate", new Date());
                        }
                      }}
                      disabled={isSubmitting}
                    />
                    <label
                      htmlFor="current-job"
                      className="text-sm text-gray-700"
                    >
                      I currently work here
                    </label>
                  </div>
                </div>

                <div className="lg:col-span-full">
                  <FormField
                    control={form.control}
                    name="skillId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="uppercase text-sm font-semibold text-gray-700">
                          Related Skills
                        </FormLabel>
                        <FormControl>
                          <ClientOnly>
                            <ReactSelect<
                              { label: string; value: string; icon: string },
                              true
                            >
                              isMulti
                              options={skills.map((skill) => ({
                                label: skill.name,
                                value: skill.id,
                                icon: skill.icon,
                              }))}
                              value={skills
                                .filter((skill) =>
                                  field.value?.includes(skill.id)
                                )
                                .map((skill) => ({
                                  label: skill.name,
                                  value: skill.id,
                                  icon: skill.icon,
                                }))}
                              onChange={(selectedOptions) => {
                                field.onChange(
                                  selectedOptions.map((option) => option.value)
                                );
                              }}
                              formatOptionLabel={(option: {
                                label: string;
                                value: string;
                                icon: string;
                              }) => (
                                <span className="flex items-center gap-2">
                                  <i className={`${option.icon} text-2xl`} />
                                  {option.label}
                                </span>
                              )}
                              isDisabled={isSubmitting || isLoadingSkills}
                            />
                          </ClientOnly>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="lg:col-span-full">
                  <FormLabel className="uppercase text-sm font-semibold text-gray-700 mb-3 block">
                    Description
                  </FormLabel>
                  <div className="space-y-3">
                    {descriptionFields.map((_, index) => (
                      <div key={index}>
                        <FormField
                          control={form.control}
                          name={`description.${index}` as const}
                          render={() => (
                            <FormItem>
                              <FormControl>
                                <div className="flex items-center gap-2">
                                  <div className="flex-1">
                                    <Input
                                      placeholder={`Poin ${
                                        index + 1
                                      } - Deskripsikan tanggung jawab atau pencapaian`}
                                      value={descriptionFields[index]}
                                      onChange={(e) =>
                                        updateDescriptionField(
                                          index,
                                          e.target.value
                                        )
                                      }
                                      disabled={isSubmitting}
                                    />
                                  </div>
                                  {descriptionFields.length > 1 && (
                                    <Button
                                      type="button"
                                      onClick={() =>
                                        removeDescriptionField(index)
                                      }
                                      variant="outline"
                                      size="icon"
                                      className="shrink-0"
                                      disabled={isSubmitting}
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  )}
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    ))}

                    <Button
                      type="button"
                      onClick={addDescriptionField}
                      variant="secondary"
                      className="mt-2"
                      disabled={isSubmitting}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Tambah Poin
                    </Button>
                  </div>
                </div>

                <div className="lg:col-span-full flex gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsOpen(false)}
                    className="flex-1"
                    disabled={isSubmitting}
                  >
                    Batal
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Menyimpan...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Simpan Pengalaman Kerja
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}