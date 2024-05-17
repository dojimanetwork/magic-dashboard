import * as path from "path";
import { exec } from "child_process";
import { promisify } from "util";
import * as fs from "fs";
import * as _ from "lodash";

export async function deploy(programName: string) {
  const originalPath = process.cwd();
  const pathNew = path.join(
    originalPath,
    "setup",
    "sol-evm-token",
    "solana",
    `${programName}`
  );

  // // Change the current working directory
  // process.chdir(pathNew);

  const promisifiedExec = promisify(exec);
  const command = "anchor deploy";

  try {
    const { stdout, stderr } = await promisifiedExec(command, { cwd: pathNew });
    if (stderr) {
      return "Deploy failed";
    }

    // Extract programId from the stdout
    const programIdMatch = stdout.match(/Program Id: (\w+)/);
    if (!programIdMatch) {
      throw new Error("Failed to extract programId");
    }

    const programId = programIdMatch[1];

    // Read IDL of the program
    const idl = JSON.parse(
      fs
        .readFileSync(`${pathNew}/target/idl/${_.snakeCase(programName)}.json`)
        .toString()
    );

    return {
      programId,
      idl,
    };

    // return "Deploy success";
  } catch (error) {
    return "Deploy failed";
  }
  // finally {
  //   // Change back to the original directory
  //   process.chdir(originalPath);
  // }
}
