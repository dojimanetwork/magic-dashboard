import {
  // defi,
  // dex,
  bep20Template,
  nftTemplate,
} from "../../../../excalidraw-app/dojima-templates/bsc";
import { LibraryItem } from "../../../types";

const bscErc20LibTemplate: LibraryItem = {
  status: "published",
  elements: bep20Template,
  id: "bsc-erc20-library-template",
  created: 1704008568756,
};

const bscNftLibTemplate: LibraryItem = {
  status: "published",
  elements: nftTemplate,
  id: "bsc-nft-library-template",
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

export const defaultBscLibraryTemplates = [
  bscErc20LibTemplate,
  // dojDexLibTemplate,
  // dojDefiLibTemplate,
  bscNftLibTemplate,
];
