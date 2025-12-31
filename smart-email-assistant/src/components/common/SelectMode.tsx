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

const MODES = [
  { value: 'GENERATE_REPLY', label: 'Generate Reply', description: 'Create a new response' },
  { value: 'POLISH', label: 'Polish', description: 'Improve grammar and style' },
  { value: 'SHORTEN', label: 'Shorten', description: 'Make it more concise' },
  { value: 'EXPAND', label: 'Expand', description: 'Add more detail' },
  { value: 'MAKE_FORMAL', label: 'Make Formal', description: 'Professional tone' },
];

interface SelectModeProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  disabled?: boolean;
}

export const SelectMode: React.FC<SelectModeProps> = ({
  value,
  onChange,
  className,
  disabled = false,
}) => {
  return (
    <div className={cn("space-y-2", className)}>
      <Label className="text-sm font-medium text-foreground">Mode</Label>
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger className="w-full transition-all duration-200 hover:border-primary/50">
          <SelectValue placeholder="Select mode" />
        </SelectTrigger>
        <SelectContent>
          {MODES.map((mode) => (
            <SelectItem key={mode.value} value={mode.value}>
              <div className="flex flex-col">
                <span className="font-medium">{mode.label}</span>
                <span className="text-xs text-muted-foreground">{mode.description}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export { MODES };
