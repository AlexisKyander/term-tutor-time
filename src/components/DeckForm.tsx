import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DeckFormProps {
  folderName: string;
  onAdd: (name: string) => void;
  onBack: () => void;
}

export const DeckForm = ({ folderName, onAdd, onBack }: DeckFormProps) => {
  const [name, setName] = useState("");
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast({
        title: "Error",
        description: "Please enter a deck name",
        variant: "destructive",
      });
      return;
    }

    onAdd(name.trim());
    setName("");
    toast({
      title: "Success!",
      description: "Deck created successfully",
    });
  };

  return (
    <div className="max-w-md mx-auto">
      <Button variant="ghost" onClick={onBack} className="mb-4">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to {folderName}
      </Button>
      
      <Card>
        <CardHeader>
          <CardTitle>Create New Deck</CardTitle>
          <CardDescription>
            Create a deck in {folderName} to organize your vocabulary
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
            
            <div className="flex gap-2">
              <Button type="submit" className="flex-1">
                Create Deck
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