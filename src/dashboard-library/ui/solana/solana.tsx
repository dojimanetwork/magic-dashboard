export default function SolanaContract(){};
// import { useEffect } from "react";
// import { AvailableChains } from "../../../../excalidraw-app/dojima-templates/types";
// import Button from "../common/Button";
// import {
//   ContractDetailsData,
//   useContractDetails,
// } from "../../../context/contract-appState";
// import { useUserDetails } from "../../../context/user-appState";

// export default function SolanaContract({
//   displayCode,
//   selectedChain,
// }: {
//   displayCode: (code: string) => void;
//   selectedChain: AvailableChains;
// }) {
//   const { contractsData, updateContractDetails } = useContractDetails();
//   const { userDetails } = useUserDetails();

//   useEffect(() => {
//     displayCode("");
//   }, []);

//   function saveDetails() {
//     // Find the contract with the selected chain
//     const selectedContract = contractsData.contracts.find(
//       (contract) => contract.chain === selectedChain,
//     );

//     if (selectedContract) {
//       // Create an updated contract with only the changed fields
//       const updatedContract: ContractDetailsData = {
//         ...selectedContract,
//         name: "",
//         symbol: "",
//         arguments: [],
//       };

//       // Update the contract details using the context
//       updateContractDetails(updatedContract);
//     } else {
//       // Create an updated contract with only the changed fields
//       const updatedContract: ContractDetailsData = {
//         name: "",
//         symbol: "",
//         arguments: [],
//         code: "",
//         chain: selectedChain,
//         gasPrice: "~0.0002",
//         type: userDetails.type,
//       };

//       // Update the contract details using the context
//       updateContractDetails(updatedContract);
//     }
//   }

//   return (
//     <div className="contract-form-container">
//       <div className="contract-heading">Contract Form</div>
//       <div className="flex justify-between mt-[140px] ">
//         <Button
//           onClick={saveDetails}
//           className="min-w-[113px]"
//           color={"primary"}
//         >
//           Save
//         </Button>
//       </div>
//     </div>
//   );
// }
