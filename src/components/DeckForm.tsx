import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DeckFormProps {
  folderName: string;
  editingDeck?: { id: string; name: string; fromLanguage: string; toLanguage: string; information?: string };
  onAdd: (name: string, fromLanguage: string, toLanguage: string, information?: string) => void;
  onUpdate?: (id: string, name: string, fromLanguage: string, toLanguage: string, information?: string) => void;
  onBack: () => void;
}

export const DeckForm = ({ folderName, editingDeck, onAdd, onUpdate, onBack }: DeckFormProps) => {
  const [name, setName] = useState(editingDeck?.name || "");
  const [fromLanguage, setFromLanguage] = useState(editingDeck?.fromLanguage || "English");
  const [toLanguage, setToLanguage] = useState(editingDeck?.toLanguage || "Spanish");
  const [information, setInformation] = useState(editingDeck?.information || "");
  const { toast } = useToast();
  const isEditing = !!editingDeck;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !fromLanguage.trim() || !toLanguage.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    if (isEditing && editingDeck && onUpdate) {
      onUpdate(editingDeck.id, name.trim(), fromLanguage.trim(), toLanguage.trim(), information.trim() || undefined);
      toast({
        title: "Success!",
        description: "Deck updated successfully",
      });
    } else {
      onAdd(name.trim(), fromLanguage.trim(), toLanguage.trim(), information.trim() || undefined);
      toast({
        title: "Success!",
        description: "Deck created successfully",
      });
    }
    
    if (!isEditing) {
      setName("");
      setFromLanguage("English");
      setToLanguage("Spanish");
      setInformation("");
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <Button variant="ghost" onClick={onBack} className="mb-4">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to {folderName}
      </Button>
      
      <Card>
        <CardHeader>
          <CardTitle>{isEditing ? 'Edit Deck' : 'Create New Deck'}</CardTitle>
          <CardDescription>
            {isEditing ? 'Update deck settings' : `Create a deck in ${folderName} to organize your vocabulary`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Deck Name</Label>
              <Input
                id="name"
                placeholder="e.g., Common Verbs, Food & Drinks, Travel"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fromLanguage">From Language</Label>
                <Input
                  id="fromLanguage"
                  placeholder="e.g., English"
                  value={fromLanguage}
                  onChange={(e) => setFromLanguage(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="toLanguage">To Language</Label>
                <Input
                  id="toLanguage"
                  placeholder="e.g., Spanish"
                  value={toLanguage}
                  onChange={(e) => setToLanguage(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="information">Information (optional)</Label>
              <Textarea
                id="information"
                placeholder="Add notes or information about this deck..."
                value={information}
                onChange={(e) => setInformation(e.target.value)}
                rows={3}
              />
            </div>
            
            <div className="flex gap-2">
              <Button type="submit" className="flex-1">
                {isEditing ? 'Update Deck' : 'Create Deck'}
              </Button>
              <Button type="button" variant="outline" onClick={onBack}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};