import React from 'react';
import { Suggestion, KanbanStatus } from '../types';

interface SuggestionCardProps {
  suggestion: Suggestion;
  onMove: (id: string, newStatus: KanbanStatus) => void;
  currentStatus: KanbanStatus;
}

const CategoryBadge: React.FC<{ category: string }> = ({ category }) => {
    const colors: { [key: string]: string } = {
        'Clareza': 'bg-blue-900 text-blue-300',
        'Contexto': 'bg-purple-900 text-purple-300',
        'Reorganização': 'bg-green-900 text-green-300',
        'Formatação': 'bg-yellow-900 text-yellow-300',
        'default': 'bg-slate-700 text-slate-300'
    };
    const colorClass = colors[category] || colors['default'];
    return (
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${colorClass}`}>
            {category}
        </span>
    );
};


export const SuggestionCard: React.FC<SuggestionCardProps> = ({ suggestion, onMove, currentStatus }) => {
  return (
    <div className="bg-slate-800 rounded-lg shadow-lg p-4 mb-4 border border-slate-700 flex flex-col justify-between">
      <div>
        <div className="mb-3">
            <CategoryBadge category={suggestion.category} />
        </div>
        
        <div className="mb-3">
          <h4 className="font-semibold text-sm text-slate-400 mb-1">Trecho Original</h4>
          <blockquote className="border-l-2 border-slate-600 pl-3 text-sm text-slate-300 italic break-words">
            "{suggestion.originalSnippet}"
          </blockquote>
        </div>

        <div className="mb-3">
          <h4 className="font-semibold text-sm text-slate-400 mb-1">Problema Identificado</h4>
          <p className="text-sm text-slate-300 break-words">{suggestion.issue}</p>
        </div>

        <div className="mb-3">
          <h4 className="font-semibold text-sm text-slate-400 mb-1">Sugestão de Melhoria</h4>
          <p className="text-sm text-slate-300 break-words">{suggestion.suggestionSummary}</p>
        </div>

        <div className="mb-4">
          <h4 className="font-semibold text-sm text-slate-400 mb-1">Texto Reescrito Sugerido</h4>
          <div className="bg-slate-900 p-3 rounded-md">
            <p className="text-sm text-sky-300 font-mono break-words whitespace-pre-wrap">{suggestion.rewrittenText}</p>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-2 mt-auto pt-2 border-t border-slate-700">
        {currentStatus !== KanbanStatus.ADOPTED && (
          <button
            onClick={() => onMove(suggestion.id, KanbanStatus.ADOPTED)}
            className="px-3 py-1 text-xs font-semibold text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors"
          >
            Adotar
          </button>
        )}
        {currentStatus !== KanbanStatus.DISMISSED && (
          <button
            onClick={() => onMove(suggestion.id, KanbanStatus.DISMISSED)}
            className="px-3 py-1 text-xs font-semibold text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
          >
            Dispensar
          </button>
        )}
        {currentStatus !== KanbanStatus.TODO && (
          <button
            onClick={() => onMove(suggestion.id, KanbanStatus.TODO)}
            className="px-3 py-1 text-xs font-semibold text-slate-300 bg-slate-600 rounded-md hover:bg-slate-500 transition-colors"
          >
            Revisar
          </button>
        )}
      </div>
    </div>
  );
};