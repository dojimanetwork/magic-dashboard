import { AvailableChains, OmniChainDeployableData } from "./types";
import { deployBSCContractHandler } from "./bsc/deployContract";
import { DeployableChainsData } from "./deploy";
import { deployDOJContractHandler } from "./dojima/deployContract";
import { deployETHContractHandler } from "./ethereum/deployContract";
import { EVMContractDeployedObject } from "./types";
import { deployContractsHandler } from "./deployAllScripts";
import { deployETHOmnichainContractHandler } from "./ethereum/omnichainDeploy";
import { deployDOJOmnichainContractHandler } from "./dojima/omnichainDeploy";
import { deployBSCOmnichainContractHandler } from "./bsc/omnichainDeploy";
import { deployAVAXOmnichainContractHandler } from "./avalanche/omnichainDeploy";

// export async function DeployChainScript(
//   contractsData: Array<DeployableChainsData>,
// ) {
//   let deployedDetails: Array<{
//     chain: AvailableChains;
//     details: EVMContractDeployedObject;
//   }> = [];
//   await Promise.all(
//     contractsData.map(async (contract) => {
//       let result;

//       if (contract.chainName === "bsc") {
//         result = await deployBSCContractHandler({
//           contractCode: contract.contracts[0].contractCode,
//           contractName: contract.contracts[0].contractName,
//           args: contract.contracts[0].args,
//         });
//       } else if (contract.chainName === "dojima") {
//         result = await deployDOJContractHandler({
//           contractCode: contract.contracts[0].contractCode,
//           contractName: contract.contracts[0].contractName,
//           args: contract.contracts[0].args,
//         });
//       } else if (contract.chainName === "ethereum") {
//         result = await deployETHContractHandler({
//           contractCode: contract.contracts[0].contractCode,
//           contractName: contract.contracts[0].contractName,
//           args: contract.contracts[0].args,
//         });
//       }

//       if (typeof result === "string") {
//         throw new Error(`${contract.chainName} deployment failed`);
//       }

//       deployedDetails.push({
//         chain: contract.chainName,
//         details: result as EVMContractDeployedObject,
//       });
//     }),
//   );

//   return deployedDetails;
// }

export async function DeployChainScript(
  contractsData: Array<DeployableChainsData>,
) {
  let deployedDetails: Array<{
    chain: AvailableChains;
    details: EVMContractDeployedObject;
  }> = [];

  // for (const contract of contractsData) {
  //   let result;

  //   if (contract.chainName === "bsc") {
  //     result = await deployBSCContractHandler({
  //       contractCode: contract.contracts[0].contractCode,
  //       contractName: contract.contracts[0].contractName,
  //       args: contract.contracts[0].args,
  //     });
  //   } else if (contract.chainName === "dojima") {
  //     result = await deployDOJContractHandler({
  //       contractCode: contract.contracts[0].contractCode,
  //       contractName: contract.contracts[0].contractName,
  //       args: contract.contracts[0].args,
  //     });
  //   } else if (contract.chainName === "ethereum") {
  //     result = await deployETHContractHandler({
  //       contractCode: contract.contracts[0].contractCode,
  //       contractName: contract.contracts[0].contractName,
  //       args: contract.contracts[0].args,
  //     });
  //   }

  //   if (typeof result === "string") {
  //     throw new Error(`${contract.chainName} deployment failed`);
  //   }

  //   deployedDetails.push({
  //     chain: contract.chainName,
  //     details: result as EVMContractDeployedObject,
  //   });
  // }

  deployedDetails = await deployContractsHandler(contractsData);

  return deployedDetails;
}

export async function DeployDOJChainScript(
  contractsData: DeployableChainsData,
) {
  let deployedDetails: {
    chain: AvailableChains;
    details: EVMContractDeployedObject;
  };

  const result = await deployDOJContractHandler({
    contractCode: contractsData.contracts[0].contractCode,
    contractName: contractsData.contracts[0].contractName,
    args: contractsData.contracts[0].args,
  });

  deployedDetails = {
    chain: contractsData.chainName,
    details: result as EVMContractDeployedObject,
  };

  return deployedDetails;
}

export async function DeployETHChainScript(
  contractsData: DeployableChainsData,
) {
  let deployedDetails: {
    chain: AvailableChains;
    details: EVMContractDeployedObject;
  };

  const result = await deployETHContractHandler({
    contractCode: contractsData.contracts[0].contractCode,
    contractName: contractsData.contracts[0].contractName,
    args: contractsData.contracts[0].args,
  });

  deployedDetails = {
    chain: contractsData.chainName,
    details: result as EVMContractDeployedObject,
  };

  return deployedDetails;
}

export async function DeployBSCChainScript(
  contractsData: DeployableChainsData,
) {
  let deployedDetails: {
    chain: AvailableChains;
    details: EVMContractDeployedObject;
  };

  const result = await deployBSCContractHandler({
    contractCode: contractsData.contracts[0].contractCode,
    contractName: contractsData.contracts[0].contractName,
    args: contractsData.contracts[0].args,
  });

  deployedDetails = {
    chain: contractsData.chainName,
    details: result as EVMContractDeployedObject,
  };

  return deployedDetails;
}

export async function DeployOmniChainScript(
  contractsData: Array<OmniChainDeployableData>,
) {
  let deployedDetails: Array<{
    chain: AvailableChains;
    details: EVMContractDeployedObject[];
  }> = [];

  console.log("Deploy omni chain script : ", contractsData);
  console.log("Deploy omni chain script type : ", typeof contractsData);
  
  // let res = [];

  for (const contract of contractsData) {
    const { chainName, contracts } = contract;
    // const { contractName, args } = contracts[0];
    let result;
    if (chainName === "dojima") {
      console.log("Entered dojima");
      result = await deployDOJOmnichainContractHandler(contracts);
    } else if (chainName === "ethereum") {
      console.log("Entered ethereum");
      result = await deployETHOmnichainContractHandler(contracts);
    } else if (chainName === "bsc") {
      console.log("Entered bsc");
      result = await deployBSCOmnichainContractHandler(contracts);
    } else if (chainName === "avalanche") {
      console.log("Entered avalanche");
      result = await deployAVAXOmnichainContractHandler(contracts);
    }

    if (typeof result === "string") {
      throw new Error(`${contract.chainName} deployment failed`);
    }

    deployedDetails.push({
      chain: contract.chainName,
      details: result as Array<EVMContractDeployedObject>,
    });

    // res.push({
    //   chain: contract.chainName,
    //   details: result
    // })
  }

  return deployedDetails;
  // return res;
}