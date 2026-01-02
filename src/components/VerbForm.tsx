import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, X, ChevronDown, ChevronUp } from "lucide-react";
import type { Verb, VerbConjugation } from "./VerbList";
import type { VerbStructure } from "./VerbStructureForm";

interface VerbFormProps {
  editingVerb?: Verb;
  verbStructure?: VerbStructure;
  onAdd: (name: string, tags: string[], conjugations: VerbConjugation[]) => void;
  onUpdate?: (id: string, name: string, tags: string[], conjugations: VerbConjugation[]) => void;
  onBack: () => void;
}

export const VerbForm = ({ editingVerb, verbStructure, onAdd, onUpdate, onBack }: VerbFormProps) => {
  const [name, setName] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [conjugations, setConjugations] = useState<VerbConjugation[]>([]);
  const [expandedTense, setExpandedTense] = useState<string | null>(null);

  useEffect(() => {
    if (editingVerb) {
      setName(editingVerb.name);
      setTags(editingVerb.tags);
      setConjugations(editingVerb.conjugations || []);
    } else if (verbStructure) {
      // Initialize empty conjugations from verb structure
      const initialConjugations: VerbConjugation[] = [];
      
      verbStructure.simpleTenses.forEach(tense => {
        const conjugationMap: Record<string, string> = {};
        tense.enabledPronouns.forEach(pronoun => {
          conjugationMap[pronoun] = "";
        });
        initialConjugations.push({
          tense: tense.name,
          tenseType: 'simple',
          conjugations: conjugationMap
        });
      });
      
      verbStructure.compoundTenses.forEach(tense => {
        const conjugationMap: Record<string, string> = {};
        tense.enabledPronouns.forEach(pronoun => {
          conjugationMap[pronoun] = "";
        });
        initialConjugations.push({
          tense: tense.name,
          tenseType: 'compound',
          conjugations: conjugationMap
        });
      });
      
      setConjugations(initialConjugations);
    }
  }, [editingVerb, verbStructure]);

  const handleAddTag = () => {
    const trimmedTag = tagInput.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag]);
      setTagInput("");
    }
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const updateConjugation = (tense: string, pronoun: string, value: string) => {
    setConjugations(prev => 
      prev.map(conj => 
        conj.tense === tense 
          ? { ...conj, conjugations: { ...conj.conjugations, [pronoun]: value } }
          : conj
      )
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingVerb && onUpdate) {
      onUpdate(editingVerb.id, name.trim(), tags, conjugations);
    } else {
      onAdd(name.trim(), tags, conjugations);
    }
  };

  const resetForm = () => {
    setName("");
    setTagInput("");
    setTags([]);
    // Re-initialize conjugations from structure
    if (verbStructure) {
      const initialConjugations: VerbConjugation[] = [];
      
      verbStructure.simpleTenses.forEach(tense => {
        const conjugationMap: Record<string, string> = {};
        tense.enabledPronouns.forEach(pronoun => {
          conjugationMap[pronoun] = "";
        });
        initialConjugations.push({
          tense: tense.name,
          tenseType: 'simple',
          conjugations: conjugationMap
        });
      });
      
      verbStructure.compoundTenses.forEach(tense => {
        const conjugationMap: Record<string, string> = {};
        tense.enabledPronouns.forEach(pronoun => {
          conjugationMap[pronoun] = "";
        });
        initialConjugations.push({
          tense: tense.name,
          tenseType: 'compound',
          conjugations: conjugationMap
        });
      });
      
      setConjugations(initialConjugations);
    } else {
      setConjugations([]);
    }
  };

  const simpleTenseConjugations = conjugations.filter(c => c.tenseType === 'simple');
  const compoundTenseConjugations = conjugations.filter(c => c.tenseType === 'compound');

  const renderTenseCard = (conj: VerbConjugation) => {
    const isExpanded = expandedTense === `${conj.tenseType}-${conj.tense}`;
    const pronouns = Object.keys(conj.conjugations);
    const filledCount = Object.values(conj.conjugations).filter(v => v.trim()).length;

    return (
      <div key={`${conj.tenseType}-${conj.tense}`} className="border rounded-md bg-card">
        <div
          className="flex items-center gap-2 p-3 cursor-pointer"
          onClick={() => setExpandedTense(isExpanded ? null : `${conj.tenseType}-${conj.tense}`)}
        >
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          )}
          <span className="flex-1 font-medium">{conj.tense}</span>
          <span className="text-xs text-muted-foreground">
            {filledCount}/{pronouns.length} filled
          </span>
        </div>
        {isExpanded && (
          <div className="px-4 pb-4 pt-2 border-t space-y-3">
            {pronouns.map(pronoun => (
              <div key={pronoun} className="flex items-center gap-3">
                <span className="w-24 text-sm text-muted-foreground">{pronoun}</span>
                <Input
                  placeholder={`${name || 'verb'} for ${pronoun}`}
                  value={conj.conjugations[pronoun]}
                  onChange={(e) => updateConjugation(conj.tense, pronoun, e.target.value)}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const hasTenses = conjugations.length > 0;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <h2 className="text-2xl font-bold">
          {editingVerb ? "Edit Verb" : "Add Verb"}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{editingVerb ? "Edit verb details" : "Enter verb details"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Verb</Label>
              <Input
                id="name"
                placeholder="e.g., être, avoir, aller"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <div className="flex gap-2">
                <Input
                  id="tags"
                  placeholder="Add a tag and press Enter"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                />
                <Button type="button" variant="outline" onClick={handleAddTag}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {tags.length > 0 && (
                <div className="flex gap-2 flex-wrap mt-2">
                  {tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {!hasTenses && (
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground">
                No verb structure defined. Please define the verb structure first to add conjugations.
              </p>
            </CardContent>
          </Card>
        )}

        {simpleTenseConjugations.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Simple Tenses</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {simpleTenseConjugations.map(renderTenseCard)}
            </CardContent>
          </Card>
        )}

        {compoundTenseConjugations.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Compound Tenses</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {compoundTenseConjugations.map(renderTenseCard)}
            </CardContent>
          </Card>
        )}

        <div className="flex gap-2">
          <Button type="submit">
            {editingVerb ? "Update Verb" : "Add Verb"}
          </Button>
          {!editingVerb && (
            <Button type="button" variant="outline" onClick={resetForm}>
              Reset
            </Button>
          )}
        </div>
      </form>
    </div>
  );
};
