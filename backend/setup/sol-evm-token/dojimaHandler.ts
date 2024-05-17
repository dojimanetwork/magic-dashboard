import * as fs from "fs";
import * as path from "path";
import { compile } from "./dojima/compile";
import { deploy } from "./dojima/deploy";
import { processCreateHardhat } from "./dojima/init";
import { DojimaContractData } from "./types";

async function removeContractDir(programName: string) {
  const baseDirPath = path.join(
    process.cwd(),
    "setup",
    "sol-evm-token",
    "dojima",
  );
  const programDirPath = path.join(baseDirPath, programName);
  if (fs.existsSync(programDirPath)) {
    fs.rmSync(programDirPath, { recursive: true });
  }
}

async function compileContract(contractName: string, contractSymbol: string, totalSupply: number) {
  const initialize = await processCreateHardhat(
    contractName,
    contractSymbol,
    totalSupply
  );

  if (initialize) {
    const compiledContract = await compile(contractName);

    return compiledContract;
  } else {
    return "Compile failed";
  }
}

async function deployContract(contractName: string) {
  const deployedContract = await deploy(contractName);

  return deployedContract;
}

export default async function deployDOJContractHandler(params: DojimaContractData) {
  try {
    try {
      // Compile the contract
      const processCompile = await compileContract(params.contractName, params.contracSymbol, params.totalSupply);

      // Check if compile was successful
      if (processCompile.includes("success")) {
        // deploy if compile is successful
        const deployDetails = await deployContract(params.contractName);

        return deployDetails;
      } else {
        return "Error compiling contract";
      }
    } catch (e: any) {
      return `Error deploying and compiling contract: ${e.message}`;
    } finally {
      await removeContractDir(params.contractName);
    }
  } catch (error: any) {
    return `Internal Server Error: ${error.message}`;
  } finally {
    await removeContractDir(params.contractName);
  }
}
