import { readdir, lstat } from "node:fs/promises";
import path, { sep } from "node:path";

/**
 *
 * @param directory walker dir
 * @param walkerOptions {wanted:walker file types , deep:walker dir deep}
 * @returns all wanted files
 */

export async function walker(
  directory: string,
  walkerOptions?: { wanted: string[]; deep?: number }
): Promise<string[] | undefined> {
  try {
    const files = [""];
    const contents = await readdir(directory);
    const exts = walkerOptions?.wanted!;
    for (const content of contents) {
      const _dir = `${directory}${sep}${content}`;
      const stats = await lstat(_dir);
      if (!stats.isDirectory()) {
        const ext = path.extname(_dir);
        if (exts.includes(ext)) {
          files.push(_dir);
        }
      } else {
        const dirFiles = await walker(_dir, {
          wanted: walkerOptions?.wanted!,
          deep: walkerOptions?.deep,
        });
        files.push(...dirFiles!);
      }
    }
    return files.filter(Boolean);
  } catch (error) {
    console.error(error);
  }
}
