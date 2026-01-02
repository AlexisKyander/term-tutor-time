import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Plus, X, GripVertical } from "lucide-react";

interface VerbStructureFormProps {
  folderName: string;
  initialPronouns?: string[];
  onSave: (pronouns: string[]) => void;
  onBack: () => void;
}

export const VerbStructureForm = ({ 
  folderName, 
  initialPronouns = [], 
  onSave, 
  onBack 
}: VerbStructureFormProps) => {
  const [pronounInput, setPronounInput] = useState("");
  const [pronouns, setPronouns] = useState<string[]>(initialPronouns);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  useEffect(() => {
    setPronouns(initialPronouns);
  }, [initialPronouns]);

  const handleAddPronoun = () => {
    const trimmedPronoun = pronounInput.trim();
    if (trimmedPronoun && !pronouns.includes(trimmedPronoun)) {
      setPronouns([...pronouns, trimmedPronoun]);
      setPronounInput("");
    }
  };

  const handlePronounKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddPronoun();
    }
  };

  const handleRemovePronoun = (pronounToRemove: string) => {
    setPronouns(pronouns.filter(p => p !== pronounToRemove));
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newPronouns = [...pronouns];
    const draggedItem = newPronouns[draggedIndex];
    newPronouns.splice(draggedIndex, 1);
    newPronouns.splice(index, 0, draggedItem);
    setPronouns(newPronouns);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(pronouns);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div>
          <h2 className="text-2xl font-bold">Define Verb Structure</h2>
          <p className="text-muted-foreground">{folderName}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pronoms (Pronouns)</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="pronouns">Add pronouns for conjugation</Label>
              <p className="text-sm text-muted-foreground">
                Define the pronouns that verbs should be conjugated for. Drag to reorder.
              </p>
              <div className="flex gap-2">
                <Input
                  id="pronouns"
                  placeholder="e.g., yo, tú, él/ella"
                  value={pronounInput}
                  onChange={(e) => setPronounInput(e.target.value)}
                  onKeyDown={handlePronounKeyDown}
                />
                <Button type="button" variant="outline" onClick={handleAddPronoun}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {pronouns.length > 0 && (
                <div className="flex flex-col gap-2 mt-2">
                  {pronouns.map((pronoun, index) => (
                    <div
                      key={index}
                      draggable
                      onDragStart={() => handleDragStart(index)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDragEnd={handleDragEnd}
                      className={`flex items-center gap-2 p-2 rounded-md border bg-card cursor-move transition-colors ${
                        draggedIndex === index ? "border-primary bg-primary/10" : "border-border"
                      }`}
                    >
                      <GripVertical className="w-4 h-4 text-muted-foreground" />
                      <span className="flex-1">{pronoun}</span>
                      <button
                        type="button"
                        onClick={() => handleRemovePronoun(pronoun)}
                        className="hover:text-destructive"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Button type="submit">
              Save Structure
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
