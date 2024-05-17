import deployDOJContractHandler from "./dojimaHandler";
import deploySOLProgramHandler from "./solanaHandler";
import {
  DojimaDeployedData,
  SolanaDeployedData,
  SolDojTokenTemplateParams,
} from "./types";

export async function SolDojTokenTemplate(params: SolDojTokenTemplateParams) {
  let deployedDetails: Array<{
    chain: "dojima" | "solana";
    details: DojimaDeployedData | SolanaDeployedData | string;
  }> = [];

  const dojimaDeployment = await deployDOJContractHandler(params.dojima);

  if (typeof dojimaDeployment === "string") {
    deployedDetails.push({
      chain: "dojima",
      details: "Deployment failed",
    });
  } else {
    deployedDetails.push({
      chain: "dojima",
      details: dojimaDeployment,
    });
  }

  const solanaDeployment = await deploySOLProgramHandler(params.solana);

  if (typeof solanaDeployment === "string") {
    deployedDetails.push({
      chain: "solana",
      details: "Deployment failed",
    });
  } else {
    deployedDetails.push({
      chain: "solana",
      details: solanaDeployment,
    });
  }

  return deployedDetails;
}
