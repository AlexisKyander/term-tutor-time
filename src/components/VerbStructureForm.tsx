import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Plus, X, GripVertical, ChevronDown, ChevronUp } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

export interface TenseStructure {
  name: string;
  enabledPronouns: string[];
}

export interface VerbStructure {
  pronouns: string[];
  simpleTenses: TenseStructure[];
  compoundTenses: TenseStructure[];
}

interface VerbStructureFormProps {
  folderName: string;
  initialStructure?: VerbStructure;
  onSave: (structure: VerbStructure) => void;
  onBack: () => void;
}

export const VerbStructureForm = ({ 
  folderName, 
  initialStructure,
  onSave, 
  onBack 
}: VerbStructureFormProps) => {
  const [pronounInput, setPronounInput] = useState("");
  const [pronouns, setPronouns] = useState<string[]>(initialStructure?.pronouns || []);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  
  const [simpleTenseInput, setSimpleTenseInput] = useState("");
  const [simpleTenses, setSimpleTenses] = useState<TenseStructure[]>(initialStructure?.simpleTenses || []);
  
  const [compoundTenseInput, setCompoundTenseInput] = useState("");
  const [compoundTenses, setCompoundTenses] = useState<TenseStructure[]>(initialStructure?.compoundTenses || []);
  
  const [expandedTense, setExpandedTense] = useState<string | null>(null);

  useEffect(() => {
    if (initialStructure) {
      setPronouns(initialStructure.pronouns);
      setSimpleTenses(initialStructure.simpleTenses);
      setCompoundTenses(initialStructure.compoundTenses);
    }
  }, [initialStructure]);

  const handleAddPronoun = () => {
    const trimmedPronoun = pronounInput.trim();
    if (trimmedPronoun && !pronouns.includes(trimmedPronoun)) {
      const newPronouns = [...pronouns, trimmedPronoun];
      setPronouns(newPronouns);
      setPronounInput("");
      // Update all tenses to include the new pronoun by default
      setSimpleTenses(simpleTenses.map(t => ({
        ...t,
        enabledPronouns: [...t.enabledPronouns, trimmedPronoun]
      })));
      setCompoundTenses(compoundTenses.map(t => ({
        ...t,
        enabledPronouns: [...t.enabledPronouns, trimmedPronoun]
      })));
    }
  };

  const handlePronounKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddPronoun();
    }
  };

  const handleRemovePronoun = (pronounToRemove: string) => {
    const newPronouns = pronouns.filter(p => p !== pronounToRemove);
    setPronouns(newPronouns);
    // Remove pronoun from all tenses
    setSimpleTenses(simpleTenses.map(t => ({
      ...t,
      enabledPronouns: t.enabledPronouns.filter(p => p !== pronounToRemove)
    })));
    setCompoundTenses(compoundTenses.map(t => ({
      ...t,
      enabledPronouns: t.enabledPronouns.filter(p => p !== pronounToRemove)
    })));
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

  const handleAddSimpleTense = () => {
    const trimmed = simpleTenseInput.trim();
    if (trimmed && !simpleTenses.some(t => t.name === trimmed)) {
      setSimpleTenses([...simpleTenses, { name: trimmed, enabledPronouns: [...pronouns] }]);
      setSimpleTenseInput("");
    }
  };

  const handleAddCompoundTense = () => {
    const trimmed = compoundTenseInput.trim();
    if (trimmed && !compoundTenses.some(t => t.name === trimmed)) {
      setCompoundTenses([...compoundTenses, { name: trimmed, enabledPronouns: [...pronouns] }]);
      setCompoundTenseInput("");
    }
  };

  const handleRemoveSimpleTense = (tenseName: string) => {
    setSimpleTenses(simpleTenses.filter(t => t.name !== tenseName));
  };

  const handleRemoveCompoundTense = (tenseName: string) => {
    setCompoundTenses(compoundTenses.filter(t => t.name !== tenseName));
  };

  const togglePronounForTense = (
    tenseType: 'simple' | 'compound',
    tenseName: string,
    pronoun: string
  ) => {
    const updateTenses = (tenses: TenseStructure[]) =>
      tenses.map(t => {
        if (t.name !== tenseName) return t;
        const hasP = t.enabledPronouns.includes(pronoun);
        return {
          ...t,
          enabledPronouns: hasP
            ? t.enabledPronouns.filter(p => p !== pronoun)
            : [...t.enabledPronouns, pronoun]
        };
      });

    if (tenseType === 'simple') {
      setSimpleTenses(updateTenses(simpleTenses));
    } else {
      setCompoundTenses(updateTenses(compoundTenses));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      pronouns,
      simpleTenses,
      compoundTenses
    });
  };

  const renderTenseSection = (
    title: string,
    tenses: TenseStructure[],
    tenseInput: string,
    setTenseInput: (val: string) => void,
    handleAdd: () => void,
    handleRemove: (name: string) => void,
    tenseType: 'simple' | 'compound'
  ) => (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="e.g., Present, Imperfect, Future"
            value={tenseInput}
            onChange={(e) => setTenseInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAdd();
              }
            }}
          />
          <Button type="button" variant="outline" onClick={handleAdd}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        {tenses.length > 0 && (
          <div className="flex flex-col gap-2">
            {tenses.map((tense) => {
              const isExpanded = expandedTense === `${tenseType}-${tense.name}`;
              return (
                <div
                  key={tense.name}
                  className="border rounded-md bg-card"
                >
                  <div
                    className="flex items-center gap-2 p-2 cursor-pointer"
                    onClick={() => setExpandedTense(isExpanded ? null : `${tenseType}-${tense.name}`)}
                  >
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    )}
                    <span className="flex-1">{tense.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {tense.enabledPronouns.length}/{pronouns.length} pronouns
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemove(tense.name);
                      }}
                      className="hover:text-destructive"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  {isExpanded && pronouns.length > 0 && (
                    <div className="px-4 pb-3 pt-1 border-t">
                      <p className="text-xs text-muted-foreground mb-2">
                        Select pronouns for this tense:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {pronouns.map((pronoun) => {
                          const isEnabled = tense.enabledPronouns.includes(pronoun);
                          return (
                            <label
                              key={pronoun}
                              className={`flex items-center gap-2 px-3 py-1.5 rounded-md border cursor-pointer transition-colors ${
                                isEnabled
                                  ? "bg-primary/10 border-primary text-primary"
                                  : "bg-muted/50 border-border text-muted-foreground"
                              }`}
                            >
                              <Checkbox
                                checked={isEnabled}
                                onCheckedChange={() =>
                                  togglePronounForTense(tenseType, tense.name, pronoun)
                                }
                              />
                              <span className="text-sm">{pronoun}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
        {pronouns.length === 0 && (
          <p className="text-sm text-muted-foreground italic">
            Add pronouns first to configure tense-specific pronouns.
          </p>
        )}
      </CardContent>
    </Card>
  );

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
          <CardTitle>Pronouns</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
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
          </div>
        </CardContent>
      </Card>

      {renderTenseSection(
        "Simple Tenses",
        simpleTenses,
        simpleTenseInput,
        setSimpleTenseInput,
        handleAddSimpleTense,
        handleRemoveSimpleTense,
        'simple'
      )}

      {renderTenseSection(
        "Compound Tenses",
        compoundTenses,
        compoundTenseInput,
        setCompoundTenseInput,
        handleAddCompoundTense,
        handleRemoveCompoundTense,
        'compound'
      )}

      <form onSubmit={handleSubmit}>
        <Button type="submit" className="w-full">
          Save Structure
        </Button>
      </form>
    </div>
  );
};
