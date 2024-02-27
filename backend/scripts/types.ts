/** Chains supported by dashboard
 * Note: Might increase in future
 */
export type AvailableChains = "dojima" | "ethereum" | "bsc";

/** EVM Template types supported by dashboard */

export type templateType = "erc20" | "nft";

export type EVMContractDeployedObject = {
  contractAddress: string;
  contractABI: string;
  contractByteCode: string;
};

export type ChainContractsData = {
  contractAddress: string;
  contractAbi: string;
  contractByteCode: string;
  verified: boolean;
};

export type UserContractsObject = {
  email: string;
  dojima: ChainContractsData[];
  ethereum: ChainContractsData[];
};

export type ContractsChain = "dojima" | "ethereum";

export type ChainContractsObject = {
  chain: ContractsChain;
  contracts: ChainContractsData[];
};

export type DeployEVMContractParams = {
  contractCode?: string;
  contractName?: string;
  args?: any;
};

export type VerifyEVMContractParams = {
  network?: string;
  contractAddress?: string;
  args?: any;
};

export type ElementsDeploymentData = {
  element: string;
  deployed: boolean;
  contractAddress: string;
};

export type ProjectDataObject = {
  projectName: string;
  email: string;
  description: string;
  type: string;
  chains: string[];
  projectData: string;
  status?: boolean;
  deploymentData?: ElementsDeploymentData[];
  dateCreated?: Date;
  lastUpdated?: Date;
};
