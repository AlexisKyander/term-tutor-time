import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowLeft, Plus, Image as ImageIcon, X } from "lucide-react";
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
  question?: string;
  answer?: string;
  language: string;
  targetLanguage: string;
  deckId: string;
  createdAt: Date;
}

interface VocabularyFormProps {
  onAdd: (item: { word: string; translation: string; comment: string; image?: string; type?: 'practice' | 'grammar-rule' | 'grammar-exercise'; title?: string; rule?: string; exerciseDescription?: string; question?: string; answer?: string; deckId: string }) => void;
  onBack: () => void;
  deckName: string;
  deckId: string;
  categoryId?: string;
  deckType?: 'exercises' | 'grammar-rules' | 'grammar-exercises';
  existingExerciseDescription?: string;
}

export const VocabularyForm = ({ onAdd, onBack, deckName, deckId, categoryId, deckType, existingExerciseDescription }: VocabularyFormProps) => {
  const [cardType, setCardType] = useState<'practice' | 'grammar-rule' | 'grammar-exercise'>(
    deckType === 'grammar-rules' ? 'grammar-rule' : 
    deckType === 'grammar-exercises' ? 'grammar-exercise' : 'practice'
  );
  const [word, setWord] = useState("");
  const [translation, setTranslation] = useState("");
  const [comment, setComment] = useState("");
  const [image, setImage] = useState<string>("");
  const [title, setTitle] = useState("");
  const [rule, setRule] = useState("");
  const [exerciseDescription, setExerciseDescription] = useState(existingExerciseDescription || "");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const { toast } = useToast();

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
    
    if (cardType === 'grammar-rule') {
      if (!title.trim() || !rule.trim()) {
        toast({
          title: "Error",
          description: "Please fill in both title and grammar rule",
          variant: "destructive",
        });
        return;
      }

      onAdd({
        word: "",
        translation: "",
        comment: "",
        type: 'grammar-rule',
        title: title.trim(),
        rule: rule.trim(),
        deckId,
      });
      setTitle("");
      setRule("");
      
      toast({
        title: "Success!",
        description: "Grammar rule added successfully",
      });
    } else if (cardType === 'grammar-exercise') {
      if (!exerciseDescription.trim() || !question.trim() || !answer.trim()) {
        toast({
          title: "Error",
          description: "Please fill in exercise description, question, and answer",
          variant: "destructive",
        });
        return;
      }

      onAdd({
        word: "",
        translation: "",
        comment: "",
        type: 'grammar-exercise',
        exerciseDescription: exerciseDescription.trim(),
        question: question.trim(),
        answer: answer.trim(),
        deckId,
      });
      // Keep exercise description for next card, reset question and answer
      setQuestion("");
      setAnswer("");
      
      toast({
        title: "Success!",
        description: "Grammar exercise added successfully",
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

      onAdd({
        word: word.trim(),
        translation: translation.trim(),
        comment: comment.trim(),
        image: image || undefined,
        type: 'practice',
        deckId,
      });
      setWord("");
      setTranslation("");
      setComment("");
      setImage("");
      
      toast({
        title: "Success!",
        description: "Vocabulary added successfully",
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
          <CardTitle>Add New {categoryId === 'grammar' ? 'Card' : 'Vocabulary'}</CardTitle>
          <CardDescription>
            Add a new {categoryId === 'grammar' ? 'card' : 'word and its translation'} to {deckName}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {categoryId === 'grammar' && deckType !== 'grammar-rules' && deckType !== 'grammar-exercises' && (
              <div className="space-y-2">
                <Label>Card Type</Label>
                <RadioGroup value={cardType} onValueChange={(value) => setCardType(value as 'practice' | 'grammar-rule')}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="practice" id="practice" />
                    <Label htmlFor="practice" className="font-normal cursor-pointer">Practice</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="grammar-rule" id="grammar-rule" />
                    <Label htmlFor="grammar-rule" className="font-normal cursor-pointer">Grammar Rule</Label>
                  </div>
                </RadioGroup>
              </div>
            )}

            {cardType === 'grammar-rule' ? (
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
                    className="min-h-[300px]"
                  />
                  <p className="text-xs text-muted-foreground">
                    Tip: You can format tables using markdown syntax
                  </p>
                </div>
              </>
            ) : cardType === 'grammar-exercise' ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="exerciseDescription">Exercise Description</Label>
                  <Textarea
                    id="exerciseDescription"
                    placeholder="Describe the exercise (this will be prefilled for subsequent cards)"
                    value={exerciseDescription}
                    onChange={(e) => setExerciseDescription(e.target.value)}
                    autoFocus={!existingExerciseDescription}
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground">
                    This description will be shown at the top of every card and will be prefilled for the next cards
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="question">Question</Label>
                  <Textarea
                    id="question"
                    placeholder="Enter the question"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    autoFocus={!!existingExerciseDescription}
                    rows={2}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="answer">Answer</Label>
                  <Textarea
                    id="answer"
                    placeholder="Enter the answer"
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    rows={2}
                  />
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
                <Plus className="w-4 h-4 mr-2" />
                Add {cardType === 'grammar-rule' ? 'Grammar Rule' : cardType === 'grammar-exercise' ? 'Exercise Card' : 'Vocabulary'}
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