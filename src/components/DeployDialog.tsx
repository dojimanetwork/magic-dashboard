// import React, { useEffect, useState } from "react";
// // import { t } from "../i18n";
// import { Dialog } from "./Dialog";
// import "./HelpDialog.scss";
// import { usersIcon } from "./icons";
// import {
//   ContractDetailsData,
//   useContractDetails,
// } from "../context/contract-appState";
// import { AvailableChains } from "../../excalidraw-app/dojima-templates/types";
// import { useUserDetails } from "../context/user-appState";
// import axios from "axios";
// // import { DeployEVMContractParams } from "../contracts/types";
// import AddIconImg from "../static/add_icon.svg";
// // import { XTokenContractTemplate } from "../dashboard-library/template-contracts/contracts/dojima/token/XTokenContract";
// // import { OmniChainTokenContractTemplate } from "../dashboard-library/template-contracts/contracts/dojima/token/OmniChainTokenContract";
// // import { EthereumCrossChainTokenTemplate } from "../dashboard-library/template-contracts/contracts/ethereum/token/EthereumCrossChainToken";
// import SuccessIcon from "./Success.icon";
// import ErrorIcon from "./ErrorIcon";
// import DojimaImg from "../static/dojima.png";
// import BinanceImg from "../static/binance.svg";
// import EthereumImg from "../static/ethereum.svg";
// import FailIcon from "./FailIcon";
// import CircleCancleIcon from "./circlecancleIcon";
// import CopyIcon from "./copyIcon";
// import { Card } from "./Card";
// import { copyTextToClipboard, copyTextToSystemClipboard } from "../clipboard";
// import FillDeleteIcon from "./filldeleteIcon";
// import {
//   extractConstructorArguments,
//   InputConstructorArgsType,
// } from "../dashboard-library/utils/readConstructorArgs";
// import { useProjectData } from "../context/project-appState";
// import Button from "../dashboard-library/ui/common/Button";
// import SyntaxHighlighter from "react-syntax-highlighter";
// import { monokai } from "react-syntax-highlighter/dist/esm/styles/hljs";

// export function formatSolidityCode(code: string): string {
//   code = code.replace("pragma solidity", "\npragma solidity");
//   code = code.replace(/;/g, ";\n");
//   code = code.replace(/{/g, "{\n");
//   code = code.replace(/}/g, "}\n");
//   const lines = code.split("\n");
//   const indentedCode = lines.map((line) => ` ${line}`).join("\n");
//   return `\n${indentedCode}\n`;
// }

// export type ContractsData = {
//   fileName: string;
//   contractCode: {
//     fileName: string;
//     code: string;
//   }[];
//   contractName: string;
//   contractSymbol?: string;
//   args?: {
//     fileName: string;
//     arguments: any;
//   }[];
// };

// export type ProjectChainsDeploymentData = {
//   chain: string;
//   contractAddress: string;
//   contractAbi: string;
//   contractByteCode: string;
// };

// export type DeployableChainsData = {
//   chainName: AvailableChains;
//   contracts: Array<ContractsData>;
// };

// export type EVMContractDeployedObject = {
//   contractAddress: string;
//   contractABI: string;
//   contractByteCode: string;
// };

// export type DeployedDetails = {
//   chain: AvailableChains;
//   details: EVMContractDeployedObject[];
// };

// export type EVMCompileParams = {
//   fileName: string;
//   code: string;
// };

// export type OmnichainContractsData = {
//   fileName: string;
//   contractCode: Array<EVMCompileParams>;
//   contractName: string;
//   contractSymbol?: string;
//   args: {
//     fileName: string;
//     arguments: any;
//   }[];
// };

// export type OmniChainDeployableData = {
//   chainName: AvailableChains;
//   contracts: OmnichainContractsData;
// };

// const Section = (props: { title: string; children: React.ReactNode }) => (
//   <>
//     <h3>{props.title}</h3>
//     <div className="HelpDialog__islands-container">{props.children}</div>
//   </>
// );

