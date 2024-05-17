import * as path from "path";
import { exec } from "child_process";
import { promisify } from "util";

export async function compile(contractName: string) {
  const originalPath = process.cwd();
  const pathNew = path.join(
    originalPath,
    "setup",
    "dojima",
    `${contractName}`
  );

  // // Change the current working directory
  // process.chdir(pathNew);

  const promisifiedExec = promisify(exec);
  const command = "yarn hardhat compile";

  try {
    const { stdout, stderr } = await promisifiedExec(command, {cwd: pathNew});
    if (stderr) {
      return "Compile failed";
    }
    if (
      stdout.includes("successfully") ||
      stdout.includes("Nothing to compile") ||
      stdout.includes("No need to generate any newer typings")
    ) {
      return "Compile success";
    } else {
      return "Compile failed";
    }
  } catch (error) {
    return "Compile failed";
  }
}
