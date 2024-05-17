import * as fs from "fs";
import * as path from "path";
import { processCreateAnchor } from "./solana/anchorInit";
import { build } from "./solana/build";
import { deploy } from "./solana/deploy";
import { SolanaProgramData } from "./types";

async function removeProgramDir(programName: string) {
  const baseDirPath = path.join(
    process.cwd(),
    "setup",
    "sol-evm-token",
    "solana",
  );
  const programDirPath = path.join(baseDirPath, programName);
  if (fs.existsSync(programDirPath)) {
    fs.rmSync(programDirPath, { recursive: true });
  }
}

async function buildProgram(programName: string) {
  const initialize = await processCreateAnchor(programName);

  if (initialize) {
    const buildProgram = await build(programName);

    return buildProgram;
  } else {
    return "Build failed";
  }
}

async function deployProgram(programName: string) {
  const deployProgram = await deploy(programName);

  return deployProgram;
}

export default async function deploySOLProgramHandler(params: SolanaProgramData) {
  try {
    try {
      // build the program
      const processBuild = await buildProgram(params.programName);

      // Check if build was successful
      if (processBuild.includes("success")) {
        // deploy if build is successful
        const deployDetails = await deployProgram(params.programName);

        return deployDetails;
      } else {
        return "Error building program";
      }
    } catch (e: any) {
      return `Error deploying and building program: ${e.message}`;
    } finally {
      await removeProgramDir(params.programName);
    }
  } catch (error: any) {
    return `Internal Server Error: ${error.message}`;
  } finally {
    await removeProgramDir(params.programName);
  }
}
