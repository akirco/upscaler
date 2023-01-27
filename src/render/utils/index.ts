const rootDir = window.rootdir;
const outputPath = rootDir + "\\" + "images";

const getFileName = (fullPath: string) => {
  return fullPath.substring(fullPath.lastIndexOf("\\"), fullPath.length);
};

export const getOutputPath = (fullPath: string) => {
  return outputPath + getFileName(fullPath);
};
