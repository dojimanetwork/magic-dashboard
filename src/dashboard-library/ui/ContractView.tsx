import React, { useState } from "react";
import "./ui.css";
// import Button from "./common/Button";
// import { Text } from "./common/Typography";
import SyntaxHighlighter from "react-syntax-highlighter";
import { monokai } from "react-syntax-highlighter/dist/esm/styles/hljs";
// import Erc20 from "./evm/erc20";
import { NonDeletedExcalidrawElement } from "../../element/types";
import { AppState } from "../../types";
import { AvailableChains } from "../../../excalidraw-app/dojima-templates/types";
import { DisplayContract } from "./DisplayContract";

export function formatSolidityCode(code: string): string {
  code = code.replace("pragma solidity", "\npragma solidity");
  code = code.replace(/;/g, ";\n");
  code = code.replace(/{/g, "{\n");
  code = code.replace(/}/g, "}\n");
  const lines = code.split("\n");
  const indentedCode = lines.map((line) => ` ${line}`).join("\n");
  return `\n${indentedCode}\n`;
}

function ContractView({
  element,
  setAppState,
  selectedElementChain,
}: {
  element: NonDeletedExcalidrawElement;
  setAppState: React.Component<any, AppState>["setState"];
  selectedElementChain: AvailableChains;
}) {
  const [contractCode, setContractCode] = useState("");

  const displayContractCode = (code: string) => {
    setContractCode(code);
  };

  // const copyToClipboard = async () => {
  //   try {
  //     await navigator.clipboard.writeText(contractCode);
  //   } catch (err) {
  //     console.error("Failed to copy text: ", err);
  //   }
  // };

  return (
    <section className="">
      <div className="flex items-center text-center border-b text-[] text-xl/6 font-semibold uppercase">
        <div className="w-1/3 cursor-pointer py-6 text-[#6B45CD] border-r last:border-r-0">
          Erc20
        </div>
        <div className="w-1/3 cursor-pointer py-6 hover:text-[#6B45CD] border-r last:border-r-0">
          ERC721
        </div>
        <div className="w-1/3 cursor-pointer py-6 hover:text-[#6B45CD] border-r last:border-r-0">
          ERC1155
        </div>
      </div>
      <div className="flex h-[600px] overflow-auto w-[810px]">
        <div className="h-full overflow-auto w-1/3 shrink-0">
          <div>
            <DisplayContract
              displayCode={displayContractCode}
              selectedChain={selectedElementChain}
            />
          </div>
        </div>

        <div className="contract-view-content h-full w-full">
          <SyntaxHighlighter
            language="solidity"
            style={monokai}
            wrapLongLines={true}
            customStyle={{
              backgroundColor: "transparent",
              color: "white",
            }}
          >
            {formatSolidityCode(contractCode)}
          </SyntaxHighlighter>
        </div>
      </div>
    </section>
  );
}

export default ContractView;

