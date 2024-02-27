//deployAndCompile.ts
import { exec } from "child_process";
import { promisify } from "util";
import { formatSolidityCode } from "../utils";
import { ethers } from "ethers";
import { writeFileSync, readFileSync } from "fs";
import { DeployEVMContractParams, EVMContractDeployedObject } from "../types";

const promisifiedExec = promisify(exec);

async function compile(contract: string, contractName: string) {
  const code = formatSolidityCode(contract);
  //   createFile(code, `contracts/${contractName}.sol`);
  writeFileSync(`contracts/${contractName}-doj.sol`, code);

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

async function deploy(
  contractName: string,
  args: Array<any>,
): Promise<EVMContractDeployedObject> {
  const provider = new ethers.JsonRpcProvider(
    process.env.VITE_APP_DOJIMA_API_URL as string,
    // "https://api-test.d11k.dojima.network/"
  );
  // const signer = new ethers.Wallet(process.env.VITE_APP_TEST_ACCOUNT_PVTKEY as string, provider);
  const signer = ethers.Wallet.fromPhrase(
    process.env.VITE_APP_TEST_ACCOUNT_PHRASE as string,
    // "letter ethics correct bus asset pipe tourist vapor envelope kangaroo warm dawn"
  ).connect(provider);
  try {
    const jsonData = JSON.parse(
      readFileSync(
        `artifacts/contracts/${contractName}-doj.sol/${contractName}.json`,
      ).toString(),
    );

    // const data = readFile(`artifacts/contracts/${contractName}.sol/${contractName}.json`, 'utf8');
    // const jsonData = JSON.parse(data);

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

export async function deployDOJContractHandler(
  deployParams: DeployEVMContractParams,
) {
  try {
    const { contractCode, contractName, args }: DeployEVMContractParams =
      deployParams;
    // Check if required parameters are present
    if (!contractCode || !contractName) {
      console.error("Input all required params");
      throw new Error("Error: Input all required params");
    }

    try {
      // Call compileHandler
      const compiled = await compile(contractCode, contractName);

      // Check if compilation was successful
      if (
        compiled.includes("successfully") ||
        compiled.includes("Nothing to compile") ||
        compiled.includes("No need to generate any newer typings")
      ) {
        // Call deployContractHandler if compilation is successful
        const deployDetails = await deploy(
          contractName,
          args
            ? typeof args === "string"
              ? JSON.parse(args).values
              : args
            : [],
        );

        return deployDetails;
      }
      throw new Error("Error compiling contract");
    } catch (e: any) {
      throw new Error(`Error deploying and compiling contract: ${e.message}`);
    }
  } catch (error: any) {
    console.error(error);
    throw new Error(`Internal Server Error: ${error.message}`);
  }
}