// async function addDeployedDetailsToDb(
//   email: string,
//   projectName: string,
//   contractDetails: Array<DeployedDetails>,
// ) {
//   // let deploymentData: ProjectChainsDeploymentData[] = [];
//   // contractDetails.map(
//   //   (details) => {
//   //     details.details.map((subDetails: EVMContractDeployedObject) => {
//   //       deploymentData.push({
//   //         chain: details.chain,
//   //         contractAddress: subDetails.contractAddress,
//   //         contractAbi: subDetails.contractABI,
//   //         contractByteCode: subDetails.contractByteCode,
//   //       })
//   //     })
//   //   },
//   // );
//   const response = await axios.post(
//     `${
//       import.meta.env.VITE_APP_FAAS_TESTNET_URL
//     }/v1/dev/dash/projects/update/deployment`,
//     {
//       projectName,
//       email,
//       contractDetails,
//     },
//   );

//   if (response.status === 201) {
//     return true;
//   } else {
//     return false;
//   }
// }

// async function deployContracts(contractsData: Array<OmniChainDeployableData>) {
//   let deployedDetails: Array<DeployedDetails> = [];

//   try {
//     const url = `${
//       import.meta.env.VITE_APP_MAGIC_DASHBOARD_BACKEND_URL
//     }/omnichain/deploy`;

//     const response = await fetch(url, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         data: contractsData,
//       }),
//     });

//     if (response.status === 200) {
//       const result = await response.json();
//       const responseDetails: DeployedDetails = result;
//       deployedDetails.push(responseDetails);
//     } else {
//       contractsData.map((data: OmniChainDeployableData) => {
//         deployedDetails.push({
//           chain: data.chainName,
//           details: [
//             {
//               contractAddress: "Deployment Failed",
//               contractABI: "-",
//               contractByteCode: "-",
//             },
//           ],
//         });
//       });
//     }
//   } catch (error) {
//     contractsData.map((data: OmniChainDeployableData) => {
//       deployedDetails.push({
//         chain: data.chainName,
//         details: [
//           {
//             contractAddress: "Deployment Failed",
//             contractABI: "-",
//             contractByteCode: "-",
//           },
//         ],
//       });
//     });
//     console.error(error);
//   }

//   return deployedDetails;
// }

// // async function deployContracts(contractsData: Array<DeployableChainsData>) {
// //   let deployedDetails: Array<DeployedDetails> = [];
// //   for (const contractData of contractsData) {
// //     // try {
// //     //   const result = await axios.post(
// //     //     `${import.meta.env.VITE_APP_MAGIC_DASHBOARD_BACKEND_URL}/deploy/${
// //     //       contractData.chainName
// //     //     }`,
// //     //     {
// //     //       data: contractData,
// //     //     },
// //     //   );
// //     //   if (result.status === 200) {
// //     //     const response: DeployedDetails = result.data;
// //     //     deployedDetails.push(response);
// //     //   } else {
// //     //     deployedDetails.push({
// //     //       chain: contractData.chainName,
// //     //       details: {
// //     //         contractAddress: "Deployment Failed",
// //     //         contractABI: "-",
// //     //         contractByteCode: "-",
// //     //       },
// //     //     });
// //     //   }
// //     // } catch (error: any) {
// //     //   deployedDetails.push({
// //     //     chain: contractData.chainName,
// //     //     details: {
// //     //       contractAddress: "Deployment Failed",
// //     //       contractABI: "-",
// //     //       contractByteCode: "-",
// //     //     },
// //     //   });
// //     //   console.error(error);
// //     // }
// //     try {
// //       const url = `${
// //         import.meta.env.VITE_APP_MAGIC_DASHBOARD_BACKEND_URL
// //       }/deploy/${contractData.chainName}`;

// //       const response = await fetch(url, {
// //         method: "POST",
// //         headers: {
// //           "Content-Type": "application/json",
// //         },
// //         body: JSON.stringify({
// //           data: contractData,
// //         }),
// //       });

// //       if (response.status === 200) {
// //         const result = await response.json();
// //         const responseDetails: DeployedDetails = result;
// //         deployedDetails.push(responseDetails);
// //       } else {
// //         deployedDetails.push({
// //           chain: contractData.chainName,
// //           details: {
// //             contractAddress: "Deployment Failed",
// //             contractABI: "-",
// //             contractByteCode: "-",
// //           },
// //         });
// //       }
// //     } catch (error) {
// //       deployedDetails.push({
// //         chain: contractData.chainName,
// //         details: {
// //           contractAddress: "Deployment Failed",
// //           contractABI: "-",
// //           contractByteCode: "-",
// //         },
// //       });
// //       console.error(error);
// //     }
// //   }

