import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { FolderOpen, Plus, Trash2 } from "lucide-react";

export interface Folder {
  id: string;
  name: string;
  createdAt: Date;
}

interface FolderListProps {
  folders: Folder[];
  onSelectFolder: (folderId: string) => void;
  onAddFolder: () => void;
  onDeleteFolder: (id: string) => void;
}

export const FolderList = ({ folders, onSelectFolder, onAddFolder, onDeleteFolder }: FolderListProps) => {
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
        <div>
          <h2 className="text-2xl font-bold">Language Folders</h2>
          <p className="text-muted-foreground">Organize your vocabulary by language pairs</p>
        </div>
        <Button onClick={onAddFolder}>
          <Plus className="w-4 h-4 mr-2" />
          Add Folder
        </Button>
      </div>

      {folders.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <FolderOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
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
            <Card key={folder.id} className="group hover:shadow-lg transition-all duration-300 cursor-pointer">
              <CardHeader onClick={() => onSelectFolder(folder.id)}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <FolderOpen className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{folder.name}</CardTitle>
                      <CardDescription>
                        Created {folder.createdAt.toLocaleDateString()}
                      </CardDescription>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteClick(folder.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
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