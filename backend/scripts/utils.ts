import { unlinkSync, writeFileSync } from "fs";
import { exec } from "child_process";
import { promisify } from "util";

export function createFile(data: any, filePath: string) {
  try {
    writeFileSync(filePath, data);
    // console.log(`File ${filePath} has been created with provided data`);
  } catch (error: any) {
    console.error(`Error creating file: ${error.message}`);
  }
}

export function deleteFile(filePath: string) {
  try {
    unlinkSync(filePath);
    // console.log(`File ${filePath} has been deleted`);
  } catch (error: any) {
    console.error(`Error deleting file: ${error.message}`);
  }
}

export async function compile(contract: string, contractName: string) {
  const code = formatSolidityCode(contract);
  writeFileSync(`contracts/${contractName}-doj.sol`, code);
  const promisifiedExec = promisify(exec);
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

// export function formatSolidityCode(inputCode: string): string {
//   const lines = inputCode.split('\n'); // Split the input code into lines
//   const formattedLines = lines.map((line) => `    '${line}'`).join(' + \n'); // Add proper indentation and concatenate lines
//   return formattedLines;
// }

// export function formatSolidityCode(inputCode: string): string {
//   const formattedCode = inputCode
//     // .split(/;\s+/)
//     // .map((line) => line.trim())
//     // .join(' + \n');
//     .split(';')
//     .map((line) => line.trim())
//     .join(' + ";" + \n');
//
//   return formattedCode;
// }

export function formatSolidityCode(code: string): string {
  code = code.replace("pragma solidity", "\npragma solidity");
  // Replace semicolons with semicolons + newline
  code = code.replace(/;/g, ";\n");
  code = code.replace(/{/g, "{\n");
  code = code.replace(/}/g, "}\n");
  // Split the code into lines
  const lines = code.split("\n");
  // Indent each line with 4 spaces
  const indentedCode = lines.map((line) => `    ${line}`).join("\n");
  // Add a Solidity file preamble
  return `\n${indentedCode}\n`;
}
