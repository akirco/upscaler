import fs from "fs/promises";
import path from "path";

export interface WalkDirOptions {
  extensions: string[];
  maxDepth: number;
}

export async function walkDir(
  dirPath: string,
  options: WalkDirOptions,
  currentDepth = 0
): Promise<string[]> {
  if (currentDepth > options.maxDepth) {
    return [];
  }
  const files = await fs.readdir(dirPath);
  const filePaths: string[] = [];
  for (const file of files) {
    const filePath = path.join(dirPath, file);
    const stat = await fs.stat(filePath);
    if (stat.isDirectory()) {
      const subDirFilePaths = await walkDir(
        filePath,
        options,
        currentDepth + 1
      );
      filePaths.push(...subDirFilePaths);
    } else {
      const ext = path.extname(filePath);
      if (options.extensions.includes(ext)) {
        filePaths.push(filePath);
      }
    }
  }
  return filePaths;
}
