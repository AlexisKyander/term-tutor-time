import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { ArrowLeft, RotateCcw, CheckCircle, XCircle } from "lucide-react";
import { VocabularyItem } from "@/pages/Index";
import { StudySettings } from "@/components/Settings";
import { useToast } from "@/hooks/use-toast";

interface FlashcardModeProps {
  vocabulary: VocabularyItem[];
  settings: StudySettings;
  onBack: () => void;
  onUpdateStatistics: (vocabularyId: string, result: 'correct' | 'almostCorrect' | 'incorrect') => void;
  direction: 'forward' | 'reverse';
}

export const FlashcardMode = ({ vocabulary, settings, onBack, onUpdateStatistics, direction }: FlashcardModeProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [shuffledVocabulary, setShuffledVocabulary] = useState<VocabularyItem[]>([]);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [sessionComplete, setSessionComplete] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Create study deck with repetitions based on settings
    const studyDeck: VocabularyItem[] = [];
    
    vocabulary.forEach(item => {
      // Always include the item once
      studyDeck.push(item);

      // Add repetitions for items with correct answers
      for (let i = 0; i < item.statistics.correct * settings.correctRepetitions; i++) {
        studyDeck.push(item);
      }
      
      // Add repetitions for items with incorrect answers
      for (let i = 0; i < item.statistics.incorrect * settings.incorrectRepetitions; i++) {
        studyDeck.push(item);
      }
      
      // Add repetitions for items with almost correct answers
      for (let i = 0; i < item.statistics.almostCorrect * settings.almostCorrectRepetitions; i++) {
        studyDeck.push(item);
      }
    });
    
    // Shuffle the study deck
    const shuffled = studyDeck.sort(() => Math.random() - 0.5);
    setShuffledVocabulary(shuffled);
  }, [vocabulary, settings]);

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
    const correctAnswer = direction === 'forward' ? currentCard.translation : currentCard.word;
    const normalizedCorrect = normalizeText(correctAnswer);
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
    
    // Update statistics
    const result = correct ? 'correct' : isAlmostCorrect ? 'almostCorrect' : 'incorrect';
    onUpdateStatistics(currentCard.id, result);
    
    setScore(prev => ({
      correct: prev.correct + (correct ? 1 : 0),
      total: prev.total + 1
    }));

    // Clear focus to prevent accidental Enter press from advancing immediately
    (document.activeElement as HTMLElement)?.blur();
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
    // Recreate study deck with current statistics
    const studyDeck: VocabularyItem[] = [];
    
    vocabulary.forEach(item => {
      studyDeck.push(item);

      for (let i = 0; i < item.statistics.correct * settings.correctRepetitions; i++) {
        studyDeck.push(item);
      }
      
      for (let i = 0; i < item.statistics.incorrect * settings.incorrectRepetitions; i++) {
        studyDeck.push(item);
      }
      
      for (let i = 0; i < item.statistics.almostCorrect * settings.almostCorrectRepetitions; i++) {
        studyDeck.push(item);
      }
    });
    
    const shuffled = studyDeck.sort(() => Math.random() - 0.5);
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
              {direction === 'forward' ? currentCard.language : currentCard.targetLanguage}
            </p>
            <h2 className="text-4xl font-bold">
              {direction === 'forward' ? currentCard.word : currentCard.translation}
            </h2>
          </div>

          <div className="space-y-6">
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground uppercase tracking-wider">
                Translate to {direction === 'forward' ? currentCard.targetLanguage : currentCard.language}
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
                  <p className="text-center">
                    <span className="text-muted-foreground">Your answer: </span>
                    <span className="font-semibold">{userAnswer}</span>
                  </p>
                  {!isCorrect && (
                    <p className="text-center mt-2">
                      <span className="text-muted-foreground">Correct answer: </span>
                      <span className="font-semibold">
                        {direction === 'forward' ? currentCard.translation : currentCard.word}
                      </span>
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