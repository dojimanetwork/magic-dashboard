import React from "react";
import {
  AvailableChains,
  templateType,
} from "../../excalidraw-app/dojima-templates/types";

export interface ContractDetailsData {
  name: string;
  chain: AvailableChains;
  type: templateType;
  gasPrice: string;
  codeDetails: {
    id: string;
    fileName: string;
    code: string;
  }[];
  symbol?: string;
  argumentsDetails?: {
    id: string;
    fileName: string;
    arguments: Array<any>;
  }[];
}

export interface ContractArguments {
  argument1: string;
  argument2: string;
}

export interface InitialContractDetails {
  contracts: Array<ContractDetailsData>;
}

export interface ContractDetailsContextProps {
  contractsData: InitialContractDetails;
  updateContractDetails: (updatedContract: ContractDetailsData) => void;
  resetContractDetails: () => void;
}

export const ContractDetailsContext =
  React.createContext<ContractDetailsContextProps>(null!);

export const useContractDetails = () =>
  React.useContext(ContractDetailsContext);

export const ContractDetailsProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [contractsData, setContractsData] =
    React.useState<InitialContractDetails>({
      contracts: [],
    });

  const updateContractDetails = (updatedContract: ContractDetailsData) => {
    // Find the index of the contract with the same chain in the contracts array
    const index = contractsData.contracts.findIndex(
      (contract) => contract.chain === updatedContract.chain,
    );

    if (index !== -1) {
      // If the contract with the same chain exists, update it
      const updatedContracts = [...contractsData.contracts];
      updatedContracts[index] = updatedContract;
      setContractsData({ contracts: updatedContracts });
    } else {
      // If the contract with the same chain doesn't exist, add the new contract
      setContractsData((prevContracts) => ({
        contracts: [...prevContracts.contracts, updatedContract],
      }));
    }
  };

  const resetContractDetails = () => {
    setContractsData({
      contracts: [],
    });
  };

  const contextValue: ContractDetailsContextProps = {
    contractsData,
    updateContractDetails,
    resetContractDetails,
  };

  return (
    <ContractDetailsContext.Provider value={contextValue}>
      {children}
    </ContractDetailsContext.Provider>
  );
};

// export interface ContractDetails {
//     contractName: string,
//     contractSymbol: string
// }
//
// export interface ContractDetailsContextProps {
//     contractDetails: ContractDetails;
//     updateContractDetails: (updatedFields: Partial<ContractDetails>) => void;
// }
//
// export const ContractDetailsContext = React.createContext<ContractDetailsContextProps>(null!);
//
// // Custom hook to access the global state
// export const useContractDetails = () => React.useContext(ContractDetailsContext);
//
// export const ContractDetailsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
//     const [contractDetails, setContractDetails] = React.useState<ContractDetails>({
//         contractName: 'Erc20Token',
//         contractSymbol: 'E2T',
//     });
//
//     const updateContractDetails = (updatedFields: Partial<ContractDetails>) => {
//         setContractDetails((prevContractDetails) => ({
//             ...prevContractDetails,
//             ...updatedFields,
//         }));
//     };
//
//     const contextValue: ContractDetailsContextProps = {
//         contractDetails,
//         updateContractDetails,
//     };
//
//     return (
//         <ContractDetailsContext.Provider value={contextValue}>
//             {children}
//         </ContractDetailsContext.Provider>
//     );
// };
