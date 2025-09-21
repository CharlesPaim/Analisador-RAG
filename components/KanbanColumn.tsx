
import React from 'react';
import { SuggestionCard } from './SuggestionCard';
import { SuggestionWithStatus, KanbanStatus } from '../types';

interface KanbanColumnProps {
  title: string;
  status: KanbanStatus;
  suggestions: SuggestionWithStatus[];
  onMove: (id: string, newStatus: KanbanStatus) => void;
  icon: JSX.Element;
  color: string;
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({ title, status, suggestions, onMove, icon, color }) => {
  return (
    <div className="flex-1 min-w-[300px] bg-slate-800/50 rounded-lg p-4">
      <div className={`flex items-center mb-4 pb-2 border-b-2 ${color}`}>
        {icon}
        <h3 className="font-bold text-lg ml-2">{title}</h3>
        <span className="ml-auto bg-slate-700 text-slate-300 text-sm font-semibold w-6 h-6 flex items-center justify-center rounded-full">
          {suggestions.length}
        </span>
      </div>
      <div className="h-[60vh] overflow-y-auto pr-2">
        {suggestions.length > 0 ? (
          suggestions.map(suggestion => (
            <SuggestionCard 
              key={suggestion.id} 
              suggestion={suggestion} 
              onMove={onMove}
              currentStatus={status}
            />
          ))
        ) : (
          <div className="flex items-center justify-center h-full text-slate-500">
            <p>Nenhuma sugestão aqui.</p>
          </div>
        )}
      </div>
    </div>
  );
};
