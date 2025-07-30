import ClientOnly from "@/components/ClientOnly";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { About, AboutFormValues, aboutSchema } from "@/domain/admin/about-schema";
import { useSkillsManager } from "@/hooks/admin/useSkill";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save, SquarePen, Upload, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import ReactSelect from "react-select";
import toast from "react-hot-toast";
import NextImage from "next/image";
import { useSosmedManager } from "@/hooks/admin/useSosmed";
import { extractUsernameFromUrl } from "@/lib/utils";
import { useProjectManager } from "@/hooks/admin/useProject";

interface EditAboutDialogProps {
    about: About;
    onUpdate: (projectId: string, updateData: {
        data: AboutFormValues;
        profileFile?: File | null;
        profileDeleted?: boolean;
        oldThumbnail?: string;
    }) => Promise<void>;
    isUpdating?: boolean;
}

export function EditAboutDialog({ about, onUpdate, isUpdating = false }: EditAboutDialogProps) {

    const [isOpen, setIsOpen] = useState(false);

    const { skills, isLoading: isLoadingSkills, fetchSkills } = useSkillsManager();
    const { sosmed, isLoading: isLoadingSosmed, fetchSosmed } = useSosmedManager();
    const { project, isLoading: isLoadingProjects, fetchProjects } = useProjectManager();

    const [profileFile, setProfileFile] = useState<File | null>(null);
    const [profileDeleted, setProfileDeleted] = useState<boolean>(false);
    const [profilePreview, setProfilePreview] = useState<string>("");

    const [isUploadingProfile, setIsUploadingProfile] = useState(false);

    const profileInputRef = useRef<HTMLInputElement>(null);

    const editForm = useForm<AboutFormValues>({
        resolver: zodResolver(aboutSchema),
        defaultValues: {
            name: about.name,
            jobTitle: about.jobTitle,
            introduction: about.introduction,
            profilePicture: about.profilePicture,
            skillId: about.Skills.map((skill) => skill.id),
            sosmed: about.sosmed?.map((sosmed) => sosmed.id),
            workExperiences: about.workExperiences?.map((work) => work.id),
            projects: about.projects?.map((project) => project.id),
        },
    });

    const handleOpenChange = (open: boolean) => {
        setIsOpen(open);
    };

    useEffect(() => {
        if (isOpen) {
            fetchSkills();
            fetchSosmed();
            fetchProjects();
        }
    }, [isOpen, fetchSkills, fetchSosmed, fetchProjects]);

    // Handle profile file change
    const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setProfileFile(file);
            const previewUrl = URL.createObjectURL(file);
            setProfilePreview(previewUrl);
            setProfileDeleted(false);
        }
    };

    // Remove profile (new file)
    const removeProfile = () => {
        if (profilePreview) {
            URL.revokeObjectURL(profilePreview);
        }
        setProfileFile(null);
        setProfilePreview("");
        if (profileInputRef.current) {
            profileInputRef.current.value = "";
        }
    };

    // Remove existing profile
    const removeExistingProfile = () => {
        setProfileDeleted(true);
    };

    // Restore existing profile
    const restoreExistingProfile = () => {
        setProfileDeleted(false);
    };

    const handleUpdate = async (data: AboutFormValues) => {
        try {
            setIsUploadingProfile(true);
            await onUpdate(about.id, {
                data,
                profileFile,
                profileDeleted,
                oldThumbnail: about.profilePicture || ""
            });

            setIsOpen(false);
            setIsUploadingProfile(false);
        } catch (error) {
            console.error("Error in handleUpdate:", error);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button className="h-10 w-full justify-between px-4">
                    <span className="flex items-center">
                        <SquarePen className="h-4 w-4 mr-2" />
                        Update
                    </span>
                    <span />
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <SquarePen className="h-5 w-5" />
                        Edit Data Diri
                    </DialogTitle>
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
                                {/* Photo Profile Edit Section */}
                                <div className="lg:col-span-full">
                                    <FormLabel className="uppercase text-sm font-semibold text-gray-700">
                                        Photo Profile*
                                    </FormLabel>
                                    <div className="mt-2 space-y-4">
                                        {/* Current Photo Profile */}
                                        {about.profilePicture && !profileFile && !profileDeleted && (
                                            <div>
                                                <p className="text-sm text-gray-600 mb-2">Current photo profile:</p>
                                                <div className="relative inline-block">
                                                    <NextImage
                                                        src={about.profilePicture}
                                                        alt="Current photo profile"
                                                        width={128}
                                                        height={128}
                                                        className="w-32 h-32 object-cover rounded-lg border"
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="destructive"
                                                        size="icon"
                                                        className="absolute -top-2 -right-2 h-6 w-6"
                                                        onClick={removeExistingProfile}
                                                        disabled={isUpdating}
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            </div>
                                        )}

                                        {/* Deleted thumbnail message */}
                                        {profileDeleted && !profileFile && (
                                            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm text-red-800">
                                                        Photo profile akan dihapus
                                                    </span>
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={restoreExistingProfile}
                                                        disabled={isUpdating}
                                                    >
                                                        Restore
                                                    </Button>
                                                </div>
                                            </div>
                                        )}

                                        {/* New Photo Profile Preview */}
                                        {profilePreview && (
                                            <div>
                                                <p className="text-sm text-gray-600 mb-2">New photo profile:</p>
                                                <div className="relative inline-block">
                                                    <NextImage
                                                        src={profilePreview}
                                                        alt="New photo profile preview"
                                                        width={128}
                                                        height={128}
                                                        className="w-32 h-32 object-cover rounded-lg border"
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="destructive"
                                                        size="icon"
                                                        className="absolute -top-2 -right-2 h-6 w-6"
                                                        onClick={removeProfile}
                                                        disabled={isUpdating}
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            </div>
                                        )}

                                        {/* Upload Button */}
                                        <div className="flex items-center gap-4">
                                            <input
                                                ref={profileInputRef}
                                                type="file"
                                                accept="image/*"
                                                onChange={handleProfileChange}
                                                className="hidden"
                                                disabled={isUpdating}
                                            />
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => profileInputRef.current?.click()}
                                                disabled={isUpdating || isUploadingProfile}
                                                className="flex items-center gap-2"
                                            >
                                                <Upload className="h-4 w-4" />
                                                {isUploadingProfile ? "Uploading..." :
                                                    about.profilePicture && !profileDeleted ? "Change Photo Profile" : "Upload Photo Profile"}
                                            </Button>
                                            {profileFile && (
                                                <span className="text-sm text-gray-600">
                                                    {profileFile.name}
                                                </span>
                                            )}
                                        </div>

                                        {/* No photo profile option */}
                                        {!about.profilePicture && !profileFile && (
                                            <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                                                <span className="text-sm text-gray-600">
                                                    No photo profile selected. This project will display without a photo profile.
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="lg:col-span-full">
                                    <FormField
                                        control={editForm.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="uppercase text-sm font-semibold text-gray-700">Title *</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="text"
                                                        placeholder="Ex: John Doe"
                                                        {...field}
                                                        disabled={isUpdating}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <div className="lg:col-span-full">
                                    <FormField
                                        control={editForm.control}
                                        name="jobTitle"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="uppercase text-sm font-semibold text-gray-700">Job Title *</FormLabel>
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
                                <div className="lg:col-span-full">
                                    <FormField
                                        control={editForm.control}
                                        name="introduction"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="uppercase text-sm font-semibold text-gray-700">Introduction *</FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        placeholder="Ex: Hello, I am John Doe, a software engineer with a passion for building web applications."
                                                        {...field}
                                                        disabled={isUpdating}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
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
                                    <FormField
                                        control={editForm.control}
                                        name="sosmed"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="uppercase text-sm font-semibold text-gray-700">
                                                    Related Social Media
                                                </FormLabel>
                                                <FormControl>
                                                    <ClientOnly>
                                                        <ReactSelect
                                                            isMulti={true}
                                                            options={sosmed.map(sosmed => {
                                                                const username = extractUsernameFromUrl(sosmed.url);
                                                                return {
                                                                    label: username,
                                                                    value: sosmed.id,
                                                                    icon: sosmed.name,
                                                                };
                                                            })}
                                                            value={sosmed
                                                                .filter(sosmed => field.value?.includes(sosmed.id))
                                                                .map(sosmed => {
                                                                    const username = extractUsernameFromUrl(sosmed.url);
                                                                    return {
                                                                        label: username,
                                                                        value: sosmed.id,
                                                                        icon: sosmed.name,
                                                                    };
                                                                })
                                                            }
                                                            onChange={selectedOptions => {
                                                                field.onChange(selectedOptions.map(option => option.value));
                                                            }}
                                                            formatOptionLabel={(option) => (
                                                                <span className="flex items-center gap-2">
                                                                    <i className={`fa-brands fa-${option.icon} text-2xl`} />
                                                                    {option.label}
                                                                </span>
                                                            )}
                                                            isDisabled={isUpdating || isLoadingSosmed}
                                                        />
                                                    </ClientOnly>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <div className="lg:col-span-full">
                                    <FormField
                                        control={editForm.control}
                                        name="projects"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="uppercase text-sm font-semibold text-gray-700">
                                                    Related Projects
                                                </FormLabel>
                                                <FormControl>
                                                    <ClientOnly>
                                                        <ReactSelect
                                                            isMulti={true}
                                                            options={project.map(project => {
                                                                return {
                                                                    label: project.title,
                                                                    value: project.id,
                                                                };
                                                            })}
                                                            value={project
                                                                .filter(project => field.value?.includes(project.id))
                                                                .map(project => {
                                                                    return {
                                                                        label: project.title,
                                                                        value: project.id,
                                                                    };
                                                                })
                                                            }
                                                            onChange={selectedOptions => {
                                                                field.onChange(selectedOptions.map(option => option.value));
                                                            }}
                                                            formatOptionLabel={(option) => (
                                                                <span className="flex items-center gap-2">
                                                                    {option.label}
                                                                </span>
                                                            )}
                                                            isDisabled={isUpdating || isLoadingProjects}
                                                        />
                                                    </ClientOnly>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <div className="lg:col-span-full flex gap-2 pt-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setIsOpen(false)}
                                        className="flex-1"
                                        disabled={isUpdating}
                                    >
                                        Batal
                                    </Button>
                                    <Button
                                        type="submit"
                                        className="flex-1"
                                        disabled={isUpdating || isUploadingProfile || profileDeleted}
                                    >
                                        {isUpdating || isUploadingProfile ? (
                                            <>
                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                {isUploadingProfile ? "Uploading Photo Profile..." : "Mengupdate..."}
                                            </>
                                        ) : (
                                            <>
                                                <Save className="h-4 w-4 mr-2" />
                                                Update Proyek
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
