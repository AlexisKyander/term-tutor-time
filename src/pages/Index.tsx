import { useState } from "react";
import { VocabularyForm } from "@/components/VocabularyForm";
import { VocabularyList } from "@/components/VocabularyList";
import { FlashcardMode } from "@/components/FlashcardMode";
import { FolderList, type Folder } from "@/components/FolderList";
import { DeckList, type Deck } from "@/components/DeckList";
import { FolderForm } from "@/components/FolderForm";
import { DeckForm } from "@/components/DeckForm";
import { useToast } from "@/hooks/use-toast";

export interface VocabularyItem {
  id: string;
  word: string;
  translation: string;
  language: string;
  targetLanguage: string;
  deckId: string;
  createdAt: Date;
}

type Mode = 'folders' | 'add-folder' | 'decks' | 'add-deck' | 'vocabulary' | 'add-word' | 'study';

interface NavigationState {
  currentFolderId?: string;
  currentDeckId?: string;
}

const Index = () => {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [decks, setDecks] = useState<Deck[]>([]);
  const [vocabulary, setVocabulary] = useState<VocabularyItem[]>([]);
  const [mode, setMode] = useState<Mode>('folders');
  const [navigation, setNavigation] = useState<NavigationState>({});
  const { toast } = useToast();

  const addFolder = (name: string) => {
    const newFolder: Folder = {
      id: crypto.randomUUID(),
      name,
      createdAt: new Date(),
    };
    setFolders(prev => [...prev, newFolder]);
    setMode('folders');
  };

  const deleteFolder = (id: string) => {
    const relatedDecks = decks.filter(deck => deck.folderId === id);
    const relatedVocab = vocabulary.filter(item => 
      relatedDecks.some(deck => deck.id === item.deckId)
    );
    
    setFolders(prev => prev.filter(folder => folder.id !== id));
    setDecks(prev => prev.filter(deck => deck.folderId !== id));
    setVocabulary(prev => prev.filter(item => 
      !relatedDecks.some(deck => deck.id === item.deckId)
    ));
    
    toast({
      title: "Folder deleted",
      description: `Deleted folder and ${relatedDecks.length} decks with ${relatedVocab.length} words`,
    });
  };

  const addDeck = (name: string) => {
    if (!navigation.currentFolderId) return;
    
    const newDeck: Deck = {
      id: crypto.randomUUID(),
      name,
      folderId: navigation.currentFolderId,
      createdAt: new Date(),
    };
    setDecks(prev => [...prev, newDeck]);
    setMode('decks');
  };

  const deleteDeck = (id: string) => {
    const relatedVocab = vocabulary.filter(item => item.deckId === id);
    
    setDecks(prev => prev.filter(deck => deck.id !== id));
    setVocabulary(prev => prev.filter(item => item.deckId !== id));
    
    toast({
      title: "Deck deleted",
      description: `Deleted deck with ${relatedVocab.length} words`,
    });
  };

  const addVocabulary = (item: Omit<VocabularyItem, 'id' | 'createdAt'>) => {
    const newItem: VocabularyItem = {
      ...item,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    };
    setVocabulary(prev => [...prev, newItem]);
    setMode('vocabulary');
  };

  const deleteVocabulary = (id: string) => {
    setVocabulary(prev => prev.filter(item => item.id !== id));
  };

  const selectFolder = (folderId: string) => {
    setNavigation({ currentFolderId: folderId });
    setMode('decks');
  };

  const selectDeck = (deckId: string) => {
    setNavigation(prev => ({ ...prev, currentDeckId: deckId }));
    setMode('vocabulary');
  };

  const studyDeck = (deckId: string) => {
    setNavigation(prev => ({ ...prev, currentDeckId: deckId }));
    setMode('study');
  };

  const getCurrentFolder = () => {
    return folders.find(f => f.id === navigation.currentFolderId);
  };

  const getCurrentDeck = () => {
    return decks.find(d => d.id === navigation.currentDeckId);
  };

  const getCurrentDecks = () => {
    return decks.filter(d => d.folderId === navigation.currentFolderId);
  };

  const getCurrentVocabulary = () => {
    return vocabulary.filter(v => v.deckId === navigation.currentDeckId);
  };

  const getVocabularyCounts = () => {
    return decks.reduce((acc, deck) => {
      acc[deck.id] = vocabulary.filter(v => v.deckId === deck.id).length;
      return acc;
    }, {} as Record<string, number>);
  };

  const renderContent = () => {
    switch (mode) {
      case 'add-folder':
        return (
          <FolderForm 
            onAdd={addFolder}
            onBack={() => setMode('folders')}
          />
        );

      case 'decks': {
        const currentFolder = getCurrentFolder();
        if (!currentFolder) {
          setMode('folders');
          return null;
        }
        return (
          <DeckList 
            decks={getCurrentDecks()}
            folderName={currentFolder.name}
            vocabularyCounts={getVocabularyCounts()}
            onSelectDeck={selectDeck}
            onAddDeck={() => setMode('add-deck')}
            onDeleteDeck={deleteDeck}
            onStudyDeck={studyDeck}
            onBack={() => setMode('folders')}
          />
        );
      }

      case 'add-deck': {
        const currentFolder = getCurrentFolder();
        if (!currentFolder) {
          setMode('folders');
          return null;
        }
        return (
          <DeckForm 
            folderName={currentFolder.name}
            onAdd={addDeck}
            onBack={() => setMode('decks')}
          />
        );
      }

      case 'vocabulary': {
        const currentDeck = getCurrentDeck();
        if (!currentDeck) {
          setMode('decks');
          return null;
        }
        return (
          <VocabularyList 
            vocabulary={getCurrentVocabulary()}
            deckName={currentDeck.name}
            onDelete={deleteVocabulary}
            onAddWord={() => setMode('add-word')}
            onBack={() => setMode('decks')}
          />
        );
      }

      case 'add-word': {
        const currentDeck = getCurrentDeck();
        if (!currentDeck) {
          setMode('decks');
          return null;
        }
        return (
          <VocabularyForm 
            deckName={currentDeck.name}
            deckId={currentDeck.id}
            onAdd={addVocabulary}
            onBack={() => setMode('vocabulary')}
          />
        );
      }

      case 'study': {
        const currentDeck = getCurrentDeck();
        const vocabItems = getCurrentVocabulary();
        
        if (!currentDeck) {
          setMode('decks');
          return null;
        }
        
        return (
          <FlashcardMode 
            vocabulary={vocabItems}
            onBack={() => setMode('decks')}
          />
        );
      }

      default:
        return (
          <FolderList 
            folders={folders}
            onSelectFolder={selectFolder}
            onAddFolder={() => setMode('add-folder')}
            onDeleteFolder={deleteFolder}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-purple-50/30">
      <div className="container mx-auto px-4 py-8">
        {renderContent()}
      </div>
    </div>
  );
};

export default Index;