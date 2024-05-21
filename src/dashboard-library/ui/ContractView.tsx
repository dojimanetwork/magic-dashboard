import React, { useEffect, useState } from "react";
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
import { useUserDetails } from "../../context/user-appState";
import axios from "axios";
import { useProjectData } from "../../context/project-appState";
import CopyIcon from "../../components/copyIcon";
import { copyTextToSystemClipboard } from "../../clipboard";

export type ProjectChainsDeploymentData = {
  chain: string;
  contractAddress: string;
  contractAbi: string;
  contractByteCode: string;
};

export type ProjectDataObject = {
  projectName: string;
  email: string;
  ownerUrl: string;
  description: string;
  type: string;
  chains: string[];
  projectData: string;
  status?: boolean;
  deploymentData?: ProjectChainsDeploymentData[];
  dateCreated?: Date;
  lastUpdated?: Date;
};

export function formatSolidityCode(code: string): string {
  code = code.replace("pragma solidity", "\npragma solidity");
  code = code.replace(/;/g, ";\n");
  code = code.replace(/{/g, "{\n");
  code = code.replace(/}/g, "}\n");
  const lines = code.split("\n");
  const indentedCode = lines.map((line) => ` ${line}`).join("\n");
  return `\n${indentedCode}\n`;
}

export function formatRustCode(code: string): string {
  // Add newline after 'use' statements
  code = code.replace(/(use\s+[^;]+;)/g, "$1\n");
  // Add newline after semicolons
  code = code.replace(/;/g, ";\n");
  // Add newline after opening curly braces and indent the content
  code = code.replace(/{/g, "{\n");
  // Add newline before closing curly braces
  code = code.replace(/}/g, "\n}");
  // Split the code into lines
  const lines = code.split("\n");
  // Indent each line with 4 spaces
  const indentedCode = lines.map((line) => `    ${line.trim()}`).join("\n");
  // Add a Rust file preamble
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
  const [isDeployed, setIsDeployed] = useState(false);
  const [contractDeployedData, setContractDeployedData] =
    useState<ProjectChainsDeploymentData>();
  const { userDetails } = useUserDetails();
  const { projectData } = useProjectData();

  const displayContractCode = (code: string) => {
    setContractCode(code);
  };

  useEffect(() => {
    if (userDetails.email && userDetails.projectName) {
      if (projectData.deploymentData && projectData.deploymentData.length > 0) {
        const contractDataByChain = projectData.deploymentData?.find(
          (data) => data.chain === selectedElementChain,
        );

        setContractDeployedData(contractDataByChain);
        setIsDeployed(true);
      } else {
        setIsDeployed(false);
      }
    }
  }, [projectData, selectedElementChain]);

  // const copyToClipboard = async () => {
  //   try {
  //     await navigator.clipboard.writeText(contractCode);
  //   } catch (err) {
  //     console.error("Failed to copy text: ", err);
  //   }
  // };

  return (
    <>
      {isDeployed ? (
        // <>
        //   <div className=" mt-4 mb-4  p-4">
        //     <div className="flex items-center">
        //       <p className="text-start text-sm w-20">
        //         {contractDeployedData?.chain}{" "}
        //       </p>
        //     </div>
        //     <div className="flex items-center">
        //       <p className="text-start text-sm w-20 ">Contract Address </p>
        //       <p className="w-10">:</p>
        //       <strong className="font-semibold">
        //         {contractDeployedData?.contractAddress}
        //       </strong>
        //     </div>
        //   </div>
        //   <div className="mt-6">
        //     <p className="text-base text-[#757575] font-semibold ">
        //       Contract ABI
        //     </p>
        //     <div className=" text-black cursor-not-allowed">
        //       <div className="text-base w-full h-36 max-h-36  font-medium border rounded-lg p-3 border-[#dddddd] overflow-auto">
        //         <div>
        //           <pre>
        //             {JSON.stringify(contractDeployedData?.contractAbi, null, 2)}
        //           </pre>
        //         </div>
        //       </div>
        //     </div>
        //   </div>
        //   <div className="mt-6">
        //     <p className="text-base text-[#757575] font-semibold ">
        //       Contract ByteCode
        //     </p>
        //     <div className=" text-black cursor-not-allowed">
        //       <div className="text-base w-full h-36 max-h-36  font-medium border rounded-lg p-3 border-[#dddddd] overflow-auto">
        //         {contractDeployedData?.contractByteCode}
        //       </div>
        //     </div>
        //   </div>
        // </>
        <div>
          <div className=" flex text-base items-center m-2">
            <div className=" w-[150px] font-semibold text-base text-[#000]">
              Contract Address
            </div>
            <div className="w-full flex justify-between pr-4 items-center mr-2 p-2 text-[15px] font-medium text-black border rounded-lg h-[40px]">
              {contractDeployedData?.contractAddress}
              <div
                className="cursor-pointer"
                onClick={() =>
                  copyTextToSystemClipboard(
                    contractDeployedData?.contractAddress as string,
                  )
                }
              >
                <CopyIcon width="15" />
              </div>
            </div>
          </div>
          <div className="h-[1px] bg-[#dddddd] m-4"></div>
          <div className="m-2">
            <div className="flex justify-between">
              <p className="text-base text-black mb-2 font-semibold ">
                Contract ABI
              </p>
              <div
                className="cursor-pointer mr-5"
                onClick={() =>
                  copyTextToSystemClipboard(
                    contractDeployedData?.contractAbi as string,
                  )
                }
              >
                <CopyIcon width="15" />
              </div>
            </div>
            <div className=" text-black cursor-not-allowed">
              <div className="text-[15px] w-full h-36 max-h-36 font-medium border rounded-lg p-3 border-[#dddddd] overflow-auto">
                <pre>
                  {JSON.stringify(contractDeployedData?.contractAbi, null, 2)}
                </pre>
              </div>
            </div>
          </div>
          <div className="h-[1px] bg-[#dddddd] m-4"></div>
          <div className="m-2">
            <div className="flex justify-between">
              <p className="text-base text-black mb-2 font-semibold ">
                Contract Bytecode
              </p>
              <div
                className="cursor-pointer mr-5"
                onClick={() =>
                  copyTextToSystemClipboard(
                    contractDeployedData?.contractByteCode as string,
                  )
                }
              >
                <CopyIcon width="15" />
              </div>
            </div>
            <div className=" text-black cursor-not-allowed">
              <div className="text-[15px] w-full break-all h-36 max-h-36  font-medium border rounded-lg p-3 border-[#dddddd] overflow-auto">
                <div className="m-2">
                  {contractDeployedData?.contractByteCode}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <section className="">
          <div className="flex items-center text-center border-b text-[] text-xl/6 font-semibold uppercase">
            {/* <div className="w-1/3 cursor-pointer py-6 text-[#6B45CD] border-r last:border-r-0">
            Erc20
          </div>
          <div className="w-1/3 cursor-pointer py-6 hover:text-[#6B45CD] border-r last:border-r-0">
            ERC721
          </div>
          <div className="w-1/3 cursor-pointer py-6 hover:text-[#6B45CD] border-r last:border-r-0">
            ERC1155
          </div> */}
            <div className="cursor-pointer text-center w-full py-6 text-[#6B45CD] border-r last:border-r-0">
              {selectedElementChain}
            </div>
          </div>
          <div className="flex h-[600px] overflow-auto w-[810px]">
            <div className="h-full overflow-auto w-1/3 shrink-0">
              <div>
                <DisplayContract
                  displayCode={displayContractCode}
                  selectedChain={selectedElementChain as AvailableChains}
                />
              </div>
            </div>

            <div className="contract-view-content h-full w-full">
              <SyntaxHighlighter
                language={`${selectedElementChain === "solana" ? "rust" : "solidity"}`}
                style={monokai}
                wrapLongLines={true}
                customStyle={{
                  backgroundColor: "transparent",
                  color: "white",
                }}
              >
                {selectedElementChain === "solana"
                    ? formatRustCode(contractCode)
                    : formatSolidityCode(contractCode)}
              </SyntaxHighlighter>
            </div>
          </div>
        </section>
      )}
    </>
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
