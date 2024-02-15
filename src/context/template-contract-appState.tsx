import { AvailableChains } from "../../excalidraw-app/dojima-templates/types";
import React, { createContext, useContext, useState } from "react";

export interface Erc20TemplateSaveContractDetailsData {
  chain: AvailableChains;
  name: string;
  symbol?: string;
  premint?: string | number;
  mintable?: boolean;
  burnable?: boolean;
  pausable?: boolean;
  permit?: boolean;
  votes?: boolean;
  flashmint?: boolean;
  access?: any;
  upgradeable?: any;
  info?: {
    securityContract: string;
    license: string;
  };
}

export interface Erc721TemplateSaveContractDetailsData {
  chain: AvailableChains;
  name: string;
  symbol?: string;
  baseUri?: string;
  mintable?: boolean;
  burnable?: boolean;
  pausable?: boolean;
  incremental?: boolean;
  votes?: boolean;
  enumerable?: boolean;
  uriStorage?: boolean;
  access?: any;
  upgradeable?: any;
  info?: {
    securityContract: string;
    license: string;
  };
}

export interface Erc20TemplateSaveContractDetails {
  contracts: Array<Erc20TemplateSaveContractDetailsData>;
}

export interface Erc721TemplateSaveContractDetails {
  contracts: Array<Erc721TemplateSaveContractDetailsData>;
}

interface ContractContextProps {
  erc20TemplateContractDetails: Erc20TemplateSaveContractDetails;
  erc721TemplateContractDetails: Erc721TemplateSaveContractDetails;
  updateErc20TemplateContractDetail: (
    chain: AvailableChains,
    updatedContract: Erc20TemplateSaveContractDetailsData,
  ) => void;
  updateErc721TemplateContractDetail: (
    chain: AvailableChains,
    updatedContract: Erc721TemplateSaveContractDetailsData,
  ) => void;
}

const TemplateContractContext = createContext<ContractContextProps>(null!);

function generateErc20InitialDetails(): Erc20TemplateSaveContractDetails {
  const chains: AvailableChains[] = ["dojima", "ethereum", "solana", "bsc"];

  const initialDetails: Erc20TemplateSaveContractDetails = {
    contracts: chains.map((chain) => ({
      chain,
      name: "Token",
    })),
  };

  return initialDetails;
}

function generateErc721InitialDetails(): Erc721TemplateSaveContractDetails {
  const chains: AvailableChains[] = ["dojima", "ethereum", "solana", "bsc"];

  const initialDetails: Erc721TemplateSaveContractDetails = {
    contracts: chains.map((chain) => ({
      chain,
      name: "Nft",
    })),
  };

  return initialDetails;
}

export const useTemplateContractDetails = () =>
  useContext(TemplateContractContext);

export const TemplateContractProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [erc20TemplateContractDetails, setErc20TemplateContractDetails] =
    useState<Erc20TemplateSaveContractDetails>(generateErc20InitialDetails);
  const [erc721TemplateContractDetails, setErc721TemplateContractDetails] =
    useState<Erc721TemplateSaveContractDetails>(generateErc721InitialDetails);

  const updateErc20TemplateContractDetail = (
    chain: AvailableChains,
    updatedContract: Erc20TemplateSaveContractDetailsData,
  ) => {
    // Find the index of the contract with the same chain in the contracts array
    const index = erc20TemplateContractDetails.contracts.findIndex(
      (contract) => contract.chain === updatedContract.chain,
    );

    if (index !== -1) {
      // If the contract with the same chain exists, update it
      let updatedContracts = [...erc20TemplateContractDetails.contracts];
      updatedContracts[index] = updatedContract;
      updatedContracts = updatedContracts.map((contract) => {
        return {
          ...contract,
          name: updatedContract.name,
          symbol: updatedContract.symbol || contract.symbol,
        };
      });

      setErc20TemplateContractDetails({ contracts: updatedContracts });
    } else {
      // If the contract with the same chain doesn't exist, add the new contract
      const latestContracts = [
        ...erc20TemplateContractDetails.contracts,
        updatedContract,
      ];
      latestContracts.map((contract) => {
        return {
          ...contract,
          name: updatedContract.name,
          symbol: updatedContract.symbol || contract.symbol,
        };
      });
      setErc20TemplateContractDetails({ contracts: latestContracts });
    }
  };

  const updateErc721TemplateContractDetail = (
    chain: AvailableChains,
    updatedContract: Erc721TemplateSaveContractDetailsData,
  ) => {
    // Find the index of the contract with the same chain in the contracts array
    const index = erc721TemplateContractDetails.contracts.findIndex(
      (contract) => contract.chain === updatedContract.chain,
    );

    if (index !== -1) {
      // If the contract with the same chain exists, update it
      let updatedContracts = [...erc721TemplateContractDetails.contracts];
      updatedContracts[index] = updatedContract;
      updatedContracts = updatedContracts.map((contract) => {
        return {
          ...contract,
          name: updatedContract.name,
          symbol: updatedContract.symbol || contract.symbol,
          baseUri: updatedContract.baseUri || contract.baseUri,
        };
      });

      setErc721TemplateContractDetails({ contracts: updatedContracts });
    } else {
      // If the contract with the same chain doesn't exist, add the new contract
      const latestContracts = [
        ...erc721TemplateContractDetails.contracts,
        updatedContract,
      ];
      latestContracts.map((contract) => {
        return {
          ...contract,
          name: updatedContract.name,
          symbol: updatedContract.symbol || contract.symbol,
          baseUri: updatedContract.baseUri || contract.baseUri,
        };
      });
      setErc721TemplateContractDetails({ contracts: latestContracts });
    }
  };

  const contextValue: ContractContextProps = {
    erc20TemplateContractDetails,
    erc721TemplateContractDetails,
    updateErc20TemplateContractDetail,
    updateErc721TemplateContractDetail
  };

  return (
    <TemplateContractContext.Provider value={contextValue}>
      {children}
    </TemplateContractContext.Provider>
  );
};
