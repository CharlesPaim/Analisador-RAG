import React from 'react';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// FIX: Explicitly use React.JSX.Element to resolve "Cannot find namespace 'JSX'" error.
const InfoSection: React.FC<{ title: string; icon: React.JSX.Element; children: React.ReactNode }> = ({ title, icon, children }) => (
  <div className="mb-6">
    <div className="flex items-center mb-2">
      {icon}
      <h3 className="text-xl font-semibold text-slate-200 ml-3">{title}</h3>
    </div>
    <div className="text-slate-300 space-y-2 leading-relaxed pl-9">
      {children}
    </div>
  </div>
);

export const InfoModal: React.FC<InfoModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div 
        className="bg-slate-800 rounded-lg shadow-xl max-w-3xl w-full p-6 md:p-8 border border-slate-700 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()} // Prevent closing modal when clicking inside
      >
        <div className="flex justify-between items-center border-b border-slate-600 pb-4 mb-6">
          <h2 className="text-2xl font-bold text-sky-400">Sobre o Auditor de Documentos para RAG</h2>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-white transition-colors"
            aria-label="Fechar modal"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="prose prose-invert max-w-none">
          <InfoSection 
            title="O que é?"
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          >
            <p>
              Esta é uma ferramenta de análise de conteúdo assistida por IA, projetada para avaliar e otimizar documentos antes de serem integrados a um sistema de <strong>Retrieval-Augmented Generation (RAG)</strong>.
              Ela atua como um "auditor de qualidade", garantindo que a base de conhecimento da sua IA seja clara, coesa e eficaz.
            </p>
          </InfoSection>
          
          <InfoSection 
            title="Principais Funcionalidades"
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>}
          >
            <ul className="list-disc space-y-2 pl-5">
              <li><strong>Análise Multifacetada:</strong> Avalia clareza, contexto, metadados e sensibilidade dos dados.</li>
              <li><strong>Sugestões Acionáveis:</strong> Fornece recomendações concretas para reescrita e reorganização.</li>
              <li><strong>Quadro Kanban Interativo:</strong> Permite gerenciar as sugestões, movendo-as entre "Para Revisar", "Adotadas" e "Dispensadas".</li>
              <li><strong>Pré-visualização de RAG:</strong> Simula como o documento será dividido ("chunked") para a indexação vetorial, ajudando a identificar problemas de formatação.</li>
              <li><strong>Suporte a Múltiplos Formatos:</strong> Aceita arquivos <code>.txt</code>, <code>.md</code>, <code>.pdf</code>, e <code>.docx</code>.</li>
            </ul>
          </InfoSection>

          <InfoSection 
            title="Como Usar?"
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          >
             <ol className="list-decimal space-y-2 pl-5">
                <li><strong>Envie um Documento:</strong> Arraste e solte ou clique para selecionar um arquivo do seu computador.</li>
                <li><strong>Inicie a Análise:</strong> Clique em "Analisar Documento" para que a IA processe o conteúdo.</li>
                <li><strong>Explore o Relatório:</strong> Navegue pelo resumo, diagnóstico detalhado e sugestões de melhoria.</li>
                <li><strong>Gerencie as Tarefas:</strong> Use o quadro Kanban para "Adotar" ou "Dispensar" as sugestões da IA.</li>
                <li><strong>Verifique o Chunking:</strong> Acesse a aba "Pré-visualização RAG" para ver como seu documento será segmentado.</li>
            </ol>
          </InfoSection>

        </div>
      </div>
    </div>
  );
};
