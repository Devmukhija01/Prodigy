import { useState } from "react";
import { X, Upload, Hash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertPostSchema } from "@shared/schema";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import PostPreview from "./post-preview";

interface PostCreatorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const formSchema = insertPostSchema.extend({
  scheduledDate: z.string().optional(),
  scheduledTime: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export default function PostCreatorModal({ open, onOpenChange }: PostCreatorModalProps) {
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['twitter']);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      content: "",
      platforms: [],
      status: "draft",
      tags: [],
      mediaUrls: [],
    },
  });

  const createPostMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const { scheduledDate, scheduledTime, ...postData } = data;
      
      let scheduledDateTime = null;
      if (scheduledDate && scheduledTime) {
        scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}`);
      }

      const finalData = {
        ...postData,
        platforms: selectedPlatforms,
        scheduledDate: scheduledDateTime,
        status: scheduledDateTime ? 'scheduled' : 'draft',
      };

      const response = await apiRequest("POST", "/api/posts", finalData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics/stats"] });
      toast({
        title: "Post created successfully",
        description: "Your post has been saved and will be published as scheduled.",
      });
      onOpenChange(false);
      form.reset();
      setSelectedPlatforms(['twitter']);
    },
    onError: (error) => {
      toast({
        title: "Error creating post",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handlePlatformToggle = (platform: string) => {
    setSelectedPlatforms(prev => 
      prev.includes(platform) 
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    );
  };

  const platforms = [
    { id: 'twitter', name: 'Twitter', icon: 'fab fa-twitter', color: 'text-blue-500' },
    { id: 'facebook', name: 'Facebook', icon: 'fab fa-facebook', color: 'text-blue-600' },
    { id: 'instagram', name: 'Instagram', icon: 'fab fa-instagram', color: 'text-pink-500' },
    { id: 'linkedin', name: 'LinkedIn', icon: 'fab fa-linkedin', color: 'text-blue-700' },
  ];

  const onSubmit = (data: FormData) => {
    createPostMutation.mutate(data);
  };

  const content = form.watch("content");
  const characterCount = content?.length || 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Create New Post</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Editor */}
            <div className="space-y-6">
              <div>
                <Label htmlFor="title" className="text-sm font-medium text-gray-700">
                  Post Title
                </Label>
                <Input
                  id="title"
                  {...form.register("title")}
                  placeholder="Enter post title"
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="content" className="text-sm font-medium text-gray-700">
                  Post Content
                </Label>
                <Textarea
                  id="content"
                  {...form.register("content")}
                  placeholder="What's on your mind?"
                  className="mt-2 h-32 resize-none"
                />
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    Character count: {characterCount}/280
                  </span>
                  <Button type="button" variant="link" size="sm" className="text-primary">
                    <Hash className="w-4 h-4 mr-1" />
                    Add hashtags
                  </Button>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                  Media
                </Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 mb-2">Drag and drop your media here</p>
                  <Button type="button" variant="outline" size="sm">
                    Choose Files
                  </Button>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                  Platforms
                </Label>
                <div className="grid grid-cols-2 gap-3">
                  {platforms.map((platform) => (
                    <div
                      key={platform.id}
                      className="flex items-center space-x-3 p-3 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer"
                      onClick={() => handlePlatformToggle(platform.id)}
                    >
                      <Checkbox
                        checked={selectedPlatforms.includes(platform.id)}
                        onChange={() => handlePlatformToggle(platform.id)}
                      />
                      <i className={`${platform.icon} ${platform.color}`}></i>
                      <span className="text-sm font-medium">{platform.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column - Preview & Scheduling */}
            <div className="space-y-6">
              <PostPreview 
                content={content} 
                platforms={selectedPlatforms}
                title={form.watch("title")}
              />

              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                  Schedule
                </Label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="scheduledDate" className="text-xs text-gray-500">
                      Date
                    </Label>
                    <Input
                      id="scheduledDate"
                      type="date"
                      {...form.register("scheduledDate")}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="scheduledTime" className="text-xs text-gray-500">
                      Time
                    </Label>
                    <Input
                      id="scheduledTime"
                      type="time"
                      {...form.register("scheduledTime")}
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="tags" className="text-sm font-medium text-gray-700">
                  Tags
                </Label>
                <Input
                  id="tags"
                  placeholder="Add tags separated by commas"
                  className="mt-2"
                  onChange={(e) => {
                    const tags = e.target.value.split(',').map(tag => tag.trim()).filter(Boolean);
                    form.setValue("tags", tags);
                  }}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-6 border-t border-gray-200 bg-gray-50 -mx-6 -mb-6 px-6 py-4">
            <div className="flex items-center space-x-3">
              <Button type="button" variant="outline" onClick={() => form.setValue("status", "draft")}>
                Save as Draft
              </Button>
              <Button type="button" variant="outline" className="text-primary border-primary">
                Save Template
              </Button>
            </div>
            <div className="flex items-center space-x-3">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="bg-primary hover:bg-primary/90"
                disabled={createPostMutation.isPending}
              >
                {createPostMutation.isPending ? "Creating..." : "Schedule Post"}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
