import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { ArrowLeft, Plus } from "lucide-react";
import { VocabularyItem } from "@/pages/Index";

interface GrammarRulesGridViewProps {
  items: VocabularyItem[];
  deckName: string;
  onBack: () => void;
  onAddWord: () => void;
}

export const GrammarRulesGridView = ({ items, deckName, onBack, onAddWord }: GrammarRulesGridViewProps) => {
  const [flippedId, setFlippedId] = useState<string | null>(null);

  const renderRule = (rule: string) => {
    const lines = rule.split('\n');
    let inTable = false;
    const elements: JSX.Element[] = [];
    let tableRows: string[] = [];
    
    lines.forEach((line, index) => {
      if (line.trim().includes('|')) {
        if (!inTable) {
          inTable = true;
          tableRows = [];
        }
        tableRows.push(line);
      } else {
        if (inTable && tableRows.length > 0) {
          elements.push(renderTable(tableRows, `table-${index}`));
          tableRows = [];
          inTable = false;
        }
        if (line.trim()) {
          elements.push(<p key={`p-${index}`} className="mb-2">{line}</p>);
        }
      }
    });
    
    if (inTable && tableRows.length > 0) {
      elements.push(renderTable(tableRows, 'table-end'));
    }
    
    return elements;
  };
  
  const renderTable = (rows: string[], key: string) => {
    const parsedRows = rows
      .filter(row => !row.includes('---'))
      .map(row => row.split('|').map(cell => cell.trim()).filter(cell => cell));
    
    if (parsedRows.length === 0) return null;
    
    const headers = parsedRows[0];
    const dataRows = parsedRows.slice(1);
    
    return (
      <div key={key} className="overflow-x-auto my-4">
        <table className="w-full border-collapse border border-border">
          <thead>
            <tr className="bg-muted">
              {headers.map((header, i) => (
                <th key={i} className="border border-border px-4 py-2 text-left font-semibold">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dataRows.map((row, i) => (
              <tr key={i} className="hover:bg-muted/50">
                {row.map((cell, j) => (
                  <td key={j} className="border border-border px-4 py-2">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to {deckName}
        </Button>
        <Button onClick={onAddWord}>
          <Plus className="w-4 h-4 mr-2" />
          Create new card
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.length === 0 ? (
          <div className="col-span-full text-center py-16">
            <p className="text-muted-foreground mb-4">No grammar rules added yet</p>
            <Button onClick={onAddWord}>
              <Plus className="w-4 h-4 mr-2" />
              Create first card
            </Button>
          </div>
        ) : (
          items.map((item) => (
            <Card 
              key={item.id} 
              className="cursor-pointer transition-transform hover:shadow-lg"
              onClick={() => setFlippedId(flippedId === item.id ? null : item.id)}
              style={{ transform: flippedId === item.id ? 'scale(1.03)' : 'scale(1)' }}
            >
              <div style={{ perspective: '1000px' }}>
                <div
                  style={{
                    position: 'relative',
                    transformStyle: 'preserve-3d',
                    transition: 'transform 0.6s',
                    transform: flippedId === item.id ? 'rotateY(180deg)' : 'rotateY(0deg)',
                    minHeight: '180px'
                  }}
                >
                  {/* Front */}
                  <div
                    style={{ backfaceVisibility: 'hidden', position: 'absolute', inset: 0, padding: '1.5rem' }}
                  >
                    <CardHeader className="p-0">
                      <CardTitle className="text-lg">{item.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 pt-4">
                      <p className="text-sm text-muted-foreground">Click to view rule</p>
                    </CardContent>
                  </div>

                  {/* Back */}
                  <div
                    style={{
                      backfaceVisibility: 'hidden',
                      transform: 'rotateY(180deg)',
                      position: 'absolute',
                      inset: 0,
                      padding: '1.5rem',
                      overflowY: 'auto'
                    }}
                  >
                    <div className="prose prose-sm max-w-none dark:prose-invert">
                      {item.rule && renderRule(item.rule)}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

    </div>
  );
};
