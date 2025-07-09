import { useState } from 'react';
import { Plus, Palette, Image, Type, FileText, Edit, Trash2, Search, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { insertBrandAssetSchema, BrandAsset, type InsertBrandAsset } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

const CURRENT_USER_ID = 1;

export const Brand = () => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: assets = [], isLoading } = useQuery<BrandAsset[]>({
    queryKey: ['/api/brand-assets/user', CURRENT_USER_ID],
  });

  const createAssetMutation = useMutation({
    mutationFn: (data: InsertBrandAsset) => apiRequest('/api/brand-assets', 'POST', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/brand-assets/user', CURRENT_USER_ID] });
      setIsCreateOpen(false);
      toast({
        title: "Success",
        description: "Brand asset created successfully!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create brand asset. Please try again.",
        variant: "destructive",
      });
    },
  });

  const form = useForm<InsertBrandAsset>({
    resolver: zodResolver(insertBrandAssetSchema),
    defaultValues: {
      name: '',
      type: 'color',
      value: '',
      userId: CURRENT_USER_ID,
      isActive: true,
    },
  });

  const onSubmit = (data: InsertBrandAsset) => {
    createAssetMutation.mutate(data);
  };

  const filteredAssets = assets.filter(asset => {
    const matchesSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         asset.value.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || asset.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const getAssetIcon = (type: string) => {
    switch (type) {
      case 'color':
        return <Palette className="w-4 h-4" />;
      case 'font':
        return <Type className="w-4 h-4" />;
      case 'logo':
        return <Image className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const renderAssetPreview = (asset: BrandAsset) => {
    switch (asset.type) {
      case 'color':
        return (
          <div className="flex items-center space-x-2">
            <div 
              className="w-6 h-6 rounded border border-gray-300 dark:border-gray-600"
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
        return (
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Logo: {asset.value}
          </div>
        );
      default:
        return (
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {asset.value}
          </div>
        );
    }
  };

  const assetTypes = ['color', 'font', 'logo', 'other'];
  const uniqueTypes = [...new Set(assets.map(asset => asset.type))];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Brand Assets</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your brand colors, fonts, and assets</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-primary to-secondary hover:shadow-lg">
              <Plus size={16} className="mr-2" />
              Add Asset
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add New Brand Asset</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Asset Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter asset name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Asset Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select asset type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {assetTypes.map(type => (
                            <SelectItem key={type} value={type}>
                              {type.charAt(0).toUpperCase() + type.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="value"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Value</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter asset value (e.g., #FF0000, Arial, logo.png)" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between">
                      <FormLabel>Active Asset</FormLabel>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createAssetMutation.isPending}>
                    {createAssetMutation.isPending ? 'Adding...' : 'Add Asset'}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search assets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {uniqueTypes.map(type => (
              <SelectItem key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Assets Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="glass-effect shadow-xl animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredAssets.length === 0 ? (
        <div className="text-center py-12">
          <Palette className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {searchTerm || typeFilter !== 'all' ? 'No assets found' : 'No brand assets yet'}
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            {searchTerm || typeFilter !== 'all'
              ? "Try adjusting your search or filter settings" 
              : "Add your first brand asset to get started!"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAssets.map((asset) => (
            <Card key={asset.id} className="glass-effect shadow-xl hover:shadow-2xl transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {getAssetIcon(asset.type)}
                    <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                      {asset.name}
                    </CardTitle>
                  </div>
                  <div className="flex items-center space-x-2">
                    {asset.isActive && (
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    )}
                    <Badge variant={asset.isActive ? "default" : "secondary"}>
                      {asset.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  {renderAssetPreview(asset)}
                </div>
                
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-xs">
                    {asset.type}
                  </Badge>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {formatDate(asset.createdAt)}
                  </span>
                </div>
                
                <div className="flex items-center space-x-2 pt-2">
                  <Button size="sm" variant="outline">
                    <Edit size={14} className="mr-1" />
                    Edit
                  </Button>
                  <Button size="sm" variant="outline">
                    <Trash2 size={14} className="mr-1" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};