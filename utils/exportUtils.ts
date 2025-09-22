import { AnalysisResult, SuggestionWithStatus, KanbanStatus, Suggestion } from '../types';

const getStyles = (): string => `
<style>
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
    background-color: #0f172a; /* slate-900 */
    color: #cbd5e1; /* slate-300 */
    margin: 0;
    padding: 2rem;
  }
  .container {
    max-width: 1200px;
    margin: 0 auto;
  }
  h1, h2, h3 {
    color: #f1f5f9; /* slate-100 */
    margin-top: 0;
  }
  h1 { font-size: 2.5rem; margin-bottom: 0.5rem; }
  h2 { font-size: 2rem; margin-bottom: 1.5rem; border-bottom: 2px solid #334155; /* slate-700 */ padding-bottom: 0.5rem; }
  h3 { font-size: 1.25rem; }
  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2.5rem;
  }
  .card {
    background-color: #1e293b; /* slate-800 */
    border: 1px solid #334155; /* slate-700 */
    border-radius: 0.5rem;
    padding: 1.5rem;
    word-wrap: break-word;
    white-space: pre-wrap;
  }
  .final-evaluation {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    padding: 2rem;
    flex-wrap: wrap;
  }
  .readiness-circle {
    flex-shrink: 0;
    width: 120px;
    height: 120px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    font-size: 1.1rem;
    font-weight: 600;
  }
  .readiness-green { border: 3px solid #22c55e; color: #86efac; } /* green */
  .readiness-yellow { border: 3px solid #eab308; color: #fde047; } /* yellow */
  .readiness-red { border: 3px solid #ef4444; color: #fca5a5; } /* red */
  
  .kanban-board {
    display: flex;
    gap: 1.5rem;
    flex-wrap: wrap;
  }
  .kanban-column {
    flex: 1;
    min-width: 300px;
    background-color: #1e293b; /* slate-800 */
    border-radius: 0.5rem;
    padding: 1rem;
  }
  .kanban-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 0.5rem;
    margin-bottom: 1rem;
    border-bottom: 2px solid #475569; /* slate-600 */
  }
  .kanban-header h3 {
    margin: 0;
  }
  .count-badge {
    background-color: #334155; /* slate-700 */
    color: #cbd5e1; /* slate-300 */
    font-size: 0.875rem;
    font-weight: 600;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .suggestion-card {
    background-color: #334155; /* slate-700 */
    border-radius: 0.5rem;
    padding: 1rem;
    margin-bottom: 1rem;
    border: 1px solid #475569; /* slate-600 */
  }
  .suggestion-card h4 {
    font-size: 0.875rem;
    color: #94a3b8; /* slate-400 */
    font-weight: 600;
    margin-bottom: 0.25rem;
    margin-top: 0.75rem;
  }
  .suggestion-card h4:first-child {
    margin-top: 0;
  }
  .suggestion-card p, .suggestion-card blockquote {
    font-size: 0.875rem;
    color: #cbd5e1; /* slate-300 */
    margin: 0;
    word-wrap: break-word;
  }
  blockquote {
    border-left: 2px solid #64748b; /* slate-500 */
    padding-left: 0.75rem;
    font-style: italic;
  }
  .rewritten-text {
    background-color: #0f172a; /* slate-900 */
    padding: 0.75rem;
    border-radius: 0.25rem;
    font-family: monospace;
    color: #7dd3fc; /* sky-300 */
    white-space: pre-wrap;
    word-wrap: break-word;
  }
  .keywords {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  .keyword-badge {
    background-color: #115e59; /* teal-900/50 */
    color: #5eead4; /* teal-300 */
    font-size: 0.875rem;
    padding: 0.25rem 0.75rem;
    border-radius: 9999px;
    border: 1px solid #134e4a; /* teal-700 */
  }
</style>
`;

const getReadinessClass = (readiness: string): string => {
    if (readiness.includes('Pronto')) return 'readiness-green';
    if (readiness.includes('Moderados')) return 'readiness-yellow';
    return 'readiness-red';
};

const renderSuggestion = (suggestion: Suggestion): string => `
  <div class="suggestion-card">
    <h4>Trecho Original</h4>
    <blockquote>"${suggestion.originalSnippet}"</blockquote>
    <h4>Problema Identificado</h4>
    <p>${suggestion.issue}</p>
    <h4>Sugestão de Melhoria</h4>
    <p>${suggestion.suggestionSummary}</p>
    <h4>Texto Reescrito Sugerido</h4>
    <div class="rewritten-text">${suggestion.rewrittenText}</div>
  </div>
`;

const renderKanbanColumn = (title: string, suggestions: SuggestionWithStatus[]): string => `
  <div class="kanban-column">
    <div class="kanban-header">
      <h3>${title}</h3>
      <span class="count-badge">${suggestions.length}</span>
    </div>
    <div>
      ${suggestions.map(renderSuggestion).join('') || '<p style="color: #64748b;">Nenhuma sugestão aqui.</p>'}
    </div>
  </div>
`;

export const exportAnalysisToHTML = (
    result: AnalysisResult, 
    suggestions: SuggestionWithStatus[], 
    keywords: string[],
    fileName: string = 'analise-documento.html'
) => {
    const todoSuggestions = suggestions.filter(s => s.status === KanbanStatus.TODO);
    const adoptedSuggestions = suggestions.filter(s => s.status === KanbanStatus.ADOPTED);
    const dismissedSuggestions = suggestions.filter(s => s.status === KanbanStatus.DISMISSED);

    const htmlContent = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Relatório de Análise de Documento</title>
    ${getStyles()}
</head>
<body>
    <div class="container">
        <h1>Relatório de Análise de Documento</h1>
        
        <h2>Avaliação Final</h2>
        <div class="card final-evaluation">
            <div class="readiness-circle ${getReadinessClass(result.finalEvaluation.readiness)}">
                <span>${result.finalEvaluation.readiness.replace(' ', '<br/>')}</span>
            </div>
            <p>${result.finalEvaluation.reason}</p>
        </div>

        <h2>Resumo da Análise</h2>
        <div class="grid">
            <div class="card">
                <h3>Principais Palavras-Chave</h3>
                <div class="keywords">
                    ${keywords.map(k => `<span class="keyword-badge">${k}</span>`).join('')}
                </div>
            </div>
            <div class="card">
                <h3>Diagnóstico de Clareza</h3>
                <p>${result.clarityDiagnosis}</p>
            </div>
            <div class="card">
                <h3>Lacunas de Contexto</h3>
                <p>${result.contextGaps}</p>
            </div>
            <div class="card">
                <h3>Metadados Sugeridos</h3>
                <p>${result.suggestedMetadata}</p>
            </div>
            <div class="card">
                <h3>Sensibilidade de Dados</h3>
                <p>${result.dataSensitivity}</p>
            </div>
        </div>

        <h2>Sugestões de Melhoria</h2>
        <div class="kanban-board">
            ${renderKanbanColumn('Para Revisar', todoSuggestions)}
            ${renderKanbanColumn('Adotadas', adoptedSuggestions)}
            ${renderKanbanColumn('Dispensadas', dismissedSuggestions)}
        </div>
    </div>
</body>
</html>
    `;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
};
