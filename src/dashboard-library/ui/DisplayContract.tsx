import { useUserDetails } from "../../context/user-appState";
import { AvailableChains, templateType } from "../../../excalidraw-app/dojima-templates/types";
import * as EVMContractsUI from "./evm";
// import SolanaContract from "./solana/solana";
import SolEvmTokenTemplatesUI from "./templates/sol-evm-token";
import EvmSolDataTransferTemplatesUI from "./templates/evm-sol-data-transfer";

// const componentMapping = {
//   erc20: EVMContractsUI.Erc20,
//   nft: EVMContractsUI.Erc721,
//   // dex: EVMContractsUI.Dex,
//   // defi: EVMContractsUI.Defi,
// };

const componentMapping: Record<
  AvailableChains,
  Partial<
    Record<
      templateType,
      React.FC<{
        displayCode: (code: string) => void;
        selectedChain: AvailableChains;
      }>
    >
  >
> = {
  dojima: {
    erc20: EVMContractsUI.DojimaErc20TemplateComponent,
    nft: EVMContractsUI.DojimaNftTemplateComponent,
    solEvmTokenTemplate: SolEvmTokenTemplatesUI.DojimaSolEvmTokenTemplateView,
    evmSolDataTransferTemplate: EvmSolDataTransferTemplatesUI.DojimaEvmSolDataTransferTemplateView,
  },
  ethereum: {
    erc20: EVMContractsUI.EthereumErc20TemplateView,
    nft: EVMContractsUI.EthereumNftTemplateView,
  },
  bsc: {
    erc20: EVMContractsUI.BscErc20TemplateView,
    nft: EVMContractsUI.BscNftTemplateView,
  },
  avalanche: {
    erc20: EVMContractsUI.AvalancheErc20TemplateView,
    nft: EVMContractsUI.AvalancheNftTemplateView,
  },
  solana: {
    solEvmTokenTemplate: SolEvmTokenTemplatesUI.SolanaSolEvmTokenTemplateView,
    evmSolDataTransferTemplate: EvmSolDataTransferTemplatesUI.SolanaEvmSolDataTransferTemplateView,
  },
  // Add mappings for other chains as needed
};

// const componentMapping = {
//   dojima: {
//     erc20: EVMContractsUI.DojimaErc20TemplateComponent,
//     nft: EVMContractsUI.DojimaNftTemplateComponent,
//     solEvmTokenTemplate: SolEvmTokenTemplatesUI.DojimaSolEvmTokenTemplateView
//   },
//   ethereum: {
//     erc20: EVMContractsUI.EthereumErc20TemplateView,
//     nft: EVMContractsUI.EthereumNftTemplateView,
//   },
//   bsc: {
//     erc20: EVMContractsUI.BscErc20TemplateView,
//     nft: EVMContractsUI.BscNftTemplateView,
//   },
//   solana: {
//     solEvmTokenTemplate: SolEvmTokenTemplatesUI.DojimaSolEvmTokenTemplateView
//   }
//   // dojima: {
//   //   erc20: EVMContractsUI.Erc20,
//   //   nft: EVMContractsUI.Erc721,
//   // },
//   // ethereum: {
//   //   erc20: EVMContractsUI.Erc20,
//   //   nft: EVMContractsUI.Erc721,
//   // },
//   // bsc: {
//   //   erc20: EVMContractsUI.BscBep20View,
//   //   nft: EVMContractsUI.Erc721,
//   // },
//   // solana: {
//   //   erc20: EVMContractsUI.Erc20,
//   //   nft: EVMContractsUI.Erc721,
//   // },
//   // Add mappings for other chains as needed
// };

export function DisplayContract({
  displayCode,
  selectedChain,
}: {
  displayCode: (code: string) => void;
  selectedChain: AvailableChains;
}) {
  const { userDetails } = useUserDetails();

  const Component = componentMapping[selectedChain]?.[userDetails.type];

  return (
    <>
      {Component && (
        <Component displayCode={displayCode} selectedChain={selectedChain} />
      )}
      {/* {(
        selectedChain === "ethereum" ||
        selectedChain === "dojima" ||
        selectedChain === "bsc") &&
        Component && (
          <Component displayCode={displayCode} selectedChain={selectedChain} />
        )} */}
      {/* {selectedChain === "solana" && (
        <SolanaContract
          displayCode={displayCode}
          selectedChain={selectedChain}
        />
      )} */}
    </>
  );
}

// import { useUserDetails } from "../../context/user-appState";
// import { AvailableChains } from "../../../excalidraw-app/dojima-templates/types";
// import * as EVMContractsUI from "./evm";
// import SolanaContract from "./solana/solana";
//
// export function DisplayContract({
//   displayCode,
//   selectedChain,
// }: {
//   displayCode: (code: string) => void;
//   selectedChain: AvailableChains;
// }) {
//   const { userDetails } = useUserDetails();
//   return (
//     <>
//       {selectedChain === "ethereum" ? (
//         <>
//           {userDetails.type === "erc20" && (
//             <EVMContractsUI.Erc20
//               displayCode={displayCode}
//               selectedChain={selectedChain}
//             />
//           )}
//           {userDetails.type === "nft" && (
//             <EVMContractsUI.Erc721
//               displayCode={displayCode}
//               selectedChain={selectedChain}
//             />
//           )}
//           {userDetails.type === "dex" && (
//             <EVMContractsUI.Dex
//               displayCode={displayCode}
//               selectedChain={selectedChain}
//             />
//           )}
//           {userDetails.type === "defi" && (
//             <EVMContractsUI.Erc721
//               displayCode={displayCode}
//               selectedChain={selectedChain}
//             />
//           )}
//         </>
//       ) : selectedChain === "solana" ? (
//         <SolanaContract
//           displayCode={displayCode}
//           selectedChain={selectedChain}
//         />
//       ) : (
//         <>
//           {userDetails.type === "erc20" && (
//             <EVMContractsUI.Erc20
//               displayCode={displayCode}
//               selectedChain={selectedChain}
//             />
//           )}
//           {userDetails.type === "nft" && (
//             <EVMContractsUI.Erc721
//               displayCode={displayCode}
//               selectedChain={selectedChain}
//             />
//           )}
//           {userDetails.type === "dex" && (
//             <EVMContractsUI.Dex
//               displayCode={displayCode}
//               selectedChain={selectedChain}
//             />
//           )}
//           {userDetails.type === "defi" && (
//             <EVMContractsUI.Erc721
//               displayCode={displayCode}
//               selectedChain={selectedChain}
//             />
//           )}
//         </>
//       )}
//     </>
//   );
// }
