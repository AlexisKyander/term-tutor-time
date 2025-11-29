import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Brain, BookOpen } from "lucide-react";
import { VocabularyItem } from "@/pages/Index";

interface ExerciseSelectorProps {
  exercises: VocabularyItem[];
  deckName: string;
  availableGrammarRules: VocabularyItem[];
  onSelectExercise: (exerciseId: string) => void;
  onStudyAll: () => void;
  onBack: () => void;
}

export const ExerciseSelector = ({
  exercises,
  deckName,
  availableGrammarRules,
  onSelectExercise,
  onStudyAll,
  onBack,
}: ExerciseSelectorProps) => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h2 className="text-2xl font-bold">{deckName}</h2>
            <p className="text-muted-foreground">Choose an exercise to practice</p>
          </div>
        </div>
        <Button onClick={onStudyAll} size="lg" className="gap-2">
          <Brain className="w-5 h-5" />
          Study All Exercises
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {exercises.map((exercise) => (
          <Card 
            key={exercise.id} 
            className="group hover:shadow-lg transition-all duration-300 cursor-pointer"
            onClick={() => onSelectExercise(exercise.id)}
          >
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                  <BookOpen className="w-5 h-5 text-accent" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-lg">{exercise.title || 'Untitled Exercise'}</CardTitle>
                  <CardDescription className="text-xs">
                    {exercise.exerciseType === 'cloze-test' ? 'Cloze Test' : 'Regular Question'}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {exercise.linkedGrammarRules && exercise.linkedGrammarRules.length > 0 ? (
                <div className="mb-3">
                  <p className="text-xs text-muted-foreground mb-2">Linked to:</p>
                  <div className="flex flex-wrap gap-1">
                    {exercise.linkedGrammarRules.map((ruleId) => {
                      const rule = availableGrammarRules.find(r => r.id === ruleId);
                      if (!rule) return null;
                      return (
                        <Badge key={ruleId} variant="secondary" className="text-xs">
                          {rule.title || 'Untitled Rule'}
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground mb-3 italic">
                  No grammar rules linked
                </p>
              )}
              <Button 
                size="sm" 
                className="w-full gap-2"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectExercise(exercise.id);
                }}
              >
                <Brain className="w-3 h-3" />
                Practice This Exercise
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
