
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const analysisSchema = {
  type: Type.OBJECT,
  properties: {
    clarityDiagnosis: { type: Type.STRING, description: "Detailed diagnosis of clarity issues. Mention specific sections and explain why they are problematic. Format as a bulleted list within a single string." },
    contextGaps: { type: Type.STRING, description: "Analysis of context gaps and unexplained jargon. Format as a bulleted list within a single string." },
    suggestedMetadata: { type: Type.STRING, description: "A comma-separated list of suggested metadata tags or attributes." },
    dataSensitivity: { type: Type.STRING, description: "Report on any sensitive data found, like credentials or personal names. Format as a bulleted list within a single string." },
    recommendedImprovements: {
      type: Type.ARRAY,
      description: "A list of specific, actionable improvement suggestions.",
      items: {
        type: Type.OBJECT,
        properties: {
          category: { type: Type.STRING, description: "The category of the issue (e.g., 'Clarity', 'Context', 'Reorganization', 'Formatting')." },
          originalSnippet: { type: Type.STRING, description: "The exact text snippet from the document that needs improvement. Keep it brief (1-2 sentences)." },
          issue: { type: Type.STRING, description: "A concise description of the problem with the snippet." },
          suggestion: { type: Type.STRING, description: "The AI's rewritten or improved version of the snippet or a clear instruction for improvement." }
        },
        required: ["category", "issue", "suggestion", "originalSnippet"],
      }
    },
    finalEvaluation: {
      type: Type.OBJECT,
      properties: {
        readiness: { type: Type.STRING, description: "Final readiness classification: 'Ready for Ingestion', 'Needs Moderate Adjustments', or 'Needs Deep Revision'." },
        reason: { type: Type.STRING, description: "The reasoning behind the final readiness classification." }
      },
       required: ["readiness", "reason"],
    }
  },
  required: ["clarityDiagnosis", "contextGaps", "suggestedMetadata", "dataSensitivity", "recommendedImprovements", "finalEvaluation"],
};

const getPrompt = (documentText: string): string => `
Você agora é um auditor/editor técnico. Recebeu o documento abaixo, que hoje serve como referência para a equipe e também será transformado em fonte de conhecimento para um sistema RAG (indexação vetorial com consulta por IA).

Quero que você faça uma análise completa e retorne o resultado em formato JSON, seguindo estritamente o schema fornecido.

A análise deve conter:

1.  **Diagnóstico de clareza**: A estrutura está fácil de seguir? Há trechos redundantes ou confusos? Há seções sem título, tópicos muito longos ou misturas de assuntos que dificultam chunking?
2.  **Lacunas de contexto**: O texto pressupõe conhecimentos não explicados? Quais termos/jargões deveriam ser definidos? Há partes que precisam de exemplos, fluxogramas ou explicações adicionais para fazer sentido isoladamente?
3.  **Metadados sugeridos**: Liste tags/atributos que devem acompanhar cada seção quando for indexado (ex.: fluxo, papel, sistema, status, responsável).
4.  **Sensibilidade / higiene de dados**: Aponte trechos com dados sensíveis, credenciais, nomes que devem ser omitidos ou mascarados na ingestão.
5.  **Melhorias recomendadas**: Crie uma lista de sugestões práticas de reescrita, reorganização ou detalhamento que tornem o documento mais amigável para leitores e para RAG. Para cada sugestão, identifique o trecho original, o problema e a sugestão de melhoria.
6.  **Avaliação final**: Classifique a prontidão para ingestão (ex.: pronto, precisa de ajustes moderados, precisa de revisão profunda) e explique o motivo.

A seguir está o conteúdo a ser avaliado. Faça referência a trechos com identificadores (página, seção, título) sempre que possível para facilitar a revisão humana.

--- CONTEÚDO DO DOCUMENTO ---
${documentText}
--- FIM DO CONTEÚDO ---
`;

export const analyzeDocument = async (documentText: string): Promise<AnalysisResult> => {
  try {
    const prompt = getPrompt(documentText);
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
    console.error("Error analyzing document:", error);
    if (error instanceof Error) {
        throw new Error(`Failed to analyze document with Gemini API: ${error.message}`);
    }
    throw new Error("An unknown error occurred during document analysis.");
  }
};
