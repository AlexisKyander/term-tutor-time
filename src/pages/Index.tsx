import { useState, useEffect } from "react";
import { VocabularyForm } from "@/components/VocabularyForm";
import { VocabularyList } from "@/components/VocabularyList";
import { VocabularyEditForm } from "@/components/VocabularyEditForm";
import { FlashcardMode } from "@/components/FlashcardMode";
import { FolderList, type Folder } from "@/components/FolderList";
import { DeckList, type Deck } from "@/components/DeckList";
import { FolderForm } from "@/components/FolderForm";
import { DeckForm } from "@/components/DeckForm";
import { Settings, type StudySettings } from "@/components/Settings";
import { PreviewMode } from "@/components/PreviewMode";
import { DirectionSelector } from "@/components/DirectionSelector";
import { useToast } from "@/hooks/use-toast";
import { Download, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface VocabularyItem {
  id: string;
  word: string;
  translation: string;
  comment: string;
  language: string;
  targetLanguage: string;
  deckId: string;
  createdAt: Date;
  statistics: {
    correct: number;
    almostCorrect: number;
    incorrect: number;
  };
}

type Mode = 'folders' | 'add-folder' | 'decks' | 'add-deck' | 'edit-deck' | 'vocabulary' | 'add-word' | 'edit-word' | 'study' | 'preview' | 'settings' | 'direction-selector' | 'direction-selector-preview';

interface NavigationState {
  currentFolderId?: string;
  currentDeckId?: string;
  editingDeckId?: string;
  editingVocabularyId?: string;
  studyDirection?: 'forward' | 'reverse';
}

const STORAGE_KEY = 'vocabulary-app-data';

const Index = () => {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [decks, setDecks] = useState<Deck[]>([]);
  const [vocabulary, setVocabulary] = useState<VocabularyItem[]>([]);
  const [mode, setMode] = useState<Mode>('folders');
  const [navigation, setNavigation] = useState<NavigationState>({});
  const [settings, setSettings] = useState<StudySettings>({
    incorrectRepetitions: 2,
    almostCorrectRepetitions: 2,
    previewDelay: 3,
  });
  const { toast } = useToast();

  // Load data from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        if (parsed.folders) setFolders(parsed.folders.map((f: Folder) => ({ ...f, createdAt: new Date(f.createdAt) })));
        if (parsed.decks) setDecks(parsed.decks.map((d: Deck) => ({ ...d, createdAt: new Date(d.createdAt) })));
        if (parsed.vocabulary) setVocabulary(parsed.vocabulary.map((v: VocabularyItem) => ({ ...v, createdAt: new Date(v.createdAt) })));
        if (parsed.settings) setSettings(parsed.settings);
      } catch (error) {
        console.error('Failed to load data from localStorage:', error);
      }
    }
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    const dataToSave = {
      folders,
      decks,
      vocabulary,
      settings,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
  }, [folders, decks, vocabulary, settings]);

  const exportData = () => {
    const dataToExport = {
      folders,
      decks,
      vocabulary,
      settings,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vocabulary-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({
      title: "Data exported",
      description: "Your vocabulary data has been downloaded as a JSON file",
    });
  };

  const importData = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const imported = JSON.parse(event.target?.result as string);
          if (imported.folders) setFolders(imported.folders.map((f: Folder) => ({ ...f, createdAt: new Date(f.createdAt) })));
          if (imported.decks) setDecks(imported.decks.map((d: Deck) => ({ ...d, createdAt: new Date(d.createdAt) })));
          if (imported.vocabulary) setVocabulary(imported.vocabulary.map((v: VocabularyItem) => ({ ...v, createdAt: new Date(v.createdAt) })));
          if (imported.settings) setSettings(imported.settings);
          toast({
            title: "Data imported",
            description: "Your vocabulary data has been successfully imported",
          });
        } catch (error) {
          toast({
            title: "Import failed",
            description: "Failed to import data. Please check the file format.",
            variant: "destructive",
          });
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

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

  const addDeck = (name: string, fromLanguage: string, toLanguage: string) => {
    if (!navigation.currentFolderId) return;
    
    const newDeck: Deck = {
      id: crypto.randomUUID(),
      name,
      folderId: navigation.currentFolderId,
      fromLanguage,
      toLanguage,
      createdAt: new Date(),
    };
    setDecks(prev => [...prev, newDeck]);
    setMode('decks');
  };

  const updateDeck = (id: string, name: string, fromLanguage: string, toLanguage: string) => {
    setDecks(prev => prev.map(deck => 
      deck.id === id ? { ...deck, name, fromLanguage, toLanguage } : deck
    ));
    setMode('decks');
    toast({
      title: "Deck updated",
      description: "Deck settings have been updated",
    });
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

  const editDeck = (id: string) => {
    setNavigation(prev => ({ ...prev, editingDeckId: id }));
    setMode('edit-deck');
  };

  const addVocabulary = (item: Omit<VocabularyItem, 'id' | 'createdAt' | 'statistics' | 'language' | 'targetLanguage'>) => {
    const currentDeck = getCurrentDeck();
    if (!currentDeck) return;
    
    const newItem: VocabularyItem = {
      ...item,
      id: crypto.randomUUID(),
      language: currentDeck.fromLanguage,
      targetLanguage: currentDeck.toLanguage,
      createdAt: new Date(),
      statistics: { correct: 0, almostCorrect: 0, incorrect: 0 },
    };
    setVocabulary(prev => [...prev, newItem]);
    setMode('vocabulary');
  };

  const updateVocabulary = (updatedItem: VocabularyItem) => {
    setVocabulary(prev => prev.map(item => 
      item.id === updatedItem.id ? updatedItem : item
    ));
    setMode('vocabulary');
  };

  const deleteVocabulary = (id: string) => {
    setVocabulary(prev => prev.filter(item => item.id !== id));
  };

  const editVocabulary = (id: string) => {
    setNavigation(prev => ({ ...prev, editingVocabularyId: id }));
    setMode('edit-word');
  };

  const updateVocabularyStatistics = (vocabularyId: string, result: 'correct' | 'almostCorrect' | 'incorrect') => {
    setVocabulary(prev => prev.map(item => 
      item.id === vocabularyId 
        ? {
            ...item,
            statistics: {
              ...item.statistics,
              [result]: item.statistics[result] + 1
            }
          }
        : item
    ));
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
    setMode('direction-selector');
  };

  const previewDeck = (deckId: string) => {
    setNavigation(prev => ({ ...prev, currentDeckId: deckId }));
    setMode('direction-selector-preview');
  };

  const handleDirectionSelect = (direction: 'forward' | 'reverse') => {
    setNavigation(prev => ({ ...prev, studyDirection: direction }));
    setMode('study');
  };

  const handlePreviewDirectionSelect = (direction: 'forward' | 'reverse') => {
    setNavigation(prev => ({ ...prev, studyDirection: direction }));
    setMode('preview');
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

  const getDeckCompletionStatus = () => {
    return decks.reduce((acc, deck) => {
      const deckVocab = vocabulary.filter(v => v.deckId === deck.id);
      const hasAllCorrect = deckVocab.length > 0 && deckVocab.every(v => v.statistics.correct > 0);
      acc[deck.id] = hasAllCorrect;
      return acc;
    }, {} as Record<string, boolean>);
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
            deckCompletionStatus={getDeckCompletionStatus()}
            onSelectDeck={selectDeck}
            onAddDeck={() => setMode('add-deck')}
            onDeleteDeck={deleteDeck}
            onEditDeck={editDeck}
            onStudyDeck={studyDeck}
            onPreviewDeck={previewDeck}
            onBack={() => setMode('folders')}
            onSettings={() => setMode('settings')}
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

      case 'edit-deck': {
        const currentFolder = getCurrentFolder();
        const editingDeck = decks.find(d => d.id === navigation.editingDeckId);
        if (!currentFolder || !editingDeck) {
          setMode('decks');
          return null;
        }
        return (
          <DeckForm 
            folderName={currentFolder.name}
            editingDeck={editingDeck}
            onAdd={addDeck}
            onUpdate={updateDeck}
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
            fromLanguage={currentDeck.fromLanguage}
            toLanguage={currentDeck.toLanguage}
            onDelete={deleteVocabulary}
            onEdit={editVocabulary}
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

      case 'edit-word': {
        const currentDeck = getCurrentDeck();
        const editingItem = vocabulary.find(v => v.id === navigation.editingVocabularyId);
        if (!currentDeck || !editingItem) {
          setMode('vocabulary');
          return null;
        }
        return (
          <VocabularyEditForm 
            item={editingItem}
            deckName={currentDeck.name}
            onUpdate={updateVocabulary}
            onBack={() => setMode('vocabulary')}
          />
        );
      }

      case 'direction-selector': {
        const currentDeck = getCurrentDeck();
        if (!currentDeck) {
          setMode('decks');
          return null;
        }
        return (
          <DirectionSelector
            fromLanguage={currentDeck.fromLanguage}
            toLanguage={currentDeck.toLanguage}
            onSelect={handleDirectionSelect}
            onCancel={() => setMode('decks')}
          />
        );
      }

      case 'direction-selector-preview': {
        const currentDeck = getCurrentDeck();
        if (!currentDeck) {
          setMode('decks');
          return null;
        }
        return (
          <DirectionSelector
            fromLanguage={currentDeck.fromLanguage}
            toLanguage={currentDeck.toLanguage}
            onSelect={handlePreviewDirectionSelect}
            onCancel={() => setMode('decks')}
          />
        );
      }

      case 'study': {
        const currentDeck = getCurrentDeck();
        const vocabItems = getCurrentVocabulary();
        
        if (!currentDeck || !navigation.studyDirection) {
          setMode('decks');
          return null;
        }
        
        return (
          <FlashcardMode 
            vocabulary={vocabItems}
            settings={settings}
            direction={navigation.studyDirection}
            onBack={() => setMode('decks')}
            onUpdateStatistics={updateVocabularyStatistics}
          />
        );
      }

      case 'preview': {
        const currentDeck = getCurrentDeck();
        const vocabItems = getCurrentVocabulary();
        
        if (!currentDeck || !navigation.studyDirection) {
          setMode('decks');
          return null;
        }
        
        return (
          <PreviewMode 
            vocabulary={vocabItems}
            settings={settings}
            direction={navigation.studyDirection}
            onBack={() => setMode('decks')}
          />
        );
      }

      case 'settings':
        return (
          <Settings 
            settings={settings}
            onUpdateSettings={setSettings}
            onBack={() => setMode('decks')}
          />
        );

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
        {mode === 'folders' && (
          <div className="flex gap-2 mb-4 justify-end">
            <Button variant="outline" size="sm" onClick={importData}>
              <Upload className="w-4 h-4 mr-2" />
              Import
            </Button>
            <Button variant="outline" size="sm" onClick={exportData}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        )}
        {renderContent()}
      </div>
    </div>
  );
};

export default Index;