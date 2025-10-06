import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, ArrowLeft as ArrowLeftIcon } from "lucide-react";

interface DirectionSelectorProps {
  fromLanguage: string;
  toLanguage: string;
  onSelect: (direction: 'forward' | 'reverse') => void;
  onCancel: () => void;
}

export const DirectionSelector = ({ fromLanguage, toLanguage, onSelect, onCancel }: DirectionSelectorProps) => {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Choose Study Direction</CardTitle>
          <CardDescription>
            Select which direction you want to study the vocabulary
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            variant="outline"
            onClick={() => onSelect('forward')}
            className="w-full h-auto py-6 flex-col items-start hover:bg-accent"
          >
            <div className="flex items-center justify-between w-full mb-2">
              <span className="text-lg font-semibold">{fromLanguage}</span>
              <ArrowRight className="w-5 h-5" />
              <span className="text-lg font-semibold">{toLanguage}</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Translate from {fromLanguage} to {toLanguage}
            </p>
          </Button>

          <Button
            variant="outline"
            onClick={() => onSelect('reverse')}
            className="w-full h-auto py-6 flex-col items-start hover:bg-accent"
          >
            <div className="flex items-center justify-between w-full mb-2">
              <span className="text-lg font-semibold">{toLanguage}</span>
              <ArrowRight className="w-5 h-5" />
              <span className="text-lg font-semibold">{fromLanguage}</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Translate from {toLanguage} to {fromLanguage}
            </p>
          </Button>

          <Button variant="ghost" onClick={onCancel} className="w-full">
            Cancel
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};