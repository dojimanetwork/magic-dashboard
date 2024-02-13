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
  writeFileSync(`contracts/${contractName}-bsc.sol`, code);

  const command = `yarn hardhat compile`;

  try {
    const { stdout, stderr } = await promisifiedExec(command);
    console.log("compiled bsc : ", stdout);
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
  console.log("Url : ", process.env.VITE_APP_BSC_TESTNET_API_URL);
  console.log("phrase : ", process.env.VITE_APP_TEST_ACCOUNT_PHRASE);
  const provider = new ethers.JsonRpcProvider(
    process.env.VITE_APP_BSC_TESTNET_API_URL as string,
    // "https://eth-goerli.g.alchemy.com/v2/TIMeEU-fdUdyD-YijUoB_AbdtlVfEcl2"
  );
  // const signer = new ethers.Wallet(process.env.VITE_APP_TEST_ACCOUNT_PVTKEY as string, provider);
  const signer = ethers.Wallet.fromPhrase(
    process.env.VITE_APP_TEST_ACCOUNT_PHRASE as string,
    // "letter ethics correct bus asset pipe tourist vapor envelope kangaroo warm dawn"
  ).connect(provider);
  try {
    const jsonData = JSON.parse(
      readFileSync(
        `artifacts/contracts/${contractName}-bsc.sol/${contractName}.json`,
      ).toString(),
    );

    console.log("signer : ", signer);

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
    console.log("factory : ", factory);
    const contract = await factory.deploy(...args);
    console.log("contrct : ", contract);
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

export async function deployBSCContractHandler(
  deployParams: DeployEVMContractParams,
) {
  try {
    const { contractCode, contractName, args }: DeployEVMContractParams =
      deployParams;
    // Check if required parameters are present
    if (!contractCode || !contractName) {
      console.error("Input all required params");
      return "Error: Input all required params";
    }

    try {
      // Call compileHandler
      const compiled = await compile(contractCode, contractName);
      console.log("compile : ", compiled);
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
      return "Error compiling contract";
    } catch (e: any) {
      return `Error deploying and compiling contract: ${e.message}`;
    }
  } catch (error) {
    console.error(error);
    return "Internal Server Error";
  }
}
