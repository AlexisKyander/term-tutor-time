import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Eye } from "lucide-react";
import { useState } from "react";

interface PreviewOptionsProps {
  onStart: (delay: number, order: 'original' | 'random') => void;
  onCancel: () => void;
}

export const PreviewOptions = ({ onStart, onCancel }: PreviewOptionsProps) => {
  const [delay, setDelay] = useState<number>(3);
  const [order, setOrder] = useState<'original' | 'random'>('random');

  const handleStart = () => {
    onStart(delay, order);
  };

  return (
    <div className="max-w-md mx-auto space-y-6">
      <Button variant="ghost" onClick={onCancel}>
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Button>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Eye className="w-5 h-5 mr-2" />
            Preview Settings
          </CardTitle>
          <CardDescription>
            Configure your preview session
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="delay">Translation Delay</Label>
            <Select
              value={delay.toString()}
              onValueChange={(value) => setDelay(parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 second</SelectItem>
                <SelectItem value="2">2 seconds</SelectItem>
                <SelectItem value="3">3 seconds</SelectItem>
                <SelectItem value="4">4 seconds</SelectItem>
                <SelectItem value="5">5 seconds</SelectItem>
                <SelectItem value="6">6 seconds</SelectItem>
                <SelectItem value="7">7 seconds</SelectItem>
                <SelectItem value="8">8 seconds</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              How long to wait before showing the translation
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="order">Card Order</Label>
            <Select
              value={order}
              onValueChange={(value) => setOrder(value as 'original' | 'random')}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="original">Original order</SelectItem>
                <SelectItem value="random">Random order</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              Choose how to order the vocabulary cards
            </p>
          </div>

          <Button onClick={handleStart} className="w-full">
            <Eye className="w-4 h-4 mr-2" />
            Start Preview
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
