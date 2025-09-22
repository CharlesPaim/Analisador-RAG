import React, { useState, useMemo } from 'react';
import { AnalysisResult, SuggestionWithStatus, KanbanStatus } from '../types';
import { KanbanColumn } from './KanbanColumn';
import { simulateChunking } from '../utils/chunking';
import { exportAnalysisToHTML } from '../utils/exportUtils';

interface AnalysisDisplayProps {
  result: AnalysisResult;
  suggestions: SuggestionWithStatus[];
  onMoveSuggestion: (id: string, newStatus: KanbanStatus) => void;
  onReset: () => void;
  documentText: string;
  keywords: string[];
  fileName?: string;
}

// FIX: Explicitly use React.JSX.Element to resolve "Cannot find namespace 'JSX'" error.
const InfoCard: React.FC<{ title: string; children: React.ReactNode; icon: React.JSX.Element }> = ({ title, children, icon }) => (
    <div className="bg-slate-800 p-6 rounded-lg shadow-lg border border-slate-700">
        <div className="flex items-center mb-3">
            {icon}
            <h3 className="text-xl font-bold text-slate-200 ml-3">{title}</h3>
        </div>
        <div className="text-slate-300 space-y-2 text-base leading-relaxed whitespace-pre-wrap">{children}</div>
    </div>
);

const ReadinessCircle: React.FC<{ readiness: string }> = ({ readiness }) => {
    let colorClasses = '';
    let text = '';

    if (readiness.includes('Pronto')) {
        colorClasses = 'border-green-500 text-green-300';
        text = 'Pronto para Ingestão';
    } else if (readiness.includes('Moderados')) {
        colorClasses = 'border-yellow-500 text-yellow-300';
        text = 'Ajustes Moderados';
    } else {
        colorClasses = 'border-red-500 text-red-300';
        text = 'Revisão Profunda';
    }

    const words = text.split(' ');

    return (
        <div className={`flex-shrink-0 w-36 h-36 rounded-full border-2 ${colorClasses} flex items-center justify-center text-center p-2 bg-slate-900/50`}>
            <span className="font-semibold text-lg">
                {words.map((word, i) => <React.Fragment key={i}>{word}{i < words.length - 1 && <br />}</React.Fragment>)}
            </span>
        </div>
    );
};

const RagPreviewView: React.FC<{ documentText: string }> = ({ documentText }) => {
    const chunks = useMemo(() => simulateChunking(documentText), [documentText]);

    return (
        <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700">
            <h2 className="text-2xl font-bold text-slate-100 mb-4">
                Pré-visualização de Chunking
            </h2>
            <p className="text-slate-400 mb-6">
                O documento foi dividido em <span className="font-bold text-sky-400">{chunks.length}</span> chunks (fatias) para o sistema RAG.
            </p>
            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-4">
                {chunks.map((chunk, index) => (
                    <div key={index} className="bg-slate-800 p-4 rounded-lg border border-slate-600 shadow">
                        <p className="text-sm font-semibold text-sky-400 mb-2">CHUNK #{index + 1}</p>
                        <p className="text-slate-300 whitespace-pre-wrap">{chunk}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

const KeywordsDisplay: React.FC<{ keywords: string[] }> = ({ keywords }) => (
    <div className="bg-slate-800 p-6 rounded-lg shadow-lg border border-slate-700">
        <div className="flex items-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" /></svg>
            <h3 className="text-xl font-bold text-slate-200 ml-3">Principais Palavras-Chave Detectadas</h3>
        </div>
        <div className="flex flex-wrap gap-2">
            {keywords.map((keyword, index) => (
                <span key={index} className="bg-teal-900/50 text-teal-300 text-sm font-medium px-3 py-1 rounded-full border border-teal-700">
                    {keyword}
                </span>
            ))}
        </div>
        <p className="text-sm text-slate-500 mt-4">
            Estas são as palavras mais frequentes no seu documento. A IA as utilizou como base para sugerir os metadados.
        </p>
    </div>
);


export const AnalysisDisplay: React.FC<AnalysisDisplayProps> = ({ result, suggestions, onMoveSuggestion, onReset, documentText, keywords, fileName }) => {
  const [activeTab, setActiveTab] = useState<'audit' | 'rag'>('audit');

  const todoSuggestions = suggestions.filter(s => s.status === KanbanStatus.TODO);
  const adoptedSuggestions = suggestions.filter(s => s.status === KanbanStatus.ADOPTED);
  const dismissedSuggestions = suggestions.filter(s => s.status === KanbanStatus.DISMISSED);
  
  const handleExport = () => {
    if (!result) return;
    const baseName = fileName ? fileName.split('.').slice(0, -1).join('.') || fileName : 'documento';
    const exportFileName = `analise-${baseName}.html`;
    exportAnalysisToHTML(result, suggestions, keywords, exportFileName);
  };

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

  const TabButton: React.FC<{
      label: string;
      isActive: boolean;
      onClick: () => void;
  }> = ({ label, isActive, onClick }) => {
    const activeClasses = 'border-sky-400 text-sky-300';
    const inactiveClasses = 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-500';
    return (
        <button
            onClick={onClick}
            className={`px-4 py-3 text-lg font-semibold border-b-2 transition-colors duration-200 ${isActive ? activeClasses : inactiveClasses}`}
        >
            {label}
        </button>
    );
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="flex justify-between items-start mb-6">
        <div>
            <h1 className="text-4xl font-bold text-slate-100">Resultado da Análise</h1>
            <p className="text-slate-400 mt-1">Navegue pelas abas para ver o relatório completo e a pré-visualização RAG.</p>
        </div>
        <div className="flex space-x-2">
            <button
                onClick={handleExport}
                className="bg-teal-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-teal-700 transition-colors"
            >
                Exportar para HTML
            </button>
            <button
                onClick={onReset}
                className="bg-sky-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-sky-700 transition-colors"
            >
                Analisar Outro
            </button>
        </div>
      </div>

      <div className="mb-8 border-b border-slate-700">
        <nav className="flex space-x-2">
            <TabButton label="Relatório de Auditoria" isActive={activeTab === 'audit'} onClick={() => setActiveTab('audit')} />
            <TabButton label="Pré-visualização RAG" isActive={activeTab === 'rag'} onClick={() => setActiveTab('rag')} />
        </nav>
      </div>
      
      {activeTab === 'audit' && (
        <div>
          <div className="bg-slate-800 p-8 rounded-lg shadow-2xl mb-10 border border-slate-700">
            <div className="flex items-center mb-6">
                {ICONS.EVALUATION}
                <h2 className="text-2xl font-bold text-slate-100 ml-3">Avaliação Final</h2>
            </div>
            <div className="flex flex-col md:flex-row items-center gap-8">
                <ReadinessCircle readiness={result.finalEvaluation.readiness} />
                <p className="text-slate-300 text-base leading-relaxed">{result.finalEvaluation.reason}</p>
            </div>
          </div>
          
          <h2 className="text-3xl font-bold text-slate-100 mb-6">Resumo da Análise</h2>
          
          <div className="mb-6">
            <KeywordsDisplay keywords={keywords} />
          </div>

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
      )}

      {activeTab === 'rag' && (
        <RagPreviewView documentText={documentText} />
      )}
    </div>
  );
};