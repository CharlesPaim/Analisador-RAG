import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from '../types';

if (!process.env.API_KEY) {
  throw new Error("A variável de ambiente API_KEY não está definida.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const analysisSchema = {
  type: Type.OBJECT,
  properties: {
    clarityDiagnosis: { type: Type.STRING, description: "Diagnóstico detalhado de problemas de clareza. Mencione seções específicas e explique por que são problemáticas. Formate como uma lista com marcadores dentro de uma única string." },
    contextGaps: { type: Type.STRING, description: "Análise de lacunas de contexto e jargões não explicados. Formate como uma lista com marcadores dentro de uma única string." },
    suggestedMetadata: { type: Type.STRING, description: "Uma lista de tags ou atributos de metadados sugeridos, separados por vírgula." },
    dataSensitivity: { type: Type.STRING, description: "Relatório sobre quaisquer dados sensíveis encontrados, como credenciais ou nomes pessoais. Formate como uma lista com marcadores dentro de uma única string." },
    glossarySuggestions: {
      type: Type.ARRAY,
      description: "Uma lista de termos técnicos, jargões ou acrônimos que deveriam ser definidos em um glossário.",
      items: {
        type: Type.OBJECT,
        properties: {
          term: { type: Type.STRING, description: "O termo ou jargão identificado." },
          suggestedDefinition: { type: Type.STRING, description: "Uma sugestão de definição clara e concisa para o termo, baseada no contexto do documento." }
        },
        required: ["term", "suggestedDefinition"],
      }
    },
    recommendedImprovements: {
      type: Type.ARRAY,
      description: "Uma lista de sugestões de melhoria específicas e acionáveis.",
      items: {
        type: Type.OBJECT,
        properties: {
          category: { type: Type.STRING, description: "A categoria do problema (ex: 'Clareza', 'Contexto', 'Reorganização', 'Formatação')." },
          originalSnippet: { type: Type.STRING, description: "O parágrafo ou bloco de texto completo do documento original que precisa de melhoria." },
          issue: { type: Type.STRING, description: "Uma descrição concisa do problema com o trecho." },
          suggestionSummary: { type: Type.STRING, description: "Uma instrução clara e resumida da melhoria a ser feita." },
          rewrittenText: { type: Type.STRING, description: "A versão completa do trecho de texto já reescrito e melhorado pela IA, pronto para ser copiado." }
        },
        required: ["category", "issue", "suggestionSummary", "rewrittenText", "originalSnippet"],
      }
    },
    finalEvaluation: {
      type: Type.OBJECT,
      properties: {
        readiness: { type: Type.STRING, description: "Classificação final de prontidão: 'Pronto para Ingestão', 'Necessita de Ajustes Moderados', ou 'Necessita de Revisão Profunda'." },
        reason: { type: Type.STRING, description: "A justificativa por trás da classificação final de prontidão." }
      },
       required: ["readiness", "reason"],
    }
  },
  required: ["clarityDiagnosis", "contextGaps", "suggestedMetadata", "dataSensitivity", "glossarySuggestions", "recommendedImprovements", "finalEvaluation"],
};

const getPrompt = (documentText: string, keywords: string[]): string => `
Você agora é um Engenheiro de Conhecimento especialista em otimização de documentos para sistemas RAG (Retrieval-Augmented Generation). Seu objetivo principal é analisar o documento e sugerir modificações que o transformem em uma base de conhecimento de alta qualidade, com informações atômicas, claras e autocontidas, ideais para chunking e busca vetorial.

Uma análise preliminar do texto identificou as seguintes palavras-chave principais, baseadas na frequência:
[${keywords.join(', ')}]
Use esta lista como inspiração para os metadados sugeridos.

Quero que você faça uma análise completa e retorne o resultado em formato JSON, seguindo estritamente o schema fornecido.

A análise deve conter:

1.  **Diagnóstico de clareza**: Avalie a estrutura, redundâncias e clareza geral.
2.  **Lacunas de contexto**: Identifique conceitos que precisam de mais explicação.
3.  **Metadados sugeridos**: Sugira tags baseadas no conteúdo e nas palavras-chave.
4.  **Sensibilidade / higiene de dados**: Aponte quaisquer dados sensíveis.
5.  **Sugestões para Glossário**: Crie uma lista de jargões e termos técnicos com sugestões de definição para uma tabela "De/Para".
6.  **Melhorias recomendadas**: Para cada melhoria, forneça:
    -   **originalSnippet**: Capture o parágrafo ou bloco lógico completo onde o problema foi encontrado.
    -   **issue**: Descreva o problema.
    -   **suggestionSummary**: Resuma a ação de melhoria.
    -   **rewrittenText**: Forneça o texto completo já corrigido e formatado em Markdown, pronto para ser copiado.
7.  **Avaliação final**: Classifique a prontidão do documento para ser usado em um RAG.

--- CONTEÚDO DO DOCUMENTO ---
${documentText}
--- FIM DO CONTEÚDO ---
`;

export const analyzeDocument = async (documentText: string, keywords: string[]): Promise<AnalysisResult> => {
  try {
    const prompt = getPrompt(documentText, keywords);
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
      },
    });

    const jsonText = response.text.trim();
    const result: AnalysisResult = JSON.parse(jsonText);
    
    // Add unique IDs to each suggestion
    const improvementsWithIds = result.recommendedImprovements.map((item, index) => ({
      ...item,
      id: `suggestion-${Date.now()}-${index}`
    }));

    return { ...result, recommendedImprovements: improvementsWithIds };

  } catch (error) {
    console.error("Erro ao analisar o documento:", error);
    if (error instanceof Error) {
        throw new Error(`Falha ao analisar o documento com a API Gemini: ${error.message}`);
    }
    throw new Error("Ocorreu um erro desconhecido durante a análise do documento.");
  }
};