// packages/plugins/stats/src/wordCount.ts
export function countWords(text: string): number {
  // Counts “words” as sequences of non-whitespace
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

export function countChars(text: string): number {
  return text.length;
}
