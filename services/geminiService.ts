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
    recommendedImprovements: {
      type: Type.ARRAY,
      description: "Uma lista de sugestões de melhoria específicas e acionáveis.",
      items: {
        type: Type.OBJECT,
        properties: {
          category: { type: Type.STRING, description: "A categoria do problema (ex: 'Clareza', 'Contexto', 'Reorganização', 'Formatação')." },
          originalSnippet: { type: Type.STRING, description: "O trecho de texto exato do documento que precisa de melhoria. Mantenha-o breve (1-2 frases)." },
          issue: { type: Type.STRING, description: "Uma descrição concisa do problema com o trecho." },
          suggestion: { type: Type.STRING, description: "A versão reescrita ou melhorada do trecho pela IA ou uma instrução clara para melhoria." }
        },
        required: ["category", "issue", "suggestion", "originalSnippet"],
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
  required: ["clarityDiagnosis", "contextGaps", "suggestedMetadata", "dataSensitivity", "recommendedImprovements", "finalEvaluation"],
};

const getPrompt = (documentText: string, keywords: string[]): string => `
Você agora é um auditor/editor técnico. Recebeu o documento abaixo, que hoje serve como referência para a equipe e também será transformado em fonte de conhecimento para um sistema RAG (indexação vetorial com consulta por IA).

Uma análise preliminar do texto identificou as seguintes palavras-chave principais, baseadas na frequência:
[${keywords.join(', ')}]

Use esta lista de palavras-chave como inspiração principal para a seção "Metadados sugeridos".

Quero que você faça uma análise completa e retorne o resultado em formato JSON, seguindo estritamente o schema fornecido.

A análise deve conter:

1.  **Diagnóstico de clareza**: A estrutura está fácil de seguir? Há trechos redundantes ou confusos? Há seções sem título, tópicos muito longos ou misturas de assuntos que dificultam chunking?
2.  **Lacunas de contexto**: O texto pressupõe conhecimentos não explicados? Quais termos/jargões deveriam ser definidos? Há partes que precisam de exemplos, fluxogramas ou explicações adicionais para fazer sentido isoladamente?
3.  **Metadados sugeridos**: Baseando-se principalmente nas palavras-chave fornecidas e no conteúdo geral, liste tags/atributos que devem acompanhar o documento quando for indexado (ex.: fluxo, papel, sistema, status, responsável).
4.  **Sensibilidade / higiene de dados**: Aponte trechos com dados sensíveis, credenciais, nomes que devem ser omitidos ou mascarados na ingestão.
5.  **Melhorias recomendadas**: Crie uma lista de sugestões práticas de reescrita, reorganização ou detalhamento que tornem o documento mais amigável para leitores e para RAG. Para cada sugestão, identifique o trecho original, o problema e a sugestão de melhoria.
6.  **Avaliação final**: Classifique a prontidão para ingestão (ex.: pronto, precisa de ajustes moderados, precisa de revisão profunda) e explique o motivo.

A seguir está o conteúdo a ser avaliado. Faça referência a trechos com identificadores (página, seção, título) sempre que possível para facilitar a revisão humana.

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