import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, BookOpen, Plus, Trash2, Brain, Settings, CheckCircle } from "lucide-react";

export interface Deck {
  id: string;
  name: string;
  folderId: string;
  fromLanguage: string;
  toLanguage: string;
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
  onStudyDeck: (deckId: string) => void;
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
  onStudyDeck, 
  onBack,
  onSettings
}: DeckListProps) => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Folders
          </Button>
          <div>
            <h2 className="text-2xl font-bold">{folderName}</h2>
            <p className="text-muted-foreground">Vocabulary decks in this folder</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={onSettings}>
            <Settings className="w-4 h-4 mr-2" />
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
                          {isCompleted && (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          )}
                        </div>
                        <CardDescription>
                          {deck.fromLanguage} → {deck.toLanguage}
                        </CardDescription>
                        <CardDescription className="text-xs">
                          {vocabCount} words
                          {isCompleted && (
                            <span className="text-green-600 ml-2">• All mastered</span>
                          )}
                        </CardDescription>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteDeck(deck.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => onSelectDeck(deck.id)}
                      className="flex-1"
                    >
                      <BookOpen className="w-4 h-4 mr-2" />
                      Manage
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={() => onStudyDeck(deck.id)}
                      disabled={vocabCount === 0}
                      className="flex-1"
                    >
                      <Brain className="w-4 h-4 mr-2" />
                      Study
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};