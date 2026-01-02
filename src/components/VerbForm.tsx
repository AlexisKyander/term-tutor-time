import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, X, GripVertical } from "lucide-react";
import type { Verb } from "./VerbList";

interface VerbFormProps {
  editingVerb?: Verb;
  onAdd: (name: string, pronouns: string[], tags: string[]) => void;
  onUpdate?: (id: string, name: string, pronouns: string[], tags: string[]) => void;
  onBack: () => void;
}

export const VerbForm = ({ editingVerb, onAdd, onUpdate, onBack }: VerbFormProps) => {
  const [name, setName] = useState("");
  const [pronounInput, setPronounInput] = useState("");
  const [pronouns, setPronouns] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  useEffect(() => {
    if (editingVerb) {
      setName(editingVerb.name);
      setPronouns(editingVerb.pronouns || []);
      setTags(editingVerb.tags);
    }
  }, [editingVerb]);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingVerb && onUpdate) {
      onUpdate(editingVerb.id, name.trim(), pronouns, tags);
    } else {
      onAdd(name.trim(), pronouns, tags);
    }
  };

  const resetForm = () => {
    setName("");
    setPronounInput("");
    setPronouns([]);
    setTagInput("");
    setTags([]);
  };

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

      <Card>
        <CardHeader>
          <CardTitle>{editingVerb ? "Edit verb details" : "Enter verb details"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
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
              <Label htmlFor="pronouns">Pronoms</Label>
              <p className="text-sm text-muted-foreground">
                Add pronouns for conjugation. Drag to reorder.
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
        </CardContent>
      </Card>
    </div>
  );
};