// //   return deployedDetails;
// // }

// export const DeployDialog = ({ onClose }: { onClose?: () => void }) => {
//   const [tab, setTab] = useState(1);
//   const [isDeploying, setIsDeploying] = useState(false);
//   const [isDeployed, setIsDeployed] = useState(false);
//   const [deploymentStatus, setDeploymentStatus] = useState<
//     "success" | "failed" | ""
//   >("");

//   const { contractsData, updateContractDetails, resetContractDetails } =
//     useContractDetails();
//   const { userDetails } = useUserDetails();
//   const { refreshProjectData } = useProjectData();
//   const [deployedDetails, setDeployedDetails] = useState<
//     Array<DeployedDetails>
//   >([]);

//   const handleClose = React.useCallback(() => {
//     setDeploymentStatus("");
//     setIsDeployed(false);
//     setDeployedDetails([]);
//     refreshProjectData();
//     if (onClose) {
//       onClose();
//     }
//   }, [onClose]);

//   function handleChains(chain: string) {
//     switch (chain) {
//       case "dojima":
//       case "DOJ":
//         return DojimaImg;
//       case "ethereum":
//       case "ETH":
//         return EthereumImg;
//       case "bsc":
//       case "binance":
//       case "BSC":
//         return BinanceImg;
//     }
//   }

//   function getChainExplorerUrl(chain: string) {
//     switch (chain) {
//       case "dojima":
//       case "DOJ":
//         return import.meta.env.VITE_APP_DOJ_TESTNET_EXPLORER_URL;
//       case "ethereum":
//       case "ETH":
//         return import.meta.env.VITE_APP_ETH_TESTNET_EXPLORER_URL;
//       case "bsc":
//       case "binance":
//       case "BSC":
//         return import.meta.env.VITE_APP_BSC_TESTNET_EXPLORER_URL;
//     }
//   }

//   function handleDeploy() {
//     setIsDeploying(true);
//     const data: Array<OmniChainDeployableData> = [];

//     contractsData.contracts.map((contract) => {
//       const addContract: OmniChainDeployableData = {
//         chainName: contract.chain,
//         contracts: {
//           fileName: contract.name,
//           contractCode: contract.codeDetails.map((res) => {
//             return {
//               fileName: res.fileName,
//               code: res.code,
//             };
//           }),
//           contractName: contract.name,
//           contractSymbol: contract.symbol ? contract.symbol : "",
//           args: contract.argumentsDetails
//             ? contract.argumentsDetails.map((res) => {
//                 return {
//                   fileName: res.fileName,
//                   arguments: res.arguments,
//                 };
//               })
//             : [],
//         },
//       };
//       data.push(addContract);
//     });

//     // const customHeaders = {
//     //   "Content-Type": "application/json",
//     // };

//     // // Make Axios POST request with DeployEVMContractParams in the request body
//     // axios
//     //   .post(
//     //     `${import.meta.env.VITE_APP_MAGIC_DASHBOARD_BACKEND_URL}/deploy`,
//     //     {
//     //       data,
//     //       // headers: {
//     //       //   // ...customHeaders,
//     //       //   "Content-Type": "application/json",
//     //       //   "Access-Control-Allow-Origin": "*",
//     //       //   "Access-Control-Allow-Methods": "*",
//     //       //   "Access-Control-Allow-Headers":
//     //       //     "'Access-Control-Allow-Headers: Origin, Content-Type, X-Auth-Token'",
//     //       // },
//     //     },
//     //     { timeout: 300000 },
//     //   )
//     //   .then((response) => {
//     //     if (response.status === 200) {
//     //       const result: Array<DeployedDetails> = response.data;
//     //       setIsDeploying(false);
//     //       setDeployedDetails(result);
//     //       setDeploymentStatus("success");
//     //       setIsDeployed(true);
//     //       refreshProjectData();
//     //       resetContractDetails();
//     //       addDeployedDetailsToDb(
//     //         userDetails.email,
//     //         userDetails.projectName,
//     //         result,
//     //       )
//     //         .then((res) => {
//     //           // console.log(res);
//     //         })
//     //         .catch(() => {});
//     //     } else {
//     //       setDeploymentStatus("failed");
//     //       setIsDeployed(true);
//     //     }
//     //   })
//     //   .catch((error) => {
//     //     setIsDeploying(false);
//     //     setDeploymentStatus("failed");
//     //     setIsDeployed(true);
//     //     console.error(error);
//     //   });

