import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertPostSchema } from "@shared/schema";
import { z } from "zod";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, Calendar, Hash, Save, Send } from "lucide-react";
import PostPreview from "@/components/posts/post-preview";
import { Template } from "@shared/schema";

const formSchema = insertPostSchema.extend({
  scheduledDate: z.string().optional(),
  scheduledTime: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export default function CreatePost() {
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['twitter']);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: templates } = useQuery<Template[]>({
    queryKey: ["/api/templates/active"],
  });

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
      form.reset();
      setSelectedPlatforms(['twitter']);
      setSelectedTemplate(null);
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

  const handleTemplateSelect = (template: Template) => {
    setSelectedTemplate(template);
    form.setValue("title", template.name);
    form.setValue("content", template.content);
    setSelectedPlatforms(template.platforms);
  };

  const onSubmit = (data: FormData) => {
    createPostMutation.mutate(data);
  };

  const platforms = [
    { id: 'twitter', name: 'Twitter', icon: 'fab fa-twitter', color: 'text-blue-500' },
    { id: 'facebook', name: 'Facebook', icon: 'fab fa-facebook', color: 'text-blue-600' },
    { id: 'instagram', name: 'Instagram', icon: 'fab fa-instagram', color: 'text-pink-500' },
    { id: 'linkedin', name: 'LinkedIn', icon: 'fab fa-linkedin', color: 'text-blue-700' },
  ];

  const content = form.watch("content");
  const title = form.watch("title");
  const characterCount = content?.length || 0;

  return (
    <>
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 px-8 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Create Post</h2>
            <p className="text-gray-600">Create and schedule your social media content</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-8">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Templates */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Templates</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {templates?.map((template) => (
                    <div
                      key={template.id}
                      className={`border border-gray-200 rounded-lg p-4 cursor-pointer transition-colors ${
                        selectedTemplate?.id === template.id 
                          ? 'border-primary bg-primary/5' 
                          : 'hover:border-gray-300'
                      }`}
                      onClick={() => handleTemplateSelect(template)}
                    >
                      <h4 className="font-medium text-gray-900">{template.name}</h4>
                      <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {template.platforms.map((platform) => (
                          <span key={platform} className="text-xs bg-gray-100 px-2 py-1 rounded">
                            {platform}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Middle Column - Editor */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Post Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label htmlFor="title">Post Title</Label>
                    <Input
                      id="title"
                      {...form.register("title")}
                      placeholder="Enter post title"
                    />
                  </div>

                  <div>
                    <Label htmlFor="content">Content</Label>
                    <Textarea
                      id="content"
                      {...form.register("content")}
                      placeholder="What's on your mind?"
                      className="h-32 resize-none"
                    />
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-sm text-gray-500">
                        {characterCount}/280 characters
                      </span>
                      <Button type="button" variant="link" size="sm" className="text-primary">
                        <Hash className="w-4 h-4 mr-1" />
                        Add hashtags
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label className="mb-2 block">Platforms</Label>
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

                  <div>
                    <Label className="mb-2 block">Media</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600 mb-2">Drag and drop your media here</p>
                      <Button type="button" variant="outline" size="sm">
                        Choose Files
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label className="mb-2 block">Schedule</Label>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="scheduledDate" className="text-xs text-gray-500">
                          Date
                        </Label>
                        <Input
                          id="scheduledDate"
                          type="date"
                          {...form.register("scheduledDate")}
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
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="tags">Tags</Label>
                    <Input
                      id="tags"
                      placeholder="Add tags separated by commas"
                      onChange={(e) => {
                        const tags = e.target.value.split(',').map(tag => tag.trim()).filter(Boolean);
                        form.setValue("tags", tags);
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Preview */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <PostPreview 
                    content={content} 
                    platforms={selectedPlatforms}
                    title={title}
                  />
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200">
            <div className="flex items-center space-x-3">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => form.setValue("status", "draft")}
              >
                <Save className="w-4 h-4 mr-2" />
                Save as Draft
              </Button>
              <Button type="button" variant="outline" className="text-primary border-primary">
                Save as Template
              </Button>
            </div>
            <div className="flex items-center space-x-3">
              <Button 
                type="submit" 
                className="bg-primary hover:bg-primary/90"
                disabled={createPostMutation.isPending}
              >
                <Send className="w-4 h-4 mr-2" />
                {createPostMutation.isPending ? "Creating..." : "Schedule Post"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </>
  );
}
