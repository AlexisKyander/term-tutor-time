import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { VocabularyItem } from "@/pages/Index";

interface VocabularyEditFormProps {
  item: VocabularyItem;
  onUpdate: (item: VocabularyItem) => void;
  onBack: () => void;
  deckName: string;
}

export const VocabularyEditForm = ({ item, onUpdate, onBack, deckName }: VocabularyEditFormProps) => {
  const [word, setWord] = useState(item.word);
  const [translation, setTranslation] = useState(item.translation);
  const [comment, setComment] = useState(item.comment);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!word.trim() || !translation.trim()) {
      toast({
        title: "Error",
        description: "Please fill in both word and translation",
        variant: "destructive",
      });
      return;
    }

    const updatedItem: VocabularyItem = {
      ...item,
      word: word.trim(),
      translation: translation.trim(),
      comment: comment.trim(),
    };

    onUpdate(updatedItem);
    
    toast({
      title: "Success!",
      description: "Vocabulary updated successfully",
    });
  };

  return (
    <div className="max-w-md mx-auto">
      <Button variant="ghost" onClick={onBack} className="mb-4">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to {deckName}
      </Button>
      
      <Card>
        <CardHeader>
          <CardTitle>Edit Vocabulary</CardTitle>
          <CardDescription>
            Update the vocabulary in {deckName}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="word">Word</Label>
              <Input
                id="word"
                placeholder="Enter the word"
                value={word}
                onChange={(e) => setWord(e.target.value)}
                autoFocus
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="translation">Translation</Label>
              <Input
                id="translation"
                placeholder="Enter the translation"
                value={translation}
                onChange={(e) => setTranslation(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="comment">Context/Comment (optional)</Label>
              <Input
                id="comment"
                placeholder="e.g., Used in formal settings, Common greeting"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </div>
            
            <div className="flex gap-2">
              <Button type="submit" className="flex-1">
                <Save className="w-4 h-4 mr-2" />
                Update Vocabulary
              </Button>
              <Button type="button" variant="outline" onClick={onBack}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};