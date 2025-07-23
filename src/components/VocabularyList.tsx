import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Trash2, BookOpen, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export interface VocabularyItem {
  id: string;
  word: string;
  translation: string;
  comment: string;
  language: string;
  targetLanguage: string;
  deckId: string;
  createdAt: Date;
}

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
      title: "Word deleted",
      description: `"${item.word}" has been removed from your vocabulary`,
    });
  };

  // Group vocabulary by language pairs
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
          <CardTitle>{deckName} Vocabulary</CardTitle>
          <CardDescription>
            Manage your vocabulary in this deck ({vocabulary.length} words)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {vocabulary.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">No vocabulary added yet</p>
              <Button onClick={onAddWord}>
                <Plus className="w-4 h-4 mr-2" />
                Add First Word
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedVocabulary).map(([languagePair, items]) => (
                <div key={languagePair} className="space-y-2">
                  <h3 className="font-semibold text-lg text-muted-foreground">
                    {languagePair.replace('-', ' → ')}
                  </h3>
                  {items.map((item) => (
                    <div key={item.id} className="flex items-start justify-between p-4 bg-muted/50 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-lg">{item.word}</span>
                          <span className="text-muted-foreground">→</span>
                          <span className="text-lg">{item.translation}</span>
                        </div>
                        {item.comment && (
                          <p className="text-sm text-muted-foreground italic mt-1">
                            {item.comment}
                          </p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(item)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};