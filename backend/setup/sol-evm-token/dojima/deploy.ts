import * as path from "path";
import { exec } from "child_process";
import { promisify } from "util";
import * as fs from "fs";
import * as _ from "lodash";

export async function deploy(contractName: string) {
  const originalPath = process.cwd();
  const pathNew = path.join(
    originalPath,
    "setup",
    "sol-evm-token",
    "dojima",
    `${contractName}`
  );

  const promisifiedExec = promisify(exec);
  const command = `yarn hardhat run scripts/${contractName}.js --network dojima`;

  try {
    const { stdout, stderr } = await promisifiedExec(command, { cwd: pathNew });
    if (stderr) {
      return "Deploy failed";
    }

    // Extract contract address from the stdout
    const contractAddressMatch = stdout.match(/Contract Address: (\w+)/);
    if (!contractAddressMatch) {
      throw new Error("Failed to extract contractAddress");
    }

    const contractAddress = contractAddressMatch[1];

    // Read Abi and bytecode of the contract
    const data = JSON.parse(
      fs
        .readFileSync(`${pathNew}/artifacts/contracts/${contractName}.sol/${contractName}.json`)
        .toString()
    );

    return {
      contractAddress,
      contractAbi: data.abi,
      contractBytecode: data.bytecode
    };
  } catch (error) {
    return "Deploy failed";
  }
}
