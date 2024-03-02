// deployAndCompile.ts

import { exec } from "child_process";
import { promisify } from "util";
import { formatSolidityCode } from "./utils";
import { ethers } from "ethers";
import { writeFileSync, readFileSync } from "fs";
import {
  DeployEVMContractParams,
  EVMContractDeployedObject,
  AvailableChains,
} from "./types";
import { DeployableChainsData } from "./deploy";

const promisifiedExec = promisify(exec);

async function compileContracts(contractsData: DeployableChainsData[]) {
  for (const contractData of contractsData) {
    let chainShortForm: string;
    switch (contractData.chainName) {
      case "bsc":
        chainShortForm = "bsc";
        break;
      case "ethereum":
        chainShortForm = "eth";
        break;
      case "dojima":
        chainShortForm = "doj";
        break;
      default:
        throw new Error(`Unsupported chain: ${contractData.chainName}`);
    }
    const { contractCode, contractName } = contractData.contracts[0];

    if (!contractCode || !contractName) {
      console.error("Input all required params");
      throw new Error("Error: Input all required params");
    }

    const code = formatSolidityCode(contractCode);
    writeFileSync(
      `${process.cwd()}/contracts/${contractName}-${chainShortForm}.sol`,
      code,
    );
  }

  const command = `yarn hardhat compile`;

  try {
    const { stdout, stderr } = await promisifiedExec(command);
    if (stderr) {
      throw new Error(stderr);
    }

    return stdout;
  } catch (e: any) {
    throw new Error(`Error compiling contracts: ${e.message}`);
  }
}

async function deployContract(
  chainName: AvailableChains,
  contractName: string,
  args: Array<any>,
): Promise<EVMContractDeployedObject> {
  let providerUrl: string;
  let chainShortForm: string;
  switch (chainName) {
    case "bsc":
      providerUrl = process.env.VITE_APP_BSC_TESTNET_API_URL as string;
      chainShortForm = "bsc";
      break;
    case "ethereum":
      providerUrl = process.env.VITE_APP_ETH_GOERLI_ALCHEMY_URL as string;
      chainShortForm = "eth";
      break;
    case "dojima":
      providerUrl = process.env.VITE_APP_DOJIMA_API_URL as string;
      chainShortForm = "doj";
      break;
    default:
      throw new Error(`Unsupported chain: ${chainName}`);
  }
  const provider = new ethers.JsonRpcProvider(providerUrl);

  const signer = ethers.Wallet.fromPhrase(
    process.env.VITE_APP_TEST_ACCOUNT_PHRASE as string,
  ).connect(provider);

  try {
    const jsonData = JSON.parse(
      readFileSync(
        `${process.cwd()}/artifacts/contracts/${contractName}-${chainShortForm}.sol/${contractName}.json`,
      ).toString(),
    );

    if (!signer || !jsonData) {
      throw new Error("Unable to sign contract");
    }

    const factory = new ethers.ContractFactory(
      jsonData.abi,
      jsonData.bytecode,
      signer,
    );
    const contract = await factory.deploy(...args);
    await contract.waitForDeployment();
    const contractAddress = await contract.getAddress();
    return {
      contractAddress,
      contractABI: jsonData.abi,
      contractByteCode: jsonData.bytecode,
    };
  } catch (err: any) {
    throw new Error(`Error deploying contract: ${err.message}`);
  }
}

export async function deployContractsHandler(
  contractsData: DeployableChainsData[],
) {
  try {
    // Call compileContractsHandler
    const compiled = await compileContracts(contractsData);

    // Check if compilation was successful
    if (
      compiled.includes("successfully") ||
      compiled.includes("Nothing to compile") ||
      compiled.includes("No need to generate any newer typings")
    ) {
      const deployedDetails: Array<{
        chain: AvailableChains;
        details: EVMContractDeployedObject;
      }> = [];

      // Call deployContractHandler for each contract
      for (const contractData of contractsData) {
        const { chainName, contracts } = contractData;
        const { contractName, args } = contracts[0];

        const deployDetails = await deployContract(
          chainName,
          contractName,
          args
            ? typeof args === "string"
              ? JSON.parse(args).values
              : args
            : [],
        );

        deployedDetails.push({
          chain: chainName,
          details: deployDetails,
        });
      }

      return deployedDetails;
    }

    throw new Error("Error compiling contracts");
  } catch (e: any) {
    throw new Error(`Error deploying and compiling contracts: ${e.message}`);
  }
}
