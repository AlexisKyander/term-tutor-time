import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Folder } from "@/components/FolderList";

interface FolderFormProps {
  editingFolder?: Folder;
  categoryId?: string;
  categoryName?: string;
  parentFolderId?: string;
  isSubFolder?: boolean;
  onAdd: (name: string, fromLanguage: string, toLanguage: string, categoryId: string, parentFolderId?: string, description?: string) => void;
  onUpdate?: (id: string, name: string, fromLanguage: string, toLanguage: string, description?: string) => void;
  onBack: () => void;
}

export const FolderForm = ({ editingFolder, categoryId, categoryName, parentFolderId, isSubFolder, onAdd, onUpdate, onBack }: FolderFormProps) => {
  const isGrammarCategory = categoryId === 'grammar' || editingFolder?.categoryId === 'grammar';
  const isGrammarSubFolder = isSubFolder && isGrammarCategory;
  
  const [name, setName] = useState("");
  const [fromLanguage, setFromLanguage] = useState("");
  const [toLanguage, setToLanguage] = useState("");
  const [description, setDescription] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    if (editingFolder) {
      setName(editingFolder.name);
      setFromLanguage(editingFolder.fromLanguage);
      setToLanguage(editingFolder.toLanguage);
      setDescription(editingFolder.description || "");
    }
  }, [editingFolder]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // For Grammar sub-folders (grammar content folders), only name is required
    if (isGrammarSubFolder) {
      if (!name.trim()) {
        toast({
          title: "Error",
          description: "Please enter a folder name",
          variant: "destructive",
        });
        return;
      }
      
      if (editingFolder && onUpdate) {
        onUpdate(editingFolder.id, name.trim(), '', '', description.trim());
        toast({
          title: "Success!",
          description: "Grammar folder updated successfully",
        });
      } else {
        onAdd(name.trim(), '', '', categoryId || editingFolder?.categoryId || '', parentFolderId, description.trim());
        toast({
          title: "Success!",
          description: "Grammar folder created successfully",
        });
      }
    } else if (isGrammarCategory && !isSubFolder) {
      // For Grammar language folders, only name is required
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
    setDescription("");
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
              : isGrammarSubFolder
                ? 'Create a folder for a specific grammar topic'
                : isGrammarCategory 
                  ? 'Create a language folder for your grammar rules'
                  : 'Create a folder to organize your vocabulary by language pairs'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {isGrammarSubFolder ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="name">Folder Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Articles, Past Tense, Prepositions"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoFocus
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    placeholder="Add a description for this grammar topic..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                  />
                </div>
              </>
            ) : isGrammarCategory ? (
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