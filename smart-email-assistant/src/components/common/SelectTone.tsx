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

const TONES = [
  { value: 'FORMAL', label: 'Formal', description: 'Professional and business-like' },
  { value: 'FRIENDLY', label: 'Friendly', description: 'Warm and approachable' },
  { value: 'APOLOGY', label: 'Apology', description: 'Sincere and understanding' },
  { value: 'FOLLOW_UP', label: 'Follow Up', description: 'Reminder with context' },
  { value: 'HR', label: 'HR', description: 'Official and policy-oriented' },
  { value: 'SALES', label: 'Sales', description: 'Persuasive and engaging' },
  { value: 'SUPPORT', label: 'Support', description: 'Helpful and empathetic' },
];

interface SelectToneProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  disabled?: boolean;
}

export const SelectTone: React.FC<SelectToneProps> = ({
  value,
  onChange,
  className,
  disabled = false,
}) => {
  return (
    <div className={cn("space-y-2", className)}>
      <Label className="text-sm font-medium text-foreground">Tone</Label>
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger className="w-full transition-all duration-200 hover:border-primary/50">
          <SelectValue placeholder="Select tone" />
        </SelectTrigger>
        <SelectContent>
          {TONES.map((tone) => (
            <SelectItem key={tone.value} value={tone.value}>
              <div className="flex flex-col">
                <span className="font-medium">{tone.label}</span>
                <span className="text-xs text-muted-foreground">{tone.description}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export { TONES };
