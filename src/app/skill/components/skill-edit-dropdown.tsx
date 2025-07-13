"use client"

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Skill, SkillFormValues, skillSchema } from "@/domain/skill-schema";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { MoreHorizontal, Edit, Trash2, Eye, Loader2, Save, Code } from "lucide-react";
import toast from "react-hot-toast";

interface SkillEditDropdownProps {
  skill: Skill;
  onUpdate: (skillId: string, data: SkillFormValues) => Promise<void>;
  onDelete: (skillId: string, skillName: string) => Promise<void>;
  isUpdating?: boolean;
  isDeleting?: boolean;
  disabled?: boolean;
}

export function SkillEditDropdown({
  skill,
  onUpdate,
  onDelete,
  isUpdating = false,
  isDeleting = false,
  disabled = false
}: SkillEditDropdownProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  const editForm = useForm<SkillFormValues>({
    resolver: zodResolver(skillSchema),
    defaultValues: {
      name: skill.name,
      icon: skill.icon,
    },
  });

  const handleEdit = () => {
    editForm.setValue("name", skill.name);
    editForm.setValue("icon", skill.icon);
    setIsEditDialogOpen(true);
  };

  const handleUpdate = async (data: SkillFormValues) => {
    try {
      await onUpdate(skill.id, data);
      setIsEditDialogOpen(false);
      editForm.reset();
      toast.success("Skill berhasil diupdate!");
    } catch (error) {
      console.error("Error updating skill:", error);
      toast.error("Gagal mengupdate skill. Silakan coba lagi.");
    }
  };

  const handleDelete = async () => {
    try {
      await onDelete(skill.id, skill.name);
      setIsDeleteDialogOpen(false);
      toast.success(`Skill "${skill.name}" berhasil dihapus!`);
    } catch (error) {
      console.error("Error deleting skill:", error);
      toast.error("Gagal menghapus skill. Silakan coba lagi.");
    }
  };

  const iconValue = editForm.watch("icon");

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
            disabled={disabled}
          >
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">More options</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-48" align="end">
          <DropdownMenuItem onClick={() => setIsViewDialogOpen(true)}>
            <Eye className="h-4 w-4 text-muted-foreground" />
            <span>View Details</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleEdit}>
            <Edit className="h-4 w-4 text-muted-foreground" />
            <span>Edit Skill</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            onClick={() => setIsDeleteDialogOpen(true)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
            <span>Delete Skill</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Skill Details</DialogTitle>
            <DialogDescription>
              Detail informasi skill yang telah ditambahkan
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
              <div className="flex-shrink-0">
                {skill.icon ? (
                  <i className={`${skill.icon} text-4xl`}></i>
                ) : (
                  <div className="w-12 h-12 bg-muted rounded flex items-center justify-center">
                    <Code className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{skill.name}</h3>
                <p className="text-sm text-muted-foreground">
                  Icon Class: <code className="bg-background px-1 rounded">{skill.icon}</code>
                </p>
              </div>
            </div>
            <div className="flex justify-end">
              <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Skill</DialogTitle>
            <DialogDescription>
              Update informasi skill yang sudah ada
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(handleUpdate)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="icon"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Icon Class</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          placeholder="devicon-react-original"
                          {...field}
                          disabled={isUpdating}
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
              <FormField
                control={editForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Skill</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="React.js"
                        {...field}
                        disabled={isUpdating}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Preview */}
              {(editForm.watch("name") || editForm.watch("icon")) && (
                <div className="border rounded-lg p-3 bg-muted/30">
                  <p className="text-sm font-medium mb-2">Preview:</p>
                  <div className="flex items-center gap-3 p-2 bg-background rounded border">
                    {iconValue ? (
                      <i className={`${iconValue} text-2xl`}></i>
                    ) : (
                      <div className="w-8 h-8 bg-muted rounded flex items-center justify-center">
                        <Code className="h-4 w-4 text-muted-foreground" />
                      </div>
                    )}
                    <span className="font-medium text-sm">
                      {editForm.watch("name") || "Nama Skill"}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                  disabled={isUpdating}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isUpdating}
                  className="flex-1"
                >
                  {isUpdating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Update
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Skill</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus skill ini? Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-destructive/10 rounded-lg border border-destructive/20">
              {skill.icon ? (
                <i className={`${skill.icon} text-2xl`}></i>
              ) : (
                <div className="w-8 h-8 bg-muted rounded flex items-center justify-center">
                  <Code className="h-4 w-4 text-muted-foreground" />
                </div>
              )}
              <span className="font-medium">{skill.name}</span>
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
  );
}