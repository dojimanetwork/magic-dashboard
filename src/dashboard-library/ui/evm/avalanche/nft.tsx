import { useEffect, useRef, useState } from "react";
import Button from "../../common/Button";
import TextInput, { TextInputTypes } from "../../common/TextInput";
import {
  ContractDetailsData,
  useContractDetails,
} from "../../../../context/contract-appState";
import { AvailableChains } from "../../../../../excalidraw-app/dojima-templates/types";
import { useUserDetails } from "../../../../context/user-appState";
import {
  Erc721TemplateSaveContractDetailsData,
  useTemplateContractDetails,
} from "../../../../context/template-contract-appState";
import { Text } from "../../common/Typography";
import CheckboxInput from "../../common/CheckboxInput";
import { extractConstructorArguments } from "../../../utils/readConstructorArgs";

export type AVAXNFTContractParams = {
  id: string;
  name: string;
  symbol: string;
  baseUri: string;
};

export function GetAVAXNFTContract(params: AVAXNFTContractParams) {
  const contract = `// SPDX-License-Identifier: MIT
  pragma solidity ^0.8.19;
  
  import "@openzeppelin/contracts/access/AccessControl.sol";
  import '@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol';
  import '@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol';
  import '@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol';
  import '@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol';
  import '@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol';
  import '@dojimanetwork/dojima-contracts/contracts/interfaces/IInboundStateSender.sol';
  import {IStateExecutor} from '@dojimanetwork/dojima-contracts/contracts/interfaces/IStateReceiver.sol';
  
  contract ${params.name}${params.id} is IStateExecutor, Initializable, ERC721Upgradeable, UUPSUpgradeable, AccessControlUpgradeable, ReentrancyGuardUpgradeable {
      bytes32 public constant EXECUTE_STATE_ROLE = keccak256("EXECUTE_STATE_ROLE");
  
      IInboundStateSender public inboundStateSender;
      address public omniChainNFTContractAddress;
  
      event NFTDeposited(
          address indexed user,
          address nft,
          uint256 tokenId,
          uint256 indexed depositId
      );
  
      function initialize(
          string memory _name,
          string memory _symbol,
          address _inboundStateSender,
          address _omniChainNFTContractAddress
      ) public initializer {
          require(_inboundStateSender != address(0), "${params.name}${params.id}: InboundStateSender address cannot be zero");
          require(_omniChainNFTContractAddress != address(0), "${params.name}${params.id}: OmniChain contract address cannot be zero");
  
          __ERC721_init(_name, _symbol);
          __AccessControl_init();
          __UUPSUpgradeable_init();
  
          _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
          inboundStateSender = IInboundStateSender(_inboundStateSender);
          omniChainNFTContractAddress = _omniChainNFTContractAddress;
          _setupRole(EXECUTE_STATE_ROLE, _inboundStateSender);
      }
  
      function transferToOmniChain(address user, uint256 tokenId) external nonReentrant {
          _burn(tokenId);
          inboundStateSender.transferPayload(omniChainNFTContractAddress, abi.encode(user, tokenId, 0));
      }
  
      function executeState(uint256 /*depositID*/, bytes calldata stateData) external nonReentrant onlyRole(EXECUTE_STATE_ROLE) {
          (address userAddress, uint256 tokenId, uint256 depositId) = abi.decode(stateData, (address, uint256, uint256));
  
          _mint(userAddress, tokenId);
          emit NFTDeposited(userAddress, address(this), tokenId, depositId);
      }
  
      function _authorizeUpgrade(address newImplementation) internal override onlyRole(DEFAULT_ADMIN_ROLE) {
          // Upgrade authorization logic
      }
  
  
      function supportsInterface(bytes4 interfaceId) public view override(ERC721Upgradeable, AccessControlUpgradeable) returns (bool) {
          return super.supportsInterface(interfaceId);
      }
  }`;

  return contract;
}

