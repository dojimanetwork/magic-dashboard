import {
  // defi,
  // dex,
  erc20Template,
  nftTemplate,
} from "../../../../excalidraw-app/dojima-templates/dojima";
import { LibraryItem } from "../../../types";

const dojErc20LibTemplate: LibraryItem = {
  status: "published",
  elements: erc20Template,
  id: "dojima-erc20-library-template",
  created: 1704008568756,
};

const dojNftLibTemplate: LibraryItem = {
  status: "published",
  elements: nftTemplate,
  id: "dojima-nft-library-template",
  created: 1704008568756,
};

// const dojDexLibTemplate: LibraryItem = {
//   status: "published",
//   elements: dex,
//   id: "dojima-dex-library-template",
//   created: 1704008568756,
// };

// const dojDefiLibTemplate: LibraryItem = {
//   status: "published",
//   elements: defi,
//   id: "dojima-defi-library-template",
//   created: 1704008568756,
// };

export const defaultDojLibraryTemplates = [
  dojErc20LibTemplate,
  // dojDexLibTemplate,
  // dojDefiLibTemplate,
  dojNftLibTemplate,
];
