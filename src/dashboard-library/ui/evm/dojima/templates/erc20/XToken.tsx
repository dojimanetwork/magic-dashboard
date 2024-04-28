import { useEffect, useRef, useState } from "react";
import Button from "../../../../common/Button";
import TextInput, { TextInputTypes } from "../../../../common/TextInput";
import {
  ContractDetailsData,
  useContractDetails,
} from "../../../../../../context/contract-appState";
import { AvailableChains } from "../../../../../../../excalidraw-app/dojima-templates/types";
import { useUserDetails } from "../../../../../../context/user-appState";
import {
  Erc20TemplateSaveContractDetailsData,
  useTemplateContractDetails,
} from "../../../../../../context/template-contract-appState";
import { Text } from "../../../../common/Typography";
import CheckboxInput from "../../../../common/CheckboxInput";
import { extractConstructorArguments } from "../../../../../utils/readConstructorArgs";

export type DOJERC20ContractParams = {
  id: string;
  name: string;
  symbol: string;
  premint: number;
  decimals?: number;
  mintable?: boolean;
  burnable?: boolean;
};

export function GetDOJXTokenERC20Contract(params: DOJERC20ContractParams) {
  const contract = `// SPDX-License-Identifier: MIT
  pragma solidity ^0.8.19;
  
  import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
  import "@openzeppelin/contracts/access/AccessControl.sol";
  
  
  contract ${params.name}${params.id} is ERC20Burnable, AccessControl {
      string public xtoken_name;
      string public xtoken_symbol;
      uint8 private _decimals;
      address public omniChainERC20Contract;
      bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
  
      event OmniChainERC20ContractUpdated(address omniChainContract);
  
      constructor() ERC20(xtoken_name, xtoken_symbol) {
          xtoken_name = "${params.name}";
          xtoken_symbol = "${params.symbol}";
          _decimals = ${params.decimals};
          _mint(msg.sender, ${params.premint} * (10 ** uint256(${params.decimals})));
          _setupRole(ADMIN_ROLE, msg.sender);
      }
  
      function decimals() public view virtual override returns (uint8) {
          return _decimals;
      }
  
      function setOmniChainContract(address _omniChainToERC20Contract) external onlyRole(ADMIN_ROLE) {
          omniChainERC20Contract = _omniChainToERC20Contract;
          emit OmniChainERC20ContractUpdated(_omniChainToERC20Contract);
      }
  
      modifier onlyOmniChainContract() {
          require(msg.sender == omniChainERC20Contract, "${params.name}${params.id}: Unauthorized");
          _;
      }
  
      function burn(address account, uint256 amount) external onlyOmniChainContract {
          _burn(account, amount);
      }
  
      function mint(address account, uint256 amount) external onlyOmniChainContract{
          _mint(account, amount);
      }
  }
  
  `;

  return contract;
}

