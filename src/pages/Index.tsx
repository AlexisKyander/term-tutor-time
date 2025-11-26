import { useState, useEffect } from "react";
import { VocabularyForm } from "@/components/VocabularyForm";
import { VocabularyList } from "@/components/VocabularyList";
import { VocabularyEditForm } from "@/components/VocabularyEditForm";
import { FlashcardMode } from "@/components/FlashcardMode";
import { GrammarRuleView } from "@/components/GrammarRuleView";
import { GrammarRulesGridView } from "@/components/GrammarRulesGridView";
import { CategoryList, type Category } from "@/components/CategoryList";
import { FolderList, type Folder } from "@/components/FolderList";
import { DeckList, type Deck } from "@/components/DeckList";
import { FolderForm } from "@/components/FolderForm";
import { DeckForm } from "@/components/DeckForm";
import SettingsView, { type StudySettings } from "@/components/Settings";
import { PreviewMode } from "@/components/PreviewMode";
import { DirectionSelector } from "@/components/DirectionSelector";
import { PreviewOptions } from "@/components/PreviewOptions";
import { useToast } from "@/hooks/use-toast";
import { Download, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface VocabularyItem {
  id: string;
  word: string;
  translation: string;
  comment: string;
  image?: string;
  type?: 'practice' | 'grammar-rule' | 'grammar-exercise';
  title?: string;
  rule?: string;
  exerciseDescription?: string;
  exerciseType?: 'regular' | 'cloze-test';
  question?: string;
  answer?: string;
  clozeText?: string;
  clozeAnswers?: string[];
  clozeInputMode?: 'individual' | 'running-text';
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

type Mode = 'categories' | 'folders' | 'add-folder' | 'edit-folder' | 'decks' | 'add-deck' | 'edit-deck' | 'vocabulary' | 'add-word' | 'edit-word' | 'view-grammar-rule' | 'study' | 'preview' | 'settings' | 'direction-selector' | 'preview-options';

interface NavigationState {
  currentCategoryId?: string;
  currentFolderId?: string;
  currentDeckId?: string;
  editingFolderId?: string;
  editingDeckId?: string;
  editingVocabularyId?: string;
  viewingVocabularyId?: string;
  practicingVocabularyId?: string;
  studyDirection?: 'forward' | 'reverse';
  previewDelay?: number;
  previewOrder?: 'original' | 'random';
}

const STORAGE_KEY = 'vocabulary-app-data';

const DEFAULT_SETTINGS: StudySettings = {
  correctRepetitions: 1,
  incorrectRepetitions: 2,
  almostCorrectRepetitions: 2,
};

const Index = () => {
  const [categories] = useState<Category[]>([
    { id: 'vocabulary', name: 'Vocabulary', icon: 'vocabulary' },
    { id: 'grammar', name: 'Grammar', icon: 'grammar' },
  ]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [decks, setDecks] = useState<Deck[]>([]);
  const [vocabulary, setVocabulary] = useState<VocabularyItem[]>([]);
  const [mode, setMode] = useState<Mode>('categories');
  const [navigation, setNavigation] = useState<NavigationState>({});
  const [settings, setSettings] = useState<StudySettings>(DEFAULT_SETTINGS);
  const { toast } = useToast();

  // Load data from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        
        // Migration: Add categoryId to existing folders if they don't have it
        if (parsed.folders) {
          const migratedFolders = parsed.folders.map((f: Folder) => ({
            ...f,
            categoryId: f.categoryId || 'vocabulary', // Default to 'vocabulary' for existing folders
            createdAt: new Date(f.createdAt)
          }));
          setFolders(migratedFolders);
        }
        
        if (parsed.decks) setDecks(parsed.decks.map((d: Deck) => ({ ...d, createdAt: new Date(d.createdAt) })));
        if (parsed.vocabulary) setVocabulary(parsed.vocabulary.map((v: VocabularyItem) => ({ ...v, createdAt: new Date(v.createdAt) })));
        if (parsed.settings) setSettings({ ...DEFAULT_SETTINGS, ...parsed.settings });
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
          if (imported.settings) setSettings({ ...DEFAULT_SETTINGS, ...imported.settings });
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

  const selectCategory = (categoryId: string) => {
    setNavigation({ currentCategoryId: categoryId });
    setMode('folders');
  };

  const addFolder = (name: string, fromLanguage: string, toLanguage: string, categoryId: string, parentFolderId?: string, description?: string) => {
    const newFolder: Folder = {
      id: crypto.randomUUID(),
      name,
      fromLanguage,
      toLanguage,
      categoryId: categoryId || navigation.currentCategoryId || 'vocabulary',
      parentFolderId,
      description,
      createdAt: new Date(),
    };
    
    // If this is a grammar content folder (has a parent), automatically create two sub-folders
    const parentFolder = parentFolderId ? folders.find(f => f.id === parentFolderId) : null;
    const isGrammarContentFolder = parentFolder && parentFolder.categoryId === 'grammar' && !parentFolder.parentFolderId;
    
    if (isGrammarContentFolder) {
      // Get language from parent folder if not provided
      const lang = fromLanguage || parentFolder.fromLanguage || '';
      const targetLang = toLanguage || parentFolder.toLanguage || '';
      
      const grammarRulesFolder: Folder = {
        id: crypto.randomUUID(),
        name: 'Grammar rules',
        fromLanguage: lang,
        toLanguage: targetLang,
        categoryId: 'grammar',
        parentFolderId: newFolder.id,
        type: 'grammar-rules',
        createdAt: new Date(),
      };
      
      const grammarExercisesFolder: Folder = {
        id: crypto.randomUUID(),
        name: 'Grammar exercises',
        fromLanguage: lang,
        toLanguage: targetLang,
        categoryId: 'grammar',
        parentFolderId: newFolder.id,
        type: 'grammar-exercises',
        createdAt: new Date(),
      };
      
      // Auto-create a singleton deck for Grammar Rules folder
      const grammarRulesDeck: Deck = {
        id: crypto.randomUUID(),
        name: 'Grammar Rules',
        folderId: grammarRulesFolder.id,
        fromLanguage: lang,
        toLanguage: targetLang,
        deckType: 'grammar-rules',
        createdAt: new Date(),
      };
      
      setFolders(prev => [...prev, newFolder, grammarRulesFolder, grammarExercisesFolder]);
      setDecks(prev => [...prev, grammarRulesDeck]);
    } else {
      setFolders(prev => [...prev, newFolder]);
    }
    
    setMode('folders');
  };

  const updateFolder = (id: string, name: string, fromLanguage: string, toLanguage: string, description?: string) => {
    setFolders(prev => prev.map(folder => 
      folder.id === id ? { ...folder, name, fromLanguage, toLanguage, description } : folder
    ));
    setMode('folders');
    toast({
      title: "Folder updated",
      description: "Folder settings have been updated",
    });
  };

  const editFolder = (id: string) => {
    setNavigation(prev => ({ ...prev, editingFolderId: id }));
    setMode('edit-folder');
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

  const addDeck = (name: string, fromLanguage: string, toLanguage: string, information?: string) => {
    if (!navigation.currentFolderId) return;
    
    // Determine deck type based on parent folder
    const currentFolder = folders.find(f => f.id === navigation.currentFolderId);
    console.log('addDeck - currentFolder:', {
      id: currentFolder?.id,
      name: currentFolder?.name,
      type: currentFolder?.type,
      allFolders: folders.map(f => ({ id: f.id, name: f.name, type: f.type }))
    });
    const deckType = currentFolder?.type === 'grammar-rules' ? 'grammar-rules' : 
                     currentFolder?.type === 'grammar-exercises' ? 'grammar-exercises' : undefined;
    console.log('addDeck - deckType will be:', deckType);
    
    const newDeck: Deck = {
      id: crypto.randomUUID(),
      name,
      folderId: navigation.currentFolderId,
      fromLanguage,
      toLanguage,
      information,
      deckType,
      createdAt: new Date(),
    };
    setDecks(prev => [...prev, newDeck]);
    setMode('decks');
  };

  const updateDeck = (id: string, name: string, fromLanguage: string, toLanguage: string, information?: string) => {
    setDecks(prev => prev.map(deck => 
      deck.id === id ? { ...deck, name, fromLanguage, toLanguage, information } : deck
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

  const viewGrammarRule = (id: string) => {
    setNavigation(prev => ({ ...prev, viewingVocabularyId: id }));
    setMode('view-grammar-rule');
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
    const folder = folders.find(f => f.id === folderId);
    
    if (!folder) return;
    
    // Grammar structure: Language folder -> Grammar content folder -> Grammar rules/exercises folders -> Decks
    // For Grammar language folders (no parent), show grammar content sub-folders
    if (folder.categoryId === 'grammar' && !folder.parentFolderId) {
      setNavigation(prev => ({ ...prev, currentFolderId: folderId }));
      setMode('folders');
      return;
    }
    
    // For Grammar content folders (parent is language folder), show grammar rules/exercises sub-folders
    const parentFolder = folder.parentFolderId ? folders.find(f => f.id === folder.parentFolderId) : null;
    const isGrammarContentFolder = parentFolder && parentFolder.categoryId === 'grammar' && !parentFolder.parentFolderId;
    
    if (isGrammarContentFolder) {
      setNavigation(prev => ({ ...prev, currentFolderId: folderId }));
      setMode('folders');
      return;
    }
    
    // For everything else, determine view based on folder type
    if (folder.type === 'grammar-rules') {
      const deck = ensureGrammarRulesDeck(folder);
      setNavigation(prev => ({ ...prev, currentFolderId: folderId, currentDeckId: deck?.id }));
      setMode('vocabulary');
    } else {
      setNavigation(prev => ({ ...prev, currentFolderId: folderId }));
      setMode('decks');
    }
  };

  const getCurrentCategory = () => {
    return categories.find(c => c.id === navigation.currentCategoryId);
  };

  const getCurrentCategoryFolders = () => {
    // If we're inside a folder, show its sub-folders
    if (navigation.currentFolderId) {
      return folders.filter(f => f.parentFolderId === navigation.currentFolderId);
    }
    // Otherwise, show top-level folders for the current category
    return folders.filter(f => f.categoryId === navigation.currentCategoryId && !f.parentFolderId);
  };

  const selectDeck = (deckId: string) => {
    setNavigation(prev => ({ ...prev, currentDeckId: deckId }));
    setMode('vocabulary');
  };

  const studyDeck = (deckId: string) => {
    const deck = decks.find(d => d.id === deckId);
    if (deck?.deckType === 'grammar-exercises') {
      // Skip direction selector for grammar exercises
      setNavigation(prev => ({ ...prev, currentDeckId: deckId, studyDirection: 'forward', practicingVocabularyId: undefined }));
      setMode('study');
    } else {
      setNavigation(prev => ({ ...prev, currentDeckId: deckId, practicingVocabularyId: undefined }));
      setMode('direction-selector');
    }
  };

  const practiceExercise = (vocabularyId: string) => {
    setNavigation(prev => ({ ...prev, practicingVocabularyId: vocabularyId, studyDirection: 'forward' }));
    setMode('study');
  };

  const previewDeck = (deckId: string) => {
    setNavigation(prev => ({ ...prev, currentDeckId: deckId }));
    setMode('preview-options');
  };

  const handleDirectionSelect = (direction: 'forward' | 'reverse') => {
    setNavigation(prev => ({ ...prev, studyDirection: direction }));
    setMode('study');
  };

  const handlePreviewOptionsSelect = (delay: number, order: 'original' | 'random') => {
    setNavigation(prev => ({ ...prev, previewDelay: delay, previewOrder: order }));
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

  // Ensure a singleton grammar-rules deck exists for a grammar rules folder
  const ensureGrammarRulesDeck = (folder: Folder) => {
    let deck = decks.find(d => d.folderId === folder.id && d.deckType === 'grammar-rules');
    if (!deck) {
      deck = {
        id: crypto.randomUUID(),
        name: 'Grammar Rules',
        folderId: folder.id,
        fromLanguage: folder.fromLanguage,
        toLanguage: folder.toLanguage,
        deckType: 'grammar-rules',
        createdAt: new Date(),
      };
      setDecks(prev => [...prev, deck!]);
    }
    return deck;
  };

  const getCurrentVocabulary = () => {
    return vocabulary.filter(v => v.deckId === navigation.currentDeckId);
  };

  const getCurrentPracticeVocabulary = () => {
    // If practicing a specific exercise, return only that one
    if (navigation.practicingVocabularyId) {
      const singleExercise = vocabulary.find(v => v.id === navigation.practicingVocabularyId);
      return singleExercise ? [singleExercise] : [];
    }
    return vocabulary.filter(v => v.deckId === navigation.currentDeckId && v.type !== 'grammar-rule');
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
      case 'folders': {
        const currentCategory = getCurrentCategory();
        const currentFolder = getCurrentFolder();
        
        // Determine what level of folders we're showing
        let displayName = currentCategory?.name || '';
        let isSubFolderView = false;
        let hideAddButton = false;
        
        if (currentFolder) {
          // If current folder is a language folder (no parent), we're showing grammar content folders
          if (currentFolder.categoryId === 'grammar' && !currentFolder.parentFolderId) {
            displayName = 'Grammar content';
            isSubFolderView = true;
          }
          // If current folder has a parent that's a language folder, we're showing grammar rules/exercises folders (auto-created)
          else {
            const parentFolder = folders.find(f => f.id === currentFolder.parentFolderId);
            if (parentFolder && !parentFolder.parentFolderId) {
              displayName = currentFolder.name;
              isSubFolderView = true;
              hideAddButton = true; // Don't allow adding folders at this level (auto-created)
            }
          }
        }
        
        if (!currentCategory && !isSubFolderView) {
          setMode('categories');
          return null;
        }
        
        return (
          <FolderList 
            folders={getCurrentCategoryFolders()}
            categoryName={displayName}
            categoryId={currentCategory?.id || currentFolder?.categoryId || ''}
            hideAddButton={hideAddButton}
            onSelectFolder={selectFolder}
            onAddFolder={() => setMode('add-folder')}
            onEditFolder={editFolder}
            onDeleteFolder={deleteFolder}
            onBack={() => {
              if (isSubFolderView && currentFolder?.parentFolderId) {
                // Go back to parent folder
                setNavigation(prev => ({ ...prev, currentFolderId: currentFolder.parentFolderId }));
                setMode('folders');
              } else if (isSubFolderView) {
                // Go back to category folders
                setNavigation(prev => ({ ...prev, currentFolderId: undefined }));
                setMode('folders');
              } else {
                setMode('categories');
              }
            }}
          />
        );
      }

      case 'add-folder': {
        const currentCategory = getCurrentCategory();
        const currentFolder = getCurrentFolder();
        
        // Determine if we're adding a grammar sub-folder
        let parentFolderId = undefined;
        let isSubFolder = false;
        
        if (currentFolder) {
          // If we're in a language folder (no parent), we're adding a grammar content folder
          if (currentFolder.categoryId === 'grammar' && !currentFolder.parentFolderId) {
            parentFolderId = currentFolder.id;
            isSubFolder = true;
          }
          // If we're in a grammar content folder, we're adding a grammar rules/exercises folder (which is auto-created)
          // This case shouldn't happen as those are auto-created, but handle it anyway
          else if (currentFolder.parentFolderId) {
            const parentFolder = folders.find(f => f.id === currentFolder.parentFolderId);
            if (parentFolder && !parentFolder.parentFolderId) {
              parentFolderId = currentFolder.id;
              isSubFolder = true;
            }
          }
        }
        
        return (
          <FolderForm 
            categoryId={navigation.currentCategoryId || currentFolder?.categoryId}
            categoryName={currentCategory?.name}
            parentFolderId={parentFolderId}
            isSubFolder={isSubFolder}
            onAdd={addFolder}
            onBack={() => setMode('folders')}
          />
        );
      }

      case 'edit-folder': {
        const editingFolder = folders.find(f => f.id === navigation.editingFolderId);
        const currentCategory = getCurrentCategory();
        const isGrammarSubFolder = editingFolder && !!editingFolder.parentFolderId;
        
        if (!editingFolder) {
          setMode('folders');
          return null;
        }
        return (
          <FolderForm 
            editingFolder={editingFolder}
            categoryName={currentCategory?.name}
            isSubFolder={isGrammarSubFolder}
            onAdd={addFolder}
            onUpdate={updateFolder}
            onBack={() => setMode('folders')}
          />
        );
      }

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
            onBack={() => {
              // If this folder has a parent, go back to that parent folder
              if (currentFolder.parentFolderId) {
                setNavigation(prev => ({ ...prev, currentFolderId: currentFolder.parentFolderId, currentDeckId: undefined }));
              } else {
                // Otherwise, clear the folder selection
                setNavigation(prev => ({ ...prev, currentFolderId: undefined, currentDeckId: undefined }));
              }
              setMode('folders');
            }}
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
            defaultFromLanguage={currentFolder.fromLanguage}
            defaultToLanguage={currentFolder.toLanguage}
            folderType={currentFolder.type}
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
            folderType={currentFolder.type}
            onAdd={addDeck}
            onUpdate={updateDeck}
            onBack={() => setMode('decks')}
          />
        );
      }

      case 'vocabulary': {
        const currentDeck = getCurrentDeck();
        const currentFolder = getCurrentFolder();
        if (!currentDeck || !currentFolder) {
          setMode('decks');
          return null;
        }
        
        // If it's a grammar-rules deck, show grid view
        if (currentDeck.deckType === 'grammar-rules') {
          const grammarRules = getCurrentVocabulary().filter(v => v.type === 'grammar-rule');
          return (
            <GrammarRulesGridView 
              items={grammarRules}
              deckName={currentFolder.name}
              onBack={() => {
                if (currentFolder.type === 'grammar-rules' && currentFolder.parentFolderId) {
                  setNavigation(prev => ({ ...prev, currentFolderId: currentFolder.parentFolderId, currentDeckId: undefined }));
                  setMode('folders');
                } else {
                  setMode('decks');
                }
              }}
              onAddWord={() => setMode('add-word')}
              onEdit={editVocabulary}
            />
          );
        }
        
        return (
          <VocabularyList 
            vocabulary={getCurrentVocabulary()}
            deckName={currentDeck.name}
            fromLanguage={currentDeck.fromLanguage}
            toLanguage={currentDeck.toLanguage}
            onDelete={deleteVocabulary}
            onEdit={editVocabulary}
            onView={viewGrammarRule}
            onPractice={currentDeck.deckType === 'grammar-exercises' ? practiceExercise : undefined}
            onAddWord={() => setMode('add-word')}
            isGrammarExercises={currentDeck.deckType === 'grammar-exercises'}
            onBack={() => {
              // For grammar exercises and regular decks, go back to the deck list within the same folder
              setMode('decks');
            }}
          />
        );
      }

      case 'add-word': {
        const currentDeck = getCurrentDeck();
        const currentFolder = getCurrentFolder();
        if (!currentDeck || !currentFolder) {
          setMode('decks');
          return null;
        }
        
        // For grammar exercises, get existing exercise description if any
        let existingExerciseDescription: string | undefined;
        if (currentDeck.deckType === 'grammar-exercises') {
          const existingCards = getCurrentVocabulary().filter(v => v.type === 'grammar-exercise');
          if (existingCards.length > 0 && existingCards[0].exerciseDescription) {
            existingExerciseDescription = existingCards[0].exerciseDescription;
          }
        }
        
        return (
          <VocabularyForm 
            deckName={currentDeck.name}
            deckId={currentDeck.id}
            categoryId={currentFolder.categoryId}
            deckType={currentDeck.deckType}
            existingExerciseDescription={existingExerciseDescription}
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

      case 'view-grammar-rule': {
        const currentDeck = getCurrentDeck();
        const viewingItem = vocabulary.find(v => v.id === navigation.viewingVocabularyId);
        if (!currentDeck || !viewingItem) {
          setMode('vocabulary');
          return null;
        }
        return (
          <GrammarRuleView 
            item={viewingItem}
            deckName={currentDeck.name}
            onEdit={editVocabulary}
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

      case 'preview-options': {
        const currentDeck = getCurrentDeck();
        if (!currentDeck) {
          setMode('decks');
          return null;
        }
        return (
          <PreviewOptions
            onStart={handlePreviewOptionsSelect}
            onCancel={() => setMode('decks')}
          />
        );
      }

      case 'study': {
        const currentDeck = getCurrentDeck();
        const vocabItems = getCurrentPracticeVocabulary();
        
        if (!currentDeck || !navigation.studyDirection) {
          setMode('decks');
          return null;
        }
        
        return (
          <FlashcardMode 
            vocabulary={vocabItems}
            settings={settings}
            direction={navigation.studyDirection}
            onBack={() => {
              // Clear practicing vocabulary ID when going back
              setNavigation(prev => ({ ...prev, practicingVocabularyId: undefined }));
              // If we were practicing a single exercise, go back to vocabulary list
              if (navigation.practicingVocabularyId) {
                setMode('vocabulary');
              } else {
                setMode('decks');
              }
            }}
            onUpdateStatistics={updateVocabularyStatistics}
          />
        );
      }

      case 'preview': {
        const currentDeck = getCurrentDeck();
        const vocabItems = getCurrentPracticeVocabulary();
        
        if (!currentDeck) {
          setMode('decks');
          return null;
        }
        
        return (
          <PreviewMode 
            vocabulary={vocabItems}
            delay={navigation.previewDelay || 3}
            order={navigation.previewOrder || 'random'}
            onBack={() => setMode('decks')}
          />
        );
      }

      case 'settings':
        return (
          <SettingsView 
            settings={settings}
            onUpdateSettings={setSettings}
            onBack={() => setMode('decks')}
          />
        );

      default:
        return (
          <CategoryList 
            categories={categories}
            onSelectCategory={selectCategory}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-purple-50/30">
      <div className="container mx-auto px-4 py-8">
        {mode === 'categories' && (
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