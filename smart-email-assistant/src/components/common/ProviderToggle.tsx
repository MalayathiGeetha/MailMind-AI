import React from 'react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';
import { Sparkles, Server } from 'lucide-react';

const PROVIDERS = [
  { value: 'GEMINI', label: 'Gemini', icon: Sparkles, description: 'Google AI' },
  { value: 'OLLAMA', label: 'Ollama', icon: Server, description: 'Local LLM' },
];

interface ProviderToggleProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  disabled?: boolean;
}

export const ProviderToggle: React.FC<ProviderToggleProps> = ({
  value,
  onChange,
  className,
  disabled = false,
}) => {
  return (
    <div className={cn("space-y-2", className)}>
      <Label className="text-sm font-medium text-foreground">AI Provider</Label>
      <RadioGroup
        value={value}
        onValueChange={onChange}
        className="grid grid-cols-2 gap-3"
        disabled={disabled}
      >
        {PROVIDERS.map((provider) => {
          const Icon = provider.icon;
          const isSelected = value === provider.value;
          return (
            <label
              key={provider.value}
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all duration-200",
                isSelected
                  ? "border-primary bg-primary/5 shadow-sm"
                  : "border-border hover:border-primary/30 hover:bg-muted/50",
                disabled && "opacity-50 cursor-not-allowed"
              )}
            >
              <RadioGroupItem value={provider.value} id={provider.value} className="sr-only" />
              <div className={cn(
                "p-2 rounded-md transition-colors",
                isSelected ? "bg-primary text-primary-foreground" : "bg-muted"
              )}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex flex-col">
                <span className="font-medium text-sm">{provider.label}</span>
                <span className="text-xs text-muted-foreground">{provider.description}</span>
              </div>
            </label>
          );
        })}
      </RadioGroup>
    </div>
  );
};

export { PROVIDERS };
