import fs from "fs";
import path from "path";

const filesToUpdate = [
  "src/features/property-search/agent-tools.ts",
  "src/features/property-extraction/scraper.ts",
  "src/features/property-extraction/ai-extractor.ts",
  "src/features/property-search/link-extractor.ts",
  "src/app/api/property-search/route.ts",
  "src/app/api/property-extraction/route.ts",
];

for (const file of filesToUpdate) {
  const filePath = path.join(process.cwd(), file);
  if (!fs.existsSync(filePath)) continue;

  let content = fs.readFileSync(filePath, "utf-8");

  // Check if we need to add the import
  if ((content.includes("console.log") || content.includes("console.error")) && !content.includes("@/lib/logger")) {
    const lines = content.split("\n");
    // Insert after the last import
    const lastImportIdx = lines.findLastIndex((line) => line.trim().startsWith("import "));
    const insertIdx = lastImportIdx >= 0 ? lastImportIdx + 1 : 0;
    
    lines.splice(insertIdx, 0, `import logger from "@/lib/logger";`);
    content = lines.join("\n");
  }

  // Replace console.log and console.error
  content = content.replace(/console\.log\(/g, "logger.info(");
  content = content.replace(/console\.error\(/g, "logger.error(");

  fs.writeFileSync(filePath, content);
  console.log(`Updated ${file}`);
}
