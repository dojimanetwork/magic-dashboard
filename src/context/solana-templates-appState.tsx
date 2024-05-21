import React from "react";

export type SolanaProgramData = {
  programName: string;
};

export type DojimaContractData = {
  contractName: string;
  contractSymbol?: string;
  totalSupply?: number;
};

export type SolDojTokenTemplateParams = {
  dojima?: DojimaContractData;
  solana?: SolanaProgramData;
};

export type DojSolDataTransferTemplateParams = {
  dojima: DojimaContractData;
  solana: SolanaProgramData;
};

export interface SolanaTemplatesContextProps {
  solDojTokenData: SolDojTokenTemplateParams;
  dojSolDataTransferData: DojSolDataTransferTemplateParams;
  updateSolDojTokenDojima: (dojimaData: DojimaContractData) => void;
  updateSolDojTokenSolana: (solanaData: SolanaProgramData) => void;
  updateDojSolDataTransferDojima: (dojimaData: DojimaContractData) => void;
  updateDojSolDataTransferSolana: (solanaData: SolanaProgramData) => void;
  resetSolDojTokenDetails: () => void;
  resetDojSolDataTransferDetails: () => void;
}

export const SolanaTemplatesContext =
  React.createContext<SolanaTemplatesContextProps>(null!);

export const useSolanaTemplatesDetails = () =>
  React.useContext(SolanaTemplatesContext);

export const SolanaTemplatesProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [solDojTokenData, setSolDojTokenData] =
    React.useState<SolDojTokenTemplateParams>({});
  const [dojSolDataTransferData, setDojSolDataTransferData] =
    React.useState<DojSolDataTransferTemplateParams>({
      dojima: { contractName: "" },
      solana: { programName: "" },
    });

  const updateSolDojTokenDojima = (dojimaData: DojimaContractData) => {
    setSolDojTokenData((prevData) => ({
      ...prevData,
      dojima: dojimaData,
    }));
  };

  const updateSolDojTokenSolana = (solanaData: SolanaProgramData) => {
    setSolDojTokenData((prevData) => ({
      ...prevData,
      solana: solanaData,
    }));
  };

  const updateDojSolDataTransferDojima = (dojimaData: DojimaContractData) => {
    setDojSolDataTransferData((prevData) => ({
      ...prevData,
      dojima: dojimaData,
    }));
  };

  const updateDojSolDataTransferSolana = (solanaData: SolanaProgramData) => {
    setDojSolDataTransferData((prevData) => ({
      ...prevData,
      solana: solanaData,
    }));
  };

  const resetSolDojTokenDetails = () => {
    setSolDojTokenData({});
  };

  const resetDojSolDataTransferDetails = () => {
    setDojSolDataTransferData({
      dojima: { contractName: "" },
      solana: { programName: "" },
    });
  };

  const contextValue: SolanaTemplatesContextProps = {
    solDojTokenData,
    dojSolDataTransferData,
    updateSolDojTokenDojima,
    updateSolDojTokenSolana,
    updateDojSolDataTransferDojima,
    updateDojSolDataTransferSolana,
    resetSolDojTokenDetails,
    resetDojSolDataTransferDetails,
  };

  return (
    <SolanaTemplatesContext.Provider value={contextValue}>
      {children}
    </SolanaTemplatesContext.Provider>
  );
};
