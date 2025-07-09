import { useState } from "react";
import { Plus, Edit, Trash2, Palette, Image, Type, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertBrandAssetSchema, BrandAsset } from "@shared/schema";
import { z } from "zod";

const formSchema = insertBrandAssetSchema;
type FormData = z.infer<typeof formSchema>;

export default function BrandAssets() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingAsset, setEditingAsset] = useState<BrandAsset | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: assets, isLoading } = useQuery<BrandAsset[]>({
    queryKey: ["/api/brand-assets"],
  });

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      type: "logo",
      value: "",
      isActive: true,
    },
  });

  const createAssetMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await apiRequest("POST", "/api/brand-assets", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/brand-assets"] });
      toast({
        title: "Brand asset created",
        description: "Your brand asset has been successfully created.",
      });
      setShowCreateDialog(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error creating brand asset",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteAssetMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/brand-assets/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/brand-assets"] });
      toast({
        title: "Brand asset deleted",
        description: "The brand asset has been successfully deleted.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error deleting brand asset",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleCreateAsset = (data: FormData) => {
    createAssetMutation.mutate(data);
  };

  const handleDeleteAsset = (id: number) => {
    if (window.confirm("Are you sure you want to delete this brand asset?")) {
      deleteAssetMutation.mutate(id);
    }
  };

  const getAssetIcon = (type: string) => {
    switch (type) {
      case 'logo':
        return <Image className="w-5 h-5" />;
      case 'color':
        return <Palette className="w-5 h-5" />;
      case 'font':
        return <Type className="w-5 h-5" />;
      default:
        return <Image className="w-5 h-5" />;
    }
  };

  const getAssetDisplay = (asset: BrandAsset) => {
    switch (asset.type) {
      case 'color':
        return (
          <div className="flex items-center space-x-2">
            <div 
              className="w-8 h-8 rounded-full border-2 border-gray-300"
              style={{ backgroundColor: asset.value }}
            />
            <span className="text-sm font-mono">{asset.value}</span>
          </div>
        );
      case 'font':
        return (
          <div className="text-sm" style={{ fontFamily: asset.value }}>
            {asset.value} - Sample Text
          </div>
        );
      case 'logo':
        return asset.value.startsWith('http') ? (
          <img 
            src={asset.value} 
            alt={asset.name}
            className="w-16 h-8 object-contain"
          />
        ) : (
          <div className="w-16 h-8 bg-gray-200 rounded flex items-center justify-center">
            <Image className="w-4 h-4 text-gray-400" />
          </div>
        );
      default:
        return <span className="text-sm text-gray-600">{asset.value}</span>;
    }
  };

  const groupedAssets = assets?.reduce((acc, asset) => {
    if (!acc[asset.type]) {
      acc[asset.type] = [];
    }
    acc[asset.type].push(asset);
    return acc;
  }, {} as Record<string, BrandAsset[]>) || {};

  if (isLoading) {
    return (
      <>
        <div className="bg-white shadow-sm border-b border-gray-200 px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Brand Assets</h2>
              <p className="text-gray-600">Manage your brand colors, fonts, and logos</p>
            </div>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              Add Asset
            </Button>
          </div>
        </div>
        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-20 bg-gray-200 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 px-8 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Brand Assets</h2>
            <p className="text-gray-600">Manage your brand colors, fonts, and logos</p>
          </div>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-2" />
                Add Asset
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create Brand Asset</DialogTitle>
              </DialogHeader>
              <form onSubmit={form.handleSubmit(handleCreateAsset)} className="space-y-4">
                <div>
                  <Label htmlFor="name">Asset Name</Label>
                  <Input
                    id="name"
                    {...form.register("name")}
                    placeholder="e.g., Primary Logo, Brand Color"
                  />
                </div>
                
                <div>
                  <Label htmlFor="type">Asset Type</Label>
                  <Select
                    value={form.watch("type")}
                    onValueChange={(value) => form.setValue("type", value as "logo" | "color" | "font")}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select asset type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="logo">Logo</SelectItem>
                      <SelectItem value="color">Color</SelectItem>
                      <SelectItem value="font">Font</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="value">
                    {form.watch("type") === 'color' ? 'Color Value (hex)' : 
                     form.watch("type") === 'font' ? 'Font Family' : 'Logo URL'}
                  </Label>
                  <Input
                    id="value"
                    {...form.register("value")}
                    placeholder={
                      form.watch("type") === 'color' ? '#4F46E5' : 
                      form.watch("type") === 'font' ? 'Inter, sans-serif' : 
                      'https://example.com/logo.png'
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCreateDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-primary hover:bg-primary/90"
                    disabled={createAssetMutation.isPending}
                  >
                    {createAssetMutation.isPending ? "Creating..." : "Create Asset"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Content */}
      <div className="p-8">
        {assets?.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Palette className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No brand assets yet</h3>
            <p className="text-gray-500 mb-4">Add your first brand asset to get started</p>
            <Button 
              className="bg-primary hover:bg-primary/90"
              onClick={() => setShowCreateDialog(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Asset
            </Button>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedAssets).map(([type, typeAssets]) => (
              <div key={type}>
                <div className="flex items-center space-x-2 mb-4">
                  {getAssetIcon(type)}
                  <h3 className="text-lg font-semibold text-gray-900 capitalize">
                    {type}s ({typeAssets.length})
                  </h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {typeAssets.map((asset) => (
                    <Card key={asset.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            {getAssetIcon(asset.type)}
                            <span className="font-medium text-gray-900">{asset.name}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-gray-400 hover:text-gray-600"
                              onClick={() => setEditingAsset(asset)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteAsset(asset.id)}
                              className="text-gray-400 hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="mb-3">
                          {getAssetDisplay(asset)}
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <Badge variant={asset.isActive ? "default" : "secondary"}>
                            {asset.isActive ? "Active" : "Inactive"}
                          </Badge>
                          <span className="text-xs text-gray-500">#{asset.id}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
