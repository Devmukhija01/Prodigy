import { Plus, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Template } from "@shared/schema";

export default function TemplateLibrary() {
  const { data: templates, isLoading } = useQuery<Template[]>({
    queryKey: ["/api/templates/active"],
  });

  if (isLoading) {
    return (
      <Card className="bg-white rounded-xl shadow-sm border border-gray-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Template Library</h3>
            <Button variant="link" className="text-sm text-primary hover:text-primary/80">
              Manage
            </Button>
          </div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="border border-gray-200 rounded-lg p-4 animate-pulse">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gray-300 rounded-lg"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const getTemplateGradient = (index: number) => {
    const gradients = [
      'bg-gradient-to-br from-primary to-secondary',
      'bg-gradient-to-br from-warning to-orange-500',
      'bg-gradient-to-br from-success to-secondary'
    ];
    return gradients[index % gradients.length];
  };

  const getTemplateIcon = (name: string) => {
    if (name.toLowerCase().includes('quote')) return '💬';
    if (name.toLowerCase().includes('product')) return '🚀';
    if (name.toLowerCase().includes('stat')) return '📊';
    return '📝';
  };

  return (
    <Card className="bg-white rounded-xl shadow-sm border border-gray-200">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Template Library</h3>
          <Button variant="link" className="text-sm text-primary hover:text-primary/80">
            Manage
          </Button>
        </div>
        
        <div className="space-y-4">
          {templates?.slice(0, 3).map((template, index) => (
            <div 
              key={template.id} 
              className="border border-gray-200 rounded-lg p-4 hover:border-primary/50 transition-colors cursor-pointer"
            >
              <div className="flex items-center space-x-3">
                <div className={`w-12 h-12 ${getTemplateGradient(index)} rounded-lg flex items-center justify-center text-white text-lg`}>
                  {getTemplateIcon(template.name)}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{template.name}</p>
                  <p className="text-sm text-gray-600">{template.description}</p>
                </div>
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-600">
                  <Edit size={16} />
                </Button>
              </div>
            </div>
          ))}
          
          <Button 
            variant="outline" 
            className="w-full border-2 border-dashed border-gray-300 hover:border-primary/50 hover:text-primary"
          >
            <Plus className="mr-2" size={16} />
            Create New Template
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
