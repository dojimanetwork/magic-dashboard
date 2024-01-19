/** Templates retrieval code based on chains and templateType */
import { ExcalidrawElement } from "../../src/element/types";
import { AvailableChains, templateType } from "./types";
import * as DojimaTemplates from "./dojima";
import * as EthereumTemplates from "./ethereum";
// import * as SolanaTemplates from "./solana";
import * as BscTemplates from "./bsc";

type TemplatesMap = {
  erc20: {
    ethereum: ExcalidrawElement[];
    bsc: ExcalidrawElement[];
    default: ExcalidrawElement[];
  };
  nft: {
    ethereum: ExcalidrawElement[];
    bsc: ExcalidrawElement[];
    default: ExcalidrawElement[];
  };
};

function getChainTemplate(
  chain: AvailableChains,
  type: templateType,
): ExcalidrawElement[] {
  const templatesMap: TemplatesMap = {
    erc20: {
      ethereum: EthereumTemplates.erc20Template,
      bsc: BscTemplates.bep20Template,
      default: DojimaTemplates.erc20Template,
    },
    nft: {
      ethereum: EthereumTemplates.nftTemplate,
      bsc: BscTemplates.nftTemplate,
      default: DojimaTemplates.nftTemplate,
    },
  };

  return (
    (templatesMap[type] as any)?.[chain.toLowerCase()] ||
    (templatesMap[type] as any)?.default ||
    []
  );
}

export function retrieveTemplates(
  chain: AvailableChains[],
  type: templateType,
): ExcalidrawElement[] {
  const templates: ExcalidrawElement[] = [];

  chain.forEach((chainName) => {
    const chainTemplate = getChainTemplate(chainName, type);
    templates.push(...chainTemplate);
  });

  return templates;
}

// export function retrieveTemplates(
//   chain: AvailableChains[],
//   type: templateType,
// ) {
//   let templates: ExcalidrawElement[] = [];
//   switch (type) {
//     case "erc20":
//     default: {
//       chain.map((chainName) => {
//         const chainTemplate = getErc20ChainTemplate(chainName);
//         templates.push(...chainTemplate);
//       });
//       return templates;
//     }
//     case "nft": {
//       chain.map((chainName) => {
//         const chainTemplate = getNftChainTemplate(chainName);
//         templates.push(...chainTemplate);
//       });
//       return templates;
//     }
//     case "dex": {
//       chain.map((chainName) => {
//         const chainTemplate = getDexChainTemplate(chainName);
//         templates.push(...chainTemplate);
//       });
//       return templates;
//     }
//     case "defi": {
//       chain.map((chainName) => {
//         const chainTemplate = getDefiChainTemplate(chainName);
//         templates.push(...chainTemplate);
//       });
//       return templates;
//     }
//   }
// }
// export function getErc20ChainTemplate(chain: AvailableChains) {
//   if (chain === "ethereum") {
//     return EthereumTemplates.erc20;
//   } else if (chain === "solana") {
//     return SolanaTemplates.erc20;
//   } else {
//     return DojimaTemplates.erc20;
//   }
// }

// export function getNftChainTemplate(chain: AvailableChains) {
//   if (chain === "ethereum") {
//     return EthereumTemplates.nft;
//   } else if (chain === "solana") {
//     return SolanaTemplates.nft;
//   } else {
//     return DojimaTemplates.nft;
//   }
// }

// export function getDexChainTemplate(chain: AvailableChains) {
//   if (chain === "ethereum") {
//     return EthereumTemplates.dex;
//   } else if (chain === "solana") {
//     return SolanaTemplates.dex;
//   } else {
//     return DojimaTemplates.dex;
//   }
// }

// export function getDefiChainTemplate(chain: AvailableChains) {
//   if (chain === "ethereum") {
//     return EthereumTemplates.defi;
//   } else if (chain === "solana") {
//     return SolanaTemplates.defi;
//   } else {
//     return DojimaTemplates.defi;
//   }
// }
