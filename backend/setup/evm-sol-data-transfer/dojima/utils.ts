import * as path from "path";
import * as fs from "fs";

/** Array of [path, content] */
export type Files = [string, string][];

export async function writeFiles(files: Files, baseUri: string) {
  for (const file of files) {
    const filePath = file[0];
    const content = file[1];
    const uri = path.join(baseUri, filePath);

    if (filePath.includes(".")) {
      // File
      fs.writeFileSync(uri, Buffer.from(content));
    } else {
      // Folder
      fs.mkdirSync(uri);
    }
  }
}
