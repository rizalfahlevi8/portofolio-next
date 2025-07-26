import ClientOnly from "@/components/ClientOnly";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Project, ProjectFormValues, projectSchema } from "@/domain/project-schema";
import { useSkillsManager } from "@/hooks/useSkill";
import { getSupabaseImageUrl, uploadToSupabase, uploadMultipleFiles, deleteFromSupabase } from "@/lib/supabase";
import { zodResolver } from "@hookform/resolvers/zod";
import { Edit, Loader2, MoreHorizontal, Plus, Save, Trash2, X, Upload, Image } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import NextImage from "next/image";
import ReactSelect from "react-select";
import toast from "react-hot-toast";

interface ProjectEditDropdownProps {
    project: Project;
    onUpdate: (projectId: string, data: ProjectFormValues) => Promise<void>;
    onDelete: (projectId: string) => Promise<void>;
    isUpdating?: boolean;
    isDeleting?: boolean;
    disabled?: boolean;
}

export function ProjectEditDropdown({
    project,
    onUpdate,
    onDelete,
    isUpdating = false,
    isDeleting = false,
    disabled = false
}: ProjectEditDropdownProps) {
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    const [featureFields, setFeatureFields] = useState<string[]>([""]);
    const [technologyFields, setTechnologyFields] = useState<string[]>([""]);

    // File states for editing
    const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
    const [photoFiles, setPhotoFiles] = useState<File[]>([]);
    const [thumbnailPreview, setThumbnailPreview] = useState<string>("");
    const [photosPreviews, setPhotosPreviews] = useState<string[]>([]);
    const [existingPhotos, setExistingPhotos] = useState<string[]>([]);
    const [deletedPhotos, setDeletedPhotos] = useState<string[]>([]);
    
    // States for thumbnail and photos management
    const [thumbnailDeleted, setThumbnailDeleted] = useState<boolean>(false);
    const [allPhotosDeleted, setAllPhotosDeleted] = useState<boolean>(false);
    
    // Upload states
    const [isUploadingThumbnail, setIsUploadingThumbnail] = useState(false);
    const [isUploadingPhotos, setIsUploadingPhotos] = useState(false);

    // Refs for file inputs
    const thumbnailInputRef = useRef<HTMLInputElement>(null);
    const photosInputRef = useRef<HTMLInputElement>(null);

    const { skills, isLoading: isLoadingSkills, fetchSkills } = useSkillsManager();

    const editForm = useForm<ProjectFormValues>({
        resolver: zodResolver(projectSchema),
        defaultValues: {
            title: project.title,
            description: project.description,
            feature: project.feature || '',
            technology: project.technology || '',
            githubUrl: project.githubUrl,
            liveUrl: project.liveUrl,
            thumbnail: project.thumbnail,
            photo: project.photo,
            skillId: project.Skills?.map(skill => skill.id) || [],
        },
    });

    // Fetch skills when edit dialog opens
    useEffect(() => {
        if (isEditDialogOpen) {
            fetchSkills();
        }
    }, [isEditDialogOpen, fetchSkills]);

    useEffect(() => {
        editForm.setValue("feature", featureFields);
    }, [featureFields, editForm]);

    useEffect(() => {
        editForm.setValue("technology", technologyFields);
    }, [technologyFields, editForm]);

    // Check if all photos will be deleted
    useEffect(() => {
        const hasExistingPhotos = existingPhotos.length > 0;
        const hasNewPhotos = photoFiles.length > 0;
        setAllPhotosDeleted(!hasExistingPhotos && !hasNewPhotos);
    }, [existingPhotos, photoFiles]);

    // Handle thumbnail file change
    const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setThumbnailFile(file);
            const previewUrl = URL.createObjectURL(file);
            setThumbnailPreview(previewUrl);
            setThumbnailDeleted(false);
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

    // Remove existing photo
    const removeExistingPhoto = (index: number) => {
        const photoToDelete = existingPhotos[index];
        setDeletedPhotos(prev => [...prev, photoToDelete]);
        setExistingPhotos(prev => prev.filter((_, i) => i !== index));
    };

    // Remove new photo
    const removeNewPhoto = (index: number) => {
        setPhotoFiles(prev => prev.filter((_, i) => i !== index));
        setPhotosPreviews(prev => {
            // Revoke URL to prevent memory leaks
            URL.revokeObjectURL(prev[index]);
            return prev.filter((_, i) => i !== index);
        });
    };

    // Remove all photos (existing + new) - Single button
    const removeAllPhotos = () => {
        // Add all existing photos to deleted list
        setDeletedPhotos(prev => [...prev, ...existingPhotos]);
        setExistingPhotos([]);
        
        // Remove all new photos and their previews
        photosPreviews.forEach(url => URL.revokeObjectURL(url));
        setPhotoFiles([]);
        setPhotosPreviews([]);
        
        // Reset file input
        if (photosInputRef.current) {
            photosInputRef.current.value = "";
        }
    };

    // Restore all deleted photos
    const restoreAllPhotos = () => {
        setExistingPhotos(prev => [...prev, ...deletedPhotos]);
        setDeletedPhotos([]);
    };

    // Remove thumbnail (new file)
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

    // Remove existing thumbnail
    const removeExistingThumbnail = () => {
        setThumbnailDeleted(true);
    };

    // Restore existing thumbnail
    const restoreExistingThumbnail = () => {
        setThumbnailDeleted(false);
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

    const handleUpdate = async (data: ProjectFormValues) => {
        try {
            // Validate photos - at least one photo is required
            if (allPhotosDeleted) {
                toast.error("Minimal satu foto harus ada!");
                return;
            }

            let thumbnailPath = "";

            // Handle thumbnail logic
            if (thumbnailFile) {
                // New thumbnail uploaded
                setIsUploadingThumbnail(true);
                // Delete old thumbnail if exists
                if (project.thumbnail) {
                    try {
                        await deleteFromSupabase(project.thumbnail, 'thumbnails');
                    } catch (error) {
                        console.warn('Failed to delete old thumbnail:', error);
                    }
                }
                const thumbnailResult = await uploadToSupabase(
                    thumbnailFile,
                    'thumbnails',
                    'projects'
                );
                thumbnailPath = thumbnailResult.fileName;
                setIsUploadingThumbnail(false);
            } else if (!thumbnailDeleted && project.thumbnail) {
                // Keep existing thumbnail
                thumbnailPath = project.thumbnail;
            } else if (thumbnailDeleted && project.thumbnail) {
                // Delete existing thumbnail
                try {
                    await deleteFromSupabase(project.thumbnail, 'thumbnails');
                } catch (error) {
                    console.warn('Failed to delete thumbnail:', error);
                }
                thumbnailPath = "";
            }

            // Handle photos
            let photoPaths = [...existingPhotos];

            // Upload new photos if any
            if (photoFiles.length > 0) {
                setIsUploadingPhotos(true);
                const photosResults = await uploadMultipleFiles(
                    photoFiles,
                    'photos',
                    'projects'
                );
                photoPaths = [...photoPaths, ...photosResults.map(result => result.fileName)];
                setIsUploadingPhotos(false);
            }

            // Delete removed photos from storage
            if (deletedPhotos.length > 0) {
                const deletePromises = deletedPhotos.map(async (photo) => {
                    try {
                        await deleteFromSupabase(photo, 'photos');
                    } catch (error) {
                        console.warn(`Failed to delete photo ${photo}:`, error);
                    }
                });
                await Promise.allSettled(deletePromises);
            }

            // Prepare data for API
            const filteredData = {
                ...data,
                feature: data.feature.filter(desc => desc.trim() !== ""),
                technology: data.technology.filter(desc => desc.trim() !== ""),
                thumbnail: thumbnailPath,
                photo: photoPaths
            };

            console.log('Updating project with data:', filteredData);

            // Update project via API
            await onUpdate(project.id, filteredData);
            
            // Close dialog and reset form
            setIsEditDialogOpen(false);
            toast.success("Proyek berhasil diupdate!");
            
        } catch (error) {
            console.error("Error updating project:", error);
            toast.error("Gagal mengupdate proyek. Silakan coba lagi.");
        } finally {
            setIsUploadingThumbnail(false);
            setIsUploadingPhotos(false);
        }
    };

    const handleEdit = () => {
        // Set form values dengan konversi yang benar
        editForm.setValue("title", project.title);
        editForm.setValue("description", project.description);
        editForm.setValue("githubUrl", project.githubUrl);
        editForm.setValue("liveUrl", project.liveUrl);

        const skillIds = project.Skills?.map(skill => skill.id) || [];
        editForm.setValue("skillId", skillIds);

        // Set feature fields
        const feature = Array.isArray(project.feature)
            ? project.feature
            : project.feature
                ? [project.feature]
                : [""];
        setFeatureFields(feature.length > 0 ? feature : [""]);
        editForm.setValue("feature", feature.length > 0 ? feature : [""]);

        // Set technology fields
        const technology = Array.isArray(project.technology)
            ? project.technology
            : project.technology
                ? [project.technology]
                : [""];

        setTechnologyFields(technology.length > 0 ? technology : [""]);
        editForm.setValue("technology", technology.length > 0 ? technology : [""]);

        // Set existing photos
        setExistingPhotos(project.photo || []);
        setDeletedPhotos([]);

        // Reset file states
        setThumbnailFile(null);
        setPhotoFiles([]);
        setThumbnailPreview("");
        setPhotosPreviews([]);

        // Reset thumbnail and photos states
        setThumbnailDeleted(false);
        setAllPhotosDeleted(false);

        setIsEditDialogOpen(true);
    };

    const handleDelete = async () => {
        try {
            await onDelete(project.id);
            setIsDeleteDialogOpen(false);
            toast.success(`Proyek "${project.title}" berhasil dihapus!`);
        } catch (error) {
            console.error("Error deleting project:", error);
            toast.error("Gagal menghapus proyek. Silakan coba lagi.");
        }
    };

    const handleEditDialogChange = (open: boolean) => {
        setIsEditDialogOpen(open);
        if (!open) {
            // Clean up preview URLs to prevent memory leaks
            if (thumbnailPreview) {
                URL.revokeObjectURL(thumbnailPreview);
            }
            photosPreviews.forEach(url => URL.revokeObjectURL(url));
            
            // Reset form when closing
            editForm.reset();
            setFeatureFields([""]);
            setTechnologyFields([""]);
            setThumbnailFile(null);
            setPhotoFiles([]);
            setThumbnailPreview("");
            setPhotosPreviews([]);
            setExistingPhotos([]);
            setDeletedPhotos([]);
            setThumbnailDeleted(false);
            setAllPhotosDeleted(false);
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
                            Edit Proyek
                        </DialogTitle>
                        <DialogDescription>
                            Update informasi proyek yang sudah ada
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
                                            name="title"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="uppercase text-sm font-semibold text-gray-700">Title *</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="text"
                                                            placeholder="Ex: System Monitoring Dashboard"
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
                                            name="description"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="uppercase text-sm font-semibold text-gray-700">Description *</FormLabel>
                                                    <FormControl>
                                                        <Textarea
                                                            placeholder="Ex: This project aims to create a system monitoring dashboard..."
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
                                                            disabled={isUpdating}
                                                        />
                                                    </div>
                                                    {featureFields.length > 1 && (
                                                        <Button
                                                            type="button"
                                                            onClick={() => removeFeatureField(index)}
                                                            variant="outline"
                                                            size="icon"
                                                            className="shrink-0"
                                                            disabled={isUpdating}
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
                                                disabled={isUpdating}
                                            >
                                                <Plus className="h-4 w-4 mr-2" />
                                                Tambah Feature
                                            </Button>
                                        </div>
                                        {editForm.formState.errors.feature && (
                                            <p className="text-sm font-medium text-destructive mt-2">
                                                {editForm.formState.errors.feature.message}
                                            </p>
                                        )}
                                    </div>

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
                                                            disabled={isUpdating}
                                                        />
                                                    </div>
                                                    {technologyFields.length > 1 && (
                                                        <Button
                                                            type="button"
                                                            onClick={() => removeTechnologyField(index)}
                                                            variant="outline"
                                                            size="icon"
                                                            className="shrink-0"
                                                            disabled={isUpdating}
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
                                                disabled={isUpdating}
                                            >
                                                <Plus className="h-4 w-4 mr-2" />
                                                Tambah Technology
                                            </Button>
                                        </div>
                                        {editForm.formState.errors.technology && (
                                            <p className="text-sm font-medium text-destructive mt-2">
                                                {editForm.formState.errors.technology.message}
                                            </p>
                                        )}
                                    </div>

                                    {/* Thumbnail Edit Section */}
                                    <div className="lg:col-span-full">
                                        <FormLabel className="uppercase text-sm font-semibold text-gray-700">
                                            Thumbnail (Optional)
                                        </FormLabel>
                                        <div className="mt-2 space-y-4">
                                            {/* Current Thumbnail */}
                                            {project.thumbnail && !thumbnailFile && !thumbnailDeleted && (
                                                <div>
                                                    <p className="text-sm text-gray-600 mb-2">Current thumbnail:</p>
                                                    <div className="relative inline-block">
                                                        <NextImage
                                                            src={getSupabaseImageUrl(project.thumbnail, 'thumbnails')}
                                                            alt="Current thumbnail"
                                                            width={128}
                                                            height={128}
                                                            className="w-32 h-32 object-cover rounded-lg border"
                                                        />
                                                        <Button
                                                            type="button"
                                                            variant="destructive"
                                                            size="icon"
                                                            className="absolute -top-2 -right-2 h-6 w-6"
                                                            onClick={removeExistingThumbnail}
                                                            disabled={isUpdating}
                                                        >
                                                            <X className="h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Deleted thumbnail message */}
                                            {thumbnailDeleted && !thumbnailFile && (
                                                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm text-yellow-800">
                                                            Thumbnail akan dihapus
                                                        </span>
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={restoreExistingThumbnail}
                                                            disabled={isUpdating}
                                                        >
                                                            Restore
                                                        </Button>
                                                    </div>
                                                </div>
                                            )}

                                            {/* New Thumbnail Preview */}
                                            {thumbnailPreview && (
                                                <div>
                                                    <p className="text-sm text-gray-600 mb-2">New thumbnail:</p>
                                                    <div className="relative inline-block">
                                                        <NextImage
                                                            src={thumbnailPreview}
                                                            alt="New thumbnail preview"
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
                                                    ref={thumbnailInputRef}
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleThumbnailChange}
                                                    className="hidden"
                                                    disabled={isUpdating}
                                                />
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() => thumbnailInputRef.current?.click()}
                                                    disabled={isUpdating || isUploadingThumbnail}
                                                    className="flex items-center gap-2"
                                                >
                                                    <Upload className="h-4 w-4" />
                                                    {isUploadingThumbnail ? "Uploading..." : 
                                                     project.thumbnail && !thumbnailDeleted ? "Change Thumbnail" : "Upload Thumbnail"}
                                                </Button>
                                                {thumbnailFile && (
                                                    <span className="text-sm text-gray-600">
                                                        {thumbnailFile.name}
                                                    </span>
                                                )}
                                            </div>

                                            {/* No thumbnail option */}
                                            {!project.thumbnail && !thumbnailFile && (
                                                <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                                                    <span className="text-sm text-gray-600">
                                                        No thumbnail selected. This project will display without a thumbnail.
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Photos Edit Section */}
                                    <div className="lg:col-span-full">
                                        <FormLabel className="uppercase text-sm font-semibold text-gray-700">
                                            Photos *
                                        </FormLabel>
                                        <div className="mt-2 space-y-4">
                                            {/* Warning message when all photos will be deleted */}
                                            {allPhotosDeleted && (
                                                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm text-red-800">
                                                            Semua foto akan dihapus. Minimal satu foto diperlukan!
                                                        </span>
                                                        {deletedPhotos.length > 0 && (
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={restoreAllPhotos}
                                                                disabled={isUpdating}
                                                            >
                                                                Restore All
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Existing Photos */}
                                            {existingPhotos.length > 0 && (
                                                <div>
                                                    <p className="text-sm text-gray-600 mb-2">Current photos:</p>
                                                    <div className="grid grid-cols-3 gap-4">
                                                        {existingPhotos.map((photo, index) => (
                                                            <div key={index} className="relative">
                                                                <NextImage
                                                                    src={getSupabaseImageUrl(photo, 'photos')}
                                                                    alt={`Current photo ${index + 1}`}
                                                                    width={300}
                                                                    height={96}
                                                                    className="w-full h-24 object-cover rounded-lg border"
                                                                />
                                                                <Button
                                                                    type="button"
                                                                    variant="destructive"
                                                                    size="icon"
                                                                    className="absolute -top-2 -right-2 h-6 w-6"
                                                                    onClick={() => removeExistingPhoto(index)}
                                                                    disabled={isUpdating}
                                                                >
                                                                    <X className="h-3 w-3" />
                                                                </Button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* New Photos Preview */}
                                            {photosPreviews.length > 0 && (
                                                <div>
                                                    <p className="text-sm text-gray-600 mb-2">New photos:</p>
                                                    <div className="grid grid-cols-3 gap-4">
                                                        {photosPreviews.map((preview, index) => (
                                                            <div key={index} className="relative">
                                                                <NextImage
                                                                    src={preview}
                                                                    alt={`New photo preview ${index + 1}`}
                                                                    width={300}
                                                                    height={96}
                                                                    className="w-full h-24 object-cover rounded-lg border"
                                                                />
                                                                <Button
                                                                    type="button"
                                                                    variant="destructive"
                                                                    size="icon"
                                                                    className="absolute -top-2 -right-2 h-6 w-6"
                                                                    onClick={() => removeNewPhoto(index)}
                                                                    disabled={isUpdating}
                                                                >
                                                                    <X className="h-3 w-3" />
                                                                </Button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Single Remove All Photos button */}
                                            {(existingPhotos.length > 0 || photoFiles.length > 0) && (
                                                <div className="flex justify-center">
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        onClick={removeAllPhotos}
                                                        disabled={isUpdating}
                                                        className="text-red-600 hover:text-red-700"
                                                    >
                                                        <Trash2 className="h-4 w-4 mr-2" />
                                                        Remove All Photos
                                                    </Button>
                                                </div>
                                            )}

                                            {/* Upload Button */}
                                            <div className="flex items-center gap-4">
                                                <input
                                                    ref={photosInputRef}
                                                    type="file"
                                                    accept="image/*"
                                                    multiple
                                                    onChange={handlePhotosChange}
                                                    className="hidden"
                                                    disabled={isUpdating}
                                                />
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() => photosInputRef.current?.click()}
                                                    disabled={isUpdating || isUploadingPhotos}
                                                    className="flex items-center gap-2"
                                                >
                                                    <Image className="h-4 w-4" />
                                                    {isUploadingPhotos ? "Uploading..." : "Add More Photos"}
                                                </Button>
                                                {photoFiles.length > 0 && (
                                                    <span className="text-sm text-gray-600">
                                                        {photoFiles.length} new file(s) selected
                                                    </span>
                                                )}
                                            </div>

                                            {/* Warning if no photos */}
                                            {existingPhotos.length === 0 && photoFiles.length === 0 && (
                                                <p className="text-sm font-medium text-destructive">
                                                    At least one photo is required
                                                </p>
                                            )}
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
                                        <FormField
                                            control={editForm.control}
                                            name="githubUrl"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="uppercase text-sm font-semibold text-gray-700">GitHub URL</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="text"
                                                            placeholder="Ex: https://github.com/your-repo (optional)"
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
                                            name="liveUrl"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="uppercase text-sm font-semibold text-gray-700">Live URL</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="text"
                                                            placeholder="Ex: https://your-live-url.com (optional)"
                                                            {...field}
                                                            disabled={isUpdating}
                                                        />
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
                                            onClick={() => setIsEditDialogOpen(false)}
                                            className="flex-1"
                                            disabled={isUpdating}
                                        >
                                            Batal
                                        </Button>
                                        <Button
                                            type="submit"
                                            className="flex-1"
                                            disabled={isUpdating || isUploadingThumbnail || isUploadingPhotos || allPhotosDeleted}
                                        >
                                            {isUpdating || isUploadingThumbnail || isUploadingPhotos ? (
                                                <>
                                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                    {isUploadingThumbnail ? "Uploading Thumbnail..." : 
                                                     isUploadingPhotos ? "Uploading Photos..." : "Mengupdate..."}
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

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Delete Project</DialogTitle>
                        <DialogDescription>
                            Apakah Anda yakin ingin menghapus proyek ini? Tindakan ini tidak dapat dibatalkan.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="flex items-start gap-3 p-3 bg-destructive/10 rounded-lg border border-destructive/20">
                            <div className="flex flex-col">
                                <span className="font-medium text-sm">{project.title}</span>
                                <p
                                    className="leading-5 overflow-hidden text-xs"
                                    style={{
                                        display: '-webkit-box',
                                        WebkitBoxOrient: 'vertical',
                                        WebkitLineClamp: 1,
                                        lineHeight: '1.25rem',
                                        maxHeight: '2.5rem',
                                        wordBreak: 'break-word'
                                    }}
                                >
                                    {project.description}
                                </p>
                            </div>
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