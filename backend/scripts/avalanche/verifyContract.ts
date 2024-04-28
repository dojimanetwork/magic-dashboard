// verifyContract.ts
import { exec } from "child_process";
import { promisify } from "util";
import { VerifyEVMContractParams } from "../types";

const promisifiedExec = promisify(exec);

export async function verifyAVAXContractHandler(
  verifyParams: VerifyEVMContractParams,
) {
  try {
    const { network, contractAddress, args }: VerifyEVMContractParams =
      verifyParams;
    // Check if required parameters are present
    if (!network || !contractAddress) {
      console.error("Input all required params");
      return "Error: Input all required params";
    }

    try {
      // Ensure that args is an array
      const argsArray: string[] = args
        ? Array.isArray(args)
          ? args
          : [args]
        : [];
      const constructorArgsString = argsArray.join(" ");

      const command =
        `yarn hardhat verify --network ${network} ${contractAddress} ${constructorArgsString}`.trim();
      const { stdout, stderr } = await promisifiedExec(command);
      if (stderr) {
        return stderr;
      }

      if (
        stdout.includes("Successfully verified") ||
        stdout.includes("already been verified")
      ) {
        return stdout;
      }
      return "Error verifying contract";
    } catch (e: any) {
      return `Error verifying contract: ${e.message}`;
    }
  } catch (error) {
    console.error(error);
    return "Internal Server Error";
  }
}
