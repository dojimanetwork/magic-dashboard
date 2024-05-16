import SolAnchor from "../solana/solana-setup";
import * as fs from "fs";
import * as path from "path";
import { SolanaProgramData } from "../sol-doj-token-omnichain/types";

async function removeProgramDir(programName: string) {
  const baseDirPath = path.join(
    process.cwd(),
    "scripts",
    "solana",
    "solana-setup"
  );
  const programDirPath = path.join(baseDirPath, programName);
  if (fs.existsSync(programDirPath)) {
    fs.rmSync(programDirPath, { recursive: true });
  }
}

async function build(programName: string) {
  const initialize = await SolAnchor.processCreateAnchor(programName);

  if (initialize) {
    const buildProgram = await SolAnchor.build(programName);

    return buildProgram;
  } else {
    return "Build failed";
  }
}

async function deploy(programName: string) {
  const deployProgram = await SolAnchor.deploy(programName);

  return deployProgram;
}

export default async function deploySOLProgramHandler(params: SolanaProgramData) {
  try {
    try {
      // build the program
      const processBuild = await build(params.programName);

      // Check if build was successful
      if (processBuild.includes("success")) {
        // deploy if build is successful
        const deployDetails = await deploy(params.programName);

        return deployDetails;
      } else {
        throw new Error("Error building program");
      }
    } catch (e: any) {
      throw new Error(`Error deploying and compiling contract: ${e.message}`);
    } finally {
      await removeProgramDir(params.programName);
    }
  } catch (error: any) {
    throw new Error(`Internal Server Error: ${error.message}`);
  } finally {
    await removeProgramDir(params.programName);
  }
}
