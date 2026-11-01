import {
  BATCH_CHAR_BUDGET,
  MAX_BATCHES,
  MAX_SINGLE_FILE_CHARS,
  IGNORED_SEGMENTS,
  IGNORED_EXACT_NAMES,
  TEXT_EXTENSIONS,
} from "./constants";

type PendingFile = { path: string; content: string };
type ArchiveEntry = { name: string; async(type: "string"): Promise<string> };

export async function chunkSubmissionFiles(relevantEntries: ArchiveEntry[]) {
  // Découpage en lots : chaque fichier apparaît une seule fois, dans un
  // seul lot, sans plafond artificiel sur le nombre de fichiers total —
  // seul un fichier individuellement énorme est tronqué (avec mention).
  const batches: PendingFile[][] = [];
  let currentBatch: PendingFile[] = [];
  let currentBatchChars = 0;
  let filesIncluded = 0;
  let truncated = false;

  for (const entry of relevantEntries) {
    if (batches.length >= MAX_BATCHES && currentBatch.length === 0) {
      truncated = true;
      break;
    }

    let content = await entry.async("string");
    if (content.length > MAX_SINGLE_FILE_CHARS) {
      content =
        content.slice(0, MAX_SINGLE_FILE_CHARS) +
        `\n\n[... fichier tronqué, ${content.length} caractères au total ...]`;
    }

    if (
      currentBatchChars + content.length > BATCH_CHAR_BUDGET &&
      currentBatch.length > 0
    ) {
      batches.push(currentBatch);
      currentBatch = [];
      currentBatchChars = 0;

      if (batches.length >= MAX_BATCHES) {
        truncated = true;
        break;
      }
    }

    currentBatch.push({ path: entry.name, content });
    currentBatchChars += content.length;
    filesIncluded += 1;
  }

  if (currentBatch.length > 0 && batches.length < MAX_BATCHES) {
    batches.push(currentBatch);
  }

  return { batches, filesIncluded, truncated };
}

export function formatFileBatch(files: PendingFile[]) {
  return files
    .map((f) => `### ${f.path}\n\`\`\`\n${f.content}\n\`\`\``)
    .join("\n\n");
}

export function isRelevantFile(path: string): boolean {
  const lower = path.toLowerCase();
  const baseName = lower.split("/").pop() ?? lower;
  if (IGNORED_SEGMENTS.some((segment) => lower.includes(segment))) return false;
  if (IGNORED_EXACT_NAMES.includes(baseName)) return false;
  return TEXT_EXTENSIONS.some((ext) => lower.endsWith(ext));
}
