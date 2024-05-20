export type SolanaProgramData = {
    programName: string;
}

export type DojimaContractData = {
    contractName: string
}

export type DojSolDataTransferTemplateParams = {
    dojima: DojimaContractData,
    solana: SolanaProgramData
}

export type DojimaDeployedData = {
    contractAddress: string;
    contractAbi: any;
    contractBytecode: any;
}

export type SolanaDeployedData = {
    programId: string;
    idl: any;
}