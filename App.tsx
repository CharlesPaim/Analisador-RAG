import React, { useState, useCallback, useEffect } from 'react';
import { analyzeDocument } from './services/geminiService';
import { AnalysisResult, SuggestionWithStatus, KanbanStatus } from './types';
import { FileUpload } from './components/FileUpload';
import { Loader } from './components/Loader';
import { AnalysisDisplay } from './components/AnalysisDisplay';
import { getTermFrequency } from './utils/textUtils';

// Declare global variables for libraries loaded via <script> tags
declare var mammoth: any;
declare var pdfjsLib: any;

const App: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [suggestions, setSuggestions] = useState<SuggestionWithStatus[]>([]);
  const [documentText, setDocumentText] = useState<string>('');
  const [keywords, setKeywords] = useState<string[]>([]);

  // Configure PDF.js worker on component mount
  useEffect(() => {
    if (typeof pdfjsLib !== 'undefined') {
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js`;
    }
  }, []);

  const handleFileSelect = useCallback((selectedFile: File) => {
    setFile(selectedFile);
    setAnalysisResult(null);
    setError(null);
    setSuggestions([]);
    setDocumentText('');
    setKeywords([]);
  }, []);

  const extractTextFromFile = async (fileToProcess: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      const fileExtension = fileToProcess.name.split('.').pop()?.toLowerCase();

      if (fileExtension === 'txt' || fileExtension === 'md') {
        reader.onload = (event) => resolve(event.target?.result as string);
        reader.onerror = (err) => reject(new Error('Falha ao ler o arquivo de texto.'));
        reader.readAsText(fileToProcess);
      } else if (fileExtension === 'docx') {
        reader.onload = async (event) => {
          try {
            const arrayBuffer = event.target?.result as ArrayBuffer;
            const result = await mammoth.extractRawText({ arrayBuffer });
            resolve(result.value);
          } catch (e) {
            reject(new Error('Não foi possível processar o arquivo .docx.'));
          }
        };
        reader.onerror = () => reject(new Error('Falha ao ler o arquivo .docx.'));
        reader.readAsArrayBuffer(fileToProcess);
      } else if (fileExtension === 'pdf') {
        reader.onload = async (event) => {
          try {
            const arrayBuffer = event.target?.result as ArrayBuffer;
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            let fullText = '';
            for (let i = 1; i <= pdf.numPages; i++) {
              const page = await pdf.getPage(i);
              const textContent = await page.getTextContent();
              const pageText = textContent.items.map((item: any) => item.str).join(' ');
              fullText += pageText + '\n\n';
            }
            resolve(fullText);
          } catch (e) {
            reject(new Error('Não foi possível processar o arquivo .pdf.'));
          }
        };
        reader.onerror = () => reject(new Error('Falha ao ler o arquivo .pdf.'));
        reader.readAsArrayBuffer(fileToProcess);
      } else {
        reject(new Error("Tipo de arquivo não suportado. Use .txt, .md, .pdf ou .docx."));
      }
    });
  };

  const handleAnalyze = useCallback(async () => {
    if (!file) {
      setError("Por favor, selecione um arquivo primeiro.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const textContent = await extractTextFromFile(file);
      setDocumentText(textContent); // Store original text

      if (!textContent) {
        setError("Não foi possível extrair conteúdo do arquivo. O arquivo pode estar vazio ou corrompido.");
        setIsLoading(false);
        return;
      }
      
      const frequentTerms = getTermFrequency(textContent);
      setKeywords(frequentTerms);

      const result = await analyzeDocument(textContent, frequentTerms);
      setAnalysisResult(result);
      const initialSuggestions = result.recommendedImprovements.map(s => ({ ...s, status: KanbanStatus.TODO }));
      setSuggestions(initialSuggestions);
    } catch (e) {
      if (e instanceof Error) {
        setError(`Erro ao processar o arquivo: ${e.message}`);
      } else {
        setError("Ocorreu um erro desconhecido durante o processamento do arquivo.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [file]);
  
  const handleMoveSuggestion = useCallback((id: string, newStatus: KanbanStatus) => {
    setSuggestions(prev => 
      prev.map(s => s.id === id ? { ...s, status: newStatus } : s)
    );
  }, []);

  const handleReset = useCallback(() => {
    setFile(null);
    setAnalysisResult(null);
    setError(null);
    setSuggestions([]);
    setIsLoading(false);
    setDocumentText('');
    setKeywords([]);
  }, []);

  const renderContent = () => {
    if (isLoading) {
      return <Loader />;
    }

    if (analysisResult) {
      return <AnalysisDisplay result={analysisResult} suggestions={suggestions} onMoveSuggestion={handleMoveSuggestion} onReset={handleReset} documentText={documentText} keywords={keywords} />;
    }

    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <header className="text-center mb-10">
          <h1 className="text-5xl font-extrabold text-slate-100 mb-2">Auditor de Documentos para RAG</h1>
          <p className="text-lg text-slate-400 max-w-3xl">
            Faça o upload de um documento para receber uma análise detalhada por IA, otimizando-o para sistemas de Retrieval-Augmented Generation.
          </p>
        </header>
        <div className="w-full max-w-3xl p-8 bg-slate-800/50 rounded-xl shadow-2xl border border-slate-700">
          {file ? (
            <div className="text-center">
              <p className="text-lg text-slate-300 mb-2">Arquivo selecionado:</p>
              <p className="font-mono bg-slate-900 text-sky-300 px-4 py-2 rounded-md inline-block mb-6">{file.name}</p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={handleAnalyze}
                  className="bg-sky-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-sky-700 transition-colors text-lg"
                >
                  Analisar Documento
                </button>
                 <button
                  onClick={handleReset}
                  className="bg-slate-600 text-slate-300 font-bold py-3 px-6 rounded-lg hover:bg-slate-500 transition-colors text-lg"
                >
                  Trocar Arquivo
                </button>
              </div>
            </div>
          ) : (
            <FileUpload onFileSelect={handleFileSelect} isLoading={isLoading} />
          )}
          {error && <p className="text-red-400 mt-6 text-center">{error}</p>}
        </div>
      </div>
    );
  };

  return <main>{renderContent()}</main>;
};

export default App;
