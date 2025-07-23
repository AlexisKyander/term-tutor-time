import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FolderFormProps {
  onAdd: (name: string) => void;
  onBack: () => void;
}

export const FolderForm = ({ onAdd, onBack }: FolderFormProps) => {
  const [name, setName] = useState("");
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast({
        title: "Error",
        description: "Please enter a folder name",
        variant: "destructive",
      });
      return;
    }

    onAdd(name.trim());
    setName("");
    toast({
      title: "Success!",
      description: "Folder created successfully",
    });
  };

  return (
    <div className="max-w-md mx-auto">
      <Button variant="ghost" onClick={onBack} className="mb-4">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Folders
      </Button>
      
      <Card>
        <CardHeader>
          <CardTitle>Create New Folder</CardTitle>
          <CardDescription>
            Create a folder to organize your vocabulary by language pairs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Folder Name</Label>
              <Input
                id="name"
                placeholder="e.g., English-Spanish, French-German"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
              />
            </div>
            
            <div className="flex gap-2">
              <Button type="submit" className="flex-1">
                Create Folder
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