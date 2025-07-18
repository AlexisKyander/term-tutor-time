import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, RotateCcw, CheckCircle, XCircle, Eye } from "lucide-react";
import { VocabularyItem } from "@/pages/Index";
import { useToast } from "@/hooks/use-toast";

interface FlashcardModeProps {
  vocabulary: VocabularyItem[];
  onBack: () => void;
}

export const FlashcardMode = ({ vocabulary, onBack }: FlashcardModeProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showTranslation, setShowTranslation] = useState(false);
  const [shuffledVocabulary, setShuffledVocabulary] = useState<VocabularyItem[]>([]);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [sessionComplete, setSessionComplete] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Shuffle vocabulary on component mount
    const shuffled = [...vocabulary].sort(() => Math.random() - 0.5);
    setShuffledVocabulary(shuffled);
  }, [vocabulary]);

  const currentCard = shuffledVocabulary[currentIndex];
  const progress = ((currentIndex + 1) / shuffledVocabulary.length) * 100;

  const handleReveal = () => {
    setShowTranslation(true);
  };

  const handleAnswer = (correct: boolean) => {
    setScore(prev => ({
      correct: prev.correct + (correct ? 1 : 0),
      total: prev.total + 1
    }));

    if (currentIndex < shuffledVocabulary.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setShowTranslation(false);
    } else {
      setSessionComplete(true);
      toast({
        title: "Session Complete!",
        description: `You scored ${score.correct + (correct ? 1 : 0)} out of ${score.total + 1}`,
      });
    }
  };

  const resetSession = () => {
    const shuffled = [...vocabulary].sort(() => Math.random() - 0.5);
    setShuffledVocabulary(shuffled);
    setCurrentIndex(0);
    setShowTranslation(false);
    setScore({ correct: 0, total: 0 });
    setSessionComplete(false);
  };

  if (!currentCard && !sessionComplete) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">Loading flashcards...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (sessionComplete) {
    const percentage = Math.round((score.correct / score.total) * 100);
    
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Overview
        </Button>

        <Card className="text-center">
          <CardContent className="pt-8 pb-8">
            <div className="space-y-6">
              <div className="text-6xl">
                {percentage >= 80 ? "🎉" : percentage >= 60 ? "👍" : "📚"}
              </div>
              <div>
                <h2 className="text-3xl font-bold mb-2">Session Complete!</h2>
                <p className="text-xl text-muted-foreground">
                  You scored {score.correct} out of {score.total} ({percentage}%)
                </p>
              </div>
              <div className="flex gap-4 justify-center">
                <Button onClick={resetSession} className="flex-1 max-w-48">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Study Again
                </Button>
                <Button variant="outline" onClick={onBack} className="flex-1 max-w-48">
                  Back to Menu
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Overview
        </Button>
        <div className="text-sm text-muted-foreground">
          {currentIndex + 1} of {shuffledVocabulary.length}
        </div>
      </div>

      <div className="space-y-4">
        <Progress value={progress} className="h-2" />
        <div className="text-center text-sm text-muted-foreground">
          Score: {score.correct}/{score.total}
        </div>
      </div>

      <Card className="min-h-[300px] flex items-center justify-center">
        <CardContent className="w-full text-center space-y-8">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground uppercase tracking-wider">
              {currentCard.language}
            </p>
            <h2 className="text-4xl font-bold">{currentCard.word}</h2>
          </div>

          {showTranslation ? (
            <div className="space-y-6">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground uppercase tracking-wider">
                  {currentCard.targetLanguage}
                </p>
                <h3 className="text-3xl font-semibold text-primary">
                  {currentCard.translation}
                </h3>
              </div>
              
              <div className="flex gap-4 justify-center">
                <Button 
                  onClick={() => handleAnswer(false)}
                  variant="outline"
                  className="flex-1 max-w-32 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Wrong
                </Button>
                <Button 
                  onClick={() => handleAnswer(true)}
                  className="flex-1 max-w-32 bg-success hover:bg-success/90 text-success-foreground"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Correct
                </Button>
              </div>
            </div>
          ) : (
            <Button onClick={handleReveal} size="lg" className="w-full max-w-48">
              <Eye className="w-4 h-4 mr-2" />
              Reveal Translation
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};