
const MAX_CHUNK_SIZE = 500; // a common chunk size in characters

/**
 * Simulates how a document would be chunked for a RAG system.
 * It first splits by paragraphs. If a paragraph is too large, it splits it
 * by sentences, grouping them together without exceeding the max chunk size.
 * @param text The full document text.
 * @returns An array of string chunks.
 */
export const simulateChunking = (text: string): string[] => {
    const chunks: string[] = [];
    if (!text || !text.trim()) {
        return chunks;
    }

    // Split by one or more newlines, which can be considered paragraphs or distinct blocks
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim() !== '');

    for (const paragraph of paragraphs) {
        const trimmedParagraph = paragraph.trim();
        if (trimmedParagraph.length <= MAX_CHUNK_SIZE) {
            chunks.push(trimmedParagraph);
        } else {
            // Paragraph is too long, split by sentences.
            // Regex to split by sentences, keeping the delimiter.
            const sentences = trimmedParagraph.match(/[^.!?]+[.!?]*/g) || [trimmedParagraph];
            let currentChunk = '';
            for (const sentence of sentences) {
                const trimmedSentence = sentence.trim();
                if (trimmedSentence) {
                    // Check if adding the new sentence would exceed the limit
                    if ((currentChunk + ' ' + trimmedSentence).length > MAX_CHUNK_SIZE && currentChunk) {
                        chunks.push(currentChunk);
                        currentChunk = trimmedSentence; // Start a new chunk
                    } else {
                        // Add sentence to the current chunk
                        currentChunk = currentChunk ? currentChunk + ' ' + trimmedSentence : trimmedSentence;
                    }
                }
            }
            // Add the last remaining chunk
            if (currentChunk) {
                chunks.push(currentChunk);
            }
        }
    }
    return chunks;
};
