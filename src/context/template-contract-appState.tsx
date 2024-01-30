import { AvailableChains } from "../../excalidraw-app/dojima-templates/types";
import React, { createContext, useContext, useState } from 'react';

export interface TemplateSaveContractDetailsData {
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

export interface TemplateSaveContractDetails {
    contracts: Array<TemplateSaveContractDetailsData>;
}

interface ContractContextProps {
  templateContractDetails: TemplateSaveContractDetails;
  updateTemplateContractDetail: (chain: AvailableChains, updatedContract: TemplateSaveContractDetailsData) => void;
}

const TemplateContractContext = createContext<ContractContextProps>(null!);

function generateInitialDetails(): TemplateSaveContractDetails {
    const chains: AvailableChains[] = ['dojima', 'ethereum', 'solana', 'bsc'];
  
    const initialDetails: TemplateSaveContractDetails = {
      contracts: chains.map((chain) => ({
        chain,
        name: 'Token',
      })),
    };
  
    return initialDetails;
  };

export const useTemplateContractDetails = () =>
  useContext(TemplateContractContext);

export const TemplateContractProvider: React.FC<{
    children: React.ReactNode;
  }> = ({ children }) => {
  const [templateContractDetails, setTemplateContractDetails] = useState<TemplateSaveContractDetails>(generateInitialDetails);

  const updateTemplateContractDetail = (chain: AvailableChains, updatedContract: TemplateSaveContractDetailsData) => {
    // Find the index of the contract with the same chain in the contracts array
    const index = templateContractDetails.contracts.findIndex(
      (contract) => contract.chain === updatedContract.chain,
    );

    if (index !== -1) {
      // If the contract with the same chain exists, update it
      const updatedContracts = [...templateContractDetails.contracts];
      updatedContracts[index] = updatedContract;
      setTemplateContractDetails({ contracts: updatedContracts });
    } else {
      // If the contract with the same chain doesn't exist, add the new contract
      setTemplateContractDetails((prevContracts) => ({
        contracts: [...prevContracts.contracts, updatedContract],
      }));
    }
  };

  const contextValue: ContractContextProps = {
    templateContractDetails,
    updateTemplateContractDetail,
  };

  return (
    <TemplateContractContext.Provider value={contextValue}>
      {children}
    </TemplateContractContext.Provider>
  );
};
