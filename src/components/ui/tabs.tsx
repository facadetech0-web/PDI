import * as React from "react";
import { cn } from "@/lib/utils/cn";

export interface Tab {
  id: string;
  label: React.ReactNode;
  content: React.ReactNode;
}

export interface TabsProps {
  tabs: Tab[];
  defaultTab?: string;
  className?: string;
  tabClassName?: string;
  contentClassName?: string;
}

export function Tabs({
  tabs,
  defaultTab,
  className,
  tabClassName,
  contentClassName,
}: TabsProps) {
  const [activeTab, setActiveTab] = React.useState(defaultTab || tabs[0]?.id);

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      <div className="flex border-b border-white/5 overflow-x-auto no-scrollbar">
        <div className="flex gap-8">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "pb-4 text-sm font-medium relative transition-colors focus:outline-none whitespace-nowrap cursor-pointer",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground",
                  tabClassName
                )}
              >
                {tab.label}
                {isActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>
      <div className={cn("flex-1", contentClassName)}>
        {tabs.find((tab) => tab.id === activeTab)?.content}
      </div>
    </div>
  );
}
