export type access = "false" | "ownable" | "roles" | "managed";
export type upgradeable = "false" | "transparent" | "uups";
export type Info = {
  securityContract?: string;
  license?: string;
};
export interface ERC20ContractParams {
  name: string;
  symbol: string;
  premint: string;
  mintable: boolean;
  burnable: boolean;
  pausable: boolean;
  permit: boolean;
  votes: boolean;
  flashmint: boolean;
  access: access;
  upgradeable: upgradeable;
  info: Info;
}
export interface ERC721ContractParams {
  name: string;
  symbol: string;
  baseUri: string;
  mintable: boolean;
  burnable: boolean;
  pausable: boolean;
  incremental: boolean;
  votes: boolean;
  enumerable: boolean;
  uriStorage: boolean;
  access: access;
  upgradeable: upgradeable;
  info: Info;
}
export interface ERC1155ContractParams {
  name: string;
  uri: string;
  burnable: boolean;
  pausable: boolean;
  mintable: boolean;
  supply: boolean;
  updatableUri: boolean;
  access: access;
  upgradeable: upgradeable;
  info: Info;
}
export interface CustomContractParams {
  name: string;
  pausable: boolean;
  access: access;
  upgradeable: upgradeable;
  info: Info;
}
