import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Brain, BookOpen, Shuffle } from "lucide-react";
import { VocabularyItem } from "@/pages/Index";

interface ExerciseSelectorProps {
  exercises: VocabularyItem[];
  deckName: string;
  onSelectExercise: (exerciseId: string) => void;
  onStudyAll: (shuffle?: boolean) => void;
  onBack: () => void;
}

export const ExerciseSelector = ({
  exercises,
  deckName,
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
        <div className="flex gap-2">
          <Button onClick={() => onStudyAll(false)} size="lg" className="gap-2">
            <Brain className="w-5 h-5" />
            Study All Exercises
          </Button>
          <Button onClick={() => onStudyAll(true)} size="lg" variant="outline" className="gap-2">
            <Shuffle className="w-5 h-5" />
            Shuffle Questions
          </Button>
        </div>
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
              {exercise.exerciseDescription && (
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {exercise.exerciseDescription}
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