export default function AvalancheNftTemplateView({
  displayCode,
  selectedChain,
}: {
  displayCode: (code: string) => void;
  selectedChain: AvailableChains;
}) {
  const mounted = useRef(false);
  const { contractsData, updateContractDetails } = useContractDetails();
  const [disable, setDisable] = useState(false);
  const [missingAllInputs, setMissingAllInputs] = useState(false);
  const [baseUriError, setBaseUriError] = useState(false);
  const { erc721TemplateContractDetails, updateErc721TemplateContractDetail } =
    useTemplateContractDetails();
  const { userDetails } = useUserDetails();
  const Contract_Id = "AvaxCrossChainNFT";

  const selectedContractDetails = erc721TemplateContractDetails.contracts.find(
    (data) => data.chain === selectedChain,
  );

  const [name, setName] = useState(
    selectedContractDetails?.name === ""
      ? "Nft"
      : (selectedContractDetails?.name as string),
  );
  const [symbol, setSymbol] = useState(
    selectedContractDetails?.symbol === ""
      ? "Nft"
      : (selectedContractDetails?.symbol as string),
  );

  const [baseUri, setBaseUri] = useState(
    selectedContractDetails?.baseUri === ""
      ? ""
      : (selectedContractDetails?.baseUri as string),
  );

  const [contract, setContract] = useState("");

  const [deployedArgs, setDeployedArgs] = useState<Array<any>>([]);
  // const [deployedAddress, setDeployedAddress] = useState<string>("");
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!mounted.current) {
      // This block will execute only once when the component mounts
      mounted.current = true;
      return; // Exit early, don't execute the rest of the useEffect
    }

    setMissingAllInputs(false);
    setBaseUriError(false);
    setIsEditing(true);
    
    const nftOptions: AVAXNFTContractParams = {
      id: Contract_Id,
      name,
      symbol,
      baseUri
    };
    const finalContract = GetAVAXNFTContract(nftOptions);
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
      erc721TemplateContractDetails.contracts.findIndex(
        (contract) => contract.chain === selectedChain,
      );

    if (selectedTemplateContractIndex !== -1) {
      // If template contract with selectedChain exists, update existing details
      const updatedTemplateContracts = [
        ...erc721TemplateContractDetails.contracts,
      ];
      updatedTemplateContracts[selectedTemplateContractIndex] = {
        ...updatedTemplateContracts[selectedTemplateContractIndex],
        name,
        symbol,
        baseUri,
      };

      // Update the template contract details using the context
      updateErc721TemplateContractDetail(
        selectedChain,
        updatedTemplateContracts[selectedTemplateContractIndex],
      );
    }

    setIsEditing(false);
  }, [name, symbol, baseUri, selectedChain]);

  // useEffect(() => {
  //   const nftOptions: AVAXNFTContractParams = {
  //     id: Contract_Id,
  //     name,
  //     symbol,
  //     baseUri,
  //   };
  //   const finalContract = GetAVAXNFTContract(nftOptions);
  //   setContract(finalContract);
  //   displayCode(finalContract);
  // }, []);

  // useEffect(() => {
  //   setMissingAllInputs(false);
  //   setBaseUriError(false);
  //   setIsEditing(true);
  //   const nftOptions: AVAXNFTContractParams = {
  //     id: Contract_Id,
  //     name,
  //     symbol,
  //     baseUri
  //   };
  //   const finalContract = GetAVAXNFTContract(nftOptions);
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
  //     erc721TemplateContractDetails.contracts.find(
  //       (contract) => contract.chain === selectedChain,
  //     );

  //   if (selectedTemplateContract) {
  //     // Create an updated contract with only the changed fields
  //     const updatedTemplateContract: Erc721TemplateSaveContractDetailsData = {
  //       ...selectedTemplateContract,
  //       name,
  //       symbol,
  //       baseUri,
  //     };

  //     // Update the contract details using the context
  //     updateErc721TemplateContractDetail(
  //       selectedChain,
  //       updatedTemplateContract,
  //     );
  //   }
  // }, [displayCode, name, symbol, baseUri]);

  function saveDetails() {
    setIsSaving(true);

    if (!name || !symbol || !baseUri) {
      setMissingAllInputs(true);
      setIsSaving(false);
      return;
    }

    if (!baseUri.startsWith("https://")) {
      setBaseUriError(true);
      setIsSaving(false);
      return;
    }

    // // Find the contract with the selected chain
    // const selectedContract = contractsData.contracts.find(
    //   (contract) => contract.chain === selectedChain,
    // );

    // const constructorArgs = extractConstructorArguments(contract);

    // if (selectedContract) {
    //   // Create an updated contract with only the changed fields
    //   const updatedContract: ContractDetailsData = {
    //     ...selectedContract,
    //     name,
    //     symbol: symbol !== "" ? symbol : selectedContract.symbol,
    //     code: contract,
    //     arguments:
    //       constructorArgs && constructorArgs.length > 0
    //         ? Array(constructorArgs.length).fill("")
    //         : selectedContract.arguments,
    //   };

    //   // Update the contract details using the context
    //   updateContractDetails(updatedContract);
    // } else {
    //   // Create an updated contract with only the changed fields
    //   const updatedContract: ContractDetailsData = {
    //     name,
    //     symbol: symbol !== "" ? symbol : "",
    //     code: contract,
    //     arguments:
    //       constructorArgs && constructorArgs.length > 0
    //         ? Array(constructorArgs.length).fill("")
    //         : [],
    //     chain: selectedChain,
    //     gasPrice: "~0.0002",
    //     type: userDetails.type,
    //   };

    //   // Update the contract details using the context
    //   updateContractDetails(updatedContract);
    // }

    // // Find the templateContract with the selected chain
    // const selectedTemplateContract =
    //   erc721TemplateContractDetails.contracts.find(
    //     (contract) => contract.chain === selectedChain,
    //   );

    // if (selectedTemplateContract) {
    //   // Create an updated contract with only the changed fields
    //   const updatedTemplateContract: Erc721TemplateSaveContractDetailsData = {
    //     ...selectedTemplateContract,
    //     name,
    //     symbol,
    //     baseUri,
    //   };

    //   // Update the contract details using the context
    //   updateErc721TemplateContractDetail(
    //     selectedChain,
    //     updatedTemplateContract,
    //   );
    // }
    setIsSaving(false);
    // setIsEditing(false);
  }

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
              id="baseUri"
              label="Base URI*"
              labelClassName="text-subtext"
              type={TextInputTypes.TEXT}
              value={baseUri}
              setValue={setBaseUri}
              placeholder="https://..."
            />
            {/* <TextInput
              id="premint"
              label="Premint"
              labelClassName="text-subtext"
              type={TextInputTypes.NUMBER}
              value={premint}
              setValue={setPremint}
              minNum={0}
            /> */}
          </div>
        </div>
        {/* <div className="flex flex-col gap-y-5 py-6 border-b">
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
        </div> */}
      </div>
      {missingAllInputs ? (
        <p className="text-red-600 text-sm">Please enter all required fields</p>
      ) : null}
      {baseUriError ? (
        <p className="text-red-600 text-sm">{`Base URI should start with https://`}</p>
      ) : null}
      <div className="flex justify-center mt-6">
        <Button
          onClick={saveDetails}
          className={`w-3/4 ${isSaving && "cursor-not-allowed"}`}
          color={disable === true ? "secondary" : "primary"}
        >
          {isSaving ? "Saving..." : "Save"}
        </Button>
      </div>
    </div>
  );
}

