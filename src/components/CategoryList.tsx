import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, FileText } from "lucide-react";

export interface Category {
  id: string;
  name: string;
  icon: 'vocabulary' | 'grammar';
}

interface CategoryListProps {
  categories: Category[];
  onSelectCategory: (categoryId: string) => void;
}

export const CategoryList = ({ categories, onSelectCategory }: CategoryListProps) => {
  const getIcon = (iconType: 'vocabulary' | 'grammar') => {
    return iconType === 'vocabulary' ? BookOpen : FileText;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Learning Categories</h2>
        <p className="text-muted-foreground">Choose a category to get started</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {categories.map((category) => {
          const Icon = getIcon(category.icon);
          return (
            <Card 
              key={category.id} 
              className="group hover:shadow-lg transition-all duration-300 cursor-pointer"
              onClick={() => onSelectCategory(category.id)}
            >
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{category.name}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {category.icon === 'vocabulary' 
                    ? 'Learn and practice vocabulary across different languages'
                    : 'Master grammar rules and structures'}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
