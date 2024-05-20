import * as path from "path";
import { exec } from "child_process";
import { promisify } from "util";

export async function build(programName: string) {
  const originalPath = process.cwd();
  const pathNew = path.join(
    originalPath,
    "setup",
    "evm-sol-data-transfer",
    "solana",
    `${programName}`
  );

  // // Change the current working directory
  // process.chdir(pathNew);

  const promisifiedExec = promisify(exec);
  const command = "anchor build";

  try {
    const { stdout, stderr } = await promisifiedExec(command, {cwd: pathNew});
    if (stderr) {
      if (stderr.includes("Finished release [optimized] target(s)")) {
        return "Build success";
      }
      return "Build failed";
    }

    return "Build success";
  } catch (error) {
    return "Build failed";
  } 
  // finally {
  //   // Change back to the original directory
  //   process.chdir(originalPath);
  // }
}