// import { useEffect, useState } from "react";
// import Button from "../../common/Button";
// import TextInput, { TextInputTypes } from "../../common/TextInput";
// import {
//   ContractDetailsData,
//   useContractDetails,
// } from "../../../../context/contract-appState";
// import { AvailableChains } from "../../../../../excalidraw-app/dojima-templates/types";
// import { useUserDetails } from "../../../../context/user-appState";
// import {
//   Erc721TemplateSaveContractDetailsData,
//   useTemplateContractDetails,
// } from "../../../../context/template-contract-appState";
// import { EthereumCrossChainNftTemplate } from "../../../template-contracts/contracts/ethereum/nft/EthereumCrossChainNft";

// export default function EthereumNftTemplateView({
//   displayCode,
//   selectedChain,
// }: {
//   displayCode: (code: string) => void;
//   selectedChain: AvailableChains;
// }) {
//   const { contractsData, updateContractDetails } = useContractDetails();
//   const { erc721TemplateContractDetails, updateErc721TemplateContractDetail } =
//     useTemplateContractDetails();
//   const { userDetails } = useUserDetails();

//   const selectedContractDetails = erc721TemplateContractDetails.contracts.find(
//     (data) => data.chain === selectedChain,
//   );

//   const [name, setName] = useState(
//     selectedContractDetails?.name === ""
//       ? "Token"
//       : (selectedContractDetails?.name as string),
//   );
//   const [symbol, setSymbol] = useState(
//     selectedContractDetails?.symbol === ""
//       ? "Tkn"
//       : (selectedContractDetails?.symbol as string),
//   );
//   const [contract, setContract] = useState("");

