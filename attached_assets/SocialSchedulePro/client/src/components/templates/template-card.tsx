import { Edit, Trash2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Template } from "@shared/schema";

interface TemplateCardProps {
  template: Template;
  onDelete: () => void;
}

export default function TemplateCard({ template, onDelete }: TemplateCardProps) {
  const getTemplateGradient = (id: number) => {
    const gradients = [
      'bg-gradient-to-br from-primary to-secondary',
      'bg-gradient-to-br from-warning to-orange-500',
      'bg-gradient-to-br from-success to-secondary',
      'bg-gradient-to-br from-purple-500 to-pink-500',
      'bg-gradient-to-br from-blue-500 to-cyan-500',
    ];
    return gradients[id % gradients.length];
  };

  const getTemplateIcon = (name: string) => {
    if (name.toLowerCase().includes('quote')) return '💬';
    if (name.toLowerCase().includes('product')) return '🚀';
    if (name.toLowerCase().includes('stat')) return '📊';
    if (name.toLowerCase().includes('announcement')) return '📢';
    return '📝';
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-12 h-12 ${getTemplateGradient(template.id)} rounded-lg flex items-center justify-center text-white text-lg`}>
              {getTemplateIcon(template.name)}
            </div>
            <div>
              <CardTitle className="text-lg">{template.name}</CardTitle>
              <p className="text-sm text-gray-600 mt-1">{template.description}</p>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-600">
              <Eye className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-600">
              <Edit className="w-4 h-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onDelete}
              className="text-gray-400 hover:text-destructive"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-4">
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-sm text-gray-700 line-clamp-3">{template.content}</p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {template.platforms.map((platform) => (
              <Badge key={platform} variant="secondary" className="text-xs">
                {platform}
              </Badge>
            ))}
          </div>
          
          {template.brandColors && template.brandColors.length > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Brand Colors:</span>
              <div className="flex space-x-1">
                {template.brandColors.slice(0, 3).map((color, index) => (
                  <div
                    key={index}
                    className="w-4 h-4 rounded-full border border-gray-300"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          )}
          
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>{template.isActive ? 'Active' : 'Inactive'}</span>
            <span>Template #{template.id}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
