import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Trash2, BookOpen, Plus } from "lucide-react";
import { VocabularyItem } from "@/pages/Index";
import { useToast } from "@/hooks/use-toast";

interface VocabularyListProps {
  vocabulary: VocabularyItem[];
  onDelete: (id: string) => void;
  onBack: () => void;
  deckName: string;
  onAddWord: () => void;
}

export const VocabularyList = ({ vocabulary, onDelete, onBack, deckName, onAddWord }: VocabularyListProps) => {
  const { toast } = useToast();

  const handleDelete = (item: VocabularyItem) => {
    onDelete(item.id);
    toast({
      title: "Vocabulary deleted",
      description: `Removed "${item.word}" from your vocabulary.`,
    });
  };

  const groupedVocabulary = vocabulary.reduce((acc, item) => {
    const key = `${item.language}-${item.targetLanguage}`;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(item);
    return acc;
  }, {} as Record<string, VocabularyItem[]>);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to {deckName}
        </Button>
        <Button onClick={onAddWord}>
          <Plus className="w-4 h-4 mr-2" />
          Add Word
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BookOpen className="w-5 h-5 mr-2" />
            {deckName} Vocabulary ({vocabulary.length} words)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {vocabulary.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No vocabulary added yet.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedVocabulary).map(([languagePair, items]) => (
                <div key={languagePair} className="space-y-3">
                  <h3 className="font-semibold text-lg border-b pb-2">
                    {languagePair.replace('-', ' → ')}
                  </h3>
                  <div className="grid gap-3">
                    {items.map((item) => (
                      <div 
                        key={item.id}
                        className="flex items-center justify-between p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex-1">
                          <div className="flex items-center space-x-4">
                            <span className="font-medium text-lg">{item.word}</span>
                            <span className="text-muted-foreground">→</span>
                            <span className="text-lg">{item.translation}</span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            Added {item.createdAt.toLocaleDateString()}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(item)}
                          className="text-destructive hover:text-destructive-foreground hover:bg-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};