//   const [deployedArgs, setDeployedArgs] = useState<Array<any>>([]);
//   // const [deployedAddress, setDeployedAddress] = useState<string>("");

//   useEffect(() => {
//     const finalContract = EthereumCrossChainNftTemplate;
//     setContract(finalContract);
//     displayCode(finalContract);
//   }, []);

//   useEffect(() => {
//     const finalContract = EthereumCrossChainNftTemplate;
//     setContract(finalContract);
//     displayCode(finalContract);
//   }, [displayCode, name, symbol]);

//   function saveDetails() {
//     // Find the contract with the selected chain
//     const selectedContract = contractsData.contracts.find(
//       (contract) => contract.chain === selectedChain,
//     );

//     if (selectedContract) {
//       // Create an updated contract with only the changed fields
//       const updatedContract: ContractDetailsData = {
//         ...selectedContract,
//         name,
//         symbol: symbol !== "" ? symbol : selectedContract.symbol,
//         code: contract,
//         arguments:
//           deployedArgs.length > 0 ? deployedArgs : selectedContract.arguments,
//       };

//       // Update the contract details using the context
//       updateContractDetails(updatedContract);
//     } else {
//       // Create an updated contract with only the changed fields
//       const updatedContract: ContractDetailsData = {
//         name,
//         symbol: symbol !== "" ? symbol : "",
//         code: contract,
//         arguments: deployedArgs.length > 0 ? deployedArgs : [],
//         chain: selectedChain,
//         gasPrice: "~0.0002",
//         type: userDetails.type,
//       };

//       // Update the contract details using the context
//       updateContractDetails(updatedContract);
//     }

//     // Find the templateContract with the selected chain
//     const selectedTemplateContract =
//       erc721TemplateContractDetails.contracts.find(
//         (contract) => contract.chain === selectedChain,
//       );

//     if (selectedTemplateContract) {
//       // Create an updated contract with only the changed fields
//       const updatedTemplateContract: Erc721TemplateSaveContractDetailsData = {
//         ...selectedTemplateContract,
//         name,
//         symbol,
//       };

//       // Update the contract details using the context
//       updateErc721TemplateContractDetail(
//         selectedChain,
//         updatedTemplateContract,
//       );
//     }
//   }

//   return (
//     <div className="contract-form-container">
//       {/* <div className="">Contract Form</div> */}
//       <div className="border-b">
//         <div className="flex flex-col gap-y-5">
//           <TextInput
//             id="name"
//             label="Contract Name*"
//             labelClassName="text-subtext"
//             type={TextInputTypes.TEXT}
//             value={name}
//             setValue={setName}
//           />
//           <TextInput
//             id="symbol"
//             label="Contract Symbol*"
//             labelClassName="text-subtext"
//             type={TextInputTypes.TEXT}
//             value={symbol}
//             setValue={setSymbol}
//           />
//         </div>
//       </div>
//       <div className="flex justify-between mt-[140px] ">
//         <Button onClick={saveDetails} className="w-full" color={"secondary"}>
//           Save
//         </Button>
//       </div>
//     </div>
//   );
// }
