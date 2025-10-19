import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Save, Image as ImageIcon, X } from "lucide-react";
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
  const [image, setImage] = useState<string>(item.image || "");
  const [title, setTitle] = useState(item.title || "");
  const [rule, setRule] = useState(item.rule || "");
  const { toast } = useToast();
  
  const isGrammarRule = item.type === 'grammar-rule';

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImage("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isGrammarRule) {
      if (!title.trim() || !rule.trim()) {
        toast({
          title: "Error",
          description: "Please fill in both title and grammar rule",
          variant: "destructive",
        });
        return;
      }

      const updatedItem: VocabularyItem = {
        ...item,
        title: title.trim(),
        rule: rule.trim(),
      };

      onUpdate(updatedItem);
      
      toast({
        title: "Success!",
        description: "Grammar rule updated successfully",
      });
    } else {
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
        image: image || undefined,
      };

      onUpdate(updatedItem);
      
      toast({
        title: "Success!",
        description: "Vocabulary updated successfully",
      });
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <Button variant="ghost" onClick={onBack} className="mb-4">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to {deckName}
      </Button>
      
      <Card>
        <CardHeader>
          <CardTitle>Edit {isGrammarRule ? 'Grammar Rule' : 'Vocabulary'}</CardTitle>
          <CardDescription>
            Update the {isGrammarRule ? 'grammar rule' : 'vocabulary'} in {deckName}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {isGrammarRule ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    placeholder="Enter the grammar rule title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    autoFocus
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="rule">Grammar Rule</Label>
                  <Textarea
                    id="rule"
                    placeholder="Enter the grammar rule (you can use markdown for tables)"
                    value={rule}
                    onChange={(e) => setRule(e.target.value)}
                    className="min-h-[200px]"
                  />
                  <p className="text-xs text-muted-foreground">
                    Tip: You can format tables using markdown syntax
                  </p>
                </div>
              </>
            ) : (
              <>
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

                <div className="space-y-2">
                  <Label htmlFor="image">Image (optional)</Label>
                  <div className="space-y-2">
                    {image ? (
                      <div className="relative">
                        <img src={image} alt="Preview" className="w-full h-32 object-cover rounded-md" />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={removeImage}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Input
                          id="image"
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                        <Label
                          htmlFor="image"
                          className="flex items-center gap-2 px-4 py-2 border rounded-md cursor-pointer hover:bg-accent"
                        >
                          <ImageIcon className="w-4 h-4" />
                          Upload Image
                        </Label>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
            
            <div className="flex gap-2">
              <Button type="submit" className="flex-1">
                <Save className="w-4 h-4 mr-2" />
                Update {isGrammarRule ? 'Grammar Rule' : 'Vocabulary'}
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