export default function DojimaXTokenTemplateView({
  displayCode,
  selectedChain,
}: {
  displayCode: (code: string) => void;
  selectedChain: AvailableChains;
}) {
  const mounted = useRef(false); // Ref to track whether the component is mounted
  const { contractsData, updateContractDetails } = useContractDetails();
  const [disable, setDisable] = useState(false);
  const { erc20TemplateContractDetails, updateErc20TemplateContractDetail } =
    useTemplateContractDetails();
  const { userDetails } = useUserDetails();
  const Contract_Id = "XTokenContract";

  const selectedContractDetails = erc20TemplateContractDetails.contracts.find(
    (data) => data.chain === selectedChain,
  );

  const [name, setName] = useState(
    selectedContractDetails?.name === ""
      ? "Token"
      : (selectedContractDetails?.name as string),
  );
  const [symbol, setSymbol] = useState(
    selectedContractDetails?.symbol === ""
      ? "Tkn"
      : (selectedContractDetails?.symbol as string),
  );
  const [premint, setPremint] = useState(
    selectedContractDetails?.premint === ""
      ? "0"
      : (selectedContractDetails?.premint as string),
  );
  const [mintable, setMintable] = useState(false); // TODO : add option to user
  const [burnable, setBurnable] = useState(false); // TODO : add option to user
  const [contract, setContract] = useState("");

  const [deployedArgs, setDeployedArgs] = useState<Array<any>>([]);
  // const [deployedAddress, setDeployedAddress] = useState<string>("");
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [missingAllInputs, setMissingAllInputs] = useState(false);

  useEffect(() => {
    if (!mounted.current) {
      // This block will execute only once when the component mounts
      mounted.current = true;
      return; // Exit early, don't execute the rest of the useEffect
    }

    setMissingAllInputs(false);
    setIsEditing(true);
    
    const erc20Options: DOJERC20ContractParams = {
      id: Contract_Id,
      name,
      symbol,
      decimals: 18,
      premint: premint ? Number(premint) : 0,
    };
    const finalContract = GetDOJXTokenERC20Contract(erc20Options);
    setContract(finalContract);
    displayCode(finalContract);

    const constructorArgs = extractConstructorArguments(finalContract);

    // Find the contract with the selected chain
    const selectedContract = contractsData.contracts.find(
      (contract) => contract.chain === selectedChain,
    );

    if (selectedContract) {
      const existingCodeDetailIndex = selectedContract.codeDetails.findIndex(
        (detail) => detail.id === Contract_Id,
      );

      if (existingCodeDetailIndex !== -1) {
        // If code details with Contract_Id exist, update existing details
        const updatedContract: ContractDetailsData = {
          ...selectedContract,
          name,
          symbol,
          codeDetails: [
            ...selectedContract.codeDetails.slice(0, existingCodeDetailIndex),
            {
              ...selectedContract.codeDetails[existingCodeDetailIndex],
              fileName: `${name}${Contract_Id}`,
              code: finalContract,
            },
            ...selectedContract.codeDetails.slice(existingCodeDetailIndex + 1),
          ],
          argumentsDetails:
            selectedContract.argumentsDetails &&
            selectedContract.argumentsDetails.length > 0
              ? selectedContract.argumentsDetails.map((argDetail) => ({
                  ...argDetail,
                  fileName: `${name}${Contract_Id}`,
                }))
              : [
                  {
                    id: Contract_Id,
                    fileName: `${name}${Contract_Id}`,
                    arguments:
                      constructorArgs && constructorArgs.length > 0
                        ? Array(constructorArgs.length).fill("")
                        : [],
                  },
                ],
        };

        // Update the contract details using the context
        updateContractDetails(updatedContract);
      } else {
        // No existing code details found, add new details
        const newCodeDetail = {
          id: Contract_Id,
          fileName: `${name}${Contract_Id}`,
          code: finalContract,
        };

        const newArgumentsDetail = {
          id: Contract_Id,
          fileName: `${name}${Contract_Id}`,
          arguments:
            constructorArgs && constructorArgs.length > 0
              ? Array(constructorArgs.length).fill("")
              : [],
        };

        const updatedContract: ContractDetailsData = {
          ...selectedContract,
          name,
          symbol,
          codeDetails: [...selectedContract.codeDetails, newCodeDetail],
          argumentsDetails: [
            ...(selectedContract.argumentsDetails || []),
            newArgumentsDetail,
          ],
        };

        // Update the contract details using the context
        updateContractDetails(updatedContract);
      }
    } else {
      // If no contract with selectedChain exists, add new contract details
      const addContractDetails: ContractDetailsData = {
        name,
        symbol: symbol !== "" ? symbol : "",
        codeDetails: [
          {
            id: Contract_Id,
            fileName: `${name}${Contract_Id}`,
            code: finalContract,
          },
        ],
        argumentsDetails: [
          {
            id: Contract_Id,
            fileName: `${name}${Contract_Id}`,
            arguments:
              constructorArgs && constructorArgs.length > 0
                ? Array(constructorArgs.length).fill("")
                : [],
          },
        ],
        chain: selectedChain,
        gasPrice: "~0.0002",
        type: userDetails.type,
      };

      // Update the contract details using the context
      updateContractDetails(addContractDetails);
    }

    // Find the templateContract with the selected chain
    const selectedTemplateContractIndex =
      erc20TemplateContractDetails.contracts.findIndex(
        (contract) => contract.chain === selectedChain,
      );

    if (selectedTemplateContractIndex !== -1) {
      // If template contract with selectedChain exists, update existing details
      const updatedTemplateContracts = [
        ...erc20TemplateContractDetails.contracts,
      ];
      updatedTemplateContracts[selectedTemplateContractIndex] = {
        ...updatedTemplateContracts[selectedTemplateContractIndex],
        name,
        symbol,
        premint,
      };

      // Update the template contract details using the context
      updateErc20TemplateContractDetail(
        selectedChain,
        updatedTemplateContracts[selectedTemplateContractIndex],
      );
    }

    setIsEditing(false);
  }, [name, symbol, premint, selectedChain]);

  // useEffect(() => {
  //   const erc20Options: DOJERC20ContractParams = {
  //     id: Contract_Id,
  //     name,
  //     symbol,
  //     premint: premint ? Number(premint) : 0,
  //   };
  //   const finalContract = GetDOJXTokenERC20Contract(erc20Options);
  //   setContract(finalContract);
  //   displayCode(finalContract);

  //   const constructorArgs = extractConstructorArguments(finalContract);

  //   // Find the contract with the selected chain
  //   const selectedContract = contractsData.contracts.find(
  //     (contract) => contract.chain === selectedChain,
  //   );

  //   console.log("X selected : ", selectedContract);

  //   if (selectedContract) {
  //     // const codeDetailsByContractId = selectedContract.codeDetails.find(
  //     //   (detail) => detail.id === Contract_Id,
  //     // );

  //     // console.log("X selected in contr id : ", codeDetailsByContractId);

  //     // if (!codeDetailsByContractId) {
  //     //   const updatedContract: ContractDetailsData = {
  //     //     ...selectedContract,
  //     //     codeDetails: [
  //     //       ...selectedContract.codeDetails,
  //     //       {
  //     //         id: Contract_Id,
  //     //         fileName: `${name}${Contract_Id}`,
  //     //         code: contract,
  //     //       },
  //     //     ],
  //     //     argumentsDetails:
  //     //       selectedContract.argumentsDetails &&
  //     //       selectedContract.argumentsDetails.length > 0
  //     //         ? [
  //     //             ...selectedContract.argumentsDetails,
  //     //             {
  //     //               id: Contract_Id,
  //     //               fileName: `${name}${Contract_Id}`,
  //     //               arguments:
  //     //                 constructorArgs && constructorArgs.length > 0
  //     //                   ? Array(constructorArgs.length).fill("")
  //     //                   : [],
  //     //             },
  //     //           ]
  //     //         : [
  //     //             {
  //     //               id: Contract_Id,
  //     //               fileName: `${name}${Contract_Id}`,
  //     //               arguments:
  //     //                 constructorArgs && constructorArgs.length > 0
  //     //                   ? Array(constructorArgs.length).fill("")
  //     //                   : [],
  //     //             },
  //     //           ],
  //     //   };

  //     //   console.log("X selected not contr id : ", updatedContract);

  //     //   // Update the contract details using the context
  //     //   updateContractDetails(updatedContract);
  //     // }
  //     const existingCodeDetailIndex = selectedContract.codeDetails.findIndex(
  //       (detail) => detail.id === Contract_Id,
  //     );

  //     console.log("X selected in contr id : ", existingCodeDetailIndex);

  //     if (existingCodeDetailIndex === -1) {
  //       // If code details with Contract_Id does not exist, add new details
  //       const updatedContract: ContractDetailsData = {
  //         ...selectedContract,
  //         codeDetails: [
  //           ...selectedContract.codeDetails,
  //           {
  //             id: Contract_Id,
  //             fileName: `${name}${Contract_Id}`,
  //             code: finalContract,
  //           },
  //         ],
  //         argumentsDetails:
  //           selectedContract.argumentsDetails &&
  //           selectedContract.argumentsDetails.length > 0
  //             ? selectedContract.argumentsDetails
  //             : [
  //                 {
  //                   id: Contract_Id,
  //                   fileName: `${name}${Contract_Id}`,
  //                   arguments:
  //                     constructorArgs && constructorArgs.length > 0
  //                       ? Array(constructorArgs.length).fill("")
  //                       : [],
  //                 },
  //               ],
  //       };

  //       console.log("X selected not contr id : ", updatedContract);

  //       // Update the contract details using the context
  //       updateContractDetails(updatedContract);
  //     } else {
  //       // If code details with Contract_Id exist, update existing details
  //       const updatedContract: ContractDetailsData = {
  //         ...selectedContract,
  //         codeDetails: [
  //           ...selectedContract.codeDetails.slice(0, existingCodeDetailIndex),
  //           {
  //             ...selectedContract.codeDetails[existingCodeDetailIndex],
  //             fileName: `${name}${Contract_Id}`,
  //             code: finalContract,
  //           },
  //           ...selectedContract.codeDetails.slice(existingCodeDetailIndex + 1),
  //         ],
  //       };

  //       console.log("X selected existing contr id : ", updatedContract);

  //       // Update the contract details using the context
  //       updateContractDetails(updatedContract);
  //     }
  //   } else {
  //     const addContractDetails: ContractDetailsData = {
  //       name,
  //       symbol: symbol !== "" ? symbol : "",
  //       codeDetails: [
  //         {
  //           id: Contract_Id,
  //           fileName: `${name}${Contract_Id}`,
  //           code: finalContract,
  //         },
  //       ],
  //       argumentsDetails: [
  //         {
  //           id: Contract_Id,
  //           fileName: `${name}${Contract_Id}`,
  //           arguments:
  //             constructorArgs && constructorArgs.length > 0
  //               ? Array(constructorArgs.length).fill("")
  //               : [],
  //         },
  //       ],
  //       chain: selectedChain,
  //       gasPrice: "~0.0002",
  //       type: userDetails.type,
  //     };

  //     console.log("X selected contr id else : ", addContractDetails);

  //     // Update the contract details using the context
  //     updateContractDetails(addContractDetails);
  //   }
  // }, []);

  // // useEffect(() => {
  // //   setIsEditing(true);
  // //   const erc20Options: DOJERC20ContractParams = {
  // //     id: Contract_Id,
  // //     name,
  // //     symbol,
  // //     premint: premint ? Number(premint) : 0,
  // //   };
  // //   const finalContract = GetDOJXTokenERC20Contract(erc20Options);
  // //   setContract(finalContract);
  // //   displayCode(finalContract);

  // //   const constructorArgs = extractConstructorArguments(finalContract);

  // //   // Find the contract with the selected chain
  // //   const selectedContract = contractsData.contracts.find(
  // //     (contract) => contract.chain === selectedChain,
  // //   );

  // //   if (selectedContract) {
  // //     const codeDetailsByContractId = selectedContract.codeDetails.find(
  // //       (detail) => detail.id === Contract_Id,
  // //     );

  // //     if (codeDetailsByContractId) {
  // //       const updatedContract: ContractDetailsData = {
  // //         ...selectedContract,
  // //         name,
  // //         symbol,
  // //         codeDetails: [
  // //           ...selectedContract.codeDetails,
  // //           {
  // //             id: Contract_Id,
  // //             fileName: `${name}${Contract_Id}`,
  // //             code: finalContract,
  // //           },
  // //         ],
  // //         argumentsDetails:
  // //           selectedContract.argumentsDetails &&
  // //           selectedContract.argumentsDetails.length > 0
  // //             ? [
  // //                 ...selectedContract.argumentsDetails,
  // //                 {
  // //                   id: Contract_Id,
  // //                   fileName: `${name}${Contract_Id}`,
  // //                   arguments:
  // //                     constructorArgs && constructorArgs.length > 0
  // //                       ? Array(constructorArgs.length).fill("")
  // //                       : [],
  // //                 },
  // //               ]
  // //             : [
  // //                 {
  // //                   id: Contract_Id,
  // //                   fileName: `${name}${Contract_Id}`,
  // //                   arguments:
  // //                     constructorArgs && constructorArgs.length > 0
  // //                       ? Array(constructorArgs.length).fill("")
  // //                       : [],
  // //                 },
  // //               ],
  // //       };

  // //       // Update the contract details using the context
  // //       updateContractDetails(updatedContract);
  // //     }
  // //   }

  // //   // Find the templateContract with the selected chain
  // //   const selectedTemplateContract =
  // //     erc20TemplateContractDetails.contracts.find(
  // //       (contract) => contract.chain === selectedChain,
  // //     );

  // //   if (selectedTemplateContract) {
  // //     // Create an updated contract with only the changed fields
  // //     const updatedTemplateContract: Erc20TemplateSaveContractDetailsData = {
  // //       ...selectedTemplateContract,
  // //       name,
  // //       symbol,
  // //       premint,
  // //     };

  // //     // Update the contract details using the context
  // //     updateErc20TemplateContractDetail(selectedChain, updatedTemplateContract);
  // //   }
  // // }, [name, symbol, premint]);

  // useEffect(() => {
  //   setIsEditing(true);
  //   const erc20Options: DOJERC20ContractParams = {
  //     id: Contract_Id,
  //     name,
  //     symbol,
  //     premint: premint ? Number(premint) : 0,
  //   };
  //   const finalContract = GetDOJXTokenERC20Contract(erc20Options);
  //   setContract(finalContract);
  //   displayCode(finalContract);

  //   const constructorArgs = extractConstructorArguments(finalContract);

  //   // Find the contract with the selected chain
  //   const selectedContract = contractsData.contracts.find(
  //     (contract) => contract.chain === selectedChain,
  //   );

  //   if (selectedContract) {
  //     const existingCodeDetailIndex = selectedContract.codeDetails.findIndex(
  //       (detail) => detail.id === Contract_Id,
  //     );

  //     if (existingCodeDetailIndex !== -1) {
  //       // If code details with Contract_Id exist, update existing details
  //       const updatedContract: ContractDetailsData = {
  //         ...selectedContract,
  //         name,
  //         symbol,
  //         codeDetails: [
  //           ...selectedContract.codeDetails.slice(0, existingCodeDetailIndex),
  //           {
  //             ...selectedContract.codeDetails[existingCodeDetailIndex],
  //             fileName: `${name}${Contract_Id}`,
  //             code: finalContract,
  //           },
  //           ...selectedContract.codeDetails.slice(existingCodeDetailIndex + 1),
  //         ],
  //         argumentsDetails:
  //           selectedContract.argumentsDetails &&
  //           selectedContract.argumentsDetails.length > 0
  //             ? selectedContract.argumentsDetails
  //             : [
  //                 {
  //                   id: Contract_Id,
  //                   fileName: `${name}${Contract_Id}`,
  //                   arguments:
  //                     constructorArgs && constructorArgs.length > 0
  //                       ? Array(constructorArgs.length).fill("")
  //                       : [],
  //                 },
  //               ],
  //       };

  //       // Update the contract details using the context
  //       updateContractDetails(updatedContract);
  //     }
  //   } else {
  //     // If no contract with selectedChain exists, add new contract details
  //     const addContractDetails: ContractDetailsData = {
  //       name,
  //       symbol: symbol !== "" ? symbol : "",
  //       codeDetails: [
  //         {
  //           id: Contract_Id,
  //           fileName: `${name}${Contract_Id}`,
  //           code: finalContract,
  //         },
  //       ],
  //       argumentsDetails: [
  //         {
  //           id: Contract_Id,
  //           fileName: `${name}${Contract_Id}`,
  //           arguments:
  //             constructorArgs && constructorArgs.length > 0
  //               ? Array(constructorArgs.length).fill("")
  //               : [],
  //         },
  //       ],
  //       chain: selectedChain,
  //       gasPrice: "~0.0002",
  //       type: userDetails.type,
  //     };

  //     // Update the contract details using the context
  //     updateContractDetails(addContractDetails);
  //   }

  //   // Find the templateContract with the selected chain
  //   const selectedTemplateContractIndex = erc20TemplateContractDetails.contracts.findIndex(
  //     (contract) => contract.chain === selectedChain,
  //   );

  //   if (selectedTemplateContractIndex !== -1) {
  //     // If template contract with selectedChain exists, update existing details
  //     const updatedTemplateContracts = [...erc20TemplateContractDetails.contracts];
  //     updatedTemplateContracts[selectedTemplateContractIndex] = {
  //       ...updatedTemplateContracts[selectedTemplateContractIndex],
  //       name,
  //       symbol,
  //       premint,
  //     };

  //     // Update the template contract details using the context
  //     updateErc20TemplateContractDetail(selectedChain, updatedTemplateContracts[selectedTemplateContractIndex]);
  //   }
  //   // else {
  //   //   // If no template contract with selectedChain exists, add new template contract details
  //   //   const newTemplateContract: Erc20TemplateSaveContractDetailsData = {
  //   //     name,
  //   //     symbol,
  //   //     premint,
  //   //   };

  //   //   // Update the template contract details using the context
  //   //   updateErc20TemplateContractDetail(selectedChain, newTemplateContract);
  //   // }
  // }, [name, symbol, premint]);

  // useEffect(() => {
  //   const constructorArgs = extractConstructorArguments(contract);

  //   // Find the contract with the selected chain
  //   const selectedContract = contractsData.contracts.find(
  //     (contract) => contract.chain === selectedChain,
  //   );

  //   if (selectedContract) {
  //     const codeDetailsByContractId = selectedContract.codeDetails.find(
  //       (detail) => detail.id === Contract_Id,
  //     );

  //     if (codeDetailsByContractId) {
  //       const updatedContract: ContractDetailsData = {
  //         ...selectedContract,
  //         name,
  //         symbol,
  //         codeDetails: [
  //           ...selectedContract.codeDetails,
  //           {
  //             id: Contract_Id,
  //             fileName: `${name}${Contract_Id}`,
  //             code: contract,
  //           },
  //         ],
  //         argumentsDetails:
  //           selectedContract.argumentsDetails &&
  //           selectedContract.argumentsDetails.length > 0
  //             ? [
  //                 ...selectedContract.argumentsDetails,
  //                 {
  //                   id: Contract_Id,
  //                   fileName: `${name}${Contract_Id}`,
  //                   arguments:
  //                     constructorArgs && constructorArgs.length > 0
  //                       ? Array(constructorArgs.length).fill("")
  //                       : [],
  //                 },
  //               ]
  //             : [
  //                 {
  //                   id: Contract_Id,
  //                   fileName: `${name}${Contract_Id}`,
  //                   arguments:
  //                     constructorArgs && constructorArgs.length > 0
  //                       ? Array(constructorArgs.length).fill("")
  //                       : [],
  //                 },
  //               ],
  //       };

  //       // Update the contract details using the context
  //       updateContractDetails(updatedContract);
  //     }
  //   }
  // }, [displayCode]);

  // useEffect(() => {
  //   const erc20Options: DOJERC20ContractParams = {
  //     id: Contract_Id,
  //     name,
  //     symbol,
  //     premint: premint ? Number(premint) : 0,
  //   };
  //   const finalContract = GetDOJXTokenERC20Contract(erc20Options);
  //   setContract(finalContract);
  //   displayCode(finalContract);
  // }, []);

  // useEffect(() => {
  //   setIsEditing(true);
  //   const erc20Options: DOJERC20ContractParams = {
  //     id: Contract_Id,
  //     name,
  //     symbol,
  //     premint: premint ? Number(premint) : 0,
  //   };
  //   const finalContract = GetDOJXTokenERC20Contract(erc20Options);
  //   setContract(finalContract);
  //   displayCode(finalContract);

  //   // Find the contract with the selected chain
  //   const selectedContract = contractsData.contracts.find(
  //     (contract) => contract.chain === selectedChain,
  //   );

  //   const constructorArgs = extractConstructorArguments(contract);

  //   if (selectedContract) {
  //     // Create an updated contract with only the changed fields
  //     const updatedContract: ContractDetailsData = {
  //       ...selectedContract,
  //       name,
  //       symbol: symbol !== "" ? symbol : selectedContract.symbol,
  //       codeDetails: (() => {
  //         const existingCodeDetail = selectedContract.codeDetails.find(
  //           (codeDetail) => codeDetail.id === Contract_Id,
  //         );
  //         if (existingCodeDetail) {
  //           // Update existing code detail
  //           return selectedContract.codeDetails.map((codeDetail) => {
  //             if (codeDetail.id === Contract_Id) {
  //               return {
  //                 ...codeDetail,
  //                 fileName: `${name}${Contract_Id}`,
  //                 code: contract,
  //               };
  //             } else {
  //               return codeDetail;
  //             }
  //           });
  //         } else {
  //           // Add new code detail
  //           return [
  //             ...selectedContract.codeDetails,
  //             {
  //               id: Contract_Id,
  //               fileName: `${name}${Contract_Id}`,
  //               code: contract,
  //             },
  //           ];
  //         }
  //       })(),

  //       argumentsDetails: (() => {
  //         if (
  //           selectedContract.argumentsDetails &&
  //           selectedContract.argumentsDetails.length > 0
  //         ) {
  //           const existingArgDetail = selectedContract.argumentsDetails.find(
  //             (argDetail) => argDetail.id === Contract_Id,
  //           );
  //           if (existingArgDetail) {
  //             // Update existing arguments detail
  //             selectedContract.argumentsDetails.map((argDetail) => {
  //               if (argDetail.id === Contract_Id) {
  //                 return {
  //                   id: argDetail.id,
  //                   fileName: `${name}${Contract_Id}`,
  //                   arguments:
  //                     constructorArgs && constructorArgs.length > 0
  //                       ? Array(constructorArgs.length).fill("")
  //                       : existingArgDetail,
  //                 };
  //               } else {
  //                 return argDetail;
  //               }
  //             });
  //           } else {
  //             // Add new arguments detail
  //             return [
  //               ...selectedContract.argumentsDetails,
  //               {
  //                 id: Contract_Id,
  //                 fileName: `${name}${Contract_Id}`,
  //                 arguments:
  //                   constructorArgs && constructorArgs.length > 0
  //                     ? Array(constructorArgs.length).fill("")
  //                     : [],
  //               },
  //             ];
  //           }
  //         } else {
  //           // Add new arguments detail
  //           return [
  //             {
  //               id: Contract_Id,
  //               fileName: `${name}${Contract_Id}`,
  //               arguments:
  //                 constructorArgs && constructorArgs.length > 0
  //                   ? Array(constructorArgs.length).fill("")
  //                   : [],
  //             },
  //           ];
  //         }
  //       })(),
  //     };

  //     // Update the contract details using the context
  //     updateContractDetails(updatedContract);
  //   } else {
  //     // Create an updated contract with only the changed fields
  //     const updatedContract: ContractDetailsData = {
  //       name,
  //       symbol: symbol !== "" ? symbol : "",
  //       codeDetails: [
  //         {
  //           id: Contract_Id,
  //           fileName: `${name}${Contract_Id}`,
  //           code: contract,
  //         },
  //       ],
  //       argumentsDetails: [
  //         {
  //           id: Contract_Id,
  //           fileName: `${name}${Contract_Id}`,
  //           arguments:
  //             constructorArgs && constructorArgs.length > 0
  //               ? Array(constructorArgs.length).fill("")
  //               : [],
  //         },
  //       ],
  //       chain: selectedChain,
  //       gasPrice: "~0.0002",
  //       type: userDetails.type,
  //     };

  //     // Update the contract details using the context
  //     updateContractDetails(updatedContract);
  //   }

  //   // Find the templateContract with the selected chain
  //   const selectedTemplateContract =
  //     erc20TemplateContractDetails.contracts.find(
  //       (contract) => contract.chain === selectedChain,
  //     );

  //   if (selectedTemplateContract) {
  //     // Create an updated contract with only the changed fields
  //     const updatedTemplateContract: Erc20TemplateSaveContractDetailsData = {
  //       ...selectedTemplateContract,
  //       name,
  //       symbol,
  //       premint,
  //     };

  //     // Update the contract details using the context
  //     updateErc20TemplateContractDetail(selectedChain, updatedTemplateContract);
  //   }
  // }, [displayCode, name, premint, symbol, burnable, mintable]);

  //   function saveDetails() {
  //     setIsSaving(true);

  //     if (!name || !symbol) {
  //       setMissingAllInputs(true);
  //       setIsSaving(false);
  //       return;
  //     }

  //     setIsSaving(false);
  //     setIsEditing(false);
  //   }

  return (
    <div>
      <div className="contract-form-container h-[458px] overflow-auto">
        {/* <div className="">Contract Form</div> */}
        <div className="border-b">
          <div className="flex flex-col gap-y-5">
            <TextInput
              id="name"
              label="Contract Name*"
              labelClassName="text-subtext"
              type={TextInputTypes.TEXT}
              value={name}
              setValue={setName}
            />
            <TextInput
              id="symbol"
              label="Contract Symbol*"
              labelClassName="text-subtext"
              type={TextInputTypes.TEXT}
              value={symbol}
              setValue={setSymbol}
            />
            <TextInput
              id="premint"
              label="Premint"
              labelClassName="text-subtext"
              type={TextInputTypes.NUMBER}
              value={premint}
              setValue={setPremint}
              minNum={0}
            />
          </div>
        </div>
        <div className="flex flex-col gap-y-5 py-6 border-b">
          <Text Type="16-Md"> Features</Text>
          <div className="grid grid-cols-2 gap-x-3 gap-y-3">
            <CheckboxInput
              id="mintable"
              label="Mintable"
              value={mintable}
              setValue={setMintable}
              labelClassName="text-subtext"
              className="accent-[#6B45CD]"
            />
            <CheckboxInput
              id="burnable"
              label="Burnable"
              value={burnable}
              setValue={setBurnable}
              labelClassName="text-subtext"
              className="accent-[#6B45CD]"
            />
          </div>
        </div>
      </div>
      {/* {missingAllInputs ? (
        <p className="text-red-600 text-sm">Please enter all required fields</p>
      ) : null}
      <div className="flex justify-center mt-6">
        <Button
          onClick={saveDetails}
          className={`w-3/4 ${isSaving && "cursor-not-allowed"}`}
          color={disable === true ? "secondary" : "primary"}
        >
          {isSaving ? "Saving..." : "Save"}
        </Button>
      </div> */}
    </div>
  );
}
