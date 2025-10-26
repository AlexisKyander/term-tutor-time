import { useState, useEffect, useRef } from "react";
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
  const [clozeAnswers, setClozeAnswers] = useState<string[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [shuffledVocabulary, setShuffledVocabulary] = useState<VocabularyItem[]>([]);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [sessionComplete, setSessionComplete] = useState(false);
  const [repetitionCount, setRepetitionCount] = useState<Record<string, { incorrect: number, almostCorrect: number }>>({});
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize cloze answers when card changes
  useEffect(() => {
    if (currentCard?.exerciseType === 'cloze-test' && currentCard.clozeAnswers) {
      setClozeAnswers(Array(currentCard.clozeAnswers.length).fill(""));
    }
  }, [currentIndex]);

  useEffect(() => {
    // Create study deck - each word appears once at the start of each session
    const studyDeck: VocabularyItem[] = [...vocabulary];
    
    // Shuffle the study deck
    const shuffled = studyDeck.sort(() => Math.random() - 0.5);
    setShuffledVocabulary(shuffled);
  }, []);

  // Auto-focus input when card changes or when returning to input mode
  useEffect(() => {
    if (!showResult && !sessionComplete && inputRef.current) {
      inputRef.current.focus();
    }
  }, [currentIndex, showResult, sessionComplete]);

  // Handle Enter key when showing result
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && showResult) {
        nextCard();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showResult, currentIndex, shuffledVocabulary.length]);

  const currentCard = shuffledVocabulary[currentIndex];
  const progress = ((currentIndex + 1) / shuffledVocabulary.length) * 100;

  const normalizeText = (text: string | undefined) => {
    return (text || '').toLowerCase().trim();
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
    // For cloze tests, check all answers
    if (currentCard.exerciseType === 'cloze-test') {
      if (clozeAnswers.some(a => !a.trim())) return;
      
      const correctAnswers = currentCard.clozeAnswers || [];
      let allCorrect = true;
      
      for (let i = 0; i < correctAnswers.length; i++) {
        const userAns = normalizeText(clozeAnswers[i]);
        const correctAns = normalizeText(correctAnswers[i]);
        
        if (userAns !== correctAns) {
          allCorrect = false;
        }
      }
      
      setIsCorrect(allCorrect);
      setShowResult(true);
      
      // Explicitly set to false for cloze tests to prevent showing "almost correct"
      (window as any).isAlmostCorrect = false;
      
      const result = allCorrect ? 'correct' : 'incorrect';
      onUpdateStatistics(currentCard.id, result);
      
      setScore(prev => ({
        correct: prev.correct + (allCorrect ? 1 : 0),
        total: prev.total + 1
      }));
      
      (document.activeElement as HTMLElement)?.blur();
      return;
    }
    
    if (!userAnswer.trim()) return;
    
    // For grammar exercises, check against the answer field
    const correctAnswer = currentCard.type === 'grammar-exercise' 
      ? currentCard.answer || ''
      : direction === 'forward' ? currentCard.translation : currentCard.word;
    
    // Split by "/" to handle multiple valid answers
    const validAnswers = correctAnswer.split('/').map(ans => normalizeText(ans));
    const userAnswers = userAnswer.split('/').map(ans => normalizeText(ans));
    
    // Check if all user answers are valid (match at least one correct answer)
    const allUserAnswersValid = userAnswers.every(userAns => 
      validAnswers.some(validAns => userAns === validAns)
    );
    
    const correct = allUserAnswersValid && userAnswers.length > 0;
    
    let isAlmostCorrect = false;
    if (!correct && userAnswers.length === 1 && userAnswers[0].length > 2) {
      // Check edit distance against all valid answers
      const editDistances = validAnswers.map(validAns => ({
        distance: getEditDistance(userAnswers[0], validAns),
        maxLength: Math.max(userAnswers[0].length, validAns.length)
      }));
      
      // Find the closest match
      const closest = editDistances.reduce((best, current) => 
        current.distance < best.distance ? current : best
      );
      
      isAlmostCorrect = closest.distance <= 2 && (closest.distance <= 2 || closest.distance / closest.maxLength <= 0.4);
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
    // Check if we need to add the current card back to the deck
    if (showResult && !isCorrect) {
      const cardId = currentCard.id;
      const currentReps = repetitionCount[cardId] || { incorrect: 0, almostCorrect: 0 };
      const isAlmostCorrect = (window as any).isAlmostCorrect;
      
      let shouldRepeat = false;
      
      if (isAlmostCorrect && currentReps.almostCorrect < settings.almostCorrectRepetitions) {
        shouldRepeat = true;
        setRepetitionCount(prev => ({
          ...prev,
          [cardId]: { ...currentReps, almostCorrect: currentReps.almostCorrect + 1 }
        }));
      } else if (!isAlmostCorrect && currentReps.incorrect < settings.incorrectRepetitions) {
        shouldRepeat = true;
        setRepetitionCount(prev => ({
          ...prev,
          [cardId]: { ...currentReps, incorrect: currentReps.incorrect + 1 }
        }));
      }
      
      if (shouldRepeat) {
        // Add card back to deck at a random position after current index
        setShuffledVocabulary(prev => {
          const remaining = prev.slice(currentIndex + 1);
          const randomIndex = Math.floor(Math.random() * (remaining.length + 1));
          const newDeck = [
            ...prev.slice(0, currentIndex + 1),
            ...remaining.slice(0, randomIndex),
            currentCard,
            ...remaining.slice(randomIndex)
          ];
          return newDeck;
        });
      }
    }
    
    if (currentIndex < shuffledVocabulary.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setUserAnswer("");
      setClozeAnswers([]);
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
    // Recreate study deck - fresh start for each session
    const studyDeck: VocabularyItem[] = [...vocabulary];
    
    const shuffled = studyDeck.sort(() => Math.random() - 0.5);
    setShuffledVocabulary(shuffled);
    setCurrentIndex(0);
    setUserAnswer("");
    setClozeAnswers([]);
    setShowResult(false);
    setScore({ correct: 0, total: 0 });
    setSessionComplete(false);
    setRepetitionCount({});
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
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
          {currentCard.type === 'grammar-exercise' && currentCard.exerciseDescription && (
            <div className="p-4 bg-muted/30 rounded-lg mb-4">
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {currentCard.exerciseDescription}
              </p>
            </div>
          )}
          
          <div className="space-y-2">
            {currentCard.type === 'grammar-exercise' ? (
              <>
                <p className="text-sm text-muted-foreground uppercase tracking-wider">
                  Question
                </p>
                {currentCard.exerciseType === 'cloze-test' && currentCard.clozeText ? (
                  <div className="text-2xl font-bold whitespace-pre-wrap leading-relaxed">
                    {(() => {
                      let blankCounter = -1;
                      return currentCard.clozeText!.split(/(\*+)/).map((part, i) => {
                        if (/^\*+$/.test(part)) {
                          blankCounter++;
                          const idx = blankCounter;
                          return (
                            <span key={i} className="inline-flex items-center mx-1 align-baseline">
                              {showResult ? (
                                <span className={`px-2 py-1 rounded ${
                                  normalizeText(clozeAnswers[idx]) === normalizeText(currentCard.clozeAnswers?.[idx] || '') 
                                    ? 'bg-green-100 text-green-700 font-semibold' 
                                    : 'bg-red-100 text-red-700 font-semibold'
                                }`}>
                                  {clozeAnswers[idx] || '_____'}
                                </span>
                              ) : (
                                <Input
                                  value={clozeAnswers[idx] || ''}
                                  onChange={(e) => {
                                    const newAnswers = [...clozeAnswers];
                                    newAnswers[idx] = e.target.value;
                                    setClozeAnswers(newAnswers);
                                  }}
                                  onKeyDown={handleKeyPress}
                                  placeholder=""
                                  className="inline-block w-28 h-9 text-lg text-center px-2 py-1"
                                  disabled={showResult}
                                />
                              )}
                            </span>
                          );
                        }
                        return <span key={i}>{part}</span>;
                      });
                    })()}
                  </div>
                ) : (
                  <h2 className="text-2xl font-bold whitespace-pre-wrap">
                    {currentCard.question}
                  </h2>
                )}
              </>
            ) : (
              <>
                <p className="text-sm text-muted-foreground uppercase tracking-wider">
                  {direction === 'forward' ? currentCard.language : currentCard.targetLanguage}
                </p>
                <h2 className="text-4xl font-bold">
                  {direction === 'forward' ? currentCard.word : currentCard.translation}
                </h2>
              </>
            )}
          </div>

          <div className="space-y-6">
            {currentCard.exerciseType === 'cloze-test' ? (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground uppercase tracking-wider">
                  Fill in the blanks above
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground uppercase tracking-wider">
                  {currentCard.type === 'grammar-exercise' 
                    ? 'Your Answer' 
                    : `Translate to ${direction === 'forward' ? currentCard.targetLanguage : currentCard.language}`}
                </p>
                <Input
                  ref={inputRef}
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your answer..."
                  className="text-center text-lg h-12"
                  disabled={showResult}
                />
              </div>
            )}

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
                  {currentCard.exerciseType === 'cloze-test' && currentCard.clozeAnswers ? (
                    <div className="space-y-2">
                      {currentCard.clozeAnswers.map((correctAns, idx) => {
                        const userAns = clozeAnswers[idx] || '';
                        const isBlankCorrect = normalizeText(userAns) === normalizeText(correctAns);
                        
                        return (
                          <div key={idx} className="flex items-center justify-center gap-2 text-sm">
                            <span className="text-muted-foreground">Blank {idx + 1}:</span>
                            <span className={`px-2 py-1 rounded font-semibold ${
                              isBlankCorrect 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-red-100 text-red-700'
                            }`}>
                              {userAns}
                            </span>
                            {!isBlankCorrect && (
                              <>
                                <span className="text-muted-foreground">→</span>
                                <span className="px-2 py-1 rounded font-semibold bg-green-100 text-green-700">
                                  {correctAns}
                                </span>
                              </>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <>
                      <p className="text-center">
                        <span className="text-muted-foreground">Your answer: </span>
                        <span className="font-semibold">{userAnswer}</span>
                      </p>
                      {!isCorrect && (
                        <div className="text-center mt-2">
                          <span className="text-muted-foreground">Correct answer: </span>
                          <span className="font-semibold whitespace-pre-wrap">
                            {currentCard.type === 'grammar-exercise' 
                              ? currentCard.answer 
                              : direction === 'forward' ? currentCard.translation : currentCard.word}
                          </span>
                        </div>
                      )}
                    </>
                  )}
                </div>
                
                {(currentCard.comment || currentCard.image) && (
                  <div className="p-3 bg-muted/30 rounded-lg space-y-2">
                    {currentCard.comment && (
                      <p className="text-sm text-muted-foreground italic">
                        Context: {currentCard.comment}
                      </p>
                    )}
                    {currentCard.image && (
                      <img 
                        src={currentCard.image} 
                        alt="Context" 
                        className="w-full max-h-48 object-contain rounded-md"
                      />
                    )}
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
                disabled={currentCard.exerciseType === 'cloze-test' ? clozeAnswers.some(a => !a.trim()) : !userAnswer.trim()}
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