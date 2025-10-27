import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Edit } from "lucide-react";
import { VocabularyItem } from "@/pages/Index";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface GrammarRuleViewProps {
  item: VocabularyItem;
  onBack: () => void;
  onEdit: (id: string) => void;
  deckName: string;
}

export const GrammarRuleView = ({ item, onBack, onEdit, deckName }: GrammarRuleViewProps) => {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to {deckName}
        </Button>
        <Button variant="outline" onClick={() => onEdit(item.id)}>
          <Edit className="w-4 h-4 mr-2" />
          Edit
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>{item.title}</CardTitle>
          <CardDescription>Grammar Rule</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm max-w-none dark:prose-invert prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-em:text-foreground prose-table:text-foreground prose-th:text-foreground prose-td:text-foreground">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {item.rule || ''}
            </ReactMarkdown>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
