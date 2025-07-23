import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { WorkExperience, WorkExperienceFormValues, workExperienceSchema } from "@/domain/workexperience-schema";
import { useSkillsManager } from "@/hooks/useSkill";
import { zodResolver } from "@hookform/resolvers/zod";
import { DropdownMenuContent } from "@radix-ui/react-dropdown-menu";
import { Edit, Loader2, MoreHorizontal, Trash2, Save, Plus, X, Calendar } from "lucide-react";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import ReactSelect from "react-select";
import ClientOnly from "@/components/ClientOnly";

interface WorkExperienceEditDropdownProps {
    workExperience: WorkExperience;
    onUpdate: (workExperienceId: string, data: WorkExperienceFormValues) => Promise<void>;
    onDelete: (workExperienceId: string, workExperienceName: string) => Promise<void>;
    isUpdating?: boolean;
    isDeleting?: boolean;
    disabled?: boolean;
}

export function WorkExperienceEditDropdown({
    workExperience,
    onUpdate,
    onDelete,
    isUpdating = false,
    isDeleting = false,
    disabled = false
}: WorkExperienceEditDropdownProps) {
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isCurrentJob, setIsCurrentJob] = useState(false);
    const [descriptionFields, setDescriptionFields] = useState<string[]>([""]);

    const { skills, isLoading: isLoadingSkills, fetchSkills } = useSkillsManager();

    const editForm = useForm<WorkExperienceFormValues>({
        resolver: zodResolver(workExperienceSchema),
        defaultValues: {
            position: workExperience.position,
            employmenttype: workExperience.employmenttype,
            company: workExperience.company,
            location: workExperience.location,
            locationtype: workExperience.locationtype,
            description: workExperience.description || [""],
            startDate: workExperience.startDate,
            endDate: workExperience.endDate || null,
            skillId: workExperience.Skills?.map(skill => skill.id) || [], 
        },
    });

    // Fetch skills when edit dialog opens
    useEffect(() => {
        if (isEditDialogOpen) {
            fetchSkills();
        }
    }, [isEditDialogOpen, fetchSkills]);

    // Update form values when descriptionFields changes
    useEffect(() => {
        editForm.setValue("description", descriptionFields);
    }, [descriptionFields, editForm]);

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

    const formatDateForInput = (date: Date | string | null | undefined): string => {
        if (!date) return '';

        try {
            let d: Date;
            if (typeof date === 'string') {
                // Handle string date dengan berbagai format
                d = new Date(date);
            } else {
                d = date;
            }

            // Validasi tanggal
            if (isNaN(d.getTime())) {
                console.warn('Invalid date provided:', date);
                return '';
            }

            // Format ke YYYY-MM-DD
            return d.toISOString().split('T')[0];
        } catch (error) {
            console.error('Error formatting date:', error);
            return '';
        }
    };

    const handleEdit = () => {
        // Set form values dengan konversi yang benar
        editForm.setValue("position", workExperience.position);
        editForm.setValue("employmenttype", workExperience.employmenttype);
        editForm.setValue("company", workExperience.company);
        editForm.setValue("location", workExperience.location);
        editForm.setValue("locationtype", workExperience.locationtype);

        const skillIds = workExperience.Skills?.map(skill => skill.id) || [];
        editForm.setValue("skillId", skillIds);

        // Konversi tanggal dengan benar
        const startDate = workExperience.startDate
            ? new Date(workExperience.startDate)
            : new Date();
        editForm.setValue("startDate", startDate);

        const endDate = workExperience.endDate
            ? new Date(workExperience.endDate)
            : null;
        editForm.setValue("endDate", endDate);

        editForm.setValue("skillId", workExperience.Skills?.map(skill => skill.id) || []);

        // Set description fields
        const descriptions = Array.isArray(workExperience.description)
            ? workExperience.description
            : workExperience.description
                ? [workExperience.description]
                : [""];
        setDescriptionFields(descriptions.length > 0 ? descriptions : [""]);
        editForm.setValue("description", descriptions.length > 0 ? descriptions : [""]);

        // Set current job status
        setIsCurrentJob(!workExperience.endDate);

        setIsEditDialogOpen(true);
    };

    const handleUpdate = async (data: WorkExperienceFormValues) => {
        try {
            const filteredData = {
                ...data,
                description: data.description.filter(desc => desc.trim() !== "")
            };

            await onUpdate(workExperience.id, filteredData);
            setIsEditDialogOpen(false);
            editForm.reset();
            toast.success("Pengalaman kerja berhasil diupdate!");
        } catch (error) {
            console.error("Error updating work experience:", error);
            toast.error("Gagal mengupdate pengalaman kerja. Silakan coba lagi.");
        }
    };

    const handleDelete = async () => {
        try {
            await onDelete(workExperience.id, workExperience.position);
            setIsDeleteDialogOpen(false);
            toast.success(`Pengalaman kerja "${workExperience.position}" berhasil dihapus!`);
        } catch (error) {
            console.error("Error deleting work experience:", error);
            toast.error("Gagal menghapus pengalaman kerja. Silakan coba lagi.");
        }
    };

    const handleEditDialogChange = (open: boolean) => {
        setIsEditDialogOpen(open);
        if (!open) {
            // Reset form when closing
            editForm.reset();
            setDescriptionFields([""]);
            setIsCurrentJob(false);
        }
    };

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-100"
                        disabled={disabled}
                    >
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">More options</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                    className="w-48 z-50 bg-white border border-gray-200 rounded-md shadow-lg p-1"
                    align="end"
                    sideOffset={4}
                >
                    <DropdownMenuItem
                        onClick={handleEdit}
                        className="flex items-center gap-2 px-3 py-2 text-sm rounded-sm hover:bg-gray-100 cursor-pointer"
                    >
                        <Edit className="h-4 w-4 text-muted-foreground" />
                        <span>Edit</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="my-1 h-px bg-gray-200" />
                    <DropdownMenuItem
                        onClick={() => setIsDeleteDialogOpen(true)}
                        className="flex items-center gap-2 px-3 py-2 text-sm rounded-sm hover:bg-red-50 text-red-600 hover:text-red-700 cursor-pointer"
                    >
                        <Trash2 className="h-4 w-4" />
                        <span>Delete</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Edit Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={handleEditDialogChange}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Edit className="h-5 w-5" />
                            Edit Pengalaman Kerja
                        </DialogTitle>
                        <DialogDescription>
                            Update informasi pengalaman kerja yang sudah ada
                        </DialogDescription>
                    </DialogHeader>

                    <div className="mt-4">
                        <Form {...editForm}>
                            <form
                                onSubmit={editForm.handleSubmit(handleUpdate, (errors) => {
                                    console.log("Form validation errors:", errors);
                                    toast.error("Form tidak valid. Cek input kamu.");
                                })}
                                className="space-y-6"
                            >
                                <div className="grid grid-cols-1 lg:grid-cols-6 gap-4 items-end">
                                    <div className="lg:col-span-full">
                                        <FormField
                                            control={editForm.control}
                                            name="position"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="uppercase text-sm font-semibold text-gray-700">Position</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="text"
                                                            placeholder="Ex: Software Engineer"
                                                            {...field}
                                                            disabled={isUpdating}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="lg:col-span-3">
                                        <FormField
                                            control={editForm.control}
                                            name="employmenttype"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="uppercase text-sm font-semibold text-gray-700">
                                                        Employment Type
                                                    </FormLabel>
                                                    <Select onValueChange={field.onChange} value={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select Employment Type" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="Full-time">Full-time</SelectItem>
                                                            <SelectItem value="Part-time">Part-time</SelectItem>
                                                            <SelectItem value="Self-employed">Self-employed</SelectItem>
                                                            <SelectItem value="Freelance">Freelance</SelectItem>
                                                            <SelectItem value="Internship">Internship</SelectItem>
                                                            <SelectItem value="Apprenticeship">Apprenticeship</SelectItem>
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
                                            control={editForm.control}
                                            name="locationtype"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="uppercase text-sm font-semibold text-gray-700">
                                                        Location Type
                                                    </FormLabel>
                                                    <Select onValueChange={field.onChange} value={field.value}>
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
                                            control={editForm.control}
                                            name="company"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="uppercase text-sm font-semibold text-gray-700">Company</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="text"
                                                            placeholder="Ex: PT. Semangat Coding"
                                                            {...field}
                                                            disabled={isUpdating}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="lg:col-span-3">
                                        <FormField
                                            control={editForm.control}
                                            name="location"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="uppercase text-sm font-semibold text-gray-700">Location</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="text"
                                                            placeholder="Ex: Jakarta, Indonesia"
                                                            {...field}
                                                            disabled={isUpdating}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="lg:col-span-3">
                                        <FormField
                                            control={editForm.control}
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
                                                            value={formatDateForInput(field.value)}
                                                            onChange={(e) => {
                                                                if (e.target.value) {
                                                                    // Buat Date object dengan timezone yang konsisten
                                                                    const date = new Date(e.target.value + 'T00:00:00.000Z');
                                                                    field.onChange(date);
                                                                } else {
                                                                    field.onChange(null);
                                                                }
                                                            }}
                                                            disabled={isUpdating}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="lg:col-span-3">
                                        <FormField
                                            control={editForm.control}
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
                                                            value={field.value ? formatDateForInput(field.value) : ''}
                                                            onChange={(e) => {
                                                                const date = e.target.value ? new Date(e.target.value) : null;
                                                                field.onChange(date);
                                                            }}
                                                            disabled={isUpdating || isCurrentJob}
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
                                                id="current-job-edit"
                                                checked={isCurrentJob}
                                                onChange={(e) => {
                                                    setIsCurrentJob(e.target.checked);
                                                    if (e.target.checked) {
                                                        editForm.setValue("endDate", null);
                                                    } else {
                                                        editForm.setValue("endDate", new Date());
                                                    }
                                                }}
                                                disabled={isUpdating}
                                            />
                                            <label htmlFor="current-job-edit" className="text-sm text-gray-700">
                                                I currently work here
                                            </label>
                                        </div>
                                    </div>

                                    <div className="lg:col-span-full">
                                        <FormField
                                            control={editForm.control}
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
                                                                options={skills.map(skill => ({
                                                                    label: skill.name,
                                                                    value: skill.id,
                                                                    icon: skill.icon,
                                                                }))}
                                                                value={skills
                                                                    .filter(skill => field.value?.includes(skill.id))
                                                                    .map(skill => ({
                                                                        label: skill.name,
                                                                        value: skill.id,
                                                                        icon: skill.icon,
                                                                    }))}
                                                                onChange={(selectedOptions) => {
                                                                    field.onChange(selectedOptions.map(option => option.value));
                                                                }}
                                                                formatOptionLabel={(option: { label: string; value: string; icon: string }) => (
                                                                    <span className="flex items-center gap-2">
                                                                        <i className={`${option.icon} text-2xl`} />
                                                                        {option.label}
                                                                    </span>
                                                                )}
                                                                isDisabled={isUpdating || isLoadingSkills}
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
                                                        control={editForm.control}
                                                        name={`description.${index}` as const}
                                                        render={() => (
                                                            <FormItem>
                                                                <FormControl>
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="flex-1">
                                                                            <Input
                                                                                placeholder={`Poin ${index + 1} - Deskripsikan tanggung jawab atau pencapaian`}
                                                                                value={descriptionFields[index]}
                                                                                onChange={(e) => updateDescriptionField(index, e.target.value)}
                                                                                disabled={isUpdating}
                                                                            />
                                                                        </div>
                                                                        {descriptionFields.length > 1 && (
                                                                            <Button
                                                                                type="button"
                                                                                onClick={() => removeDescriptionField(index)}
                                                                                variant="outline"
                                                                                size="icon"
                                                                                className="shrink-0"
                                                                                disabled={isUpdating}
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
                                                disabled={isUpdating}
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
                                            onClick={() => setIsEditDialogOpen(false)}
                                            className="flex-1"
                                            disabled={isUpdating}
                                        >
                                            Batal
                                        </Button>
                                        <Button
                                            type="submit"
                                            className="flex-1"
                                            disabled={isUpdating}
                                        >
                                            {isUpdating ? (
                                                <>
                                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                    Mengupdate...
                                                </>
                                            ) : (
                                                <>
                                                    <Save className="h-4 w-4 mr-2" />
                                                    Update Pengalaman Kerja
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

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Delete Work Experience</DialogTitle>
                        <DialogDescription>
                            Apakah Anda yakin ingin menghapus pengalaman kerja ini? Tindakan ini tidak dapat dibatalkan.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 p-3 bg-destructive/10 rounded-lg border border-destructive/20">
                            <span className="font-medium">{workExperience.position}</span>
                            <span className="font-medium">{workExperience.company}</span>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                onClick={() => setIsDeleteDialogOpen(false)}
                                disabled={isDeleting}
                                className="flex-1"
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className="flex-1"
                            >
                                {isDeleting ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Deleting...
                                    </>
                                ) : (
                                    <>
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Delete
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}