//     deployContracts(data)
//       .then((result) => {
//         setIsDeploying(false);
//         setDeployedDetails(result);
//         setDeploymentStatus("success");
//         setIsDeployed(true);
//         refreshProjectData();
//         resetContractDetails();
//         addDeployedDetailsToDb(
//           userDetails.email,
//           userDetails.projectName,
//           result,
//         )
//         .then((res) => {
//           // console.log(res);
//         })
//         .catch(() => {});
//       })
//       .catch((error) => {
//         setIsDeploying(false);
//         setDeploymentStatus("failed");
//         setIsDeployed(true);
//         console.error(error);
//       });

//     // const data: Array<DeployableChainsData> = [
//     //   {
//     //     chainName: "dojima",
//     //     contracts: [
//     //       {
//     //         fileName: "XTokenContract",
//     //         contractCode: XTokenContractTemplate,
//     //         contractName: "XTokenContract",
//     //         contractSymbol: "XTK",
//     //       },
//     //       {
//     //         fileName: "OmniChainTokenContract",
//     //         contractCode: OmniChainTokenContractTemplate,
//     //         contractName: "XTokenContract",
//     //         contractSymbol: "XTK",
//     //       },
//     //     ],
//     //   },
//     //   {
//     //     chainName: "ethereum",
//     //     contracts: [
//     //       {
//     //         fileName: "EthereumCrossChainToken",
//     //         contractCode: EthereumCrossChainTokenTemplate,
//     //         contractName: "XTokenContract",
//     //         contractSymbol: "XTK",
//     //       },
//     //     ],
//     //   },
//     // ];
//     // // Make Axios POST request with DeployEVMContractParams in the request body
//     // axios.post("http://localhost:3002/deploy", { data }).then((response) => {
//     //   console.log(response);
//     // });
//   }

//   const renderDetailsForChain = (chain: AvailableChains) => {
//     const contract = contractsData.contracts[tab - 1];
//     if (!contract) {
//       return null;
//     }

//     const {
//       codeDetails,
//       argumentsDetails: contractArguments,
//       ...remainingContract
//     } = contract;

//     return (
//       <>
//         {Object.entries(remainingContract).map(([key, value]) => (
//           <div className="flex mb-2">
//             <div className="w-1/2 text-base text-[#6D6D6D]">{key}</div>
//             <div className="w-1/2  text-black">
//               {value && value.length > 0 ? value : "-"}
//             </div>
//           </div>
//         ))}
//       </>
//     );
//   };

//   const checkForAllInputArgs = () => {
//     const contract = contractsData.contracts[tab - 1];
//     if (!contract) {
//       return;
//     }

//     const { codeDetails, argumentsDetails, ...remainingContract } = contract;

//     const allValuesHaveLengthGreaterThanZero =
//       argumentsDetails &&
//       argumentsDetails.length > 0 &&
//       argumentsDetails.every(({ arguments: args }) => args && args.length > 0);

//     return allValuesHaveLengthGreaterThanZero;
//   };

//   const renderArgumentsForChain = (chain: AvailableChains) => {
//     const contract = contractsData.contracts[tab - 1];
//     if (!contract) {
//       return null;
//     }

//     const { codeDetails, ...remainingContract } = contract;

//     // Extract constructor arguments from each file within codeDetails
//     const constructorArgs = codeDetails.flatMap((file) => {
//       const args = extractConstructorArguments(file.code);
//       if (args) {
//         return args.map((arg) => ({
//           ...arg,
//           fileName: file.fileName,
//         }));
//       } else {
//         return [];
//       }
//     });

//     // Handler for input change
//     const handleTypeInputChange = (
//       fileName: string,
//       index: number,
//       value: string,
//     ) => {
//       if (!remainingContract.argumentsDetails) {
//         return; // Return early if argumentsDetails is undefined
//       }

//       const newInputValues = [...remainingContract.argumentsDetails];
//       // Find the index of the argument in argumentsDetails array based on fileName and index
//       const argIndex = newInputValues.findIndex((arg) => arg.id === fileName);
//       if (argIndex !== -1) {
//         newInputValues[argIndex].arguments[index] = value;
//         const updatedContract: ContractDetailsData = {
//           ...contract,
//           argumentsDetails: newInputValues,
//         };
//         // Update the contract details using the context
//         updateContractDetails(updatedContract);
//       }
//     };

