import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Settings as SettingsIcon } from "lucide-react";

export interface StudySettings {
  correctRepetitions: number;
  incorrectRepetitions: number;
  almostCorrectRepetitions: number;
  previewDelay: number;
}

interface SettingsProps {
  settings: StudySettings;
  onUpdateSettings: (settings: StudySettings) => void;
  onBack: () => void;
}

export const Settings = ({ settings, onUpdateSettings, onBack }: SettingsProps) => {
  const handleSettingChange = (key: keyof StudySettings, value: string) => {
    onUpdateSettings({
      ...settings,
      [key]: parseInt(value)
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Button variant="ghost" onClick={onBack}>
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Overview
      </Button>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <SettingsIcon className="w-5 h-5 mr-2" />
            Study Settings
          </CardTitle>
          <CardDescription>
            Configure how vocabulary repetition works during study sessions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="correct">Correct Answer Repetitions</Label>
            <Select
              value={settings.correctRepetitions.toString()}
              onValueChange={(value) => handleSettingChange('correctRepetitions', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">0 times</SelectItem>
                <SelectItem value="1">1 time</SelectItem>
                <SelectItem value="2">2 times</SelectItem>
                <SelectItem value="3">3 times</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              How many extra times to include words previously answered correctly
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="incorrect">Incorrect Answer Repetitions</Label>
            <Select
              value={settings.incorrectRepetitions.toString()}
              onValueChange={(value) => handleSettingChange('incorrectRepetitions', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 time</SelectItem>
                <SelectItem value="2">2 times</SelectItem>
                <SelectItem value="3">3 times</SelectItem>
                <SelectItem value="4">4 times</SelectItem>
                <SelectItem value="5">5 times</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              How many times a word should reappear if answered incorrectly
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="almostCorrect">Almost Correct Answer Repetitions</Label>
            <Select
              value={settings.almostCorrectRepetitions.toString()}
              onValueChange={(value) => handleSettingChange('almostCorrectRepetitions', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 time</SelectItem>
                <SelectItem value="2">2 times</SelectItem>
                <SelectItem value="3">3 times</SelectItem>
                <SelectItem value="4">4 times</SelectItem>
                <SelectItem value="5">5 times</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              How many times a word should reappear if answered almost correctly
            </p>
          </div>

        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;