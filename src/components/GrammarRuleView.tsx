import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { VocabularyItem } from "@/pages/Index";

interface GrammarRuleViewProps {
  item: VocabularyItem;
  onBack: () => void;
  deckName: string;
}

export const GrammarRuleView = ({ item, onBack, deckName }: GrammarRuleViewProps) => {
  // Simple markdown-like table rendering
  const renderRule = (rule: string) => {
    const lines = rule.split('\n');
    let inTable = false;
    const elements: JSX.Element[] = [];
    let tableRows: string[] = [];
    
    lines.forEach((line, index) => {
      // Simple table detection (lines with | characters)
      if (line.trim().includes('|')) {
        if (!inTable) {
          inTable = true;
          tableRows = [];
        }
        tableRows.push(line);
      } else {
        if (inTable && tableRows.length > 0) {
          // Render the table
          elements.push(renderTable(tableRows, `table-${index}`));
          tableRows = [];
          inTable = false;
        }
        if (line.trim()) {
          elements.push(<p key={`p-${index}`} className="mb-2">{line}</p>);
        }
      }
    });
    
    // Render remaining table if any
    if (inTable && tableRows.length > 0) {
      elements.push(renderTable(tableRows, 'table-end'));
    }
    
    return elements;
  };
  
  const renderTable = (rows: string[], key: string) => {
    const parsedRows = rows
      .filter(row => !row.includes('---')) // Skip separator rows
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
    <div className="max-w-3xl mx-auto">
      <Button variant="ghost" onClick={onBack} className="mb-4">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to {deckName}
      </Button>
      
      <Card>
        <CardHeader>
          <CardTitle>{item.title}</CardTitle>
          <CardDescription>Grammar Rule</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm max-w-none dark:prose-invert">
            {item.rule && renderRule(item.rule)}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