//     return (
//       <>
//         {constructorArgs && constructorArgs.length > 0 && (
//           <div className="flex flex-col gap-3  w-full">
//             {constructorArgs.map((arg, index) => (
//               <input
//                 key={`${arg.fileName}-${arg.key}`} // Use a unique key including fileName
//                 type="text"
//                 className="border !rounded-lg p-1 w-full h-10"
//                 value={
//                   (remainingContract.argumentsDetails &&
//                     remainingContract.argumentsDetails.find(
//                       (argDetail) => argDetail.id === arg.fileName,
//                     )?.arguments[index]) ||
//                   ""
//                 }
//                 onChange={(e) =>
//                   handleTypeInputChange(arg.fileName, index, e.target.value)
//                 }
//                 placeholder={`${arg.fileName} - ${arg.key} - ${arg.type}`} // Display fileName along with key and type
//               />
//             ))}
//           </div>
//         )}
//       </>
//     );

//     // const contract = contractsData.contracts[tab - 1];
//     // if (!contract) {
//     //   return null;
//     // }

//     // const { code, ...remainingContract } = contract;

//     // const constructorArgs = extractConstructorArguments(code);

//     // // Handler for input change
//     // const handleTypeInputChange = (index: number, value: string) => {
//     //   const newInputValues = remainingContract.arguments as any[];
//     //   newInputValues[index] = value;
//     //   // setInputValues(newInputValues);

//     //   const updatedContract: ContractDetailsData = {
//     //     ...contract,
//     //     arguments: newInputValues,
//     //   };

//     //   // Update the contract details using the context
//     //   updateContractDetails(updatedContract);
//     // };

//     // return (
//     //   <>
//     //     {constructorArgs && constructorArgs.length > 0 && (
//     //       <div className="flex flex-col gap-3  w-full">
//     //         {constructorArgs.map((arg, index) => (
//     //           <input
//     //             key={index}
//     //             type="text"
//     //             className="border !rounded-lg p-1 w-full h-10"
//     //             value={(remainingContract.arguments as any[])[index]}
//     //             onChange={(e) => handleTypeInputChange(index, e.target.value)}
//     //             placeholder={`${arg.key} - ${arg.type}`}
//     //           />
//     //         ))}
//     //       </div>
//     //     )}
//     //   </>
//     // );
//   };

//   // const renderArgumentsForChain = (chain: AvailableChains) => {
//   //   return (
//   //     <>
//   //       <div className="flex flex-row gap-x-6 text-black cursor-not-allowed">
//   //         <div className="text-base w-1/2 font-medium border rounded-lg p-3 border-[#dddddd] h-12"></div>
//   //         <div className="text-base  w-1/2 font-medium border rounded-lg p-3 border-[#dddddd] h-12"></div>
//   //       </div>
//   //     </>
//   //   );
//   // };

//   const renderCodeForChain = (chain: AvailableChains) => {
//     const contract = contractsData.contracts[tab - 1];
//     if (!contract) {
//       return null;
//     }

//     return (
//       <>
//         <div className=" text-black cursor-not-allowed">
//           <div className="text-base w-full h-36 max-h-36  font-medium border rounded-lg p-3 border-[#dddddd] overflow-auto">
//             {/* {contract.code} */}
//             <SyntaxHighlighter
//               language="solidity"
//               style={monokai}
//               wrapLongLines={true}
//               customStyle={{
//                 backgroundColor: "balck",
//                 color: "white",
//               }}
//             >
//               {formatSolidityCode(contract.codeDetails[0].code)}
//             </SyntaxHighlighter>
//           </div>
//         </div>
//       </>
//     );
//   };

