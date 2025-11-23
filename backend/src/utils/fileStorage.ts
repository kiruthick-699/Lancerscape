import path from "path";
import fs from "fs";

export const ensureUploadsDir = (base = path.join(process.cwd(), "uploads")) => {
  if (!fs.existsSync(base)) {
    fs.mkdirSync(base, { recursive: true });
  }
  return base;
};

export const getUploadPath = (filename: string) => path.join(ensureUploadsDir(), filename);
