import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { ArrowLeft, RotateCcw, CheckCircle, XCircle, Shuffle, Undo2, BookOpen, FileText } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { VocabularyItem } from "@/pages/Index";
import { StudySettings } from "@/components/Settings";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';

interface FlashcardModeProps {
  vocabulary: VocabularyItem[];
  settings: StudySettings;
  onBack: () => void;
  onUpdateStatistics: (vocabularyId: string, result: 'correct' | 'almostCorrect' | 'incorrect') => void;
  direction: 'forward' | 'reverse';
  availableGrammarRules?: VocabularyItem[];
  originalText?: string;
}

export const FlashcardMode = ({ vocabulary, settings, onBack, onUpdateStatistics, direction, availableGrammarRules = [], originalText }: FlashcardModeProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [clozeAnswers, setClozeAnswers] = useState<string[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [shuffledVocabulary, setShuffledVocabulary] = useState<VocabularyItem[]>([]);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [sessionComplete, setSessionComplete] = useState(false);
  const [repetitionCount, setRepetitionCount] = useState<Record<string, { incorrect: number, almostCorrect: number }>>({});
  const [originalClozeState, setOriginalClozeState] = useState<{ text: string, answers: string[] } | null>(null);
  const [viewingGrammarRule, setViewingGrammarRule] = useState<VocabularyItem | null>(null);
  const [viewingOriginalText, setViewingOriginalText] = useState(false);
  const [checkAsYouGo, setCheckAsYouGo] = useState(false);
  const [clozeAnswerStatus, setClozeAnswerStatus] = useState<('unchecked' | 'correct' | 'incorrect')[]>([]);
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const clozeInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const checkAnswerButtonRef = useRef<HTMLButtonElement | null>(null);
  const currentCard = shuffledVocabulary[currentIndex];

  // Initialize cloze answers when card changes
  useEffect(() => {
    if (currentCard?.exerciseType === 'cloze-test' && currentCard.clozeAnswers) {
      setClozeAnswers(Array(currentCard.clozeAnswers.length).fill(""));
      setClozeAnswerStatus(Array(currentCard.clozeAnswers.length).fill('unchecked'));
      clozeInputRefs.current = Array(currentCard.clozeAnswers.length).fill(null);
    }
  }, [currentIndex, currentCard?.id, currentCard?.exerciseType, currentCard?.clozeAnswers?.length]);

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
      if (e.key !== 'Enter') return;

      const target = e.target as HTMLElement | null;
      const tag = (target?.tagName || '').toLowerCase();
      const isFormField = tag === 'input' || tag === 'textarea' || tag === 'select' || (target as any)?.isContentEditable;
      if (isFormField) return; // Don't advance when Enter originates from an input/field

      if (showResult) {
        nextCard();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showResult, currentIndex, shuffledVocabulary.length]);

  const progress = ((currentIndex + 1) / shuffledVocabulary.length) * 100;

  const normalizeText = (text: string | undefined) => {
    return (text || '')
      .toLowerCase()
      .trim()
      .replace(/\.+$/, '')
      // Normalize all apostrophe/quote variants to ASCII apostrophe
      .replace(/[\u2018\u2019\u0060\u00B4\u02BC\u2032]/g, "'");
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
      let correctCount = 0;
      
      for (let i = 0; i < correctAnswers.length; i++) {
        const userAns = normalizeText(clozeAnswers[i]);
        const correctAns = normalizeText(correctAnswers[i]);
        
        if (userAns === correctAns) {
          correctCount++;
        }
      }
      
      const allCorrect = correctCount === correctAnswers.length;
      setIsCorrect(allCorrect);
      setShowResult(true);
      
      // Explicitly set to false for cloze tests to prevent showing "almost correct"
      (window as any).isAlmostCorrect = false;
      
      const result = allCorrect ? 'correct' : 'incorrect';
      onUpdateStatistics(currentCard.id, result);
      
      setScore(prev => ({
        correct: prev.correct + correctCount,
        total: prev.total + correctAnswers.length
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
      setClozeAnswerStatus([]);
      setShowResult(false);
    } else {
      setSessionComplete(true);
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
    setClozeAnswerStatus([]);
    setShowResult(false);
    setScore({ correct: 0, total: 0 });
    setSessionComplete(false);
    setRepetitionCount({});
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.stopPropagation();
      e.preventDefault();
      if (showResult) {
        nextCard();
      } else {
        checkAnswer();
      }
    }
  };

  const checkClozeAnswerAsYouGo = (index: number) => {
    if (!checkAsYouGo || !currentCard.clozeAnswers) return;
    
    const userAns = normalizeText(clozeAnswers[index]);
    const correctAns = normalizeText(currentCard.clozeAnswers[index]);
    
    const newStatus = [...clozeAnswerStatus];
    newStatus[index] = userAns === correctAns ? 'correct' : 'incorrect';
    setClozeAnswerStatus(newStatus);
  };

  const handleClozeKeyPress = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Enter') {
      e.stopPropagation();
      e.preventDefault();
      
      // Check the current answer if in "check as you go" mode
      if (checkAsYouGo && clozeAnswers[index].trim()) {
        checkClozeAnswerAsYouGo(index);
      }
      
      // If not the last input, move to next input
      if (index < clozeAnswers.length - 1) {
        const nextInput = clozeInputRefs.current[index + 1];
        if (nextInput) {
          nextInput.focus();
        }
      } else {
        // If it's the last input, check it and then move focus to the "Check Answer" button
        if (checkAsYouGo && clozeAnswers[index].trim()) {
          checkClozeAnswerAsYouGo(index);
        }
        checkAnswerButtonRef.current?.focus();
      }
    }
  };

  const shuffleQuestions = () => {
    if (!currentCard.clozeText || !currentCard.clozeAnswers) return;

    // Save original state if not already saved
    if (!originalClozeState) {
      setOriginalClozeState({
        text: currentCard.clozeText,
        answers: [...currentCard.clozeAnswers]
      });
    }

    // Parse the cloze text to identify question boundaries
    const parts = currentCard.clozeText.split(/(\(\d+\))/);
    const questions: Array<{ text: string[]; answerIndices: number[] }> = [];
    let currentQuestion: { text: string[]; answerIndices: number[] } = { text: [], answerIndices: [] };
    let blankCounter = 0;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      
      if (/^\(\d+\)$/.test(part)) {
        // This is a blank
        currentQuestion.text.push(part);
        currentQuestion.answerIndices.push(blankCounter);
        blankCounter++;
        
        // Check if next part contains a new question
        const nextPart = parts[i + 1];
        if (nextPart) {
          // First check for numbered questions (like "2.")
          const numberedMatch = nextPart.match(/(\n\s*)(\d+\.\s)/);
          // Then check for double newlines (paragraph breaks) indicating new unnumbered questions
          const doubleNewlineMatch = nextPart.match(/(\n\s*\n)/);
          // Check for single newline followed by capital letter (new unnumbered question)
          const singleNewlineCapitalMatch = nextPart.match(/(\n)([A-Z])/);
          
          if (numberedMatch) {
            // Split the next part: text before the number stays with current question
            const splitIndex = nextPart.indexOf(numberedMatch[0]);
            const textForCurrentQuestion = nextPart.substring(0, splitIndex + numberedMatch[1].length);
            const textForNewQuestion = nextPart.substring(splitIndex + numberedMatch[1].length);
            
            // Add remaining text to current question and save it
            if (textForCurrentQuestion) {
              currentQuestion.text.push(textForCurrentQuestion);
            }
            questions.push(currentQuestion);
            
            // Start new question with the number and rest of text
            currentQuestion = { text: [textForNewQuestion], answerIndices: [] };
            
            // Skip the next part since we already processed it
            i++;
          } else if (doubleNewlineMatch) {
            // For unnumbered questions, detect new question by double newline after a blank
            const splitIndex = nextPart.indexOf(doubleNewlineMatch[0]);
            const textForCurrentQuestion = nextPart.substring(0, splitIndex);
            const textForNewQuestion = nextPart.substring(splitIndex + doubleNewlineMatch[0].length);
            
            // Add remaining text to current question and save it
            if (textForCurrentQuestion) {
              currentQuestion.text.push(textForCurrentQuestion);
            }
            questions.push(currentQuestion);
            
            // Start new question with the rest of text
            currentQuestion = { text: textForNewQuestion ? [textForNewQuestion] : [], answerIndices: [] };
            
            // Skip the next part since we already processed it
            i++;
          } else if (singleNewlineCapitalMatch) {
            // For unnumbered questions, detect new question by single newline followed by capital letter
            const splitIndex = nextPart.indexOf(singleNewlineCapitalMatch[0]);
            const textForCurrentQuestion = nextPart.substring(0, splitIndex);
            // Include the capital letter in the new question
            const textForNewQuestion = nextPart.substring(splitIndex + 1);
            
            // Add remaining text to current question and save it
            if (textForCurrentQuestion) {
              currentQuestion.text.push(textForCurrentQuestion);
            }
            questions.push(currentQuestion);
            
            // Start new question with the capital letter and rest of text
            currentQuestion = { text: textForNewQuestion ? [textForNewQuestion] : [], answerIndices: [] };
            
            // Skip the next part since we already processed it
            i++;
          }
        }
      } else {
        // This is text
        currentQuestion.text.push(part);
      }
    }
    
    // Add the last question if it has content
    if (currentQuestion.text.length > 0 || currentQuestion.answerIndices.length > 0) {
      questions.push(currentQuestion);
    }

    // Shuffle the questions
    const shuffledQuestions = [...questions].sort(() => Math.random() - 0.5);

    // Reconstruct the text with renumbered blanks
    let newBlankCounter = 1;
    const newAnswers: string[] = [];
    const newText = shuffledQuestions.map((question, qIndex) => {
      let blankIndexInQuestion = 0;
      let questionText = question.text.map(part => {
        if (/^\(\d+\)$/.test(part)) {
          // This is a blank - renumber it and get the corresponding answer
          const originalIndex = question.answerIndices[blankIndexInQuestion];
          newAnswers.push(currentCard.clozeAnswers![originalIndex]);
          blankIndexInQuestion++;
          return `(${newBlankCounter++})`;
        }
        return part;
      }).join('');

      // First question: trim leading newlines
      if (qIndex === 0) {
        questionText = questionText.replace(/^\n+/, '');
      } else {
        // Subsequent questions: ensure they start with a newline
        if (!questionText.startsWith('\n')) {
          questionText = '\n' + questionText;
        }
      }

      return questionText;
    }).join('');

    // Update the current card with shuffled content
    const updatedCard = {
      ...currentCard,
      clozeText: newText,
      clozeAnswers: newAnswers
    };

    // Update the shuffled vocabulary array
    setShuffledVocabulary(prev => {
      const newVocabulary = [...prev];
      newVocabulary[currentIndex] = updatedCard;
      return newVocabulary;
    });

    // Reset the cloze answers for the user
    setClozeAnswers(Array(newAnswers.length).fill(""));
    setClozeAnswerStatus(Array(newAnswers.length).fill('unchecked'));
    
    toast({
      title: "Questions shuffled",
      description: "The order of questions has been randomized",
    });
  };

  const resetQuestionOrder = () => {
    if (!originalClozeState) return;

    // Restore original state
    const updatedCard = {
      ...currentCard,
      clozeText: originalClozeState.text,
      clozeAnswers: originalClozeState.answers
    };

    // Update the shuffled vocabulary array
    setShuffledVocabulary(prev => {
      const newVocabulary = [...prev];
      newVocabulary[currentIndex] = updatedCard;
      return newVocabulary;
    });

    // Reset the cloze answers for the user
    setClozeAnswers(Array(originalClozeState.answers.length).fill(""));
    setClozeAnswerStatus(Array(originalClozeState.answers.length).fill('unchecked'));
    
    // Clear the saved original state
    setOriginalClozeState(null);
    
    toast({
      title: "Order restored",
      description: "Questions are back to their original order",
    });
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
        <CardContent className="w-full text-center space-y-6">
          {currentCard.type === 'grammar-exercise' && currentCard.exerciseDescription && (
            <div className="p-4 bg-muted/30 rounded-lg mb-4">
              <div className="prose prose-sm max-w-none dark:prose-invert prose-headings:text-foreground prose-p:text-muted-foreground prose-strong:text-foreground prose-em:text-foreground">
                <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
                  {currentCard.exerciseDescription}
                </ReactMarkdown>
              </div>
            </div>
          )}

          {currentCard.linkedGrammarRules && currentCard.linkedGrammarRules.length > 0 && (
            <div className="flex flex-wrap gap-2 justify-center mb-4">
              {currentCard.linkedGrammarRules.map((ruleId) => {
                const rule = availableGrammarRules.find(r => r.id === ruleId);
                if (!rule) return null;
                return (
                  <Badge
                    key={rule.id}
                    variant="outline"
                    className="cursor-pointer hover:bg-accent transition-colors gap-1"
                    onClick={() => setViewingGrammarRule(rule)}
                  >
                    <BookOpen className="w-3 h-3" />
                    {rule.title}
                  </Badge>
                );
              })}
            </div>
          )}

          {originalText && (
            <div className="flex justify-center mb-4">
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => setViewingOriginalText(true)}
              >
                <FileText className="w-4 h-4" />
                View Original Text
              </Button>
            </div>
          )}

          {currentCard.exerciseType === 'cloze-test' && !showResult && (
            <div className="flex justify-between items-center gap-2 mb-2">
              <div className="flex items-center gap-2">
                <Switch
                  id="check-as-you-go"
                  checked={checkAsYouGo}
                  onCheckedChange={setCheckAsYouGo}
                />
                <Label htmlFor="check-as-you-go" className="text-sm cursor-pointer">
                  Check as you go
                </Label>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={shuffleQuestions}
                  className="gap-2"
                >
                  <Shuffle className="w-4 h-4" />
                  Shuffle Questions
                </Button>
                {originalClozeState && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={resetQuestionOrder}
                    className="gap-2"
                  >
                    <Undo2 className="w-4 h-4" />
                    Reset Order
                  </Button>
                )}
              </div>
            </div>
          )}
          
          <div className="space-y-2">
            {currentCard.type === 'grammar-exercise' ? (
              <>
                <p className="text-sm text-muted-foreground uppercase tracking-wider">
                  Question
                </p>
                {currentCard.exerciseType === 'cloze-test' && currentCard.clozeText ? (
                  <div className="text-2xl font-bold leading-relaxed pr-8 relative whitespace-pre-wrap text-left">
                    {(() => {
                      let blankCounter = -1;
                      const parts = currentCard.clozeText!.split(/(\(\d+\))/);
                      
                      return parts.map((part, i) => {
                        if (/^\(\d+\)$/.test(part)) {
                          blankCounter++;
                          const idx = blankCounter;
                          return (
                            <span key={i} className="inline-flex items-center mx-1 align-baseline relative">
                              <span className="absolute right-0 text-xs text-muted-foreground/60 select-none" style={{ marginRight: '-1.5rem' }}>
                                {idx + 1}
                              </span>
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
                                  ref={(el) => (clozeInputRefs.current[idx] = el)}
                                  value={clozeAnswers[idx] || ''}
                                  onChange={(e) => {
                                    const newAnswers = [...clozeAnswers];
                                    newAnswers[idx] = e.target.value;
                                    setClozeAnswers(newAnswers);
                                  }}
                                  onKeyDown={(e) => handleClozeKeyPress(e, idx)}
                                  onBlur={() => {
                                    if (checkAsYouGo && clozeAnswers[idx].trim()) {
                                      checkClozeAnswerAsYouGo(idx);
                                    }
                                  }}
                                  placeholder=""
                                  className={`inline-block w-28 h-9 text-lg text-center px-2 py-1 ${
                                    checkAsYouGo && clozeAnswerStatus[idx] === 'correct' ? 'bg-green-100 border-green-500 dark:bg-green-900/30' :
                                    checkAsYouGo && clozeAnswerStatus[idx] === 'incorrect' ? 'bg-red-100 border-red-500 dark:bg-red-900/30' :
                                    ''
                                  }`}
                                  disabled={showResult}
                                />
                              )}
                            </span>
                          );
                        }
                        
                        // For text parts, render inline without markdown list processing
                        // Collapse multiple consecutive newlines to single, but preserve leading newlines for parts after blanks
                        const normalizedPart = part.replace(/\n{2,}/g, '\n');
                        const lines = normalizedPart.split('\n');
                        
                        return (
                          <span key={i} className="inline">
                            {lines.map((line, lineIdx, arr) => (
                              <span key={lineIdx} className="inline">
                                {lineIdx > 0 && <br />}
                                {line && (
                                  <span 
                                    className="prose prose-lg max-w-none dark:prose-invert prose-strong:text-foreground prose-em:text-foreground inline"
                                    dangerouslySetInnerHTML={{
                                      __html: line
                                        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
                                        .replace(/\*(.+?)\*/g, '<em>$1</em>')
                                    }}
                                  />
                                )}
                              </span>
                            ))}
                          </span>
                        );
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
              <div className="mt-4">
                {/* No additional text needed for cloze tests */}
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
                  ref={checkAnswerButtonRef}
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
      
      <Dialog open={viewingGrammarRule !== null} onOpenChange={(open) => !open && setViewingGrammarRule(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{viewingGrammarRule?.title}</DialogTitle>
          </DialogHeader>
          <div className="prose prose-sm max-w-none dark:prose-invert prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-em:text-foreground">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {viewingGrammarRule?.rule || ""}
            </ReactMarkdown>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={viewingOriginalText} onOpenChange={setViewingOriginalText}>
        <DialogContent className="max-w-3xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Original Text</DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[60vh] w-full rounded-md border p-4">
            <p className="whitespace-pre-wrap text-sm">{originalText}</p>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
};