//   return (
//     <>
//       {isDeployed ? (
//         <Dialog
//           onCloseRequest={handleClose}
//           title="Deploy Details"
//           className={"HelpDialog max-w-[760px] mx-auto"}
//         >
//           <div className="px-7 py-3">
//             <div className="grid grid-cols-[0.6fr_2fr_0.5fr] body16 font-sans tracking-wide text-sm">
//               <div>Chain</div>
//               <div>Address</div>
//             </div>
//             <hr className="border-dotted mt-3 border-t-2 " />
//             <div className="grid-cols-[0.6fr_2fr_0.5fr] body16 items-center grid border-b border-outline mt-1 pb-2 last:border-none">
//               {deployedDetails.map((item) => (
//                 <>
//                   <div className="flex mt-4 items-center">
//                     <img
//                       className="mr-1"
//                       width={23}
//                       alt="img"
//                       src={handleChains(item.chain)}
//                     />
//                     <p className="text-sm text-black">{item.chain}</p>
//                   </div>
//                   <p className="text-sm mt-4 text-black">
//                     <a
//                       href={`${getChainExplorerUrl(item.chain)}address/${
//                         item.details[0].contractAddress
//                       }`}
//                       target="_blank" // Open link in a new tab
//                       rel="noopener noreferrer" // Necessary for security reasons when opening in a new tab
//                       // onClick={handleLinkClick}
//                       className="no-underline hover:underline"
//                     >
//                       {item.details[0].contractAddress}
//                     </a>
//                   </p>
//                   <div
//                     className="cursor-pointer mt-4"
//                     onClick={() =>
//                       copyTextToSystemClipboard(item.details[0].contractAddress)
//                     }
//                   >
//                     <CopyIcon width="15" />
//                   </div>
//                 </>
//               ))}
//             </div>
//           </div>
//           {/* <div className="w-ful text-center">
//             <div>
//               {deploymentStatus === "success" ? (
//                 <div className=" flex justify-center items-center ">
//                   <SuccessIcon />
//                   <strong className="text-2xl ">Success</strong>
//                 </div>
//               ) : (
//                 <div className="flex justify-center items-center ">
//                   <ErrorIcon />
//                   <strong className="text-2xl ">Error</strong>
//                 </div>
//               )}
//             </div>
//             {deployedDetails.map((detail) => {
//               return (
//                 <>
//                   <div className=" mt-4 mb-4  p-4">
//                     <div className="flex items-center">
//                       <p className="text-start text-sm w-20 ">Chain </p>
//                       <p className="w-10">:</p>
//                       <strong className="font-semibold">{detail.chain}</strong>
//                     </div>
//                     <div className="flex items-center">
//                       <p className="text-start text-sm w-20">Contract </p>
//                       <p className="w-10">:</p>
//                       <strong className="font-semibold">
//                         {detail.details.contractAddress}
//                       </strong>
//                     </div>
//                   </div>
//                   <div className="w-full h-[1px] bg-[#CEC2FF]" />
//                 </>
//               );
//             })} */}
//           {/* <div className=" mt-4 mb-4  p-4">
//               <div className="flex items-center">
//                 <p className="text-start text-sm w-20 ">Chain </p>
//                 <p className="w-10">:</p>
//                 <strong className="font-semibold">Dojima</strong>
//               </div>
//               <div className="flex items-center">
//                 <p className="text-start text-sm w-20">Address </p>
//                 <p className="w-10">:</p>
//                 <strong className="font-semibold">
//                   klajjhghjagjkhgdkfjadhgkjafhgjkdgf
//                 </strong>
//               </div>
//             </div>
//             <div className="w-full h-[1px] bg-[#CEC2FF]"> </div>
//             <div className=" p-4">
//               <div className="flex items-center">
//                 <p className="text-start text-sm w-20 ">Chain </p>
//                 <p className="w-10">:</p>
//                 <strong className="font-semibold">Dojima</strong>
//               </div>
//               <div className="flex items-center">
//                 <p className="text-start text-sm w-20">Address </p>
//                 <p className="w-10">:</p>
//                 <strong className="font-semibold">
//                   klajjhghjagjkhgdkfjadhgkjafhgjkdgf
//                 </strong>
//               </div>
//             </div> */}
//           {/* </div> */}
//         </Dialog>
//       ) : (
//         <Dialog
//           onCloseRequest={handleClose}
//           title="Deploy"
//           className={"HelpDialog max-w-[760px] mx-auto"}
//         >
//           {/* <ContractDetails /> */}
//           {/* <DeployStatus /> */}
//           <div className="HelpDialog__header">
//             {contractsData.contracts.map((item, i) => {
//               const index = i + 1;

