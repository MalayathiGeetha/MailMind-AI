// src/components/Sidebar.tsx - FIXED currentProvider ERROR
import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  Mail,
  Settings2,
  MessageSquare,
  History,
  BarChart3,
  Shield,
  User,
  Send,
  Target,
  Hash,
  FileText,
  ArrowRightLeft,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { emailApi } from '@/lib/apiClient';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

interface UserDashboard {
  preferredProvider: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggle }) => {
  const location = useLocation();
  const [currentProvider, setCurrentProvider] = useState('GEMINI');

  // Fetch current provider on mount
  useEffect(() => {
    const fetchProvider = async () => {
      try {
        const response = await emailApi.getUserDashboard();
        setCurrentProvider(response.data.preferredProvider || 'GEMINI');
      } catch {
        setCurrentProvider('GEMINI'); // Fallback
      }
    };
    fetchProvider();
  }, []);

  const navItems = [
    // ✅ Dashboard shows current model
    { 
      path: '/dashboard', 
      label: `Dashboard (${currentProvider})`, 
      icon: User, 
      description: 'Personal stats' 
    },
    { path: '/generate', label: 'Generate Email', icon: Mail, description: 'Quick email creation' },
    { path: '/advanced', label: 'Advanced Mode', icon: Settings2, description: 'Fine-tune generation' },
    
    // ✅ EMAIL SENDING
    { path: '/send', label: 'Send Email', icon: Send, description: 'Send real emails' },
    
    // ✅ Thread & Context
    { path: '/thread', label: 'Thread Reply', icon: MessageSquare, description: 'Context-aware replies' },
    { path: '/followup', label: 'Follow-ups', icon: ArrowRightLeft, description: 'Polite follow-ups' },
    
    // ✅ AI Analysis Tools
    { path: '/intent', label: 'Intent Detector', icon: Target, description: 'AI detects purpose' },
    { path: '/subjects', label: 'Subject Gen', icon: Hash, description: 'Click-worthy subjects' },
    { path: '/summarize', label: 'Summarizer', icon: FileText, description: 'Key points instantly' },
    
    // ✅ Insights & History
    { path: '/history', label: 'History', icon: History, description: 'Past generations' },
    { path: '/analytics', label: 'Analytics', icon: BarChart3, description: 'Usage insights' },
    { path: '/safety', label: 'Safety Check', icon: Shield, description: 'Quality & risk analysis' },
  ];

  return (
    <aside
      className={cn(
        "relative flex flex-col border-r bg-sidebar transition-all duration-300 ease-in-out",
        collapsed ? "w-[68px]" : "w-64"
      )}
    >
      <nav className="flex-1 space-y-1 p-3 pt-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          const linkContent = (
            <NavLink
              to={item.path}
              className={cn(
                "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 hover:shadow-md",
                isActive
                  ? "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg border border-primary/20"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:shadow-sm"
              )}
              end
            >
              <div className={cn(
                "flex h-10 w-10 items-center justify-center rounded-lg transition-all",
                isActive 
                  ? "bg-primary/20 shadow-md" 
                  : "bg-sidebar-accent/30 group-hover:bg-primary/10"
              )}>
                <Icon className={cn(
                  "h-5 w-5 shrink-0 transition-colors",
                  isActive ? "text-primary-foreground" : "text-sidebar-foreground group-hover:text-primary"
                )} />
              </div>
              
              {!collapsed && (
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="truncate font-semibold">{item.label}</span>
                  {!isActive && (
                    <span className="text-xs text-muted-foreground font-normal truncate">
                      {item.description}
                    </span>
                  )}
                </div>
              )}
              
              {isActive && !collapsed && (
                <div className="ml-auto h-2 w-2 rounded-full bg-primary/60 animate-pulse" />
              )}
            </NavLink>
          );

          if (collapsed) {
            return (
              <Tooltip key={item.path} delayDuration={100}>
                <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                <TooltipContent 
                  side="right" 
                  className="flex w-56 flex-col border bg-background p-2 shadow-xl"
                  sideOffset={8}
                >
                  <span className="font-semibold text-foreground">{item.label}</span>
                  <span className="text-xs text-muted-foreground">{item.description}</span>
                </TooltipContent>
              </Tooltip>
            );
          }

          return <div key={item.path}>{linkContent}</div>;
        })}
      </nav>

      {/* Collapsible Toggle */}
      <div className="border-t bg-sidebar/50 p-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          className={cn(
            "w-full justify-center transition-all group",
            collapsed ? "rotate-180" : ""
          )}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4 mr-2" />
              <span className="font-medium">Collapse</span>
            </>
          )}
        </Button>
      </div>
    </aside>
  );
};

