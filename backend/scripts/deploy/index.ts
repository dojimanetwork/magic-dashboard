//deployAndCompile.ts
import { exec } from "child_process";
import { promisify } from "util";
import { formatSolidityCode } from "../utils";
import { ethers } from "ethers";
import { writeFileSync, readFileSync } from "fs";
import { AvailableChains, DeployEVMContractParams, EVMContractDeployedObject } from "../types";
import deployOmnichainTokenContracts from "../omnichain/deploy_omnichain_token_contracts";

const promisifiedExec = promisify(exec);

export type ContractsData = {
  fileName: string;
  contractCode: string;
  contractName: string;
  contractSymbol?: string;
  args?: any;
};

export type DeployableChainsData = {
  chainName: AvailableChains;
  contracts: Array<ContractsData>;
};

async function compile(chainsData: Array<DeployableChainsData>) {
  chainsData.map((chainData) => {
    chainData.contracts.map((contractData) => {
      const code = formatSolidityCode(contractData.contractCode);
      writeFileSync(`contracts/${contractData.fileName}.sol`, code);
    });
  });

  const command = `yarn hardhat compile`;

  try {
    const { stdout, stderr } = await promisifiedExec(command);
    if (stderr) {
      throw new Error(stderr);
    }

    return stdout;
  } catch (e: any) {
    throw new Error(`Error compiling contract: ${e.message}`);
  }
}

async function deploy(chainsData: Array<DeployableChainsData>) {
  try {
    const chainData = chainsData.find((data) => data.chainName === "dojima");
    const deployDetails = chainData?.contracts[0];
    const contractsDeployed = await deployOmnichainTokenContracts(
      deployDetails?.contractName,
      deployDetails?.contractSymbol,
      process.env.VITE_APP_TEST_ACCOUNT_PVTKEY,
    );
    return contractsDeployed;
  } catch (error: any) {
    throw new Error(`Error deploying contract: ${error.message}`);
  }
}

export async function DeployContract(chainsData: Array<DeployableChainsData>) {
  try {
    // Call compileHandler
    const compiled = await compile(chainsData);
    // Check if compilation was successful
    if (
      compiled.includes("successfully") ||
      compiled.includes("Nothing to compile") ||
      compiled.includes("No need to generate any newer typings")
    ) {
      // Call deployContractHandler if compilation is successful
      const deployDetails = await deploy(chainsData);

      return deployDetails;
    }
    return "Error compiling contract";
  } catch (e: any) {
    return `Error deploying and compiling contract: ${e.message}`;
  }
}