//               return (
//                 <button
//                   className={`p-3 flex items-center gap-x-3 border ${
//                     i + 1 === tab
//                       ? "border-[#6B45CD] bg-[rgba(107,_69,_205,_0.14)]"
//                       : ""
//                   }   rounded-lg text-black capitalize`}
//                   // onClick={() => {
//                   //   setTab(index);
//                   //   // setIsDetailsComplete(!isDetailsComplete);
//                   // }}
//                   key={i}
//                 >
//                   <div className="w-6 h-6 grid place-items-center bg-[#CEC2FF] rounded-full p-1">
//                     <img alt="" src={handleChains(item.chain)} />
//                   </div>
//                   {item.chain}
//                 </button>
//               );
//             })}
//           </div>
//           <div className="h-[450px] pb-4 mt-8 pr-2">
//             <div className="flex gap-x-[20px] w-full">
//               <div className="w-1/2  border rounded-lg p-4 max-h-[240px] min-h-[120px] overflow-scroll">
//                 {userDetails.chains.map((chain, index) => (
//                   <React.Fragment key={index}>
//                     {tab === index + 1 && renderDetailsForChain(chain)}
//                   </React.Fragment>
//                 ))}
//               </div>
//               <div className="w-1/2 border p-4 rounded-lg max-h-[240px] min-h-[120px]">
//                 <div className="flex w-full items-center">
//                   <div className="text-base font-[600] ">
//                     Arguments Required
//                   </div>
//                   {/* <div className="justify-end w-1/2 flex">
//                     <button
//                       className={` text-xs font-normal w-[57px] h-[24px] border rounded-lg bg-[linear-gradient(270deg,_#A71CFF_-35.09%,_#8000FF_65.62%)] shadow-[0px_5px_20px_0px_rgba(0,_0,_0,_0.15)] text-white`}
//                     >
//                       Add +
//                     </button>
//                   </div> */}
//                 </div>
//                 <div className="flex mt-4 items-center overflow-scroll w-full">
//                   {/* <div className="w-[2200px] mr-2 max-w-[220px] max-h-[40px] p-2 text-sm border rounded-lg h-[38px]">
//                     Jonathan Joe
//                   </div> */}
//                   {/* {constructorArgs &&
//                     constructorArgs.map((arg, index) => (
//                       <input
//                         type="text"
//                         className="border rounded-lg p-1"
//                         value={userInputTypes[index] || ""}
//                         onChange={(e) =>
//                           handleTypeInputChange(index, e.target.value)
//                         }
//                         placeholder={arg.type}
//                       />
//                     ))} */}
//                   {userDetails.chains.map((chain, index) => (
//                     <React.Fragment key={index}>
//                       {tab === index + 1 && renderArgumentsForChain(chain)}
//                     </React.Fragment>
//                   ))}
//                   {/* <div>
//                     <FillDeleteIcon width="17" />
//                   </div> */}
//                 </div>
//               </div>
//             </div>
//             <div className="mt-6">
//               <p className="text-base text-black mb-2 font-semibold ">Code</p>
//               {userDetails.chains.map((chain, index) => (
//                 <React.Fragment key={index}>
//                   {tab === index + 1 && renderCodeForChain(chain)}
//                 </React.Fragment>
//               ))}
//             </div>
//             <div className="mt-3">
//               Note: 'Deploy' button is enabled only if all chains contract data
//               is added and input all required arguments.
//             </div>
//           </div>
//           <div className="flex justify-between mt-2 items-center">
//             <button
//               className="py-4 text-lg/[22px] font-semibold px-4 min-w-[160px] border rounded-xl"
//               onClick={
//                 tab === 1
//                   ? handleClose
//                   : () => {
//                       setTab(tab - 1);
//                     }
//               }
//             >
//               {tab === 1 ? "Close" : "Back"}
//             </button>
//             <Button
//               className={`py-4 text-lg/[22px] font-semibold px-4 min-w-[160px] border rounded-xl bg-[linear-gradient(270deg,_#A71CFF_-35.09%,_#8000FF_65.62%)] shadow-[0px_5px_20px_0px_rgba(0,_0,_0,_0.15)] text-white ${
//                 isDeploying && "cursor-not-allowed"
//               }`}
//               onClick={
//                 tab === contractsData.contracts.length
//                   ? handleDeploy
//                   : () => {
//                       setTab(tab + 1);
//                     }
//               }
//               disabled={
//                 (tab === contractsData.contracts.length &&
//                   !(
//                     userDetails.chains.length === contractsData.contracts.length
//                   )) ||
//                 checkForAllInputArgs()
//               }
//             >
//               {tab === contractsData.contracts.length
//                 ? isDeploying
//                   ? "Deploying..."
//                   : "Deploy"
//                 : "Next"}
//             </Button>
//           </div>

