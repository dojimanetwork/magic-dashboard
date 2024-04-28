import { exec } from "child_process";
import { promisify } from "util";
import { formatSolidityCode, parseDeployedDetails } from "../utils";
import { ethers } from "ethers";
import { writeFileSync, readFileSync } from "fs";
import {
  OmnichainContractsData,
  DeployEVMContractParams,
  EVMContractDeployedObject,
  OmnichainCompileParams,
} from "../types";

type OmnichainDojParams = {
  name: string;
  symbol: string;
  decimals: number;
  fileNames: {
    xchain: string;
    omnichain: string;
  };
};

const promisifiedExec = promisify(exec);

function readDOJDeployedContractDetails(fileName: string) {
  return JSON.parse(readFileSync(`${process.cwd()}/Deployed-Config/details/${fileName}-doj.json`).toString())
}

export function GetOmnichainDojScript(params: OmnichainDojParams) {
  const script = `
  const { ethers, upgrades } = require('hardhat');
  const fs = require('fs');
  const writeFileName = '${params.name}-doj';

  function readDOJDeployedContractDetails() {
    return JSON.parse(fs.readFileSync('${process.cwd()}/Deployed-Config/details/${
  params.name
}-doj.json').toString())
}

  function writeDOJDeployedContractAddresses(data) {
    fs.writeFileSync(
        '${process.cwd()}/Deployed-Config/${params.name}-doj.json',
        JSON.stringify(data, null, 2) // Indent 2 spaces
    )
  }

  function writeDOJDeployedContractDetails(data) {
    fs.writeFileSync(
        '${process.cwd()}/Deployed-Config/details/${params.name}-doj.json',
        JSON.stringify(data, null, 2) // Indent 2 spaces
    )
  }
  
  // these environment variables should be defined in an '.env' file
  // deployer account private keys
  const omniChainDeployerAccPrvKey = '${
    process.env.VITE_APP_TEST_ACCOUNT_PVTKEY
  }';
  
  // State Contracts
  const outboundStateSenderContract = '${
    process.env.VITE_APP_OUTBOUND_STATE_SENDER_CONTRACT_ADDRESS
  }';
  const stateSyncerVerifierContract = '${
    process.env.VITE_APP_STATE_SYNCER_VERIFIER_CONTRACT_ADDRESS
  }';
  
  // network config
  const dojimaURL = '${process.env.VITE_APP_DOJIMA_URL}';
  
  // token config
  const dojXTokenName = '${params.name}';
  const dojXTokenSymbol = '${params.symbol}';
  const dojXTokenDecimal = '${params.decimals}';
  
  const dojimaProvider = new ethers.JsonRpcProvider(dojimaURL);
  const omniChainDeployerWallet = new ethers.Wallet(omniChainDeployerAccPrvKey, dojimaProvider);
  
  async function main() {
    let initialDOJBalance = await dojimaProvider.getBalance(omniChainDeployerWallet.address);
  
    // deploy cross-chain token contract
    // const xTokenContract = await ethers.deployContract("${
      params.fileNames.xchain
    }", [dojXTokenName, dojXTokenSymbol,dojXTokenDecimal], omniChainDeployerWallet);
    const xTokenContract = await ethers.deployContract("${
      params.fileNames.xchain
    }", omniChainDeployerWallet);
    await xTokenContract.waitForDeployment();
  
    const OmniChainERC20 = await ethers.getContractFactory("${
      params.fileNames.omnichain
    }");
    const omniChainERC20 = await OmniChainERC20.connect(omniChainDeployerWallet);
    const omniChainContract = await upgrades.deployProxy(
      omniChainERC20,
      [xTokenContract.target, outboundStateSenderContract, stateSyncerVerifierContract],
      { initializer: 'initialize',kind: "uups" }
    );
    await omniChainContract.waitForDeployment();
  
    const setTx = await xTokenContract.setOmniChainContract(omniChainContract.target);
    await setTx.wait();
  
    writeDOJDeployedContractAddresses({
      OmniChainERC20Contract: omniChainContract.target,
      XTokenContract: xTokenContract.target,
    });
  
    const contractInputs = [
      { address: xTokenContract.target, fileName: '${
        params.fileNames.xchain
      }' },
      { address: omniChainContract.target, fileName: '${
        params.fileNames.omnichain
      }' }
  ];
  const contractInfoArray = [];

  for (const input of contractInputs) {
      const { address, fileName } = input;
      const contractFactory = await ethers.getContractFactory(fileName);
      const contract = contractFactory.attach(address);

      // Get the ABI
      const abi = contract.interface.formatJson();

      // Get the bytecode
      const bytecode = await ethers.provider.getCode(address);

      contractInfoArray.push({
        contractAddress: address,
        contractABI: abi,
        contractByteCode: bytecode
      });
  }
  console.log("Dojima Omnichain Token deployment success");

  // After success add details to new json file
  writeDOJDeployedContractDetails(contractInfoArray);

    // Exit the process
    process.exit(0);
  }
  
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });`;

  return script;
}

