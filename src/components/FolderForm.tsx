import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Folder } from "@/components/FolderList";

interface FolderFormProps {
  editingFolder?: Folder;
  categoryId?: string;
  categoryName?: string;
  onAdd: (name: string, fromLanguage: string, toLanguage: string, categoryId: string) => void;
  onUpdate?: (id: string, name: string, fromLanguage: string, toLanguage: string) => void;
  onBack: () => void;
}

export const FolderForm = ({ editingFolder, categoryId, categoryName, onAdd, onUpdate, onBack }: FolderFormProps) => {
  const isGrammarCategory = categoryId === 'grammar' || editingFolder?.categoryId === 'grammar';
  
  // Debug logging
  console.log('FolderForm - categoryId:', categoryId);
  console.log('FolderForm - isGrammarCategory:', isGrammarCategory);
  const [name, setName] = useState("");
  const [fromLanguage, setFromLanguage] = useState("");
  const [toLanguage, setToLanguage] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    if (editingFolder) {
      setName(editingFolder.name);
      setFromLanguage(editingFolder.fromLanguage);
      setToLanguage(editingFolder.toLanguage);
    }
  }, [editingFolder]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // For Grammar category, only name is required
    if (isGrammarCategory) {
      if (!name.trim()) {
        toast({
          title: "Error",
          description: "Please enter a language name",
          variant: "destructive",
        });
        return;
      }
      
      if (editingFolder && onUpdate) {
        onUpdate(editingFolder.id, name.trim(), '', '');
        toast({
          title: "Success!",
          description: "Language folder updated successfully",
        });
      } else {
        onAdd(name.trim(), '', '', categoryId || editingFolder?.categoryId || '');
        toast({
          title: "Success!",
          description: "Language folder created successfully",
        });
      }
    } else {
      // For Vocabulary category, all fields are required
      if (!name.trim() || !fromLanguage.trim() || !toLanguage.trim()) {
        toast({
          title: "Error",
          description: "Please fill in all fields",
          variant: "destructive",
        });
        return;
      }

      if (editingFolder && onUpdate) {
        onUpdate(editingFolder.id, name.trim(), fromLanguage.trim(), toLanguage.trim());
        toast({
          title: "Success!",
          description: "Folder updated successfully",
        });
      } else {
        onAdd(name.trim(), fromLanguage.trim(), toLanguage.trim(), categoryId || editingFolder?.categoryId || '');
        toast({
          title: "Success!",
          description: "Folder created successfully",
        });
      }
    }
    
    setName("");
    setFromLanguage("");
    setToLanguage("");
  };

  return (
    <div className="max-w-md mx-auto">
      <Button variant="ghost" onClick={onBack} className="mb-4">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Folders
      </Button>
      
      <Card>
        <CardHeader>
          <CardTitle>{editingFolder ? 'Edit Folder' : 'Create New Folder'}</CardTitle>
          <CardDescription>
            {editingFolder 
              ? 'Update folder settings' 
              : isGrammarCategory 
                ? 'Create a language folder for your grammar rules'
                : 'Create a folder to organize your vocabulary by language pairs'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {isGrammarCategory ? (
              <div className="space-y-2">
                <Label htmlFor="name">Language Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., French, Swedish, Spanish"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoFocus
                />
              </div>
            ) : (
              <>
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
              </>
            )}
            
            <div className="flex gap-2">
              <Button type="submit" className="flex-1">
                {editingFolder ? 'Update Folder' : 'Create Folder'}
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