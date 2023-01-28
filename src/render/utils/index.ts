const rootDir = window.rootdir;
const outputPath = rootDir + "\\" + "images";

const getFileName = (fullPath: string) => {
  return fullPath.substring(fullPath.lastIndexOf("\\") + 1, fullPath.length);
};

export const getOutputPath = (model: any, fullPath: string) => {
  const filename = getFileName(fullPath);
  return outputPath + "\\" + model + "-" + filename;
};
