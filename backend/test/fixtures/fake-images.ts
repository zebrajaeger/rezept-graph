import fs from "node:fs";
import { writeRecipeOutputs } from "../../src/output/output-writer";

export const fakeImages = async ({ svgPath, pngPath }: { svgPath: string; pngPath: string }) => {
  fs.writeFileSync(svgPath, "<svg>fixture</svg>");
  fs.writeFileSync(pngPath, "fixture PNG");
};

export const writeFakeOutputs: typeof writeRecipeOutputs = (analysis, outputDir, options) =>
  writeRecipeOutputs(analysis, outputDir, options, { renderImages: fakeImages });
