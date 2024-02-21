import { AvailableChains } from "./types";
import { deployBSCContractHandler } from "./bsc/deployContract";
import { DeployableChainsData } from "./deploy";
import { deployDOJContractHandler } from "./dojima/deployContract";
import { deployETHContractHandler } from "./ethereum/deployContract";
import { EVMContractDeployedObject } from "./types";

export async function DeployChainScript(
  contractsData: Array<DeployableChainsData>,
) {
  let deployedDetails: Array<{
    chain: AvailableChains;
    details: EVMContractDeployedObject;
  }> = [];
  await Promise.all(
    contractsData.map(async (contract) => {
      let result;

      if (contract.chainName === "bsc") {
        result = await deployBSCContractHandler({
          contractCode: contract.contracts[0].contractCode,
          contractName: contract.contracts[0].contractName,
          args: contract.contracts[0].args,
        });
      } else if (contract.chainName === "dojima") {
        result = await deployDOJContractHandler({
          contractCode: contract.contracts[0].contractCode,
          contractName: contract.contracts[0].contractName,
          args: contract.contracts[0].args,
        });
      } else if (contract.chainName === "ethereum") {
        result = await deployETHContractHandler({
          contractCode: contract.contracts[0].contractCode,
          contractName: contract.contracts[0].contractName,
          args: contract.contracts[0].args,
        });
      }

      if (typeof result === "string") {
        throw new Error(`${contract.chainName} deployment failed`);
      }

      deployedDetails.push({
        chain: contract.chainName,
        details: result as EVMContractDeployedObject,
      });
    }),
  );

  return deployedDetails;
}