// import { useState } from "react";
// import Button from "./common/Button";
// // import Input from "@/app/ui/Input";
// import { Text } from "./common/Typography";
// // import DownloadIcon3 from "@/app/icons/downloadIcon3";
// import SyntaxHighlighter from "react-syntax-highlighter";
// import { monokai } from "react-syntax-highlighter/dist/esm/styles/hljs";
// import Overlay from "./common/Overlay";
// // import DeployModal from "../deploy/page";
// // import VerifyContract from "../verifycontract/page";
// import Erc20 from "./evm/erc20";
//
// const TabData = [
//   "ERC20",
//   "ERC721",
//   "ERC1155",
//   "NFT Marketplace",
//   "DEX",
//   "DeFi",
//   "Custom",
// ];
//
// export function formatSolidityCode(code: string): string {
//   code = code.replace("pragma solidity", "\npragma solidity");
//   // Replace semicolons with semicolons + newline
//   code = code.replace(/;/g, ";\n");
//   code = code.replace(/{/g, "{\n");
//   code = code.replace(/}/g, "}\n");
//   // Split the code into lines
//   const lines = code.split("\n");
//   // Indent each line with 4 spaces
//   const indentedCode = lines.map((line) => ` ${line}`).join("\n");
//   // Add a Solidity file preamble
//   return `\n${indentedCode}\n`;
// }
//
// function ContractView() {
//   const [tab, setTab] = useState(1);
//   const [contractCode, setContractCode] = useState("");
//   const displayContractCode = (code: string) => {
//     setContractCode(code);
//   };
//
//   const copyToClipboard = async () => {
//     try {
//       await navigator.clipboard.writeText(contractCode);
//     } catch (err) {
//       console.error("Failed to copy text: ", err);
//     }
//   };
//
//   return (
//     <section>
//       {/*<div className="flex justify-between items-center border-b pb-[26px]">*/}
//       {/*  <div className="flex gap-x-8">*/}
//       {/*    {TabData.map((item, i) => {*/}
//       {/*      const index = i + 1;*/}
//       {/*      return (*/}
//       {/*        <Button*/}
//       {/*          onClick={() => setTab(index)}*/}
//       {/*          key={i}*/}
//       {/*          color="secondary"*/}
//       {/*          className={`min-w-10 p-0 border-none relative gap-x-0 ${*/}
//       {/*            tab === index ? "text-purple" : "text-black"*/}
//       {/*          }`}*/}
//       {/*          size="sm"*/}
//       {/*        >*/}
//       {/*          {item}*/}
//       {/*          {tab === index && (*/}
//       {/*            <span className="w-full h-2 bg-purple absolute -bottom-[42px] left-0 rounded-full" />*/}
//       {/*          )}*/}
//       {/*        </Button>*/}
//       {/*      );*/}
//       {/*    })}*/}
//       {/*  </div>*/}
//       {/*  <div>*/}
//       {/*    <button*/}
//       {/*      className="rounded-[10px] flex px-4 py-3 items-center bg-lightColoursPurple gap-x-3"*/}
//       {/*      onClick={copyToClipboard}*/}
//       {/*    >*/}
//       {/*      <DownloadIcon3 className="rotate-180" stroke="#6B45CD" />*/}
//       {/*      <Text Type="16-Md" className="text-purple">*/}
//       {/*        Copy to Clipboard*/}
//       {/*      </Text>*/}
//       {/*    </button>*/}
//       {/*  </div>*/}
//       {/*</div>*/}
//       <div className="grid grid-cols-[305px_1fr]">
//         <div className="flex flex-col pr-8">
//           <div className="py-6">
//             <Erc20 displayCode={displayContractCode} />
//           </div>
//         </div>
//
//         <div className="bg-black max-w-[1024px] overflow-auto max-h-[750px] p-6 text-white">
//           {/* For Refrence only we can split and join the string to make it line by line */}
//           {/* {`${JSON.stringify(validatorRes)
//                   .split(":{")
//                   .join(":{ \t")
//                   .split('"}, ')
//                   .join('"}, \n')
//                   .split("{")
//                   .join("{ \n\t\t")
//                   .split(",")
//                   .join(", \n\t\t")}`} */}
//           <SyntaxHighlighter
//             language="solidity"
//             style={monokai}
//             wrapLongLines={true}
//             customStyle={{
//               backgroundColor: "transparent",
//               color: "black",
//             }}
//           >
//             {formatSolidityCode(contractCode)}
//           </SyntaxHighlighter>
//         </div>
//       </div>
//     </section>
//   );
// }
//
// export default ContractView;
//
// // function Step1() {
// //   const [deployModal, setDeployModal] = useState(false);
// //   const [verifyModal, setVerifyModal] = useState(false);
// //   function handleDeployModalClose() {
// //     setDeployModal(false);
// //   }
// //   function handleVerifyModalClose() {
// //     setVerifyModal(false);
// //   }
// //   return (
// //     <>
// //       <div className="flex flex-col gap-y-5">
// //         <Text Type="16-Md"> Features</Text>
// //         <div className="grid grid-cols-2 gap-x-3 gap-y-3">
// //           <Input
// //             type="checkbox"
// //             label="Mintable"
// //             id="c1"
// //             labelClassName="text-subtext"
// //           />
// //           <Input
// //             type="checkbox"
// //             label="Mintable"
// //             id="c2"
// //             labelClassName="text-subtext"
// //           />
// //           <Input
// //             type="checkbox"
// //             label="Pausable"
// //             id="c3"
// //             labelClassName="text-subtext"
// //           />
// //           <Input
// //             type="checkbox"
// //             label="Votes"
// //             id="c4"
// //             labelClassName="text-subtext"
// //           />
// //           <Input
// //             type="checkbox"
// //             label="Flash Minting"
// //             id="c5"
// //             labelClassName="text-subtext"
// //           />
// //           <Input
// //             type="checkbox"
// //             label="Pausable"
// //             id="c6"
// //             labelClassName="text-subtext"
// //           />
// //         </div>
// //       </div>
// //       <div className="py-6 border-b">
// //         <div className="flex flex-col gap-y-5">
// //           <Text Type="16-Md"> Access control</Text>
//
// //           <div className="grid grid-cols-2 gap-x-3 gap-y-3">
// //             <Input
// //               id="radio"
// //               label="Mintable 0"
// //               type="radio"
// //               labelClassName="text-subtext"
// //             />
// //             <Input
// //               id="radio"
// //               label="Mintable 1"
// //               type="radio"
// //               labelClassName="text-subtext"
// //             />
// //             <Input
// //               id="radio"
// //               label="Mintable 2"
// //               type="radio"
// //               labelClassName="text-subtext"
// //             />
// //             <Input
// //               id="radio"
// //               label="Mintable 3"
// //               type="radio"
// //               labelClassName="text-subtext"
// //             />
// //           </div>
// //         </div>
// //       </div>
// //       <div className=" pt-6">
// //         <div className="flex flex-col gap-y-5">
// //           <Text Type="16-Md"> Access control</Text>
//
// //           <Input label="Contract Name" labelClassName="text-subtext" />
// //           <Input label="Symbol" labelClassName="text-subtext" />
// //           <Input label="Contract Name" labelClassName="text-subtext" />
// //         </div>
// //       </div>
// //       <div className="flex justify-between mt-[140px] ">
// //         <Button
// //           onClick={() => setDeployModal(true)}
// //           color="secondary"
// //           className="min-w-[113px]"
// //         >
// //           Deploy
// //         </Button>
// //         <Button onClick={() => setVerifyModal(true)} className="min-w-[113px]">
// //           Verify
// //         </Button>
// //       </div>
// //       {deployModal && (
// //         <Overlay>
// //           <DeployModal onClose={handleDeployModalClose} />
// //         </Overlay>
// //       )}
// //       {verifyModal && (
// //         <Overlay>
// //           <VerifyContract onClose={handleVerifyModalClose} />
// //         </Overlay>
// //       )}
// //     </>
// //   );
// // }
// // function Step2() {
// //   return <Erc20/>;
// // }
// // function Step3() {
// //   return <div>Step3</div>;
// // }
// // function Step4() {
// //   return <div>Step4</div>;
// // }
// // function Step5() {
// //   return <div>Step5</div>;
// // }
// // function Step6() {
// //   return <div>Step6</div>;
// // }
// // function Step7() {
// //   return <div>Step7</div>;
// // }
