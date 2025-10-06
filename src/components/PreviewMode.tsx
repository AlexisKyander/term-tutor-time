import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, RotateCcw } from "lucide-react";
import { VocabularyItem } from "@/pages/Index";

interface PreviewModeProps {
  vocabulary: VocabularyItem[];
  delay: number;
  order: 'original' | 'random';
  onBack: () => void;
}

export const PreviewMode = ({ vocabulary, delay, order, onBack }: PreviewModeProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showTranslation, setShowTranslation] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(false);

  const orderedVocabulary = useMemo(() => {
    if (order === 'random') {
      return [...vocabulary].sort(() => Math.random() - 0.5);
    }
    return vocabulary;
  }, [vocabulary, order]);

  useEffect(() => {
    if (orderedVocabulary.length > 0 && !showTranslation && !sessionComplete) {
      const timer = setTimeout(() => {
        setShowTranslation(true);
      }, delay * 1000);

      return () => clearTimeout(timer);
    }
  }, [currentIndex, showTranslation, delay, orderedVocabulary.length, sessionComplete]);

  const handleShowAnswer = () => {
    setShowTranslation(true);
  };

  const currentCard = orderedVocabulary[currentIndex];
  const progress = ((currentIndex + 1) / orderedVocabulary.length) * 100;

  const nextCard = () => {
    if (currentIndex < orderedVocabulary.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setShowTranslation(false);
    } else {
      setSessionComplete(true);
    }
  };

  const resetSession = () => {
    setCurrentIndex(0);
    setShowTranslation(false);
    setSessionComplete(false);
  };

  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      if (showTranslation) {
        nextCard();
      }
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [showTranslation, currentIndex, orderedVocabulary.length]);

  if (!currentCard && !sessionComplete) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">Loading vocabulary...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (sessionComplete) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Overview
        </Button>

        <Card className="text-center">
          <CardContent className="pt-8 pb-8">
            <div className="space-y-6">
              <div className="text-6xl">✅</div>
              <div>
                <h2 className="text-3xl font-bold mb-2">Preview Complete!</h2>
                <p className="text-xl text-muted-foreground">
                  You reviewed {orderedVocabulary.length} words
                </p>
              </div>
              <div className="flex gap-4 justify-center">
                <Button onClick={resetSession} className="flex-1 max-w-48">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Preview Again
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

  const displayWord = currentCard.word;
  const displayTranslation = currentCard.translation;
  const displayLanguage = currentCard.language;
  const displayTargetLanguage = currentCard.targetLanguage;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Overview
        </Button>
        <div className="text-sm text-muted-foreground">
          {currentIndex + 1} of {orderedVocabulary.length}
        </div>
      </div>

      <div className="space-y-4">
        <Progress value={progress} className="h-2" />
      </div>

      <Card className="min-h-[400px] flex items-center justify-center">
        <CardContent className="w-full text-center space-y-8 py-12">
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground uppercase tracking-wider">
              {displayLanguage}
            </p>
            <h2 className="text-5xl font-bold">{displayWord}</h2>
          </div>

          {showTranslation && (
            <div className="space-y-6 animate-fade-in">
              <div className="h-px bg-border w-24 mx-auto" />
              
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground uppercase tracking-wider">
                  {displayTargetLanguage}
                </p>
                <h3 className="text-3xl font-semibold text-primary">
                  {displayTranslation}
                </h3>
              </div>

              {currentCard.comment && (
                <div className="p-4 bg-muted/30 rounded-lg max-w-md mx-auto">
                  <p className="text-sm text-muted-foreground italic">
                    {currentCard.comment}
                  </p>
                </div>
              )}

              <Button onClick={nextCard} size="lg" className="w-full max-w-48">
                {currentIndex < orderedVocabulary.length - 1 ? 'Next Word' : 'Finish'}
              </Button>
            </div>
          )}

          {!showTranslation && (
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                Translation will appear in {delay} seconds...
              </div>
              <Button onClick={handleShowAnswer} variant="outline" size="lg">
                Show Answer
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};