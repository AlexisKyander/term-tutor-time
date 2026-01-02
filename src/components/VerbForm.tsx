import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, X } from "lucide-react";
import type { Verb } from "./VerbList";

interface VerbFormProps {
  editingVerb?: Verb;
  onAdd: (name: string, tags: string[]) => void;
  onUpdate?: (id: string, name: string, tags: string[]) => void;
  onBack: () => void;
}

export const VerbForm = ({ editingVerb, onAdd, onUpdate, onBack }: VerbFormProps) => {
  const [name, setName] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  useEffect(() => {
    if (editingVerb) {
      setName(editingVerb.name);
      setTags(editingVerb.tags);
    }
  }, [editingVerb]);

  const handleAddTag = () => {
    const trimmedTag = tagInput.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag]);
      setTagInput("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
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
      onUpdate(editingVerb.id, name.trim(), tags);
    } else {
      onAdd(name.trim(), tags);
    }
  };

  const resetForm = () => {
    setName("");
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
              <Label htmlFor="tags">Tags</Label>
              <div className="flex gap-2">
                <Input
                  id="tags"
                  placeholder="Add a tag and press Enter"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleKeyDown}
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
