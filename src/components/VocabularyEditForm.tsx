import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowLeft, Save, Image as ImageIcon, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
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
  const [clozeText, setClozeText] = useState(item.clozeText || "");
  const [clozeAnswers, setClozeAnswers] = useState<string[]>(item.clozeAnswers || []);
  const [exerciseDescription, setExerciseDescription] = useState(item.exerciseDescription || "");
  const [exerciseType, setExerciseType] = useState<'regular' | 'cloze-test'>(item.exerciseType || 'cloze-test');
  const [question, setQuestion] = useState(item.question || "");
  const [answer, setAnswer] = useState(item.answer || "");
  const [clozeInputMode, setClozeInputMode] = useState<'individual' | 'running-text'>(item.clozeInputMode || 'running-text');
  
  // Initialize running text from existing answers
  const initializeRunningText = (answers: string[]) => {
    return answers.map((ans, idx) => `(${idx + 1}) ${ans}`).join(" ");
  };
  
  const [clozeRunningText, setClozeRunningText] = useState(
    item.clozeAnswers && item.clozeAnswers.length > 0 ? initializeRunningText(item.clozeAnswers) : ""
  );
  const { toast } = useToast();
  
  const isGrammarRule = item.type === 'grammar-rule';
  const isGrammarExercise = item.type === 'grammar-exercise';
  
  // Extract answer count from cloze text
  const extractAnswerCount = (text: string): number => {
    const matches = text.match(/\(\d+\)/g);
    return matches ? matches.length : 0;
  };
  
  const answerCount = extractAnswerCount(clozeText);

  // Update cloze answers array when cloze text changes
  const updateClozeAnswerFields = (text: string) => {
    const count = extractAnswerCount(text);
    setClozeAnswers(prev => {
      if (count > prev.length) {
        return [...prev, ...Array(count - prev.length).fill("")];
      } else if (count < prev.length) {
        return prev.slice(0, count);
      }
      return prev;
    });
  };

  // Handle mode switching - sync data between modes
  const handleModeChange = (newMode: 'individual' | 'running-text') => {
    if (newMode === 'running-text' && clozeInputMode === 'individual') {
      // Converting from individual to running text - populate running text from individual answers
      const runningText = clozeAnswers.map((ans, idx) => `(${idx + 1}) ${ans}`).join(" ");
      setClozeRunningText(runningText);
    } else if (newMode === 'individual' && clozeInputMode === 'running-text') {
      // Converting from running text to individual - parse running text into individual answers
      const parsedAnswers = clozeRunningText
        .split(/\(\d+\)/)
        .filter(part => part.trim())
        .map(answer => answer.trim());
      setClozeAnswers(parsedAnswers);
    }
    setClozeInputMode(newMode);
  };

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
    } else if (isGrammarExercise) {
      if (exerciseType === 'cloze-test') {
        // Parse answers from running text if needed
        let finalAnswers = clozeAnswers;
        if (clozeInputMode === 'running-text') {
          finalAnswers = clozeRunningText
            .split(/\(\d+\)/)
            .filter(part => part.trim())
            .map(answer => answer.trim());
        }

        if (!title.trim() || !clozeText.trim()) {
          toast({
            title: "Error",
            description: "Please fill in title and question text",
            variant: "destructive",
          });
          return;
        }

        const requiredAnswers = extractAnswerCount(clozeText);
        const filledAnswers = finalAnswers.filter(a => a.trim()).length;

        if (filledAnswers < requiredAnswers) {
          toast({
            title: "Error",
            description: `Please fill in all ${requiredAnswers} answers`,
            variant: "destructive",
          });
          return;
        }

        const updatedItem: VocabularyItem = {
          ...item,
          exerciseType: 'cloze-test',
          title: title.trim(),
          clozeText: clozeText.trim(),
          clozeAnswers: finalAnswers.slice(0, requiredAnswers).map(a => a.trim()),
          exerciseDescription: exerciseDescription.trim(),
          clozeInputMode,
        };

        onUpdate(updatedItem);
        
        toast({
          title: "Success!",
          description: "Grammar exercise updated successfully",
        });
      } else {
        if (!title.trim() || !question.trim() || !answer.trim()) {
          toast({
            title: "Error",
            description: "Please fill in title, question, and answer",
            variant: "destructive",
          });
          return;
        }

        const updatedItem: VocabularyItem = {
          ...item,
          exerciseType: 'regular',
          title: title.trim(),
          exerciseDescription: exerciseDescription.trim(),
          question: question.trim(),
          answer: answer.trim(),
          clozeInputMode: undefined,
        };

        onUpdate(updatedItem);
        
        toast({
          title: "Success!",
          description: "Grammar exercise updated successfully",
        });
      }
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
          <CardTitle>Edit {isGrammarRule ? 'Grammar Rule' : isGrammarExercise ? 'Grammar Exercise' : 'Vocabulary'}</CardTitle>
          <CardDescription>
            Update the {isGrammarRule ? 'grammar rule' : isGrammarExercise ? 'grammar exercise' : 'vocabulary'} in {deckName}
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
                    placeholder="Enter the grammar rule (supports markdown: **bold**, *italic*, tables, etc.)"
                    value={rule}
                    onChange={(e) => setRule(e.target.value)}
                    className="min-h-[200px]"
                  />
                  <p className="text-xs text-muted-foreground">
                    Tip: Use markdown for formatting - **bold**, *italic*, and tables with | pipes |
                  </p>
                  <div className="mt-4">
                    <p className="text-xs text-muted-foreground mb-2">Live preview</p>
                    <div className="prose prose-sm max-w-none dark:prose-invert prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-em:text-foreground">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {rule || "Type markdown above to see a preview."}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>
              </>
            ) : isGrammarExercise ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="exerciseTitle">Exercise Title</Label>
                  <Input
                    id="exerciseTitle"
                    placeholder="Enter a title for this exercise"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    autoFocus
                  />
                </div>

                <div className="space-y-2">
                  <Label>Exercise Type</Label>
                  <RadioGroup value={exerciseType} onValueChange={(value) => setExerciseType(value as 'regular' | 'cloze-test')}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="regular" id="regular" />
                      <Label htmlFor="regular" className="font-normal cursor-pointer">Regular Question</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="cloze-test" id="cloze-test" />
                      <Label htmlFor="cloze-test" className="font-normal cursor-pointer">Cloze Test</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="exerciseDescription">Question Instructions</Label>
                  <Textarea
                    id="exerciseDescription"
                    placeholder="Enter instructions for this exercise"
                    value={exerciseDescription}
                    onChange={(e) => setExerciseDescription(e.target.value)}
                    className="min-h-[80px]"
                  />
                  <p className="text-xs text-muted-foreground">
                    This description will be shown at the top of the card
                  </p>
                </div>

                {exerciseType === 'cloze-test' ? (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="clozeText">Question Text</Label>
                      <Textarea
                        id="clozeText"
                        placeholder="Enter text with (1), (2), (3) for blanks"
                        value={clozeText}
                        onChange={(e) => {
                          setClozeText(e.target.value);
                          updateClozeAnswerFields(e.target.value);
                        }}
                        className="min-h-[120px]"
                      />
                      <p className="text-xs text-muted-foreground">
                        Use (1) for the first blank, (2) for the second, (3) for the third, etc.
                      </p>
                    </div>

                    {answerCount > 0 && (
                      <div className="space-y-2">
                        <Label>Answer Input Method</Label>
                        <RadioGroup value={clozeInputMode} onValueChange={handleModeChange}>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="individual" id="individual" />
                            <Label htmlFor="individual" className="font-normal cursor-pointer">Individual Boxes</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="running-text" id="running-text" />
                            <Label htmlFor="running-text" className="font-normal cursor-pointer">Running Text</Label>
                          </div>
                        </RadioGroup>
                      </div>
                    )}

                    {answerCount > 0 && clozeInputMode === 'individual' && (
                      <div className="space-y-2">
                        <Label>Answers</Label>
                        {Array.from({ length: answerCount }, (_, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <span className="text-sm font-medium w-8">({i + 1})</span>
                            <Input
                              placeholder={`Answer for blank ${i + 1}`}
                              value={clozeAnswers[i] || ""}
                              onChange={(e) => {
                                const newAnswers = [...clozeAnswers];
                                newAnswers[i] = e.target.value;
                                setClozeAnswers(newAnswers);
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    )}

                    {answerCount > 0 && clozeInputMode === 'running-text' && (
                      <div className="space-y-2">
                        <Label htmlFor="clozeRunningText">Answers (Running Text)</Label>
                        <Textarea
                          id="clozeRunningText"
                          placeholder="(1) first answer (2) second answer (3) third answer"
                          value={clozeRunningText}
                          onChange={(e) => setClozeRunningText(e.target.value)}
                          rows={3}
                        />
                        <p className="text-xs text-muted-foreground">
                          Use (1), (2), (3) etc. to separate answers. Whitespace at the beginning and end will be trimmed.
                        </p>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="question">Question</Label>
                      <Textarea
                        id="question"
                        placeholder="Enter the question"
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
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
                )}
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
                Update {isGrammarRule ? 'Grammar Rule' : isGrammarExercise ? 'Grammar Exercise' : 'Vocabulary'}
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