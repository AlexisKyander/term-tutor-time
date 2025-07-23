import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface VocabularyFormProps {
  onAdd: (item: { word: string; translation: string; language: string; targetLanguage: string; deckId: string }) => void;
  onBack: () => void;
  deckName: string;
  deckId: string;
}

export const VocabularyForm = ({ onAdd, onBack, deckName, deckId }: VocabularyFormProps) => {
  const [word, setWord] = useState("");
  const [translation, setTranslation] = useState("");
  const [language, setLanguage] = useState("English");
  const [targetLanguage, setTargetLanguage] = useState("Spanish");
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!word.trim() || !translation.trim()) {
      toast({
        title: "Missing information",
        description: "Please fill in both the word and translation.",
        variant: "destructive",
      });
      return;
    }

    onAdd({
      word: word.trim(),
      translation: translation.trim(),
      language,
      targetLanguage,
      deckId,
    });

    toast({
      title: "Vocabulary added!",
      description: `Added "${word}" → "${translation}"`,
    });

    setWord("");
    setTranslation("");
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Button 
        variant="ghost" 
        onClick={onBack}
        className="mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to {deckName}
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Plus className="w-5 h-5 mr-2" />
            Add to {deckName}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="language">From Language</Label>
                <Input
                  id="language"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  placeholder="e.g., English"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="targetLanguage">To Language</Label>
                <Input
                  id="targetLanguage"
                  value={targetLanguage}
                  onChange={(e) => setTargetLanguage(e.target.value)}
                  placeholder="e.g., Spanish"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="word">Word</Label>
              <Input
                id="word"
                value={word}
                onChange={(e) => setWord(e.target.value)}
                placeholder="Enter the word to learn"
                className="text-lg"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="translation">Translation</Label>
              <Input
                id="translation"
                value={translation}
                onChange={(e) => setTranslation(e.target.value)}
                placeholder="Enter the translation"
                className="text-lg"
              />
            </div>

            <Button type="submit" className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Add Vocabulary
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};