async function compile(params: OmnichainCompileParams) {
  // Create solidity files using contract codes
  params.map((param) => {
    const code = formatSolidityCode(param.code);
    //   createFile(code, `contracts/${contractFileName}.sol`);
    writeFileSync(`${process.cwd()}/contracts/${param.fileName}.sol`, code);
  });

  const command = `yarn hardhat compile`;
  console.log("Compile done");
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

async function deploy(params: OmnichainContractsData) {
  const script = GetOmnichainDojScript({
    name: params.contractName,
    symbol: params.contractSymbol as string,
    decimals: 18,
    fileNames: {
      xchain: params.contractCode[0].fileName,
      omnichain: params.contractCode[1].fileName,
    },
  });

  writeFileSync(
    `${process.cwd()}/scripts/templates-scripts/deploy_doj_omnichain_${
      params.contractName
    }_contracts.js`,
    script,
  );
  console.log("Deploy script done");
  const command = `yarn hardhat run scripts/templates-scripts/deploy_doj_omnichain_${params.contractName}_contracts.js --network dojima`;

  try {
    console.log("Deploy start");
    const { stdout, stderr } = await promisifiedExec(command);
    console.log("Deploy done");
    if (stderr) {
      throw new Error(stderr);
    }
    return stdout;
  } catch (e: any) {
    throw new Error(`Error deploying contract: ${e.message}`);
  }
}

export async function deployDOJOmnichainContractHandler(
  deployParams: OmnichainContractsData,
) {
  try {
    const { contractCode, contractName }: OmnichainContractsData = deployParams;
    // Check if required parameters are present
    if ((contractCode && contractCode.length <= 0) || !contractName) {
      console.error("Input all required params");
      throw new Error("Error: Input all required params");
    }

    try {
      // Call compileHandler
      const compiled = await compile(contractCode);

      // Check if compilation was successful
      if (
        compiled.includes("successfully") ||
        compiled.includes("Nothing to compile") ||
        compiled.includes("No need to generate any newer typings")
      ) {
        // Call deployContractHandler if compilation is successful
        const deployDetails = await deploy(deployParams);
        console.log("Deployed details : ", deployDetails);
        // Check if deployment was successful
        if (deployDetails.includes("deployment success")) {
          console.log("Entered success ");
          const details: Array<EVMContractDeployedObject> = readDOJDeployedContractDetails(deployParams.contractName);
          return details;
          
          // const deploymentResult: {
          //   details: EVMContractDeployedObject
          // } = JSON.parse(parseDeployedDetails(deployDetails) as string);
          // console.log("Deployment result : ", deploymentResult);
          // return deploymentResult.details;
        } else {
          throw new Error("Error deploying contract");
        }
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
