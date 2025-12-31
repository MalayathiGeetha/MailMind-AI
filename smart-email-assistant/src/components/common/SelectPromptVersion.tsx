import React from 'react';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

const PROMPT_VERSIONS = [
  { value: 'V1_SIMPLE', label: 'Simple', description: 'Quick and straightforward' },
  { value: 'V2_STRUCTURED', label: 'Structured', description: 'Organized with clear sections' },
  { value: 'V3_ENTERPRISE', label: 'Enterprise', description: 'Comprehensive and detailed' },
];

interface SelectPromptVersionProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  disabled?: boolean;
}

export const SelectPromptVersion: React.FC<SelectPromptVersionProps> = ({
  value,
  onChange,
  className,
  disabled = false,
}) => {
  return (
    <div className={cn("space-y-2", className)}>
      <Label className="text-sm font-medium text-foreground">Prompt Version</Label>
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger className="w-full transition-all duration-200 hover:border-primary/50">
          <SelectValue placeholder="Select version" />
        </SelectTrigger>
        <SelectContent>
          {PROMPT_VERSIONS.map((version) => (
            <SelectItem key={version.value} value={version.value}>
              <div className="flex flex-col">
                <span className="font-medium">{version.label}</span>
                <span className="text-xs text-muted-foreground">{version.description}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export { PROMPT_VERSIONS };
