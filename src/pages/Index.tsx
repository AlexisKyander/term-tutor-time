import { useState } from "react";
import { VocabularyForm } from "@/components/VocabularyForm";
import { VocabularyList } from "@/components/VocabularyList";
import { FlashcardMode } from "@/components/FlashcardMode";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Plus, Brain } from "lucide-react";

export interface VocabularyItem {
  id: string;
  word: string;
  translation: string;
  language: string;
  targetLanguage: string;
  createdAt: Date;
}

type Mode = 'overview' | 'add' | 'list' | 'study';

const Index = () => {
  const [vocabulary, setVocabulary] = useState<VocabularyItem[]>([]);
  const [mode, setMode] = useState<Mode>('overview');

  const addVocabulary = (item: Omit<VocabularyItem, 'id' | 'createdAt'>) => {
    const newItem: VocabularyItem = {
      ...item,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    };
    setVocabulary(prev => [...prev, newItem]);
  };

  const deleteVocabulary = (id: string) => {
    setVocabulary(prev => prev.filter(item => item.id !== id));
  };

  const renderContent = () => {
    switch (mode) {
      case 'add':
        return (
          <VocabularyForm 
            onAdd={addVocabulary} 
            onBack={() => setMode('overview')}
          />
        );
      case 'list':
        return (
          <VocabularyList 
            vocabulary={vocabulary}
            onDelete={deleteVocabulary}
            onBack={() => setMode('overview')}
          />
        );
      case 'study':
        return vocabulary.length > 0 ? (
          <FlashcardMode 
            vocabulary={vocabulary}
            onBack={() => setMode('overview')}
          />
        ) : (
          <Card className="max-w-md mx-auto">
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground mb-4">
                No vocabulary added yet. Add some words first!
              </p>
              <Button onClick={() => setMode('add')}>
                <Plus className="w-4 h-4 mr-2" />
                Add Vocabulary
              </Button>
            </CardContent>
          </Card>
        );
      default:
        return (
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-primary to-purple-600 rounded-xl shadow-lg">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                VocabMaster
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Learn vocabulary efficiently with flashcards. Add your own words and test yourself!
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer" 
                    onClick={() => setMode('add')}>
                <CardHeader className="text-center">
                  <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Plus className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle>Add Vocabulary</CardTitle>
                  <CardDescription>
                    Create new vocabulary pairs to learn
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer" 
                    onClick={() => setMode('list')}>
                <CardHeader className="text-center">
                  <div className="mx-auto w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                    <BookOpen className="w-6 h-6 text-accent" />
                  </div>
                  <CardTitle>Manage Words</CardTitle>
                  <CardDescription>
                    View and manage your vocabulary ({vocabulary.length} words)
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer" 
                    onClick={() => setMode('study')}>
                <CardHeader className="text-center">
                  <div className="mx-auto w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center group-hover:bg-purple-500/20 transition-colors">
                    <Brain className="w-6 h-6 text-purple-500" />
                  </div>
                  <CardTitle>Study Flashcards</CardTitle>
                  <CardDescription>
                    Test yourself with flashcard exercises
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>

            {vocabulary.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {vocabulary.slice(-3).reverse().map((item) => (
                      <div key={item.id} className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                        <div>
                          <span className="font-medium">{item.word}</span>
                          <span className="text-muted-foreground mx-2">→</span>
                          <span>{item.translation}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {item.language} → {item.targetLanguage}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
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
