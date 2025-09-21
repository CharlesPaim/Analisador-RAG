
import React from 'react';
import { AnalysisResult, SuggestionWithStatus, KanbanStatus } from '../types';
import { KanbanColumn } from './KanbanColumn';

interface AnalysisDisplayProps {
  result: AnalysisResult;
  suggestions: SuggestionWithStatus[];
  onMoveSuggestion: (id: string, newStatus: KanbanStatus) => void;
  onReset: () => void;
}

const InfoCard: React.FC<{ title: string; children: React.ReactNode; icon: JSX.Element }> = ({ title, children, icon }) => (
    <div className="bg-slate-800 p-6 rounded-lg shadow-lg border border-slate-700">
        <div className="flex items-center mb-3">
            {icon}
            <h3 className="text-xl font-bold text-slate-200 ml-3">{title}</h3>
        </div>
        <div className="text-slate-300 space-y-2 text-base leading-relaxed whitespace-pre-wrap">{children}</div>
    </div>
);

const ReadinessBadge: React.FC<{ readiness: string }> = ({ readiness }) => {
    let colorClasses = '';
    if (readiness.includes('Ready')) {
        colorClasses = 'bg-green-500/20 text-green-300 border-green-500';
    } else if (readiness.includes('Moderate')) {
        colorClasses = 'bg-yellow-500/20 text-yellow-300 border-yellow-500';
    } else {
        colorClasses = 'bg-red-500/20 text-red-300 border-red-500';
    }
    return <span className={`px-4 py-2 rounded-full font-semibold border ${colorClasses}`}>{readiness}</span>;
}

export const AnalysisDisplay: React.FC<AnalysisDisplayProps> = ({ result, suggestions, onMoveSuggestion, onReset }) => {
  const todoSuggestions = suggestions.filter(s => s.status === KanbanStatus.TODO);
  const adoptedSuggestions = suggestions.filter(s => s.status === KanbanStatus.ADOPTED);
  const dismissedSuggestions = suggestions.filter(s => s.status === KanbanStatus.DISMISSED);
  
  const ICONS = {
    EVALUATION: <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    CLARITY: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>,
    CONTEXT: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    METADATA: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h2zM7 13h10M7 17h5" /></svg>,
    SENSITIVITY: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>,
    TODO: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>,
    ADOPTED: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>,
    DISMISSED: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-slate-100">Relatório de Auditoria RAG</h1>
        <button
            onClick={onReset}
            className="bg-sky-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-sky-700 transition-colors"
        >
            Analisar Outro
        </button>
      </div>

      <div className="bg-slate-800 p-8 rounded-lg shadow-2xl mb-10 border border-slate-700">
        <div className="flex items-center mb-4">
            {ICONS.EVALUATION}
            <h2 className="text-2xl font-bold text-slate-100 ml-3">Avaliação Final</h2>
        </div>
        <div className="flex flex-col md:flex-row md:items-center md:space-x-6">
            <ReadinessBadge readiness={result.finalEvaluation.readiness} />
            <p className="text-slate-300 mt-4 md:mt-0">{result.finalEvaluation.reason}</p>
        </div>
      </div>
      
      <h2 className="text-3xl font-bold text-slate-100 mb-6">Resumo da Análise</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <InfoCard title="Diagnóstico de Clareza" icon={ICONS.CLARITY}>{result.clarityDiagnosis}</InfoCard>
        <InfoCard title="Lacunas de Contexto" icon={ICONS.CONTEXT}>{result.contextGaps}</InfoCard>
        <InfoCard title="Metadados Sugeridos" icon={ICONS.METADATA}>{result.suggestedMetadata}</InfoCard>
        <InfoCard title="Sensibilidade de Dados" icon={ICONS.SENSITIVITY}>{result.dataSensitivity}</InfoCard>
      </div>

      <h2 className="text-3xl font-bold text-slate-100 mb-6">Sugestões de Melhoria</h2>
      <div className="flex flex-col lg:flex-row gap-6">
        <KanbanColumn title="Para Revisar" status={KanbanStatus.TODO} suggestions={todoSuggestions} onMove={onMoveSuggestion} icon={ICONS.TODO} color="border-slate-400" />
        <KanbanColumn title="Adotadas" status={KanbanStatus.ADOPTED} suggestions={adoptedSuggestions} onMove={onMoveSuggestion} icon={ICONS.ADOPTED} color="border-green-400" />
        <KanbanColumn title="Dispensadas" status={KanbanStatus.DISMISSED} suggestions={dismissedSuggestions} onMove={onMoveSuggestion} icon={ICONS.DISMISSED} color="border-red-400" />
      </div>
    </div>
  );
};
