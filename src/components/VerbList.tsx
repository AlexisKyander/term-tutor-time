import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { ArrowLeft, Plus, Pencil, Trash2, GraduationCap } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";

export interface Verb {
  id: string;
  name: string;
  pronouns: string[];
  tags: string[];
  folderId: string;
}

interface VerbListProps {
  verbs: Verb[];
  folderName: string;
  onPractice: () => void;
  onAddVerb: () => void;
  onEditVerb: (id: string) => void;
  onDeleteVerb: (id: string) => void;
  onBack: () => void;
}

export const VerbList = ({ 
  verbs, 
  folderName, 
  onPractice, 
  onAddVerb, 
  onEditVerb, 
  onDeleteVerb, 
  onBack 
}: VerbListProps) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [verbToDelete, setVerbToDelete] = useState<string | null>(null);

  const handleDeleteClick = (verbId: string) => {
    setVerbToDelete(verbId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (verbToDelete) {
      onDeleteVerb(verbToDelete);
      setDeleteDialogOpen(false);
      setVerbToDelete(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h2 className="text-2xl font-bold">{folderName}</h2>
            <p className="text-muted-foreground">
              {verbs.length} {verbs.length === 1 ? 'verb' : 'verbs'}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onPractice} disabled={verbs.length === 0}>
            <GraduationCap className="w-4 h-4 mr-2" />
            Practice conjugations
          </Button>
          <Button onClick={onAddVerb}>
            <Plus className="w-4 h-4 mr-2" />
            Add verb
          </Button>
        </div>
      </div>

      {verbs.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <GraduationCap className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">
              No verbs added yet. Add your first verb to practice conjugations!
            </p>
            <Button onClick={onAddVerb}>
              <Plus className="w-4 h-4 mr-2" />
              Add First Verb
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Verb</TableHead>
                  <TableHead>Pronoms</TableHead>
                  <TableHead>Tags</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {verbs.map((verb) => (
                  <TableRow key={verb.id}>
                    <TableCell className="font-medium">{verb.name}</TableCell>
                    <TableCell>
                      <div className="flex gap-1 flex-wrap">
                        {verb.pronouns?.map((pronoun, index) => (
                          <Badge key={index} variant="outline">
                            {pronoun}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1 flex-wrap">
                        {verb.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEditVerb(verb.id)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteClick(verb.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this verb. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
