"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Heading } from "@/components/ui/heading";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { SosmedFormValues, sosmedSchema } from "@/domain/sosmed-schema";
import { useSosmedManager } from "@/hooks/useSosmed";
import { zodResolver } from "@hookform/resolvers/zod";
import { Code, ExternalLink, Link2, Loader2, Plus, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { SosmedEditDropdown } from "./components/sosmed-edit-dropdown";
import { extractUsernameFromUrl } from "@/lib/utils";

export default function Sosmed() {
    const { sosmed, isLoading: isLoadingSosmed, addSosmed, updateSosmed, deleteSosmed, fetchSosmed } = useSosmedManager();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    const form = useForm<SosmedFormValues>({
        resolver: zodResolver(sosmedSchema),
        defaultValues: {
            name: "",
            url: "",
        },
    });

    useEffect(() => {
        fetchSosmed();
    }, [fetchSosmed]);

    const onSubmit = async (data: SosmedFormValues) => {
        try {
            setIsSubmitting(true);
            await addSosmed(data);
            form.reset();
            toast.success("Sosial media berhasil ditambahkan!");
        } catch (error) {
            console.error("Error adding sosmed:", error);
            toast.error("Gagal menambahkan sosial media. Silakan coba lagi.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdateSosmed = async (sosmedId: string, data: SosmedFormValues) => {
        setUpdatingId(sosmedId);
        try {
            await updateSosmed(sosmedId, data);
        } finally {
            setUpdatingId(null);
        }
    };

    const handleDeleteSosmed = async (sosmedId: string) => {
        setDeletingId(sosmedId);
        try {
            await deleteSosmed(sosmedId);
        } finally {
            setDeletingId(null);
        }
    };

    const iconValue = form.watch("name");

    const validSosmed = sosmed?.filter((sosmed) => sosmed && sosmed.id) || [];

    const groupedSosmed = [];
    for (let i = 0; i < validSosmed.length; i += 3) {
        groupedSosmed.push(validSosmed.slice(i, i + 3));
    }

    const isTemporarySosmed = (sosmedId: string | undefined | null): boolean => {
        return sosmedId ? sosmedId.startsWith("temp-") : false;
    };

    const usernamePreview = extractUsernameFromUrl(form.watch("url"));

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <div className="flex-1 space-y-6 p-8">
                    <div className="flex items-center justify-between">
                        <Heading
                            title="Social Media Management"
                            description="Kelola data media sosial yang kamu miliki"
                        />
                        <Badge variant="secondary" className="flex items-center gap-2">
                            <Code className="h-4 w-4" />
                            Total: {validSosmed.length} Sosial Media
                        </Badge>
                    </div>
                    <Separator />

                    <Card className="w-full">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Save className="h-5 w-5" />
                                Tambah Social Media
                            </CardTitle>
                            <CardDescription>
                                Masukkan link social media yang ingin ditampilkan
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                    <div className="grid grid-cols-1 lg:grid-cols-6 gap-4 items-end">
                                        <div className="lg:col-span-2">
                                            <FormField
                                                control={form.control}
                                                name="name"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="uppercase text-sm font-semibold text-gray-700">sosial media</FormLabel>
                                                        <FormControl>
                                                            <div className="relative">
                                                                <Input
                                                                    type="text"
                                                                    placeholder="instagram"
                                                                    value={field.value?.toLowerCase() ?? ""}
                                                                    onChange={(e) => field.onChange(e.target.value.toLowerCase())}
                                                                    className="pr-12 lowercase"
                                                                    disabled={isSubmitting}
                                                                />
                                                                {iconValue && (
                                                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                                                                        <i className={`fa-brands fa-${iconValue} text-xl`} />
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
                                                name="url"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="uppercase text-sm font-semibold text-gray-700">url sosial media</FormLabel>
                                                        <FormControl>
                                                            <div className="relative">
                                                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                                                                    <Link2 className="h-5 w-5" />
                                                                </span>
                                                                <Input
                                                                    type="text"
                                                                    placeholder="https://instagram.com/yourusername"
                                                                    value={field.value?.toLowerCase() ?? ""}
                                                                    onChange={(e) => field.onChange(e.target.value.toLowerCase())}
                                                                    className="pl-10 lowercase"
                                                                    disabled={isSubmitting}
                                                                />
                                                            </div>
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

                                    {(form.watch("name") || form.watch("url")) && (
                                        <div className="border rounded-lg p-4 bg-muted/30">
                                            <div className="flex items-center justify-between mb-3">
                                                <p className="text-sm font-medium">Preview Sosmed Card:</p>
                                                <Badge variant="outline" className="text-xs">
                                                    Live Preview
                                                </Badge>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                                <div className="flex items-center gap-3 p-3 bg-background rounded border">
                                                    {iconValue ? (
                                                        <i className={`fa-brands fa-${iconValue} text-2xl`} />
                                                    ) : (
                                                        <div className="w-8 h-8 bg-muted rounded flex items-center justify-center">
                                                            <Link2 className="h-4 w-4 text-muted-foreground" />
                                                        </div>
                                                    )}
                                                    <span className="font-medium text-sm">
                                                        {usernamePreview || "URL Sosmed"}
                                                    </span>
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
                                    <CardTitle>Daftar Social Media</CardTitle>
                                    <CardDescription>Social Media yang sudah ditambahkan</CardDescription>
                                </div>
                                <Button variant="outline" size="sm">
                                    <Code className="h-4 w-4 mr-2" />
                                    Import Social Media
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {isLoadingSosmed ? (
                                <div className="text-center py-12">
                                    <Loader2 className="h-8 w-8 mx-auto mb-4 animate-spin text-muted-foreground" />
                                    <p className="text-muted-foreground">Loading Sosial media...</p>
                                </div>
                            ) : validSosmed.length > 0 ? (
                                <div className="space-y-6">
                                    {groupedSosmed.map((row, rowIndex) => (
                                        <div key={rowIndex} className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                                            {row.map((sosmed) => {
                                                if (!sosmed || !sosmed.id) return null;

                                                const isTemp = isTemporarySosmed(sosmed.id);
                                                const username = extractUsernameFromUrl(sosmed.url);

                                                return (
                                                    <div
                                                        key={sosmed.id}
                                                        className={`p-4 bg-background rounded-lg border hover:border-primary/20 transition-colors group relative ${isTemp ? "opacity-60" : ""
                                                            }`}
                                                    >
                                                        <div className="flex items-center gap-3 mb-3">
                                                            <div className="flex-shrink-0">
                                                                {sosmed.name ? (
                                                                    <i className={`fa-brands fa-${sosmed.name} text-2xl`} />
                                                                ) : (
                                                                    <div className="w-8 h-8 bg-muted rounded flex items-center justify-center">
                                                                        <Code className="h-4 w-4 text-muted-foreground" />
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <span className="font-medium text-sm flex-1">
                                                                {username || "UnURL"}
                                                            </span>
                                                            {isTemp && (
                                                                <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                                                            )}
                                                        </div>
                                                        {!isTemp && (
                                                            <div className="absolute top-2 right-2">
                                                                <SosmedEditDropdown
                                                                    sosmed={sosmed}
                                                                    onUpdate={handleUpdateSosmed}
                                                                    onDelete={handleDeleteSosmed}
                                                                    isUpdating={updatingId === sosmed.id}
                                                                    isDeleting={deletingId === sosmed.id}
                                                                    disabled={updatingId !== null || deletingId !== null}
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
                                    <p className="text-lg font-medium mb-2">Belum ada sosial media yang ditambahkan</p>
                                    <p className="text-sm">
                                        Mulai tambahkan sosial media pertama kamu menggunakan form di atas!
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
