import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Trash2, BookOpen, Plus, Edit3 } from "lucide-react";
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
  statistics: {
    correct: number;
    almostCorrect: number;
    incorrect: number;
  };
}

interface VocabularyListProps {
  vocabulary: VocabularyItem[];
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
  onBack: () => void;
  deckName: string;
  onAddWord: () => void;
  fromLanguage: string;
  toLanguage: string;
}

export const VocabularyList = ({ vocabulary, onDelete, onEdit, onBack, deckName, onAddWord, fromLanguage, toLanguage }: VocabularyListProps) => {
  const { toast } = useToast();

  const handleDelete = (item: VocabularyItem) => {
    onDelete(item.id);
    toast({
      title: "Word deleted",
      description: `"${item.word}" has been removed from your vocabulary`,
    });
  };

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
            {fromLanguage} → {toLanguage} ({vocabulary.length} words)
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
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{fromLanguage}</TableHead>
                    <TableHead>{toLanguage}</TableHead>
                    <TableHead>Comment</TableHead>
                    <TableHead>Statistics</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vocabulary.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.word}</TableCell>
                      <TableCell>{item.translation}</TableCell>
                      <TableCell className="text-muted-foreground italic">
                        {item.comment || "-"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-3 text-sm">
                          <span className="text-green-600">✓ {item.statistics.correct}</span>
                          <span className="text-yellow-600">~ {item.statistics.almostCorrect}</span>
                          <span className="text-red-600">✗ {item.statistics.incorrect}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEdit(item.id)}
                          >
                            <Edit3 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(item)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};