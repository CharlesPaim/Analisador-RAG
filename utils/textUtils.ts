// A list of common Portuguese stopwords.
const stopwords = new Set([
  'a', 'o', 'as', 'os', 'ao', 'aos', 'à', 'às', 'de', 'do', 'da', 'dos', 'das',
  'em', 'no', 'na', 'nos', 'nas', 'um', 'uma', 'uns', 'umas', 'e', 'ou', 'mas',
  'com', 'por', 'para', 'pra', 'pelo', 'pela', 'pelos', 'pelas', 'sem', 'sob',
  'sobre', 'se', 'seu', 'sua', 'seus', 'suas', 'ser', 'sendo', 'foi', 'foram',
  'é', 'era', 'eram', 'está', 'estão', 'este', 'esta', 'estes', 'estas', 'isto',
  'isso', 'aquele', 'aquela', 'aqueles', 'aquelas', 'aquilo', 'que', 'qual',
  'quais', 'quem', 'cujo', 'cuja', 'cujos', 'cujas', 'onde', 'quando', 'como',
  'porquê', 'porque', 'não', 'mais', 'muito', 'já', 'há', 'nós', 'ele', 'ela',
  'eles', 'elas', 'meu', 'minha', 'meus', 'minhas', 'teu', 'tua', 'teus', 'tuas',
  'nosso', 'nossa', 'nossos', 'nossas', 'lhe', 'lhes', 'eu', 'tu', 'você', 'vocês',
  'também', 'só', 'então', 'até', 'mesmo', 'pois', 'ainda', 'assim', 'através',
  'cada', 'coisa', 'contra', 'depois', 'desde', 'durante', 'entre', 'outro',
  'outra', 'outros', 'outras', 'pode', 'podem', 'pouco', 'qualquer', 'sempre',
  'são', 'ter', 'tem', 'têm', 'tinha', 'tinham', 'todo', 'toda', 'todos', 'todas',
  'vai', 'vão', 'ver', 'vez', 'vezes'
]);

/**
 * Extracts the most frequent terms from a text, excluding common stopwords.
 * @param text The full document text.
 * @param limit The number of top terms to return.
 * @returns An array of the most frequent terms.
 */
export const getTermFrequency = (text: string, limit: number = 10): string[] => {
  if (!text) {
    return [];
  }

  const wordCounts: { [key: string]: number } = {};

  // 1. Normalize, tokenize, and filter stopwords
  const words = text
    .toLowerCase()
    .normalize("NFD") // Separate accent from letter
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .replace(/[^\w\s]/g, '') // Remove punctuation
    .split(/\s+/); // Split by whitespace

  for (const word of words) {
    // Only consider words with more than 2 characters
    if (word.length > 2 && !stopwords.has(word)) {
      wordCounts[word] = (wordCounts[word] || 0) + 1;
    }
  }

  // 2. Sort by frequency
  const sortedWords = Object.keys(wordCounts).sort((a, b) => wordCounts[b] - wordCounts[a]);

  // 3. Return the top N terms
  return sortedWords.slice(0, limit);
};
