import {
  defi,
  dex,
  erc20,
  nft,
} from "../../../../excalidraw-app/dojima-templates/ethereum";
import { LibraryItem } from "../../../types";

const ethErc20LibTemplate: LibraryItem = {
  status: "published",
  elements: erc20,
  id: "ethereum-erc20-library-template",
  created: 1704008568756,
};

const ethNftLibTemplate: LibraryItem = {
  status: "published",
  elements: nft,
  id: "ethereum-nft-library-template",
  created: 1704008568756,
};

const ethDexLibTemplate: LibraryItem = {
  status: "published",
  elements: dex,
  id: "ethereum-dex-library-template",
  created: 1704008568756,
};

const ethDefiLibTemplate: LibraryItem = {
  status: "published",
  elements: defi,
  id: "ethereum-defi-library-template",
  created: 1704008568756,
};

export const defaultEthLibraryTemplates = [
  ethErc20LibTemplate,
  ethDexLibTemplate,
  ethDefiLibTemplate,
  ethNftLibTemplate,
];