//           {/* <div className="HelpDialog__header">
//             {contractsData.contracts.map((item, i) => {
//               const index = i + 1;

//               return (
//                 <button
//                   className={`p-3 flex items-center gap-x-3 border ${
//                     i + 1 === tab
//                       ? "border-[#6B45CD] bg-[rgba(107,_69,_205,_0.14)]"
//                       : ""
//                   }   rounded-lg text-black capitalize`}
//                   onClick={() => {
//                     setTab(index);
//                     // setIsDetailsComplete(!isDetailsComplete);
//                   }}
//                   key={i}
//                 >
//                   <div className="w-6 h-6 grid place-items-center bg-[#CEC2FF] rounded-full p-1">
//                     {usersIcon}
//                   </div>
//                   {item.chain}
//                 </button>
//               );
//             })}
//           </div>
//           <div className="border-[1px] border-dashed mt-6"></div>
//           <div className="h-[500px] pb-4 pr-2 overflow-auto ">
//             <Section title={"Details"}>
//               {userDetails.chains.map((chain, index) => (
//                 <React.Fragment key={index}>
//                   {tab === index + 1 && renderDetailsForChain(chain)}
//                 </React.Fragment>
//               ))}
//             </Section>
//             <div className="border-[1px] border-dashed mt-6"></div>
//             <div>
//               <div className="flex w-full items-center">
//                 <h3 className="w-1/2">Arguments</h3>
//                 <div className="justify-end w-1/2 flex">
//                   <img src={AddIconImg} alt="" />
//                 </div>
//               </div>
//             </div>
//             <div className="border-[1px] border-dashed mt-6"></div>
//             <div className="mt-6">
//               <p className="text-base text-[#757575] font-semibold ">Code</p>
//               {userDetails.chains.map((chain, index) => (
//                 <React.Fragment key={index}>
//                   {tab === index + 1 && renderCodeForChain(chain)}
//                 </React.Fragment>
//               ))}
//             </div>
//           </div>
//           <div className="flex mt-10 justify-between items-center">
//             <button
//               className="py-4 text-lg/[22px] font-semibold px-4 min-w-[160px] border rounded-xl"
//               onClick={
//                 tab === 1
//                   ? handleClose
//                   : () => {
//                       setTab(tab - 1);
//                     }
//               }
//             >
//               {tab === 1 ? "Close" : "Back"}
//             </button>
//             <button
//               className={`py-4 text-lg/[22px] font-semibold px-4 min-w-[160px] border rounded-xl bg-[linear-gradient(270deg,_#A71CFF_-35.09%,_#8000FF_65.62%)] shadow-[0px_5px_20px_0px_rgba(0,_0,_0,_0.15)] text-white ${
//                 isDeploying && "cursor-not-allowed"
//               }`}
//               onClick={
//                 tab === contractsData.contracts.length
//                   ? handleDeploy
//                   : () => {
//                       setTab(tab + 1);
//                     }
//               }
//             >
//               {tab === contractsData.contracts.length
//                 ? isDeploying
//                   ? "Deploying..."
//                   : "Deploy"
//                 : "Next"}
//             </button>
//           </div> */}
//         </Dialog>
//       )}
//     </>
//   );
// };

import React, { useEffect, useState } from "react";
import { useUserDetails } from "../context/user-appState";
import "./HelpDialog.scss";
import { SolEvmTokenDialog } from "./DeployTabs/SolEvmTokenDialog";
import { OmnichainDialog } from "./DeployTabs/OmnichainDialog";

export const DeployDialog = ({ onClose }: { onClose?: () => void }) => {
  const { userDetails } = useUserDetails();

  return (
    <>
      {userDetails.type === "solEvmTokenTemplate" ? (
        <SolEvmTokenDialog onClose={onClose} />
      ) : (
        <OmnichainDialog onClose={onClose} />
      )}
    </>
  );
};
