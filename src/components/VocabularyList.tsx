import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Trash2, BookOpen, Plus, Edit3, Eye, Play } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export interface VocabularyItem {
  id: string;
  word: string;
  translation: string;
  comment: string;
  image?: string;
  type?: 'practice' | 'grammar-rule' | 'grammar-exercise';
  title?: string;
  rule?: string;
  exerciseDescription?: string;
  exerciseType?: 'regular' | 'cloze-test';
  question?: string;
  answer?: string;
  clozeText?: string;
  clozeAnswers?: string[];
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
  onView?: (id: string) => void;
  onPractice?: (id: string) => void;
  onBack: () => void;
  deckName: string;
  onAddWord: () => void;
  fromLanguage: string;
  toLanguage: string;
  isGrammarExercises?: boolean;
}

export const VocabularyList = ({ vocabulary, onDelete, onEdit, onView, onPractice, onBack, deckName, onAddWord, fromLanguage, toLanguage, isGrammarExercises }: VocabularyListProps) => {
  const { toast } = useToast();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<VocabularyItem | null>(null);

  const handleDeleteClick = (item: VocabularyItem) => {
    setItemToDelete(item);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (itemToDelete) {
      onDelete(itemToDelete.id);
      toast({
        title: "Word deleted",
        description: `"${itemToDelete.word}" has been removed from your vocabulary`,
      });
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    }
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
          {isGrammarExercises ? "Add Exercise" : "Add Word"}
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>{deckName}</CardTitle>
          <CardDescription>
            {isGrammarExercises 
              ? `${vocabulary.length} exercise${vocabulary.length !== 1 ? 's' : ''}`
              : `${fromLanguage} → ${toLanguage} (${vocabulary.length} word${vocabulary.length !== 1 ? 's' : ''})`
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {vocabulary.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">No vocabulary added yet</p>
              <Button onClick={onAddWord}>
                <Plus className="w-4 h-4 mr-2" />
                {isGrammarExercises ? "Add First Exercise" : "Add First Word"}
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Comment</TableHead>
                    <TableHead>Statistics</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vocabulary.map((item) => {
                    const isGrammarRule = item.type === 'grammar-rule';
                    const isGrammarExercise = item.type === 'grammar-exercise';
                    const isGrammarType = isGrammarRule || isGrammarExercise;
                    
                    return (
                      <TableRow key={item.id}>
                        <TableCell>
                          <Badge variant={isGrammarType ? "secondary" : "outline"}>
                            {isGrammarRule ? "Rule" : isGrammarExercise ? (item.exerciseType === 'cloze-test' ? "Cloze Test" : "Regular Question") : "Practice"}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">
                          {isGrammarRule ? item.title : isGrammarExercise ? (item.title || "Grammar Exercise") : item.word}
                        </TableCell>
                        <TableCell className="text-muted-foreground italic">
                          {!isGrammarType && (item.comment || "-")}
                        </TableCell>
                        <TableCell>
                          {!isGrammarType && (
                            <div className="flex items-center space-x-3 text-sm">
                              <span className="text-green-600">✓ {item.statistics.correct}</span>
                              <span className="text-yellow-600">~ {item.statistics.almostCorrect}</span>
                              <span className="text-red-600">✗ {item.statistics.incorrect}</span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-1">
                            {isGrammarExercise && onPractice && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onPractice(item.id)}
                                title="Practice this exercise"
                              >
                                <Play className="w-4 h-4" />
                              </Button>
                            )}
                            {isGrammarRule && onView && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onView(item.id)}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            )}
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
                              onClick={() => handleDeleteClick(item)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{itemToDelete?.word}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};