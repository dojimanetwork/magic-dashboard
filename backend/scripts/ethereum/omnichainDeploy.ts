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

type OmnichainEthParams = {
  name: string;
  symbol: string;
  fileNames: {
    ethCrossChain: string;
  };
};

const promisifiedExec = promisify(exec);

function readEthDeployedContractDetails(fileName: string) {
    return JSON.parse(readFileSync(`${process.cwd()}/Deployed-Config/details/${fileName}-eth.json`).toString())
}

export function GetOmnichainEthScript(params: OmnichainEthParams) {
  const script = `
  const { ethers, upgrades } = require('hardhat');
  const fs = require('fs');
  const writeFileName = '${params.name}-eth';
  const readFileNameDojOmniChain = '${params.name}-doj';
  
  function readDOJDeployedContractAddresses() {
      return JSON.parse(fs.readFileSync('${process.cwd()}/Deployed-Config/${
    params.name
  }-doj.json').toString())
  }

  function writeEthDeployedContractDetails(data) {
    fs.writeFileSync(
        '${process.cwd()}/Deployed-Config/details/${params.name}-eth.json',
        JSON.stringify(data, null, 2) // Indent 2 spaces
    )
  }

  function writeEthDeployedContractAddresses(data) {
    fs.writeFileSync(
        '${process.cwd()}/Deployed-Config/${params.name}-eth.json',
        JSON.stringify(data, null, 2) // Indent 2 spaces
    )
  }
  
  // network config
  const ethURL = '${process.env.VITE_APP_ETH_URL}';
  
  const ethXERC20TokenName = '${params.name}';
  const ethXERC20TokenSymbol = '${params.symbol}';
  const inboundStateSenderContract = '${
    process.env.VITE_APP_INBOUND_STATE_SENDER_CONTRACT_ADDRESS
  }';
  const ethCrossChainTokenDeployerAccPrvKey = '${
    process.env.VITE_APP_TEST_ACCOUNT_PVTKEY
  }';
  const omniChainContracts = readDOJDeployedContractAddresses();
  const omniChainERC20 = omniChainContracts.OmniChainERC20Contract
  console.log('omniChainContracts address: ', omniChainERC20);

  const ethProvider = new ethers.JsonRpcProvider(ethURL);
  const ethCrossChainTokenDeployerWallet = new ethers.Wallet(ethCrossChainTokenDeployerAccPrvKey, ethProvider);
  
  async function main() {
      let EthCrossChainTokenContract = await ethers.getContractFactory('${
        params.fileNames.ethCrossChain
      }');
      // EthCrossChainTokenContract = await EthCrossChainTokenContract.connect(ethCrossChainTokenDeployerWallet);
      const ethCrossChainTokenContract = await upgrades.deployProxy(EthCrossChainTokenContract, [ethXERC20TokenName, ethXERC20TokenSymbol, inboundStateSenderContract, omniChainERC20], { initializer: 'initialize' });
      await ethCrossChainTokenContract.waitForDeployment();

      writeEthDeployedContractAddresses({
          EthCrossChainTokenContract: ethCrossChainTokenContract.target,
      });

      const contractInputs = [
        { address: ethCrossChainTokenContract.target, fileName: '${
          params.fileNames.ethCrossChain
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
  writeEthDeployedContractDetails(contractInfoArray);
      
      process.exit(0);
  }
  
  
  main().catch((error) => {
      console.error(error);
      process.exitCode = 1;
  });`;

  return script;
}

async function compile(params: OmnichainCompileParams) {
  params.map((param) => {
    const code = formatSolidityCode(param.code);
    //   createFile(code, `contracts/${contractFileName}.sol`);
    writeFileSync(`${process.cwd()}/contracts/${param.fileName}.sol`, code);
  });

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

async function deploy(params: OmnichainContractsData) {
  const script = GetOmnichainEthScript({
    name: params.contractName,
    symbol: params.contractSymbol as string,
    fileNames: {
      ethCrossChain: params.contractCode[0].fileName,
    },
  });

  writeFileSync(
    `${process.cwd()}/scripts/templates-scripts/deploy_eth_crosschain_${
      params.contractName
    }_contracts.js`,
    script,
  );

  const command = `yarn hardhat run scripts/templates-scripts/deploy_eth_crosschain_${params.contractName}_contracts.js --network holesky_ethereum`;

  try {
    const { stdout, stderr } = await promisifiedExec(command);
    if (stderr) {
      throw new Error(stderr);
    }

    return stdout;
  } catch (e: any) {
    throw new Error(`Error deploying contract: ${e.message}`);
  }
}

export async function deployETHOmnichainContractHandler(
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

        // Check if deployment was successful
        if (deployDetails.includes("deployment success")) {
            console.log("Entered success ");
          const details: Array<EVMContractDeployedObject> = readEthDeployedContractDetails(deployParams.contractName);
          return details;
        //   const deploymentResult: {
        //     details: EVMContractDeployedObject
        //   } = JSON.parse(parseDeployedDetails(deployDetails) as string);
        //   return deploymentResult.details;
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
