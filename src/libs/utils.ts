import { basename } from "path";

/**
 *
 * @param outputPath output directory : fixed
 * @param model model name
 * @param fullPath input fullpath
 * @returns output fullpath
 */

export const getOutputPath = (
  outputPath: string,
  model: string,
  fullPath: string
) => {
  return (
    outputPath +
    "\\" +
    model +
    "-" +
    Date.now().toString(36) +
    "-" +
    basename(fullPath)
  );
};
