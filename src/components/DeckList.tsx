import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, BookOpen, Plus, Trash2, Brain, Settings, CheckCircle, Pencil, Eye, Info, FileText } from "lucide-react";

export interface Deck {
  id: string;
  name: string;
  folderId: string;
  fromLanguage: string;
  toLanguage: string;
  information?: string;
  originalText?: string;
  deckType?: 'grammar-exercises' | 'grammar-rules';
  createdAt: Date;
}

interface DeckListProps {
  decks: Deck[];
  folderName: string;
  vocabularyCounts: Record<string, number>;
  deckCompletionStatus: Record<string, boolean>;
  onSelectDeck: (deckId: string) => void;
  onAddDeck: () => void;
  onDeleteDeck: (id: string) => void;
  onEditDeck: (id: string) => void;
  onStudyDeck: (deckId: string) => void;
  onPreviewDeck: (deckId: string) => void;
  onBack: () => void;
  onSettings: () => void;
}

export const DeckList = ({ 
  decks, 
  folderName, 
  vocabularyCounts, 
  deckCompletionStatus,
  onSelectDeck, 
  onAddDeck, 
  onDeleteDeck,
  onEditDeck, 
  onStudyDeck,
  onPreviewDeck, 
  onBack,
  onSettings
}: DeckListProps) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deckToDelete, setDeckToDelete] = useState<string | null>(null);
  const [originalTextDialogOpen, setOriginalTextDialogOpen] = useState(false);
  const [selectedDeckOriginalText, setSelectedDeckOriginalText] = useState<{ name: string; text: string } | null>(null);

  const handleDeleteClick = (deckId: string) => {
    setDeckToDelete(deckId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (deckToDelete) {
      onDeleteDeck(deckToDelete);
      setDeleteDialogOpen(false);
      setDeckToDelete(null);
    }
  };

  const handleViewOriginalText = (deck: Deck) => {
    if (deck.originalText) {
      setSelectedDeckOriginalText({ name: deck.name, text: deck.originalText });
      setOriginalTextDialogOpen(true);
    }
  };

  return (
    <>
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Folders
          </Button>
          <div className="flex items-center gap-3">
            <div>
              <h2 className="text-2xl font-bold">{folderName}</h2>
              <p className="text-muted-foreground">Vocabulary decks in this folder</p>
            </div>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={onSettings} className="gap-1">
            <Settings className="w-3 h-3" />
            Settings
          </Button>
          <Button onClick={onAddDeck}>
            <Plus className="w-4 h-4 mr-2" />
            Add Deck
          </Button>
        </div>
      </div>

      {decks.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">
              No decks in this folder yet. Create your first deck!
            </p>
            <Button onClick={onAddDeck}>
              <Plus className="w-4 h-4 mr-2" />
              Create First Deck
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {decks.map((deck) => {
            const vocabCount = vocabularyCounts[deck.id] || 0;
            const isCompleted = deckCompletionStatus[deck.id];
            return (
              <Card key={deck.id} className="group hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                        <BookOpen className="w-5 h-5 text-accent" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <CardTitle className="text-lg">{deck.name}</CardTitle>
                          {deck.deckType === 'grammar-rules' && (
                            <Badge variant="secondary" className="text-xs">Grammar Rules</Badge>
                          )}
                          {deck.information && (
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
                                <p className="text-sm whitespace-pre-wrap">{deck.information}</p>
                              </HoverCardContent>
                            </HoverCard>
                          )}
                          {isCompleted && (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              onEditDeck(deck.id);
                            }}
                            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Pencil className="w-3 h-3" />
                          </Button>
                        </div>
                        {deck.deckType !== 'grammar-exercises' && (
                          <CardDescription>
                            {deck.fromLanguage} → {deck.toLanguage}
                          </CardDescription>
                        )}
                        <CardDescription className="text-xs">
                          {vocabCount} {deck.deckType === 'grammar-exercises' ? 'exercise' : 'word'}{vocabCount !== 1 ? 's' : ''}
                          {isCompleted && (
                            <span className="text-green-600 ml-2">• All mastered</span>
                          )}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {deck.deckType !== 'grammar-exercises' && deck.originalText && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewOriginalText(deck);
                          }}
                          className="h-8 w-8 p-0"
                          title="View original text"
                        >
                          <FileText className="w-4 h-4 text-muted-foreground" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClick(deck.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className={`grid ${deck.deckType === 'grammar-exercises' ? 'grid-cols-2' : 'grid-cols-3'} gap-2`}>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="gap-1"
                      onClick={() => onSelectDeck(deck.id)}
                    >
                      <BookOpen className="w-3 h-3" />
                      Manage
                    </Button>
                    <Button 
                      size="sm" 
                      className="gap-1"
                      onClick={() => onStudyDeck(deck.id)}
                      disabled={vocabCount === 0}
                    >
                      <Brain className="w-3 h-3" />
                      Study
                    </Button>
                    {deck.deckType !== 'grammar-exercises' && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="gap-1"
                        onClick={() => onPreviewDeck(deck.id)}
                        disabled={vocabCount === 0}
                      >
                        <Eye className="w-3 h-3" />
                        Preview
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this deck and all its vocabulary. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={originalTextDialogOpen} onOpenChange={setOriginalTextDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Original Text - {selectedDeckOriginalText?.name}</DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[60vh] w-full rounded-md border p-4">
            <p className="whitespace-pre-wrap text-sm">{selectedDeckOriginalText?.text}</p>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
    </>
  );
};