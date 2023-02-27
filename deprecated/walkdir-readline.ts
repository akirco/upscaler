import fs from "fs";
import path from "path";
import readline from "readline";

interface WalkDirOptions {
  extensions: string[];
  maxDepth: number;
}

async function walkDir(
  dirPath: string,
  options: WalkDirOptions,
  currentDepth = 0
): Promise<string[]> {
  if (currentDepth > options.maxDepth) {
    return [];
  }
  const files = await fs.promises.readdir(dirPath);
  const filePaths: string[] = [];
  for (const file of files) {
    const filePath = path.join(dirPath, file);
    const stat = await fs.promises.stat(filePath);
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
        const stream = fs.createReadStream(filePath);
        const rl = readline.createInterface({
          input: stream,
          crlfDelay: Infinity,
        });
        for await (const line of rl) {
          // Do something with the line
          // console.log(line);
        }
        filePaths.push(filePath);
      }
    }
  }
  return filePaths;
}

const options: WalkDirOptions = {
  extensions: [".png", ".jpg", ".js"],
  maxDepth: 2,
};

walkDir("F:\\Library\\Pictures\\", options)
  .then((filePaths) => {
    console.log(filePaths);
  })
  .catch((err) => {
    console.error(err);
  });
