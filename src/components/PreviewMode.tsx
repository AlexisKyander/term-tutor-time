import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, RotateCcw } from "lucide-react";
import { VocabularyItem } from "@/pages/Index";
import { StudySettings } from "@/components/Settings";

interface PreviewModeProps {
  vocabulary: VocabularyItem[];
  settings: StudySettings;
  onBack: () => void;
  direction: 'forward' | 'reverse';
}

export const PreviewMode = ({ vocabulary, settings, onBack, direction }: PreviewModeProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showTranslation, setShowTranslation] = useState(false);
  const [shuffledVocabulary, setShuffledVocabulary] = useState<VocabularyItem[]>([]);
  const [sessionComplete, setSessionComplete] = useState(false);

  useEffect(() => {
    const shuffled = [...vocabulary].sort(() => Math.random() - 0.5);
    setShuffledVocabulary(shuffled);
  }, [vocabulary]);

  useEffect(() => {
    if (shuffledVocabulary.length > 0 && !showTranslation && !sessionComplete) {
      const timer = setTimeout(() => {
        setShowTranslation(true);
      }, settings.previewDelay * 1000);

      return () => clearTimeout(timer);
    }
  }, [currentIndex, showTranslation, settings.previewDelay, shuffledVocabulary.length, sessionComplete]);

  const currentCard = shuffledVocabulary[currentIndex];
  const progress = ((currentIndex + 1) / shuffledVocabulary.length) * 100;

  const nextCard = () => {
    if (currentIndex < shuffledVocabulary.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setShowTranslation(false);
    } else {
      setSessionComplete(true);
    }
  };

  const resetSession = () => {
    const shuffled = [...vocabulary].sort(() => Math.random() - 0.5);
    setShuffledVocabulary(shuffled);
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
  }, [showTranslation, currentIndex, shuffledVocabulary.length]);

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
                  You reviewed {shuffledVocabulary.length} words
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

  const displayWord = direction === 'forward' ? currentCard.word : currentCard.translation;
  const displayTranslation = direction === 'forward' ? currentCard.translation : currentCard.word;
  const displayLanguage = direction === 'forward' ? currentCard.language : currentCard.targetLanguage;
  const displayTargetLanguage = direction === 'forward' ? currentCard.targetLanguage : currentCard.language;

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
                {currentIndex < shuffledVocabulary.length - 1 ? 'Next Word' : 'Finish'}
              </Button>
            </div>
          )}

          {!showTranslation && (
            <div className="text-sm text-muted-foreground">
              Translation will appear in {settings.previewDelay} seconds...
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};