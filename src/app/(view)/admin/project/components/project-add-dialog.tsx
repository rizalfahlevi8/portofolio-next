import ClientOnly from "@/components/ClientOnly";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ProjectFormValues, projectSchema } from "@/schema/project-schema";
import { useProjectStore } from "@/store/project-store";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Save, X, Upload, Image } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import NextImage from "next/image";
import ReactSelect from "react-select";
import toast from "react-hot-toast";
import { useSkillStore } from "@/store/skill-store";

interface AddProjectDialogProps {
    onProjectAdded?: () => void;
}

export default function AddProjectDialog({ onProjectAdded }: AddProjectDialogProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploadingThumbnail, setIsUploadingThumbnail] = useState(false);
    const [isUploadingPhotos, setIsUploadingPhotos] = useState(false);

    const [featureFields, setFeatureFields] = useState<string[]>([""]);
    const [technologyFields, setTechnologyFields] = useState<string[]>([""]);

    // File states
    const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
    const [photoFiles, setPhotoFiles] = useState<File[]>([]);
    const [thumbnailPreview, setThumbnailPreview] = useState<string>("");
    const [photosPreviews, setPhotosPreviews] = useState<string[]>([]);

    // Refs for file inputs
    const thumbnailInputRef = useRef<HTMLInputElement>(null);
    const photosInputRef = useRef<HTMLInputElement>(null);

    const skills = useSkillStore((state) => state.skills);
    const isLoadingSkills = useSkillStore((state) => state.isLoading);
    const fetchSkills = useSkillStore((state) => state.fetchSkills);
    // ❌ DIHAPUS: const addProject = useProjectStore((state) => state.addProject);

    const form = useForm<ProjectFormValues>({
        resolver: zodResolver(projectSchema),
        defaultValues: {
            title: "",
            description: "",
            feature: [],
            technology: [],
            githubUrl: "",
            liveUrl: "",
            thumbnail: "",
            photo: [],
            skillId: [],
        },
        mode: "onChange", // Enable real-time validation
    });

    // Fetch skills on component mount
    useEffect(() => {
        if (isOpen) {
            fetchSkills();
        }
    }, [isOpen, fetchSkills]);

    // Update form values when arrays change
    useEffect(() => {
        const filteredFeatures = featureFields.filter(feat => feat.trim() !== "");
        form.setValue("feature", filteredFeatures, { shouldValidate: true });
    }, [featureFields, form]);

    useEffect(() => {
        const filteredTechnologies = technologyFields.filter(tech => tech.trim() !== "");
        form.setValue("technology", filteredTechnologies, { shouldValidate: true });
    }, [technologyFields, form]);

    // Update thumbnail in form when file changes
    useEffect(() => {
        if (thumbnailFile) {
            form.setValue("thumbnail", "placeholder", { shouldValidate: true });
        } else {
            form.setValue("thumbnail", "", { shouldValidate: true });
        }
    }, [thumbnailFile, form]);

    // Update photos in form when files change
    useEffect(() => {
        if (photoFiles.length > 0) {
            const photoPlaceholders = photoFiles.map((_, index) => `placeholder-${index}`);
            form.setValue("photo", photoPlaceholders, { shouldValidate: true });
        } else {
            form.setValue("photo", [], { shouldValidate: true });
        }
    }, [photoFiles, form]);

    // Handle thumbnail file change
    const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setThumbnailFile(file);
            const previewUrl = URL.createObjectURL(file);
            setThumbnailPreview(previewUrl);
        }
    };

    // Handle photos file change
    const handlePhotosChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files) {
            const fileArray = Array.from(files);
            setPhotoFiles(prev => [...prev, ...fileArray]);

            // Create previews for new files
            fileArray.forEach(file => {
                const previewUrl = URL.createObjectURL(file);
                setPhotosPreviews(prev => [...prev, previewUrl]);
            });
        }
    };

    // Remove photo
    const removePhoto = (index: number) => {
        setPhotoFiles(prev => prev.filter((_, i) => i !== index));
        setPhotosPreviews(prev => {
            // Revoke URL to prevent memory leaks
            URL.revokeObjectURL(prev[index]);
            return prev.filter((_, i) => i !== index);
        });
    };

    // Remove thumbnail
    const removeThumbnail = () => {
        if (thumbnailPreview) {
            URL.revokeObjectURL(thumbnailPreview);
        }
        setThumbnailFile(null);
        setThumbnailPreview("");
        if (thumbnailInputRef.current) {
            thumbnailInputRef.current.value = "";
        }
    };

    const addFeatureField = () => {
        setFeatureFields([...featureFields, ""]);
    };

    const addTechnologyField = () => {
        setTechnologyFields([...technologyFields, ""]);
    };

    const removeFeatureField = (index: number) => {
        if (featureFields.length > 1) {
            const newFields = featureFields.filter((_, i) => i !== index);
            setFeatureFields(newFields);
        }
    };

    const removeTechnologyField = (index: number) => {
        if (technologyFields.length > 1) {
            const newFields = technologyFields.filter((_, i) => i !== index);
            setTechnologyFields(newFields);
        }
    };

    const updateFeatureField = (index: number, value: string) => {
        const newFields = [...featureFields];
        newFields[index] = value;
        setFeatureFields(newFields);
    };

    const updateTechnologyField = (index: number, value: string) => {
        const newFields = [...technologyFields];
        newFields[index] = value;
        setTechnologyFields(newFields);
    };

    const resetForm = () => {
        form.reset({
            title: "",
            description: "",
            feature: [],
            technology: [],
            githubUrl: "",
            liveUrl: "",
            thumbnail: "",
            photo: [],
            skillId: [],
        });
        setFeatureFields([""]);
        setTechnologyFields([""]);

        // Reset file states
        setThumbnailFile(null);
        setPhotoFiles([]);

        // Clean up preview URLs
        if (thumbnailPreview) {
            URL.revokeObjectURL(thumbnailPreview);
        }
        photosPreviews.forEach(url => URL.revokeObjectURL(url));

        setThumbnailPreview("");
        setPhotosPreviews([]);

        // Reset file inputs
        if (thumbnailInputRef.current) {
            thumbnailInputRef.current.value = "";
        }
        if (photosInputRef.current) {
            photosInputRef.current.value = "";
        }
    };

    const onSubmit = async (data: ProjectFormValues) => {
        try {
            setIsSubmitting(true);
            setIsUploadingThumbnail(!!thumbnailFile);
            setIsUploadingPhotos(photoFiles.length > 0);

            // Validasi file & field tetap sama
            if (!thumbnailFile) {
                toast.error("Thumbnail harus diupload!");
                setIsSubmitting(false);
                return;
            }
            if (photoFiles.length === 0) {
                toast.error("Minimal satu foto harus diupload!");
                setIsSubmitting(false);
                return;
            }
            const filteredFeatures = featureFields.filter(feat => feat.trim() !== "");
            const filteredTechnologies = technologyFields.filter(tech => tech.trim() !== "");

            if (filteredFeatures.length === 0) {
                toast.error("Minimal satu feature harus diisi!");
                setIsSubmitting(false);
                return;
            }
            if (filteredTechnologies.length === 0) {
                toast.error("Minimal satu technology harus diisi!");
                setIsSubmitting(false);
                return;
            }

            // Prepare data (tanpa upload manual, biarkan backend yang handle upload)
            const filteredData: ProjectFormValues = {
                ...data,
                feature: filteredFeatures,
                technology: filteredTechnologies,
                skillId: data.skillId ?? [],
            };

            // ✅ DIUBAH: Menggunakan addProject dari store secara langsung
            await useProjectStore.getState().addProject(filteredData, thumbnailFile, photoFiles);

            resetForm();
            setIsOpen(false);
            toast.success("Proyek berhasil ditambahkan!");

            if (onProjectAdded) {
                onProjectAdded();
            }
        } catch (error) {
            console.error("Error adding project:", error);
            toast.error("Gagal menambahkan proyek. Silakan coba lagi.");
        } finally {
            setIsUploadingThumbnail(false);
            setIsUploadingPhotos(false);
            setIsSubmitting(false);
        }
    };

    const handleOpenChange = (open: boolean) => {
        setIsOpen(open);
        if (!open) {
            resetForm();
        }
    };

    // Debug function to check form state
    const checkFormState = () => {
        console.log("Form errors:", form.formState.errors);
        console.log("Form values:", form.getValues());
        console.log("Feature fields:", featureFields);
        console.log("Technology fields:", technologyFields);
        console.log("Thumbnail file:", thumbnailFile);
        console.log("Photo files:", photoFiles);
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
                        Tambah Proyek
                    </DialogTitle>
                </DialogHeader>
                <div className="mt-4">
                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(onSubmit, (errors) => {
                                console.log("Form validation errors:", errors);
                                checkFormState(); // Debug form state
                                toast.error("Form tidak valid. Cek input kamu.");
                            })}
                            className="space-y-6"
                        >
                            <div className="grid grid-cols-1 lg:grid-cols-6 gap-4 items-end">
                                <div className="lg:col-span-full">
                                    <FormField
                                        control={form.control}
                                        name="title"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="uppercase text-sm font-semibold text-gray-700">Title *</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="text"
                                                        placeholder="Ex: System Monitoring Dashboard"
                                                        {...field}
                                                        disabled={isSubmitting}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="lg:col-span-full">
                                    <FormField
                                        control={form.control}
                                        name="description"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="uppercase text-sm font-semibold text-gray-700">Description *</FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        placeholder="Ex: This project aims to create a system monitoring dashboard..."
                                                        {...field}
                                                        disabled={isSubmitting}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                {/* Feature Fields */}
                                <div className="lg:col-span-full">
                                    <FormLabel className="uppercase text-sm font-semibold text-gray-700 mb-3 block">
                                        Feature *
                                    </FormLabel>
                                    <div className="space-y-3">
                                        {featureFields.map((_, index) => (
                                            <div key={index} className="flex items-center gap-2">
                                                <div className="flex-1">
                                                    <Input
                                                        placeholder={`Feature ${index + 1} - Deskripsikan fitur`}
                                                        value={featureFields[index]}
                                                        onChange={(e) => updateFeatureField(index, e.target.value)}
                                                        disabled={isSubmitting}
                                                    />
                                                </div>
                                                {featureFields.length > 1 && (
                                                    <Button
                                                        type="button"
                                                        onClick={() => removeFeatureField(index)}
                                                        variant="outline"
                                                        size="icon"
                                                        className="shrink-0"
                                                        disabled={isSubmitting}
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        ))}

                                        <Button
                                            type="button"
                                            onClick={addFeatureField}
                                            variant="secondary"
                                            className="mt-2"
                                            disabled={isSubmitting}
                                        >
                                            <Plus className="h-4 w-4 mr-2" />
                                            Tambah Feature
                                        </Button>
                                    </div>
                                    {form.formState.errors.feature && (
                                        <p className="text-sm font-medium text-destructive mt-2">
                                            {form.formState.errors.feature.message}
                                        </p>
                                    )}
                                </div>

                                {/* Technology Fields */}
                                <div className="lg:col-span-full">
                                    <FormLabel className="uppercase text-sm font-semibold text-gray-700 mb-3 block">
                                        Technology *
                                    </FormLabel>
                                    <div className="space-y-3">
                                        {technologyFields.map((_, index) => (
                                            <div key={index} className="flex items-center gap-2">
                                                <div className="flex-1">
                                                    <Input
                                                        placeholder={`Technology ${index + 1} - Deskripsikan teknologi`}
                                                        value={technologyFields[index]}
                                                        onChange={(e) => updateTechnologyField(index, e.target.value)}
                                                        disabled={isSubmitting}
                                                    />
                                                </div>
                                                {technologyFields.length > 1 && (
                                                    <Button
                                                        type="button"
                                                        onClick={() => removeTechnologyField(index)}
                                                        variant="outline"
                                                        size="icon"
                                                        className="shrink-0"
                                                        disabled={isSubmitting}
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        ))}

                                        <Button
                                            type="button"
                                            onClick={addTechnologyField}
                                            variant="secondary"
                                            className="mt-2"
                                            disabled={isSubmitting}
                                        >
                                            <Plus className="h-4 w-4 mr-2" />
                                            Tambah Technology
                                        </Button>
                                    </div>
                                    {form.formState.errors.technology && (
                                        <p className="text-sm font-medium text-destructive mt-2">
                                            {form.formState.errors.technology.message}
                                        </p>
                                    )}
                                </div>

                                {/* Thumbnail Upload */}
                                <div className="lg:col-span-full">
                                    <FormLabel className="uppercase text-sm font-semibold text-gray-700">
                                        Thumbnail *
                                    </FormLabel>
                                    <div className="mt-2">
                                        <div className="flex items-center gap-4">
                                            <input
                                                ref={thumbnailInputRef}
                                                type="file"
                                                accept="image/*"
                                                onChange={handleThumbnailChange}
                                                className="hidden"
                                                disabled={isSubmitting}
                                            />
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => thumbnailInputRef.current?.click()}
                                                disabled={isSubmitting || isUploadingThumbnail}
                                                className="flex items-center gap-2"
                                            >
                                                <Upload className="h-4 w-4" />
                                                {isUploadingThumbnail ? "Uploading..." : "Choose Thumbnail"}
                                            </Button>
                                            {thumbnailFile && (
                                                <span className="text-sm text-gray-600">
                                                    {thumbnailFile.name}
                                                </span>
                                            )}
                                        </div>

                                        {thumbnailPreview && (
                                            <div className="mt-4 relative inline-block">
                                                <NextImage
                                                    src={thumbnailPreview}
                                                    alt="Thumbnail preview"
                                                    width={128}
                                                    height={128}
                                                    className="w-32 h-32 object-cover rounded-lg border"
                                                />
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    size="icon"
                                                    className="absolute -top-2 -right-2 h-6 w-6"
                                                    onClick={removeThumbnail}
                                                    disabled={isSubmitting}
                                                >
                                                    <X className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        )}

                                        {!thumbnailFile && (
                                            <p className="text-sm font-medium text-destructive mt-2">
                                                Thumbnail is required
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Photos Upload */}
                                <div className="lg:col-span-full">
                                    <FormLabel className="uppercase text-sm font-semibold text-gray-700">
                                        Photos *
                                    </FormLabel>
                                    <div className="mt-2">
                                        <div className="flex items-center gap-4">
                                            <input
                                                ref={photosInputRef}
                                                type="file"
                                                accept="image/*"
                                                multiple
                                                onChange={handlePhotosChange}
                                                className="hidden"
                                                disabled={isSubmitting}
                                            />
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => photosInputRef.current?.click()}
                                                disabled={isSubmitting || isUploadingPhotos}
                                                className="flex items-center gap-2"
                                            >
                                                <Image className="h-4 w-4" />
                                                {isUploadingPhotos ? "Uploading..." : "Choose Photos"}
                                            </Button>
                                            {photoFiles.length > 0 && (
                                                <span className="text-sm text-gray-600">
                                                    {photoFiles.length} file(s) selected
                                                </span>
                                            )}
                                        </div>

                                        {photosPreviews.length > 0 && (
                                            <div className="mt-4 grid grid-cols-3 gap-4">
                                                {photosPreviews.map((preview, index) => (
                                                    <div key={index} className="relative">
                                                        <NextImage
                                                            src={preview}
                                                            alt={`Photo preview ${index + 1}`}
                                                            width={300}
                                                            height={96}
                                                            className="w-full h-24 object-cover rounded-lg border"
                                                        />

                                                        <Button
                                                            type="button"
                                                            variant="destructive"
                                                            size="icon"
                                                            className="absolute -top-2 -right-2 h-6 w-6"
                                                            onClick={() => removePhoto(index)}
                                                            disabled={isSubmitting}
                                                        >
                                                            <X className="h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        {photoFiles.length === 0 && (
                                            <p className="text-sm font-medium text-destructive mt-2">
                                                At least one photo is required
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Skills Selection */}
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
                                    <FormField
                                        control={form.control}
                                        name="githubUrl"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="uppercase text-sm font-semibold text-gray-700">GitHub URL</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="text"
                                                        placeholder="Ex: https://github.com/your-repo (optional)"
                                                        {...field}
                                                        disabled={isSubmitting}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="lg:col-span-full">
                                    <FormField
                                        control={form.control}
                                        name="liveUrl"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="uppercase text-sm font-semibold text-gray-700">Live URL</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="text"
                                                        placeholder="Ex: https://your-live-url.com (optional)"
                                                        {...field}
                                                        disabled={isSubmitting}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsOpen(false)}
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isSubmitting || isUploadingThumbnail || isUploadingPhotos}
                                    className="flex items-center gap-2"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="h-4 w-4" />
                                            Save Project
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </div>
            </DialogContent>
        </Dialog>
    );
}