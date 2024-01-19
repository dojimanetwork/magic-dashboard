import { unlinkSync, writeFileSync } from "fs";

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
