import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { ArrowLeft, Plus, Pencil, Trash2, Languages, Info } from "lucide-react";

export interface Folder {
  id: string;
  name: string;
  fromLanguage: string;
  toLanguage: string;
  categoryId: string;
  parentFolderId?: string;
  description?: string;
  type?: 'grammar-rules' | 'grammar-exercises';
  isDefault?: boolean; // Default folders cannot be deleted
  language?: 'French' | 'Spanish' | 'Other'; // Language selection for Grammar language folders
  pronouns?: string[]; // Pronouns for verb conjugation (stored on Verbs folder)
  createdAt: Date;
}

interface FolderListProps {
  folders: Folder[];
  categoryName: string;
  categoryId: string;
  onSelectFolder: (folderId: string) => void;
  onAddFolder: () => void;
  onEditFolder: (id: string) => void;
  onDeleteFolder: (id: string) => void;
  onBack: () => void;
  hideAddButton?: boolean;
}

export const FolderList = ({ folders, categoryName, categoryId, onSelectFolder, onAddFolder, onEditFolder, onDeleteFolder, onBack, hideAddButton = false }: FolderListProps) => {
  const isGrammarCategory = categoryId === 'grammar';
  const isGrammarContentView = categoryName === 'Grammar content';
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [folderToDelete, setFolderToDelete] = useState<string | null>(null);

  const handleDeleteClick = (folderId: string) => {
    setFolderToDelete(folderId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (folderToDelete) {
      onDeleteFolder(folderToDelete);
      setDeleteDialogOpen(false);
      setFolderToDelete(null);
    }
  };

  return (
    <>
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="flex items-center gap-3">
            <div>
              <h2 className="text-2xl font-bold">{categoryName}</h2>
              <p className="text-muted-foreground">
                {isGrammarContentView
                  ? 'Organize grammar rules by topic'
                  : isGrammarCategory 
                    ? 'Select a language to manage grammar rules' 
                    : 'Organize vocabulary by language pairs'}
              </p>
            </div>
          </div>
        </div>
        {!hideAddButton && (
          <Button onClick={onAddFolder}>
            <Plus className="w-4 h-4 mr-2" />
            Add Folder
          </Button>
        )}
      </div>

      {folders.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <Languages className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">
              No folders created yet. Create your first language folder!
            </p>
            <Button onClick={onAddFolder}>
              <Plus className="w-4 h-4 mr-2" />
              Create First Folder
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {folders.map((folder) => (
            <Card 
              key={folder.id} 
              className="group hover:shadow-lg transition-all duration-300 cursor-pointer"
              onClick={() => onSelectFolder(folder.id)}
            >
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3 flex-1">
                    <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                      <Languages className="w-5 h-5 text-accent" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <CardTitle className="text-lg mb-1">{folder.name}</CardTitle>
                        {folder.description && (
                          <HoverCard>
                            <HoverCardTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-4 w-4 p-0 hover:bg-transparent"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Info className="w-4 h-4 text-muted-foreground hover:text-foreground transition-colors" />
                              </Button>
                            </HoverCardTrigger>
                            <HoverCardContent className="w-80">
                              <p className="text-sm whitespace-pre-wrap">{folder.description}</p>
                            </HoverCardContent>
                          </HoverCard>
                        )}
                      </div>
                      {!isGrammarCategory && !isGrammarContentView && (
                        <CardDescription>
                          {folder.fromLanguage} → {folder.toLanguage}
                        </CardDescription>
                      )}
                    </div>
                  </div>
                  {!folder.type && (
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditFolder(folder.id);
                        }}
                      >
                        <Pencil className="w-3 h-3" />
                      </Button>
                      {!folder.isDefault && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClick(folder.id);
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this folder and all its decks and vocabulary. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
    </>
  );
};