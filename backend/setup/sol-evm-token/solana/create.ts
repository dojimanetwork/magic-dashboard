import * as path from "path";
// import { spawnSync } from "child_process";
import * as fs from "fs";
import { exec } from "child_process";
import { promisify } from "util";

import { Files, writeFiles } from "./utils";

interface CreateProps {
  name: string;
  files: Files;
}

export async function processCreate({ name, files }: CreateProps) {
  const baseDirPath = path.join(
    process.cwd(),
    "scripts",
    "solana",
    "solana-setup"
  );
  fs.mkdirSync(path.join(baseDirPath, name));

  // Create files with the name prefix to not override current files
  files = files.map((f) => [path.join(name, f[0]), f[1]]);

  try {
    await writeFiles(files, baseDirPath);
    return true;
  } catch (error) {
    return false;
  }
}

export async function processInstallNodeModules(name: string) {
  const cwd = path.join(
    process.cwd(),
    "scripts",
    "solana",
    "solana-setup",
    name
  );
  const promisifiedExec = promisify(exec);
  const command = "yarn";

  await promisifiedExec(command, {cwd: cwd});
  // spawnSync("yarn", { cwd });
}
