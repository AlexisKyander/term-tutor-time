import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { ArrowLeft, RotateCcw, CheckCircle, XCircle } from "lucide-react";
import { VocabularyItem } from "@/pages/Index";
import { useToast } from "@/hooks/use-toast";

interface FlashcardModeProps {
  vocabulary: VocabularyItem[];
  onBack: () => void;
}

export const FlashcardMode = ({ vocabulary, onBack }: FlashcardModeProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
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

  const normalizeText = (text: string) => {
    return text.toLowerCase().trim();
  };

  const getEditDistance = (str1: string, str2: string): number => {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));

    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;

    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1, // deletion
          matrix[j - 1][i] + 1, // insertion
          matrix[j - 1][i - 1] + indicator // substitution
        );
      }
    }

    return matrix[str2.length][str1.length];
  };

  const checkAnswer = () => {
    if (!userAnswer.trim()) return;
    
    const normalizedAnswer = normalizeText(userAnswer);
    const normalizedCorrect = normalizeText(currentCard.translation);
    const correct = normalizedAnswer === normalizedCorrect;
    
    let isAlmostCorrect = false;
    if (!correct && normalizedAnswer.length > 2) {
      const editDistance = getEditDistance(normalizedAnswer, normalizedCorrect);
      const maxLength = Math.max(normalizedAnswer.length, normalizedCorrect.length);
      // More lenient threshold for letter swaps and minor errors
      isAlmostCorrect = editDistance <= 2 && (editDistance <= 2 || editDistance / maxLength <= 0.4);
    }
    
    setIsCorrect(correct);
    setShowResult(true);
    
    // Store the almost correct state for display
    (window as any).isAlmostCorrect = isAlmostCorrect;
    
    setScore(prev => ({
      correct: prev.correct + (correct ? 1 : 0),
      total: prev.total + 1
    }));
  };

  const nextCard = () => {
    if (currentIndex < shuffledVocabulary.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setUserAnswer("");
      setShowResult(false);
    } else {
      setSessionComplete(true);
      toast({
        title: "Session Complete!",
        description: `You scored ${score.correct} out of ${score.total + 1}`,
      });
    }
  };

  const resetSession = () => {
    const shuffled = [...vocabulary].sort(() => Math.random() - 0.5);
    setShuffledVocabulary(shuffled);
    setCurrentIndex(0);
    setUserAnswer("");
    setShowResult(false);
    setScore({ correct: 0, total: 0 });
    setSessionComplete(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (showResult) {
        nextCard();
      } else {
        checkAnswer();
      }
    }
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

          <div className="space-y-6">
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground uppercase tracking-wider">
                Translate to {currentCard.targetLanguage}
              </p>
              <Input
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your answer..."
                className="text-center text-lg h-12"
                disabled={showResult}
              />
            </div>

            {showResult ? (
              <div className="space-y-6">
                <div className={`p-4 rounded-lg ${
                  isCorrect 
                    ? 'bg-green-50 border border-green-200' 
                    : (window as any).isAlmostCorrect 
                      ? 'bg-yellow-50 border border-yellow-200' 
                      : 'bg-red-50 border border-red-200'
                }`}>
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    {isCorrect ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (window as any).isAlmostCorrect ? (
                      <CheckCircle className="w-5 h-5 text-yellow-600" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600" />
                    )}
                    <span className={`font-semibold ${
                      isCorrect 
                        ? 'text-green-600' 
                        : (window as any).isAlmostCorrect 
                          ? 'text-yellow-600' 
                          : 'text-red-600'
                    }`}>
                      {isCorrect ? 'Correct!' : (window as any).isAlmostCorrect ? 'Almost correct!' : 'Incorrect'}
                    </span>
                  </div>
                  {!isCorrect && (
                    <p className="text-center">
                      <span className="text-muted-foreground">Correct answer: </span>
                      <span className="font-semibold">{currentCard.translation}</span>
                    </p>
                  )}
                </div>
                
                {currentCard.comment && (
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <p className="text-sm text-muted-foreground italic">
                      Context: {currentCard.comment}
                    </p>
                  </div>
                )}
                
                <Button onClick={nextCard} size="lg" className="w-full max-w-48">
                  {currentIndex < shuffledVocabulary.length - 1 ? 'Next Card' : 'Finish Session'}
                </Button>
              </div>
            ) : (
              <Button 
                onClick={checkAnswer} 
                size="lg" 
                className="w-full max-w-48"
                disabled={!userAnswer.trim()}
              >
                Check Answer
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};