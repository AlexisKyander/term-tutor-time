import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft, Plus, Edit } from "lucide-react";
import { VocabularyItem } from "@/pages/Index";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface GrammarRulesGridViewProps {
  items: VocabularyItem[];
  deckName: string;
  onBack: () => void;
  onAddWord: () => void;
  onEdit: (id: string) => void;
}

export const GrammarRulesGridView = ({ items, deckName, onBack, onAddWord, onEdit }: GrammarRulesGridViewProps) => {
  const [selectedItem, setSelectedItem] = useState<VocabularyItem | null>(null);


  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to {deckName}
        </Button>
        <Button onClick={onAddWord}>
          <Plus className="w-4 h-4 mr-2" />
          Create new card
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.length === 0 ? (
          <div className="col-span-full text-center py-16">
            <p className="text-muted-foreground mb-4">No grammar rules added yet</p>
            <Button onClick={onAddWord}>
              <Plus className="w-4 h-4 mr-2" />
              Create first card
            </Button>
          </div>
        ) : (
          items.map((item) => (
            <Card 
              key={item.id} 
              className="cursor-pointer hover:shadow-lg transition-all hover:scale-105 animate-fade-in"
              onClick={() => setSelectedItem(item)}
            >
              <CardHeader>
                <CardTitle className="text-lg">{item.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Click to view rule</p>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">{selectedItem?.title}</DialogTitle>
          </DialogHeader>
          <div className="prose prose-sm max-w-none dark:prose-invert mt-4 prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-em:text-foreground">
            {selectedItem?.rule && (
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {selectedItem.rule}
              </ReactMarkdown>
            )}
          </div>
          <div className="mt-6 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setSelectedItem(null)}>
              Close
            </Button>
            {selectedItem && (
              <Button onClick={() => { onEdit(selectedItem.id); setSelectedItem(null); }}>
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
